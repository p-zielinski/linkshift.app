export type LoginDto = {
  email: string;
  password: string;
};

export type RegisterDto = {
  email: string;
  password: string;
  organizationName: string;
};

export type RefreshTokenDto = {
  refreshToken: string;
};
