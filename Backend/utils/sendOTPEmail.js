import { Resend } from 'resend';

const sendOTPEmail = async (recipientEmail, otp) => {
    try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
            from: 'Quiz Platform <onboarding@resend.dev>', // Default Resend testing email
            to: recipientEmail,
            subject: 'Quiz Platform - Verify your email',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Verify your email</h2>
                    <p>Your verification code is:</p>
                    <h1 style="font-size: 32px; letter-spacing: 4px; color: #2563eb;">${otp}</h1>
                    <p>This code expires in 10 minutes.</p>
                    <p>If you did not create an account, you can ignore this email.</p>
                </div>
            `
        });
        return true;
    } catch (error) {
        console.error("Error sending OTP email with Resend: ", error);
        return false;
    }
};

export default sendOTPEmail;
