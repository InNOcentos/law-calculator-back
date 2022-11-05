export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type JwtPayload = {
  sub: string;
  email: string;
};

export type SignupResponse = {
  mailSent: boolean;
};

export type UserConfirmed = {
  userConfirmed: boolean;
};
