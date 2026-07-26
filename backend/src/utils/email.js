const { Resend } = require('resend')

const resend = new Resend(process.env.RESEND_API_KEY)

const sendBookingConfirmation = async ({ to, name, hospitalName, testName, date, time, price, bookingId }) => {
  try {
    await resend.emails.send({
      from: 'MedCompare <onboarding@resend.dev>',
      to,
      subject: `Booking Confirmed — ${testName} at ${hospitalName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          
          <div style="background: linear-gradient(135deg, #0d9488, #3b82f6); padding: 30px; border-radius: 16px; text-align: center; margin-bottom: 24px;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🏥 MedCompare</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0 0; font-size: 14px;">Your appointment is confirmed</p>
          </div>

          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
            <h2 style="color: #166534; margin: 0 0 4px 0; font-size: 18px;">✅ Booking Confirmed!</h2>
            <p style="color: #15803d; margin: 0; font-size: 14px;">Hi ${name}, your appointment has been successfully booked.</p>
          </div>

          <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
            <h3 style="color: #374151; margin: 0 0 16px 0; font-size: 16px;">Appointment Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 10px 0; color: #6b7280; font-size: 13px;">Booking ID</td>
                <td style="padding: 10px 0; color: #111827; font-weight: bold; font-size: 13px;">#${bookingId}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 10px 0; color: #6b7280; font-size: 13px;">Hospital</td>
                <td style="padding: 10px 0; color: #111827; font-weight: bold; font-size: 13px;">${hospitalName}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 10px 0; color: #6b7280; font-size: 13px;">Test</td>
                <td style="padding: 10px 0; color: #111827; font-weight: bold; font-size: 13px;">${testName}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 10px 0; color: #6b7280; font-size: 13px;">Date</td>
                <td style="padding: 10px 0; color: #111827; font-weight: bold; font-size: 13px;">${date}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 10px 0; color: #6b7280; font-size: 13px;">Time</td>
                <td style="padding: 10px 0; color: #111827; font-weight: bold; font-size: 13px;">${time}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #6b7280; font-size: 13px;">Amount</td>
                <td style="padding: 10px 0; color: #0d9488; font-weight: bold; font-size: 16px;">₹${price}</td>
              </tr>
            </table>
          </div>

          <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
            <p style="color: #92400e; margin: 0; font-size: 13px;">
              ⚠️ <strong>Please bring:</strong> This confirmation, a valid ID proof, and any previous reports if applicable.
            </p>
          </div>

          <div style="text-align: center; margin-bottom: 20px;">
            <a href="https://medcompare-frontend.vercel.app/my-bookings"
              style="background: linear-gradient(135deg, #0d9488, #3b82f6); color: white; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">
              View My Bookings →
            </a>
          </div>

          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
            MedCompare · Compare diagnostic test prices across hospitals
          </p>
        </div>
      `
    })
    console.log('✅ Email sent to:', to)
  } catch (error) {
    console.log('❌ Email error:', error.message)
  }
}

module.exports = { sendBookingConfirmation }