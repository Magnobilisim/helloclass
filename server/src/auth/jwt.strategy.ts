import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

interface CognitoJwtPayload {
  sub: string;
  email?: string;
  [key: string]: any;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      audience: configService.get<string>('cognito.clientId'),
      issuer: configService.get<string>('cognito.authority'),
    });
  }

  async validate(payload: CognitoJwtPayload) {
    return {
      userId: payload.sub,
      email: payload.email,
      claims: payload,
    };
  }
}
