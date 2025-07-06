import * as jwt from 'jsonwebtoken';

export type AccessTokenPayload = {
  userId: string;
};

export const createAccessToken = (userId: string) => {
  const jwtPayload: AccessTokenPayload = {
    userId,
  };

  return jwt.sign(jwtPayload, process.env.JWT_SECRET, { expiresIn: '15m' });
};

export const verifyAccessToken = (token: string) =>
  jwt.verify(token, process.env.JWT_SECRET) as AccessTokenPayload;
