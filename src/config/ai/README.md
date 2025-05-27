# AI Service Module

Module này cung cấp khả năng kiểm tra nội dung hình ảnh bằng Google Generative AI (Gemini).

## Tính năng

- Kiểm tra nội dung hình ảnh không phù hợp (thuốc lá, rượu bia, chất cấm, vũ khí hoặc hình ảnh trái phép)
- Chặn việc tải lên hình ảnh không phù hợp

## Cài đặt

1. Thêm API key vào file `.env`:

```
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
```

2. Đảm bảo đã cài đặt các thư viện cần thiết:

```bash
npm install ai @ai-sdk/google zod
```

## Cách sử dụng

1. Import AiModule vào module của bạn:

```typescript
import { AiModule } from 'src/config/ai/ai.module';

@Module({
  imports: [
    // ...
    AiModule,
    // ...
  ],
})
export class YourModule {}
```

2. Inject AiService vào service của bạn:

```typescript
import { AiService } from 'src/config/ai/ai.service';

@Injectable()
export class YourService {
  constructor(private readonly aiService: AiService) {}

  async yourMethod() {
    // Kiểm tra nội dung hình ảnh
    const checkResult = await this.aiService.checkImage(imageBuffer);

    if (!checkResult.isValid) {
      throw new BadRequestException(
        `Hình ảnh chứa nội dung không phù hợp: ${checkResult.reason}`,
      );
    }

    // Tiếp tục xử lý nếu hình ảnh phù hợp
  }
}
```
