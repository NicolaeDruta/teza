import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendLoginNotification(email: string, username: string) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'New Login Alert',
      text: `Hello ${username},\n\nWe noticed a new login to your account. If this was not you, please change your password immediately.\n\nBest regards,\nYour Security Team`,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Login notification sent to:', email);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }
}
