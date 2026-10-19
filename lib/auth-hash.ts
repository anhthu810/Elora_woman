import bcrypt from 'bcryptjs';
export const hash = (p: string) => bcrypt.hashSync(p, 10);
