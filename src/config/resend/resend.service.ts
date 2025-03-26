import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class ResendService {
  private readonly logger = new Logger(ResendService.name);
  private readonly resend: Resend;

  constructor(private readonly configService: ConfigService) {
    const resendApiKey = this.configService.get('RESEND_API_KEY');
    if (!resendApiKey) {
      this.logger.error('RESEND_API_KEY không được cấu hình trong file .env');
    }
    this.resend = new Resend(resendApiKey);

    // Kiểm tra kết nối Resend khi khởi động
    this.checkResendConnection();
  }

  private async checkResendConnection(): Promise<void> {
    try {
      await this.resend.apiKeys.list();
      this.logger.debug('Kết nối thành công đến dịch vụ Resend');
    } catch (error) {
      this.logger.error(`Không thể kết nối đến dịch vụ Resend: ${error.message}`, error.stack);
    }
  }

  async sendOTPEmail(email: string, otp: string): Promise<void> {
    try {
      await this.resend.emails.send({
        from: 'Orange Sea <no-reply@nonegroup.io.vn>',
        to: email,
        subject: 'Xác minh đăng ký tài khoản',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Xác minh đăng ký tài khoản</title>
          </head>
          <body>
            <div>
              <h1>Xác minh đăng ký tài khoản</h1>
              <p>Xin chào,</p>
              <p>Mã xác minh của bạn là: <strong>${otp}</strong></p>
              <p>Mã này sẽ hết hạn sau 5 phút.</p>
              <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
              <p>Trân trọng,<br>Đội ngũ Orange Sea</p>
            </div>
          </body>
          </html>
        `,
      });

      this.logger.debug(`Email OTP đã được gửi thành công đến ${email}`);
    } catch (error) {
      this.logger.error(`Lỗi khi gửi email OTP đến ${email}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async sendPasswordResetEmail(email: string, resetLink: string): Promise<void> {
    try {
      await this.resend.emails.send({
        from: 'Orange Sea <no-reply@orangesea.io.vn>',
        to: email,
        subject: 'Reset mật khẩu Orange Sea',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset mật khẩu Orange Sea</title>
          </head>
          <body class="bg-gray-100 font-sans">
            <div>
              <h1>Yêu cầu reset mật khẩu</h1>

              <p>Xin chào,</p>

              <p>Chúng tôi đã nhận được yêu cầu reset mật khẩu cho tài khoản Orange Sea của bạn. Để tiếp tục quá trình này, vui lòng truy cập vào liên kết bên dưới.</p>

              <div>
                <a href="${resetLink}">
                  Reset mật khẩu ngay
                </a>
              </div>

              <p><strong>Lưu ý:</strong> Liên kết này sẽ hết hạn sau 1 giờ kể từ khi nhận được email và chỉ có thể sử dụng một lần.</p>

              <p>Nếu bạn không yêu cầu reset mật khẩu, vui lòng bỏ qua email này hoặc liên hệ với đội hỗ trợ của chúng tôi nếu bạn có thắc mắc.</p>

              <p>
                Trân trọng,<br>
                Đội ngũ Orange Sea
              </p>

              <div>
                <p>&copy; ${new Date().getFullYear()} Orange Sea. Tất cả các quyền được bảo lưu.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });

      this.logger.debug(`Email reset mật khẩu đã được gửi thành công đến ${email}`);
    } catch (error) {
      this.logger.error(`Lỗi khi gửi email reset mật khẩu đến ${email}: ${error.message}`, error.stack);
      throw error;
    }
  }
}
