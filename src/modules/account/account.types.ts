export type FindAccountParams = {
  email?: string;
  id?: string;
  refreshToken?: string;
  codeHash?: string;
};

export type SaveAccountParams = {
  email: string;
  passwordHash: string;
  codeHash: string;
};

export type UpdateAccountParams = {
  id: string;
  email?: string;
  refreshToken?: string;
  codeHash?: string;
  status?: AccountStatus;
};

export enum AccountStatus {
  Confirmed = 'confirmed',
  Unconfirmed = 'Unconfirmed',
}

export type UpdateRefreshTokenParams = {
  id: string;
  refreshToken: string;
};
