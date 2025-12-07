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

    // Format items for email
    const itemsList = items.map(item => {
      const productName = productMap.get(item.productId) || 'Unknown Product';
      return `• ${productName} × ${item.quantity} = ₱${item.subtotal.toLocaleString()}`;
    }).join('\n');

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

    // Send confirmation email
    try {
      await resend.emails.send({
        from: 'Sisters & Mom Pastry <orders@sistersandmom.site>',
        to: email,
        subject: `Order Confirmation - ${order.order_number}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="${siteUrl}/logo.jpg" alt="Sisters & Mom" style="width: 80px; height: 80px; border-radius: 50%; margin-bottom: 15px;">
              <h1 style="color: #82C3A3; margin-bottom: 5px;">Sisters & Mom</h1>
              <p style="color: #666; margin: 0;">Order Confirmation</p>
            </div>

            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
              <h2 style="color: #333; margin-top: 0;">Hi ${customerName}!</h2>
              <p>Thank you for your order. Here are your order details:</p>

              <div style="background-color: #82C3A3; color: white; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
                <p style="margin: 0; font-size: 14px;">Your Order Number</p>
                <p style="margin: 5px 0 0 0; font-size: 28px; font-weight: bold; letter-spacing: 2px;">${order.order_number}</p>
              </div>

              <h3 style="color: #333; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Order Summary</h3>
              <pre style="font-family: Arial, sans-serif; white-space: pre-wrap; margin: 0;">${itemsList}</pre>
              <p style="font-size: 18px; font-weight: bold; color: #82C3A3; margin-top: 15px;">Total: ₱${totalAmount.toLocaleString()}</p>

              <h3 style="color: #333; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Pickup Details</h3>
              <p><strong>Date:</strong> ${formattedPickupDate}</p>
              ${orderNotes ? `<p><strong>Notes:</strong> ${orderNotes}</p>` : ''}
            </div>

            <div style="background-color: #FDF2F0; padding: 20px; border-radius: 10px; margin-bottom: 20px; border: 1px solid #FADBD8;">
              <h3 style="color: #8B5A2B; margin-top: 0;">Payment Instructions</h3>
              <p style="color: #6B4423;">Please pay <strong>₱${totalAmount.toLocaleString()}</strong> using <strong>${paymentMethodName}</strong>:</p>

              <div style="background-color: white; padding: 15px; border-radius: 8px; margin: 15px 0; text-align: center;">
                <img src="${siteUrl}/${paymentMethod}-qr.jpg" alt="${paymentMethodName} QR Code" style="max-width: 200px; border-radius: 8px; display: block; margin: 0 auto;">
              </div>

              <p style="color: #6B4423; font-size: 14px; text-align: center;">If QR doesn't load: <a href="${siteUrl}/order/confirmation?orderNumber=${order.order_number}" style="color: #82C3A3; font-weight: bold;">View payment details on our website</a></p>
            </div>

            <div style="background-color: #E8F5EC; padding: 20px; border-radius: 10px; margin-bottom: 20px; border: 1px solid #A9DFBF;">
              <h3 style="color: #2D6A4F; margin-top: 0;">Next Steps</h3>
              <ol style="color: #2D6A4F; padding-left: 20px;">
                <li>Pay ₱${totalAmount.toLocaleString()} using ${paymentMethodName} (scan QR code above)</li>
                <li>Take a screenshot of your payment receipt</li>
                <li>Send the screenshot to our Instagram: <a href="https://ig.me/m/bysistersandmom" style="color: #1B4332; font-weight: bold;">@bysistersandmom</a></li>
                <li>Include your order number: <strong>${order.order_number}</strong></li>
                <li>Wait for our confirmation message</li>
              </ol>
            </div>

            <div style="background-color: #E8F5EC; padding: 20px; border-radius: 10px; margin-bottom: 20px; border: 1px solid #82C3A3;">
              <h3 style="color: #1B4332; margin-top: 0;">Courier Booking (When Order is Ready)</h3>
              <p style="color: #2D6A4F;">When you receive notification that your order is ready:</p>
              <ul style="color: #2D6A4F; padding-left: 20px;">
                <li><strong>Shop Address:</strong> Blk 13 Lot 14 Dahlia St. Pineda Subdivision, Dau, Mabalacat Pampanga, Philippines 2010</li>
                <li><strong>Contact Number:</strong> 0917-815-8007</li>
                <li><strong>Order Number:</strong> ${order.order_number}</li>
              </ul>
              <p style="color: #2D6A4F; font-size: 14px;">Book via Grab or Maxim and provide the order number to the courier.</p>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="color: #666; font-size: 14px;">Track your order anytime:</p>
              <a href="${siteUrl}/track?orderNumber=${order.order_number}&phone=${phone}" style="display: inline-block; background-color: #82C3A3; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 10px;">Track Order</a>
              <p style="color: #999; font-size: 12px; margin-top: 20px;">
                Questions? DM us on Instagram <a href="https://www.instagram.com/bysistersandmom/" style="color: #82C3A3;">@bysistersandmom</a>
              </p>
              <p style="color: #ccc; font-size: 10px; margin-top: 15px;">
                Website by <strong>DABCAS Digital Solutions</strong> • <a href="mailto:imdenisalimpolos@gmail.com" style="color: #82C3A3;">imdenisalimpolos@gmail.com</a>
              </p>
            </div>
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
