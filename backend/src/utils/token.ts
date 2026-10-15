import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';

export interface TokenPayload {
  userId: string;
  role: string;
  email: string;
  tokenVersion?: number;
}

export interface RefreshTokenPayload extends TokenPayload {
  tokenVersion: number;
  jti?: string;
}

export const generateTokens = (payload: TokenPayload, tokenVersion: number = 0) => {
  const accessToken = jwt.sign({ ...payload, tokenVersion }, ENV.JWT_SECRET, {
    expiresIn: ENV.JWT_EXPIRES_IN as any,
  });

  const jti = crypto.randomUUID();
  const refreshPayload: RefreshTokenPayload = {
    ...payload,
    tokenVersion,
  };

  const refreshToken = jwt.sign(refreshPayload, ENV.JWT_REFRESH_SECRET, {
    expiresIn: ENV.JWT_REFRESH_EXPIRES_IN as any,
    jwtid: jti,
  });

  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, ENV.JWT_SECRET) as TokenPayload;
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  return jwt.verify(token, ENV.JWT_REFRESH_SECRET) as RefreshTokenPayload;
};
