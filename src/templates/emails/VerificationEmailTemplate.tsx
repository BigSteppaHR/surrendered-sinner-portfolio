
import React from 'react';

interface VerificationEmailTemplateProps {
  fullName: string;
  verificationUrl: string;
}

export const generateVerificationEmailTemplate = ({
  fullName,
  verificationUrl,
}: VerificationEmailTemplateProps): string => {
  const currentYear = new Date().getFullYear();
  
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
          Hi ${fullName},
        </p>
        
        <p style="margin: 20px 0; font-size: 16px; line-height: 1.5;">
          Thank you for signing up with Surrendered Sinner. We're excited to have you join our elite fitness coaching platform.
        </p>
        
        <p style="margin: 20px 0; font-size: 16px; line-height: 1.5;">
          To get started, please verify your email address by clicking the button below:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
            style="background-color: #FF2D2D; color: white; padding: 14px 28px; text-decoration: none; 
            border-radius: 4px; display: inline-block; font-size: 16px; font-weight: bold; text-transform: uppercase;
            border: none;">
            VERIFY EMAIL
          </a>
        </div>
        
        <p style="margin: 20px 0; font-size: 16px; line-height: 1.5;">
          If the button above doesn't work, you can copy and paste the following URL into your browser:
        </p>
        
        <div style="background-color: #222222; padding: 15px; border-radius: 4px; word-break: break-all; margin: 20px 0; font-size: 14px;">
          ${verificationUrl}
        </div>
        
        <p style="margin: 20px 0; font-size: 16px; line-height: 1.5;">
          This link will expire in 24 hours.
        </p>
        
        <p style="margin: 20px 0; font-size: 16px; line-height: 1.5;">
          If you did not sign up for this account, please ignore this email.
        </p>
      </div>
      
      <!-- Footer -->
      <div style="background-color: #000000; padding: 20px; text-align: center; border-top: 1px solid #333333;">
        <p style="color: #777777; margin: 0 0 10px; font-size: 14px;">
          Surrendered Sinner Elite Fitness Coaching
        </p>
        <p style="color: #777777; margin: 0; font-size: 12px;">
          &copy; ${currentYear} Surrendered Sinner. All rights reserved.
        </p>
      </div>
    </div>
  `;
};
