import * as argon2 from 'argon2';

export const comparePassword = async (
  password: string,
  encryptPassword: string,
) => {
  return await argon2.verify(encryptPassword, password);
};
