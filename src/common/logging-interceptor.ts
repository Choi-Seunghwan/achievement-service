import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    console.log(
      `[Request] ${req.method} ${req.url} - Params:`,
      req.params,
      'Query:',
      req.query,
      'Body:',
      req.body,
    );

    return next.handle().pipe(
      tap((data) => {
        console.log(`[Response] ${req.method} ${req.url} - Response:`, data);
      }),
    );
  }
}
