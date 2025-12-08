import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

type OrderItem = {
  productId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

type OrderRequest = {
  customerName: string;
  phone: string;
  email: string;
  paymentMethod: 'gcash' | 'maribank';
  pickupDate: string;
  orderNotes: string;
  items: OrderItem[];
  totalAmount: number;
};

export async function POST(request: Request) {
  try {
    const body: OrderRequest = await request.json();

    const {
      customerName,
      phone,
      email,
      paymentMethod,
      pickupDate,
      orderNotes,
      items,
      totalAmount
    } = body;

    // Validate required fields
    if (!customerName || !phone || !email || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get current date in Philippine timezone (YYYY-MM-DD format)
    const now = new Date();
    const phDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
    const orderDate = `${phDate.getFullYear()}-${String(phDate.getMonth() + 1).padStart(2, '0')}-${String(phDate.getDate()).padStart(2, '0')}`;

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('Orders')
      .insert({
        customer_name: customerName,
        phone_number: phone,
        email: email,
        payment_method: paymentMethod,
        pickup_date: pickupDate,
        order_date: orderDate,
        order_notes: orderNotes || null,
        total_amount: totalAmount,
        status: 'pending',
        is_paid: false,
        is_completed: false,
        is_production_complete: false
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }

    // Create order items
    const orderItemsData = items.map(item => ({
      order_id: order.id,
      product_id: item.productId,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      subtotal: item.subtotal
    }));

    const { error: itemsError } = await supabase
      .from('OrderItems')
      .insert(orderItemsData);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      // Try to delete the order if items failed
      await supabase.from('Orders').delete().eq('id', order.id);
      return NextResponse.json(
        { error: 'Failed to create order items' },
        { status: 500 }
      );
    }

    // Fetch product names for email
    const productIds = items.map(item => item.productId);
    const { data: products } = await supabase
      .from('Products')
      .select('id, name')
      .in('id', productIds);

    const productMap = new Map(products?.map(p => [p.id, p.name]) || []);

    // Format pickup date
    const formattedPickupDate = new Date(pickupDate).toLocaleDateString('en-PH', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const paymentMethodName = paymentMethod === 'gcash' ? 'GCash' : 'MariBank';

    // Site URL for email links
    const siteUrl = 'https://sistersandmom.site';

    // Extract first name for personalized greeting
    const firstName = customerName.split(' ')[0];

    // Format items for email - simpler format without bullet points
    const itemsHtml = items.map(item => {
      const productName = productMap.get(item.productId) || 'Unknown Product';
      return `<tr><td style="padding:6px 0;color:#555;font-size:13px;">${productName} × ${item.quantity}</td><td style="padding:6px 0;text-align:right;font-weight:600;color:#333;font-size:13px;">₱${item.subtotal.toLocaleString()}</td></tr>`;
    }).join('');

    // Send confirmation email
    try {
      await resend.emails.send({
        from: 'Sisters & Mom Pastry <orders@sistersandmom.site>',
        to: email,
        subject: `Order Confirmed! ${order.order_number}`,
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#FFF8F5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:0 auto;padding:16px;">
    <tr><td>
      <!-- Main Card -->
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;">

        <!-- Header -->
        <tr><td style="text-align:center;padding:24px 16px 16px;">
          <img src="${siteUrl}/logo.jpg" alt="Sisters & Mom" width="60" height="60" style="border-radius:50%;display:block;margin:0 auto 12px;">
          <h1 style="margin:0;font-size:20px;color:#82C3A3;">Thank you, ${firstName}!</h1>
          <p style="margin:4px 0 0;font-size:13px;color:#888;">Your order has been placed</p>
        </td></tr>

        <!-- Order Number Banner -->
        <tr><td style="padding:0 16px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#82C3A3;border-radius:12px;">
            <tr><td style="padding:16px;text-align:center;">
              <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.8);text-transform:uppercase;letter-spacing:1px;">Order Number</p>
              <p style="margin:6px 0;font-size:22px;font-weight:bold;color:#fff;letter-spacing:2px;">${order.order_number}</p>
              <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.9);">Pickup: ${formattedPickupDate}</p>
            </td></tr>
          </table>
        </td></tr>

        <!-- Order Summary -->
        <tr><td style="padding:16px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fa;border-radius:10px;padding:14px;">
            <tr><td>
              <p style="margin:0 0 10px;font-size:14px;font-weight:600;color:#333;">Order Summary</p>
              <table width="100%" cellpadding="0" cellspacing="0">${itemsHtml}</table>
              <div style="border-top:1px dashed #ddd;margin:10px 0;"></div>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:15px;font-weight:bold;color:#333;">Total</td>
                  <td style="text-align:right;font-size:16px;font-weight:bold;color:#82C3A3;">₱${totalAmount.toLocaleString()}</td>
                </tr>
              </table>
              ${orderNotes ? `<p style="margin:10px 0 0;font-size:12px;color:#666;"><b>Notes:</b> ${orderNotes}</p>` : ''}
            </td></tr>
          </table>
        </td></tr>

        <!-- Payment QR -->
        <tr><td style="padding:0 16px 16px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:${paymentMethod === 'gcash' ? '#EBF5FF' : '#FFF8E1'};border:1px solid ${paymentMethod === 'gcash' ? '#90CAF9' : '#FFE082'};border-radius:10px;">
            <tr><td style="padding:14px;text-align:center;">
              <p style="margin:0 0 10px;font-size:14px;font-weight:600;color:${paymentMethod === 'gcash' ? '#007DFE' : '#F26522'};">Pay via ${paymentMethodName}</p>
              <table cellpadding="0" cellspacing="0" style="margin:0 auto;background:#fff;border-radius:8px;padding:10px;">
                <tr><td>
                  <img src="${siteUrl}/${paymentMethod}-qr.jpg" alt="QR Code" width="150" height="150" style="display:block;border-radius:6px;">
                </td></tr>
              </table>
              <p style="margin:10px 0 0;font-size:16px;font-weight:bold;color:${paymentMethod === 'gcash' ? '#007DFE' : '#F26522'};">₱${totalAmount.toLocaleString()}</p>
              <p style="margin:8px 0 0;font-size:11px;color:#888;">Can't scan? <a href="${siteUrl}/order/confirmation?orderNumber=${order.order_number}" style="color:#82C3A3;font-weight:600;">View on website</a></p>
            </td></tr>
          </table>
        </td></tr>

        <!-- Next Steps -->
        <tr><td style="padding:0 16px 16px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#E8F5EC;border:1px solid #A9DFBF;border-radius:10px;">
            <tr><td style="padding:14px;">
              <p style="margin:0 0 10px;font-size:14px;font-weight:600;color:#2D6A4F;">What to do next</p>
              <p style="margin:0 0 6px;font-size:13px;color:#2D6A4F;">1. Scan the QR code to pay</p>
              <p style="margin:0 0 6px;font-size:13px;color:#2D6A4F;">2. Screenshot your receipt</p>
              <p style="margin:0 0 12px;font-size:13px;color:#2D6A4F;">3. Send it to our Instagram</p>
              <a href="https://ig.me/m/bysistersandmom" style="display:block;background:linear-gradient(135deg,#833AB4,#E1306C,#F77737);color:#fff;padding:10px;border-radius:8px;text-decoration:none;font-weight:600;text-align:center;font-size:13px;">Message @bysistersandmom</a>
              <p style="margin:10px 0 0;font-size:11px;color:#2D6A4F;text-align:center;background:#d4edda;padding:6px;border-radius:6px;">We confirm within 1-2 hours (9AM-6PM)</p>
            </td></tr>
          </table>
        </td></tr>

        <!-- Track Button -->
        <tr><td style="padding:0 16px 16px;text-align:center;">
          <a href="${siteUrl}/track?orderNumber=${order.order_number}&phone=${phone}" style="display:inline-block;background:#82C3A3;color:#fff;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:14px;">Track Your Order</a>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:16px;text-align:center;background:#FFF8F5;border-top:1px solid #f0f0f0;">
          <p style="margin:0 0 8px;font-size:12px;color:#888;">Follow us for updates!</p>
          <a href="https://www.instagram.com/bysistersandmom/" style="display:inline-block;background:linear-gradient(135deg,#833AB4,#E1306C,#F77737);color:#fff;padding:8px 14px;border-radius:6px;text-decoration:none;font-size:12px;font-weight:500;">@bysistersandmom</a>
          <p style="margin:12px 0 0;font-size:10px;color:#ccc;">Website by DABCAS Digital Solutions</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
        `
      });
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // Don't fail the order if email fails, just log it
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.order_number
    });

  } catch (error) {
    console.error('Error in order creation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
