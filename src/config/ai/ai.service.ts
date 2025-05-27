import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { generateObject } from 'ai';
import { z } from 'zod';

@Injectable()
export class AiService {
  private model;
  private readonly logger = new Logger(AiService.name);

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>(
      'GOOGLE_GENERATIVE_AI_API_KEY',
    );

    if (!apiKey) {
      this.logger.warn(
        'GOOGLE_GENERATIVE_AI_API_KEY is not set. AI image validation will not work correctly.',
      );
      return;
    }

    const googleAI = createGoogleGenerativeAI({
      apiKey,
    });

    this.model = googleAI('gemini-2.0-flash');
  }

  async checkImage(
    file: Buffer,
  ): Promise<{ isValid: boolean; reason?: string }> {
    try {
      if (!this.model) {
        this.logger.warn(
          'AI model not initialized. Skipping image validation.',
        );
        return { isValid: true };
      }

      this.logger.debug(
        `Checking image content with AI. Buffer size: ${file.length} bytes`,
      );

      // Convert Buffer to base64
      const base64Image = file.toString('base64');

      const { object } = await generateObject({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: `Bạn là một AI đánh giá hình ảnh, nhiệm vụ của bạn là kiểm tra xem hình ảnh có chứa nội dung vi phạm như: thuốc lá, rượu bia, chất cấm, vũ khí hoặc hình ảnh trái phép hay không; nếu ảnh vi phạm, hãy trả về lý do mô tả rõ nội dung vi phạm (ví dụ: ảnh có chứa điếu thuốc, chai rượu, vũ khí...); luôn trả lời bằng tiếng Việt, trình bày rõ ràng, dễ hiểu.`,
          },
          {
            role: 'user',
            content: [
              {
                type: 'image',
                image: base64Image,
              },
            ],
          },
        ],
        schema: z.object({
          isValid: z.boolean(),
          reason: z.string().optional().describe('Lý do nếu isValid là false'),
        }),
      });

      this.logger.debug(`AI image check result: ${JSON.stringify(object)}`);
      return object;
    } catch (error) {
      this.logger.error(
        `Lỗi khi phân tích hình ảnh: ${error.message}`,
        error.stack,
      );
      return { isValid: true };
    }
  }
}
