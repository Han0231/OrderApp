// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const sgMail = require('@sendgrid/mail');

admin.initializeApp();
sgMail.setApiKey(functions.config().sendgrid.key);

exports.sendOrderReceipt = functions.firestore
  .document('orders/{orderId}')
  .onCreate(async (snap, context) => {
    const order = snap.data();

    if (!order?.email) {
      console.error('No email found in order');
      return;
    }
    const createdAt = order.createdAt.toDate();

    const msg = {
      to: order.email,
      from: 'replies.jay@gmail.com', // Verified SendGrid sender
      subject: `Order Receipt #${context.params.orderId}`,
      html: `
        <h1>Thank you for your order, ${order.customerName || 'Customer'}!</h1>
        <h2>Order #${context.params.orderId}</h2>
        <h3>Items:</h3>
        <ul>
          ${order.items.map(item => `
            <li>${item.name} - $${item.price.toFixed(2)}</li>
          `).join('')}
        </ul>
        <h3>Total: $${order.total.toFixed(2)}</h3>
        <h4>Order Date: ${createdAt}</h4>
        <p>If you have any questions, feel free to contact us.</p>
        <p>Thank you for ordering with us!</p>
      `,
    };

    try {
      await sgMail.send(msg);
      console.log('Email sent to:', order.email);
    } catch (error) {
      console.error('SendGrid error:', {
        status: error.response?.statusCode,
        errors: error.response?.body?.errors,
        message: error.message
      });
    }
  });
