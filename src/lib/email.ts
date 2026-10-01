// DHAAGAÉ Email Notification Service (Powered by Resend)

export interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  items: Array<{ name: string; quantity: number; price: number; size?: string }>;
  shippingAddress: string;
  status?: string;
  trackingNumber?: string;
}

export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  const apiKey = process.env.EMAIL_API_KEY;
  if (!apiKey || apiKey.startsWith('your-')) {
    console.log('[Email Simulation] Order confirmation email logged for', data.customerEmail);
    return { success: true, simulated: true };
  }

  const itemsHtml = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #f3ece6;">${item.name} (${item.size || '3-4Y'})</td>
        <td style="padding: 8px; border-bottom: 1px solid #f3ece6; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #f3ece6; text-align: right;">PKR ${item.price.toLocaleString()}</td>
      </tr>`
    )
    .join('');

  const html = `
    <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: #fffcf8; border: 1px solid #e8ded4; border-radius: 12px; overflow: hidden;">
      <div style="background: #4a1525; padding: 28px; text-align: center; color: #fff;">
        <h1 style="margin: 0; font-size: 26px; letter-spacing: 4px; text-transform: uppercase;">DHAAGAÉ</h1>
        <p style="margin: 6px 0 0; font-size: 13px; color: #f5d6c6; font-style: italic;">Little Outfits, Beautifully Crafted</p>
      </div>

      <div style="padding: 32px; color: #3d312a;">
        <h2 style="font-size: 20px; color: #4a1525; margin-top: 0;">Order Confirmed: #${data.orderNumber}</h2>
        <p>Dear ${data.customerName},</p>
        <p>Thank you for choosing DHAAGAÉ. Our master artisans have received your order and will carefully begin handcrafting your little angel's outfit with pure fabrics and exquisite detailing.</p>

        <h3 style="font-size: 16px; border-bottom: 2px solid #e0b0b4; padding-bottom: 6px; margin-top: 24px;">Order Summary</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
          <thead>
            <tr style="background: #f7efe7; color: #5a3c2c;">
              <th style="padding: 8px; text-align: left;">Outfit</th>
              <th style="padding: 8px; text-align: center;">Qty</th>
              <th style="padding: 8px; text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="text-align: right; font-size: 16px; font-weight: bold; color: #4a1525; margin-bottom: 24px;">
          Total: PKR ${data.total.toLocaleString()}
        </div>

        <div style="background: #fdf6f0; border-left: 4px solid #b38d8f; padding: 12px 16px; font-size: 13px; border-radius: 4px;">
          <strong>Delivery Destination:</strong><br/>
          ${data.shippingAddress}
        </div>

        <p style="margin-top: 28px; font-size: 13px; color: #7a6358;">
          Have questions or customization updates? Simply reply to this email or contact our atelier directly via WhatsApp at +92 300 1234567.
        </p>
      </div>

      <div style="background: #f3ece6; padding: 16px; text-align: center; font-size: 12px; color: #8c7568;">
        © 2026 DHAAGAÉ Luxury Children's Couture. All rights reserved.
      </div>
    </div>
  `;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: 'DHAAGAÉ Atelier <onboarding@resend.dev>',
        to: data.customerEmail.includes('@example.com') ? 'delivered@resend.dev' : data.customerEmail,
        subject: `✨ DHAAGAÉ Order Confirmed: #${data.orderNumber}`,
        html,
      }),
    });

    const resData = await res.json();
    return { success: res.ok, data: resData };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.warn('Failed to send Resend email:', message);
    return { success: false, error: message };
  }
}

export async function sendOrderStatusUpdateEmail(data: OrderEmailData) {
  const apiKey = process.env.EMAIL_API_KEY;
  if (!apiKey || apiKey.startsWith('your-')) return { success: true };

  const html = `
    <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: #fffcf8; border: 1px solid #e8ded4; border-radius: 12px; overflow: hidden;">
      <div style="background: #4a1525; padding: 24px; text-align: center; color: #fff;">
        <h1 style="margin: 0; font-size: 24px; letter-spacing: 4px;">DHAAGAÉ</h1>
      </div>
      <div style="padding: 30px; color: #3d312a;">
        <h2 style="font-size: 18px; color: #4a1525;">Status Update: Order #${data.orderNumber}</h2>
        <p>Dear ${data.customerName},</p>
        <p>The status of your handcrafted order has been updated to: <strong>${data.status}</strong></p>
        ${data.trackingNumber ? `<p><strong>Courier Tracking Number:</strong> ${data.trackingNumber}</p>` : ''}
        <p>Thank you for letting DHAAGAÉ be part of your celebrations.</p>
      </div>
    </div>
  `;

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: 'DHAAGAÉ Atelier <onboarding@resend.dev>',
        to: data.customerEmail.includes('@example.com') ? 'delivered@resend.dev' : data.customerEmail,
        subject: `Update on your DHAAGAÉ Order #${data.orderNumber}: ${data.status}`,
        html,
      }),
    });
    return { success: true };
  } catch {
    return { success: false };
  }
}
