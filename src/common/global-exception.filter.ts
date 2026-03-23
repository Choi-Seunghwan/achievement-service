import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';

/**
 * 전역 예외 필터
 * - PrismaClientKnownRequestError 처리
 * - 처리되지 않은 예외에 대한 사용자 친화적 메시지 반환
 * - 요청 컨텍스트(userId, endpoint) 로깅
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    // 요청 컨텍스트 정보 추출
    const userId = (request as any).user?.userId ?? 'anonymous';
    const endpoint = `${request.method} ${request.url}`;

    // Prisma 에러 처리
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const { status, message } = this.handlePrismaError(exception);

      this.logger.error(
        `[Prisma 에러] 코드: ${exception.code} | userId: ${userId} | endpoint: ${endpoint}`,
        exception.stack,
      );

      response.status(status).json({
        statusCode: status,
        message,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
      return;
    }

    // NestJS HttpException 처리
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      this.logger.error(
        `[HTTP 에러] 상태: ${status} | userId: ${userId} | endpoint: ${endpoint}`,
        exception.stack,
      );

      response.status(status).json({
        statusCode: status,
        message:
          typeof exceptionResponse === 'string'
            ? exceptionResponse
            : (exceptionResponse as any).message || exception.message,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
      return;
    }

    // 처리되지 않은 예외
    this.logger.error(
      `[미처리 에러] userId: ${userId} | endpoint: ${endpoint}`,
      exception instanceof Error ? exception.stack : String(exception),
    );

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  /**
   * Prisma 에러 코드별 사용자 친화적 메시지 매핑
   */
  private handlePrismaError(
    error: Prisma.PrismaClientKnownRequestError,
  ): { status: number; message: string } {
    switch (error.code) {
      // 고유 제약 조건 위반
      case 'P2002':
        return {
          status: HttpStatus.CONFLICT,
          message: '이미 존재하는 데이터입니다.',
        };
      // 레코드를 찾을 수 없음
      case 'P2025':
        return {
          status: HttpStatus.NOT_FOUND,
          message: '요청한 데이터를 찾을 수 없습니다.',
        };
      // 외래 키 제약 조건 위반
      case 'P2003':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: '관련 데이터가 존재하지 않습니다.',
        };
      // 기타 Prisma 에러
      default:
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: '데이터 처리 중 오류가 발생했습니다.',
        };
    }
  }
}
