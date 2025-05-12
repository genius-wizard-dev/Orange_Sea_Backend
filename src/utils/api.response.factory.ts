import { ApiProperty } from '@nestjs/swagger';
import { ResponeData } from './api.response';

export class SuccessResponseDto<T> implements ResponeData<T> {
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
  data?: T;
}


export class ErrorResponseDto implements ResponeData<null> {
  statusCode: number;
  message: string;
  error?: any;
}

function createResponse<T = any>(
  statusCode: number,
  message: string,
  data?: T | T[],
  error?: any,
): ResponeData<T> {
  const response: ResponeData<T> = { statusCode, message };

  if (data !== undefined && data !== null) {
    response.data = data;
  }

  if (error !== undefined && error !== null) {
    response.error = error;
  }

  return response;
}

export function successResponse<T = any>(
  data?: T | T[],
  message: string = 'Thành công',
): ResponeData<T> {
  return createResponse(200, message, data);
}

export function errorResponse(
  message: string,
  statusCode: number,
  error?: any,
): ResponeData<null> {
  return createResponse<null>(statusCode, message, null, error);
}

export function validationError(
  error: any,
  message: string = 'Dữ liệu không hợp lệ',
): ResponeData<null> {
  return createResponse<null>(422, message, null, error);
}

export function unauthorized(
  message: string = 'Không có quyền truy cập',
): ResponeData<null> {
  return createResponse<null>(401, message, null);
}

export function forbidden(
  message: string = 'Bị từ chối truy cập',
): ResponeData<null> {
  return createResponse<null>(403, message, null);
}

export function notFound(
  message: string = 'Không tìm thấy',
): ResponeData<null> {
  return createResponse<null>(404, message, null);
}

export function internalError(
  message: string = 'Lỗi máy chủ',
): ResponeData<null> {
  return createResponse<null>(500, message, null);
}
