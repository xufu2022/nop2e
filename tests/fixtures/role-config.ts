export interface RoleCredentials {
  username: string;
  password: string;
}

export const roles = {
  admin: {
    username: process.env.ADMIN_USERNAME || '',
    password: process.env.ADMIN_PASSWORD || '',
  } as RoleCredentials,
  buyer: {
    username: process.env.BUYER_USERNAME || '',
    password: process.env.BUYER_PASSWORD || '',
  } as RoleCredentials,
};

export type RoleName = keyof typeof roles;

export function getCredentials(role: RoleName = 'admin'): RoleCredentials {
  return roles[role];
}
