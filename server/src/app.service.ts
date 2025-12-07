import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getWelcomeMessage() {
    return {
      message: 'Welcome to the HelloClass API',
    };
  }
}
