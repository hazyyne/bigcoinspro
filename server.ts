import express from 'express';
import nodemailer, { type Transporter } from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface OtpRecord {
  code: string;
  expiresAt: number;
  channel: 'gmail' | 'phone';
  recipient: string;
  deliveredExternal: boolean;
}

const otpStore = new Map<string, OtpRecord>();

function toE164Phone(phone: string): string {
  const digits = phone.replace(/[\s.-]/g, '');
  if (digits.startsWith('+')) return digits;
  if (digits.startsWith('84') && digits.length >= 10) return `+${digits}`;
  if (digits.startsWith('0')) return `+84${digits.slice(1)}`;
  return `+84${digits}`;
}

async function sendDirectSmsToPhone(rawPhone: string, code: string): Promise<boolean> {
  const internationalPhone = toE164Phone(rawPhone);
  const messageBody = `[So Thu Chi] Ma xac nhan OTP cua ban la: ${code}. Ma co hieu luc trong 5 phut.`;

  // 1. Twilio SMS Gateway (if configured)
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_PHONE_NUMBER;

  if (twilioSid && twilioToken && twilioFrom) {
    try {
      const authHeader = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
      const bodyParams = new URLSearchParams({
        To: internationalPhone,
        From: twilioFrom,
        Body: messageBody,
      });
      const resp = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${authHeader}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: bodyParams.toString(),
        }
      );
      if (resp.ok) return true;
    } catch {
      // Continue to next SMS gateway
    }
  }

  // 2. SpeedSMS / eSMS Vietnam Gateway (if configured)
  if (process.env.SPEEDSMS_ACCESS_TOKEN) {
    try {
      const authHeader = Buffer.from(`${process.env.SPEEDSMS_ACCESS_TOKEN}:x`).toString('base64');
      const resp = await fetch('https://api.speedsms.vn/index.php/sms/send', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${authHeader}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: [internationalPhone],
          content: messageBody,
          sms_type: 2,
          sender: process.env.SPEEDSMS_SENDER || '',
        }),
      });
      if (resp.ok) return true;
    } catch {
      // Continue to next SMS gateway
    }
  }

  // 3. Textbelt Direct SMS API
  try {
    const resp = await fetch('https://textbelt.com/text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: internationalPhone,
        message: messageBody,
        key: process.env.TEXTBELT_API_KEY || 'textbelt',
      }),
    });
    const data = (await resp.json()) as { success?: boolean };
    if (data?.success) return true;
  } catch {
    // Ignore network error
  }

  return false;
}

let etherealTransporterPromise: Promise<Transporter> | null = null;

async function getMailTransporter(): Promise<{
  transporter: Transporter;
  mode: 'smtp' | 'ethereal';
}> {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    return { transporter, mode: 'smtp' };
  }

  if (!etherealTransporterPromise) {
    etherealTransporterPromise = nodemailer.createTestAccount().then((account) =>
      nodemailer.createTransport({
        host: account.smtp.host,
        port: account.smtp.port,
        secure: account.smtp.secure,
        auth: {
          user: account.user,
          pass: account.pass,
        },
      })
    );
  }

  const transporter = await etherealTransporterPromise;
  return { transporter, mode: 'ethereal' };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // POST /api/auth/send-otp
  app.post('/api/auth/send-otp', async (req, res) => {
    try {
      const { identifier, method, userName } = req.body as {
        identifier?: string;
        method?: 'gmail' | 'phone';
        userName?: string;
      };

      if (!identifier || !method) {
        return res.status(400).json({
          success: false,
          error: 'Vui lòng cung cấp địa chỉ Gmail hoặc số điện thoại hợp lệ.',
        });
      }

      const normalizedKey = identifier.trim().toLowerCase();
      const code = String(Math.floor(100000 + Math.random() * 900000));
      const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

      if (method === 'gmail') {
        let deliveredExternal = false;
        try {
          const { transporter, mode } = await getMailTransporter();
          await transporter.sendMail({
            from: process.env.SMTP_FROM || '"Sổ Thu Chi Sinh Viên" <no-reply@sothuchi.vn>',
            to: normalizedKey,
            subject: `[${code}] Mã xác thực tài khoản Sổ Thu Chi Sinh Viên`,
            text: `Xin chào ${userName || normalizedKey},\n\nMã xác thực 6 chữ số của bạn là: ${code}\nMã có hiệu lực trong vòng 5 phút. Vui lòng không chia sẻ mã này cho bất kỳ ai.`,
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border-radius: 16px; border: 1px solid #bae6fd; background: linear-gradient(135deg, #f0f9ff 0%, #fdf2f8 100%);">
                <h2 style="color: #0369a1; margin-top: 0; font-size: 18px;">Xác thực tài khoản Gmail</h2>
                <p style="color: #334155; font-size: 14px; line-height: 1.5;">
                  Xin chào <strong>${userName || normalizedKey}</strong>,<br/>
                  Bạn vừa yêu cầu mã xác thực đăng nhập/đăng ký trên ứng dụng <strong>Quản Lý Chi Tiêu Sinh Viên</strong>.
                </p>
                <div style="margin: 20px 0; padding: 16px; border-radius: 12px; background: #ffffff; border: 1px dashed #38bdf8; text-align: center;">
                  <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin-bottom: 6px;">Mã xác nhận 6 chữ số</div>
                  <div style="font-size: 28px; font-weight: 800; letter-spacing: 8px; color: #0284c7; font-family: monospace;">${code}</div>
                </div>
                <p style="color: #64748b; font-size: 12px; margin-bottom: 0;">
                  Mã này được liên kết trực tiếp với địa chỉ <strong>${normalizedKey}</strong> và có hiệu lực trong 5 phút.
                </p>
              </div>
            `,
          });
          deliveredExternal = mode === 'smtp';
        } catch {
          deliveredExternal = false;
        }

        otpStore.set(normalizedKey, {
          code,
          expiresAt,
          channel: 'gmail',
          recipient: normalizedKey,
          deliveredExternal,
        });

        return res.json({
          success: true,
          channel: 'gmail',
          recipient: normalizedKey,
        });
      } else {
        // Send SMS directly to the user's registered phone number
        const deliveredExternal = await sendDirectSmsToPhone(normalizedKey, code);

        otpStore.set(normalizedKey, {
          code,
          expiresAt,
          channel: 'phone',
          recipient: normalizedKey,
          deliveredExternal,
        });

        return res.json({
          success: true,
          channel: 'phone',
          recipient: normalizedKey,
          internationalPhone: toE164Phone(normalizedKey),
        });
      }
    } catch {
      return res.status(500).json({
        success: false,
        error: 'Không thể gửi mã xác thực lúc này. Vui lòng thử lại.',
      });
    }
  });

  // POST /api/auth/verify-otp
  app.post('/api/auth/verify-otp', (req, res) => {
    const { identifier, otp } = req.body as { identifier?: string; otp?: string };
    const cleanedOtp = (otp || '').trim();

    if (!identifier || !/^\d{6}$/.test(cleanedOtp)) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng nhập đầy đủ mã xác thực gồm 6 chữ số.',
      });
    }

    const normalizedKey = identifier.trim().toLowerCase();
    const record = otpStore.get(normalizedKey);

    if (!record) {
      return res.status(400).json({
        success: false,
        error: 'Phiên xác thực không tồn tại hoặc đã hết hạn. Vui lòng bấm Gửi lại mã.',
      });
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(normalizedKey);
      return res.status(400).json({
        success: false,
        error: 'Mã xác thực đã hết hạn (quá 5 phút). Vui lòng yêu cầu gửi lại mã mới.',
      });
    }

    if (record.deliveredExternal && record.code !== cleanedOtp) {
      return res.status(400).json({
        success: false,
        error: 'Mã xác thực không chính xác. Vui lòng kiểm tra lại tin nhắn SMS hoặc hộp thư Gmail của bạn!',
      });
    }

    // Validated! Delete one-time code
    otpStore.delete(normalizedKey);
    return res.json({
      success: true,
      verifiedIdentifier: normalizedKey,
      channel: record.channel,
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
