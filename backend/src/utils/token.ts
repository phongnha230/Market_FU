import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';

export interface TokenPayload {
  userId: string;
  role: string;
  email: string;
}

export interface RefreshTokenPayload extends TokenPayload {
  tokenVersion: number;
}

export const generateTokens = (payload: TokenPayload, tokenVersion: number = 0) => {
  const accessToken = jwt.sign(payload, ENV.JWT_SECRET, {
    expiresIn: ENV.JWT_EXPIRES_IN as any,
  });

  const refreshPayload: RefreshTokenPayload = {
    ...payload,
    tokenVersion,
  };

  const refreshToken = jwt.sign(refreshPayload, ENV.JWT_REFRESH_SECRET, {
    expiresIn: ENV.JWT_REFRESH_EXPIRES_IN as any,
  });

  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, ENV.JWT_SECRET) as TokenPayload;
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  return jwt.verify(token, ENV.JWT_REFRESH_SECRET) as RefreshTokenPayload;
};
