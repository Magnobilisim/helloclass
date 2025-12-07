import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as pkg from '../../../package.json';

@Injectable()
export class HealthService {
  constructor(private readonly configService: ConfigService) {}

  getStatus() {
    return {
      status: 'ok',
      environment: this.configService.get<string>('environment'),
      version: (pkg as { version?: string }).version ?? '0.0.0',
      timestamp: new Date().toISOString(),
    };
  }
}
