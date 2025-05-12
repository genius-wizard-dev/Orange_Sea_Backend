import { ApiProperty } from '@nestjs/swagger';

export class ResponeData<T = any> {
  @ApiProperty({
    example: 200,
    description: 'HTTP status code',
  })
  statusCode: number;

  @ApiProperty({
    example: 'Thành công',
    description: 'Thông báo kết quả',
  })
  message: string;

  @ApiProperty({
    description: 'Dữ liệu trả về',
    required: false,
  })
  data?: T | T[];

  @ApiProperty({
    description: 'Thông tin lỗi chi tiết',
    required: false,
  })
  error?: string;
}
