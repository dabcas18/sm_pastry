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

    // Extract first name for personalized greeting
    const firstName = customerName.split(' ')[0];

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
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #FFF8F5;">
            <div style="background-color: white; border-radius: 16px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">

              <!-- Header -->
              <div style="text-align: center; margin-bottom: 25px;">
                <img src="${siteUrl}/logo.jpg" alt="Sisters & Mom" style="width: 70px; height: 70px; border-radius: 50%; margin-bottom: 12px;">
                <h1 style="color: #82C3A3; margin: 0; font-size: 22px;">Thank you, ${firstName}!</h1>
                <p style="color: #666; margin: 5px 0 0 0; font-size: 14px;">Your order has been placed successfully</p>
              </div>

              <!-- Order Number Card -->
              <div style="background: linear-gradient(135deg, #82C3A3 0%, #6BAF8B 100%); color: white; padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
                <p style="margin: 0; font-size: 12px; opacity: 0.9;">ORDER NUMBER</p>
                <p style="margin: 8px 0 0 0; font-size: 26px; font-weight: bold; letter-spacing: 2px;">${order.order_number}</p>
                <p style="margin: 12px 0 0 0; font-size: 13px; opacity: 0.9;">Pickup: ${formattedPickupDate}</p>
              </div>

              <!-- Order Summary -->
              <div style="background-color: #f8f9fa; padding: 18px; border-radius: 10px; margin-bottom: 20px;">
                <h3 style="color: #333; margin: 0 0 12px 0; font-size: 15px;">Order Summary</h3>
                <div style="font-size: 14px; color: #555;">${itemsList.replace(/\n/g, '<br>')}</div>
                <div style="border-top: 1px solid #e0e0e0; margin-top: 12px; padding-top: 12px;">
                  <p style="font-size: 18px; font-weight: bold; color: #82C3A3; margin: 0;">Total: ₱${totalAmount.toLocaleString()}</p>
                </div>
                ${orderNotes ? `<p style="font-size: 13px; color: #666; margin: 10px 0 0 0;"><strong>Notes:</strong> ${orderNotes}</p>` : ''}
              </div>

              <!-- Payment Section -->
              <div style="background-color: #FFF9E6; padding: 18px; border-radius: 10px; margin-bottom: 20px; border: 1px solid #FFE082;">
                <h3 style="color: #8B6914; margin: 0 0 12px 0; font-size: 15px;">Pay via ${paymentMethodName}</h3>
                <div style="background-color: white; padding: 15px; border-radius: 8px; text-align: center;">
                  <img src="${siteUrl}/${paymentMethod}-qr.jpg" alt="${paymentMethodName} QR Code" style="max-width: 180px; border-radius: 8px;">
                  <p style="color: #8B6914; font-weight: bold; font-size: 16px; margin: 12px 0 0 0;">₱${totalAmount.toLocaleString()}</p>
                </div>
                <p style="color: #8B6914; font-size: 12px; text-align: center; margin: 12px 0 0 0;">Can't scan? <a href="${siteUrl}/order/confirmation?orderNumber=${order.order_number}" style="color: #82C3A3; font-weight: bold;">View on website</a></p>
              </div>

              <!-- Next Steps -->
              <div style="background-color: #E8F5EC; padding: 18px; border-radius: 10px; margin-bottom: 20px; border: 1px solid #A9DFBF;">
                <h3 style="color: #2D6A4F; margin: 0 0 12px 0; font-size: 15px;">What to do next</h3>
                <ol style="color: #2D6A4F; padding-left: 18px; margin: 0; font-size: 14px;">
                  <li style="margin-bottom: 8px;">Scan the QR code above to pay</li>
                  <li style="margin-bottom: 8px;">Screenshot your payment receipt</li>
                  <li style="margin-bottom: 8px;">Send it to our Instagram with your order number</li>
                </ol>
                <a href="https://ig.me/m/bysistersandmom" style="display: block; background: linear-gradient(135deg, #833AB4 0%, #E1306C 50%, #F77737 100%); color: white; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; text-align: center; margin-top: 15px; font-size: 14px;">Message @bysistersandmom</a>
                <p style="color: #2D6A4F; font-size: 12px; margin: 12px 0 0 0; text-align: center; background-color: #d4edda; padding: 8px; border-radius: 6px;">We usually confirm within 1-2 hours (9 AM - 6 PM)</p>
              </div>

              <!-- Pickup Info (Collapsed) -->
              <div style="background-color: #f0f0f0; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                <h3 style="color: #555; margin: 0 0 8px 0; font-size: 14px;">When your order is ready</h3>
                <p style="color: #666; font-size: 13px; margin: 0;">Book a courier (Grab/Maxim) to pickup from:</p>
                <p style="color: #333; font-size: 13px; margin: 8px 0 0 0;"><strong>Blk 13 Lot 14 Dahlia St. Pineda Subdivision, Dau, Mabalacat Pampanga 2010</strong></p>
                <p style="color: #666; font-size: 13px; margin: 5px 0 0 0;">Contact: 0917-815-8007</p>
              </div>

              <!-- Track Order Button -->
              <div style="text-align: center; margin-bottom: 25px;">
                <a href="${siteUrl}/track?orderNumber=${order.order_number}&phone=${phone}" style="display: inline-block; background-color: #82C3A3; color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 15px;">Track Your Order</a>
              </div>

              <!-- Friendly Closing -->
              <div style="text-align: center; padding: 20px; background-color: #FFF8F5; border-radius: 10px; margin-bottom: 20px;">
                <p style="color: #666; font-size: 14px; margin: 0 0 10px 0;">We're excited to bake for you!</p>
                <a href="https://www.instagram.com/bysistersandmom/" style="display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #833AB4 0%, #E1306C 50%, #F77737 100%); color: white; padding: 10px 16px; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 500;">Follow @bysistersandmom</a>
              </div>

              <!-- Footer -->
              <div style="text-align: center; padding-top: 15px; border-top: 1px solid #eee;">
                <p style="color: #999; font-size: 11px; margin: 0;">
                  Questions? DM us on <a href="https://www.instagram.com/bysistersandmom/" style="color: #82C3A3;">Instagram</a>
                </p>
                <p style="color: #ccc; font-size: 10px; margin: 10px 0 0 0;">
                  Website by <strong>DABCAS Digital Solutions</strong>
                </p>
              </div>
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
