import * as bcrypt from 'bcrypt';

export class PasswordUtility {
  static async verifyPassword(password, hash): Promise<boolean> {
    const isMatch = await bcrypt.compare(password, hash);
    return isMatch;
  }

  static async hashPassword(password: string): Promise<string> {
    const hash = await bcrypt.hash(password, 10);
    return hash;
  }
}
