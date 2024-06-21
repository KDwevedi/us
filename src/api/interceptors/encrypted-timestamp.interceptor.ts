import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from '../api.service'; // Adjust the path as necessary
import { ConfigService } from "@nestjs/config";
import { encrypt, decrypt, pack, unpack } from '../encryption.service';

@Injectable()
export class AddTimestampInterceptor implements NestInterceptor {
  constructor(private apiService: ApiService, private configService: ConfigService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const aesKey = this.configService.get<string>("AES_GCM_KEY")
    const now = new Date().toISOString();
    const {cipher, iv} = await encrypt(now, aesKey)
    const encryptedTimeStamp = `${iv}:${pack(cipher)}`
    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        response.setHeader('X-Timestamp', encryptedTimeStamp);
      }),
    );
  }
}
