import { Type } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { ErrorResponseDto, SuccessResponseDto } from './api.response.factory';

export function SwaggerSuccessResponse<T>(
  endpoint: string,
  controller: string,
  dataDto?: Type<T>,
  isArray?: boolean,
): Type<SuccessResponseDto<T>> {
  class SuccessResponseWithDataDto extends SuccessResponseDto<T> {
    @ApiProperty({
      example: dataDto,
      description: 'Dữ liệu trả về',
      required: false,
      type: dataDto,
      isArray: isArray,
    })
    data?: T;
  }

  Object.defineProperty(SuccessResponseWithDataDto, 'name', {
    value: `Success_${controller.charAt(0).toUpperCase() + controller.slice(1)}_${endpoint.charAt(0).toUpperCase() + endpoint.slice(1)}_Schema`,
  });

  return SuccessResponseWithDataDto;
}

export function SwaggerErrorResponse(
  statusCode: number,
  message: string,
  endpoint: string,
  controller: string,
): Type<ErrorResponseDto> {
  class CustomErrorResponseDto extends ErrorResponseDto {
    @ApiProperty({
      example: statusCode,
    })
    statusCode: number;

    @ApiProperty({
      example: message,
    })
    message: string;

    @ApiProperty({
      example: 'Thông tin lỗi',
    })
    error: string = 'Thông tin lỗi';
  }

  Object.defineProperty(CustomErrorResponseDto, 'name', {
    value: `Error_${statusCode}_${controller.charAt(0).toUpperCase() + controller.slice(1)}_${endpoint.charAt(0).toUpperCase() + endpoint.slice(1)}_Schema`,
  });

  return CustomErrorResponseDto;
}
