import * as jwt from 'jsonwebtoken';

export type AuthTokenPayload = {
  userId: string;
};

export const createAuthToken = (payload: AuthTokenPayload) => {
  const jwtPayload = { userId: payload.userId };

  return jwt.sign(jwtPayload, process.env.JWT_SECRET, { expiresIn: '1 day' });
};

export const verifyAuthToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_SECRET) as AuthTokenPayload;
};
