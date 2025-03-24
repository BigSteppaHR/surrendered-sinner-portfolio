
interface VerificationEmailParams {
  fullName: string;
  verificationUrl: string;
}

export const generateVerificationEmailTemplate = ({ fullName, verificationUrl }: VerificationEmailParams): string => {
  return `
    <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #000000;">
      <!-- Header with Logo -->
      <div style="background-color: #111111; padding: 20px; text-align: center; border-bottom: 3px solid #FF2D2D;">
        <h1 style="color: #FFFFFF; margin: 0; font-size: 28px; font-weight: bold;">
          SURRENDERED<span style="color: #FF2D2D;">SINNER</span>
        </h1>
        <p style="color: #AAAAAA; margin: 5px 0 0; font-size: 16px;">Elite Fitness Coaching</p>
      </div>
      
      <!-- Main Content -->
      <div style="background-color: #111111; color: #FFFFFF; padding: 30px 20px;">
        <h2 style="color: #FFFFFF; margin-top: 0; font-size: 22px; border-bottom: 1px solid #333333; padding-bottom: 10px;">
          Verify Your Email
        </h2>
        
        <p style="margin: 20px 0; font-size: 16px; line-height: 1.5;">
          Hello ${fullName || 'there'},
        </p>
        
        <p style="margin: 20px 0; font-size: 16px; line-height: 1.5;">
          Thank you for signing up! To get started, please verify your email address by clicking the button below:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #FF2D2D; color: #FFFFFF; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 4px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        
        <p style="margin: 20px 0; font-size: 16px; line-height: 1.5;">
          If the button above doesn't work, please copy and paste the following URL into your browser:
        </p>
        
        <p style="margin: 20px 0; font-size: 14px; background-color: #222222; padding: 10px; border-radius: 4px; word-break: break-all;">
          ${verificationUrl}
        </p>
        
        <p style="margin: 20px 0; font-size: 16px; line-height: 1.5;">
          This verification link will expire in 24 hours.
        </p>
        
        <p style="margin: 20px 0; font-size: 16px; line-height: 1.5;">
          If you did not create an account, please ignore this email.
        </p>
      </div>
      
      <!-- Footer -->
      <div style="background-color: #000000; padding: 20px; text-align: center; border-top: 1px solid #333333;">
        <p style="color: #777777; margin: 0 0 10px; font-size: 14px;">
          Surrendered Sinner Elite Fitness Coaching
        </p>
        <p style="color: #777777; margin: 0; font-size: 12px;">
          &copy; ${new Date().getFullYear()} Surrendered Sinner. All rights reserved.
        </p>
      </div>
    </div>
  `;
};
