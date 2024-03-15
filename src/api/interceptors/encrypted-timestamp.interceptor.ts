import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from '../api.service'; // Adjust the path as necessary
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AddTimestampInterceptor implements NestInterceptor {
  constructor(private apiService: ApiService, private configService: ConfigService) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const aesKey = JSON.parse(this.configService.get<string>("AUDIT_PARSED_SECRET_KEY"))
    const now = new Date();
    const encryptedTimeStamp = this.apiService.encrypt(now.toISOString(), aesKey)
    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        response.setHeader('X-Timestamp', encryptedTimeStamp);
      }),
    );
  }
}
