import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
  } from '@nestjs/common';
  import { Request, Response } from 'express';
  
  @Catch()
  export class AllExceptionsFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const request = ctx.getRequest<Request>();
  
      const status =
        exception instanceof HttpException
          ? exception.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;
  
      const exceptionResponse =
        exception instanceof HttpException
          ? exception.getResponse()
          : null;
  
      let message = 'Lỗi hệ thống nội bộ';
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        message = (exceptionResponse as any).message || exception.message || message;
      } else if (exception.message) {
        message = exception.message;
      }
  
      response.status(status).json({
        success: false,
        statusCode: status,
        message: Array.isArray(message) ? message.join(', ') : message,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
  }