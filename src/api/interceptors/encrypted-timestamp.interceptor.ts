import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../api.service';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';


@Injectable()
export class AddTimestampInterceptor implements NestInterceptor {
  constructor(private apiService: ApiService, private configService: ConfigService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const aesKey = JSON.parse(this.configService.get<string>("AUDIT_PARSED_SECRET_KEY"));
    const now = new Date();
    const encryptedTimeStamp = this.apiService.encrypt(now.toISOString(), aesKey);

    return next.handle().pipe(
      map(data => {
        const response: Response = context.switchToHttp().getResponse();
        // Checking if the response from the API is a success
        if (data && data.responseCode === 'OK') {
          response.setHeader('X-Timestamp', encryptedTimeStamp);
        }
        return data;
      })
    );
  }
}

