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
      subject: 'Nouă Alertă de Autentificare',
      text: `Bună ${username},\n\nAm observat o nouă autentificare în contul dvs. Dacă nu ați fost dvs., vă rugăm să vă schimbați imediat parola.\n\nCu respect,\nEchipa de Securitate`,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Login notification sent to:', email);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }
}
