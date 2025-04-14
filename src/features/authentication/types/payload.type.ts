export interface JWTPayload {
  email: string;
  sub: string;
  role?: string;
  iat?: number;
  exp?: number;
}

export interface JWTRefreshPayload {
  id: string;
  iat?: number;
  exp?: number;
}
