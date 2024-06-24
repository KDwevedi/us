import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../api.service';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { encrypt, decrypt, pack, unpack } from '../encryption';


@Injectable()
export class AddTimestampInterceptor implements NestInterceptor {
  constructor(private apiService: ApiService, private configService: ConfigService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const aesKey = this.configService.get<string>("AES_GCM_KEY")
    const now = new Date();
    const {cipher, iv, authTag, aad} = await encrypt(now.toISOString(), aesKey);

    const encryptedTimeStamp = `${pack(cipher)}:${pack(iv)}:${pack(authTag)}:${pack(aad)}`
    return next.handle().pipe(
      map(data => {
        const response: Response = context.switchToHttp().getResponse();
        // Checking if the response from the API is a success
        // if (data && data.responseCode === 'OK') {
          response.setHeader('X-Timestamp', encryptedTimeStamp);
        // }
        return {
            ...data,
            encryptedTimeStamp,
      };
  })
    );
  }
}

