export type FindUserParams = {
  email?: string;
  id?: string;
  refreshToken?: string;
  codeHash?: string;
};

export type DeleteUserParams = {
  id?: string;
  email?: string;
};

export type SaveUserParams = {
  email: string;
  passwordHash: string;
  codeHash: string;
};

export type UpdateUserParams = {
  id: string;
  email?: string;
  refreshToken?: string;
  codeHash?: string;
  status?: UserStatus;
};

export enum UserStatus {
  Confirmed = 'confirmed',
  Unconfirmed = 'Unconfirmed',
}

export type UpdateRefreshTokenParams = {
  id: string;
  refreshToken: string;
};
