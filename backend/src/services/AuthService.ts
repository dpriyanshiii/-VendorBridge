import { User, IUser, UserRole } from '../models/User';
import { AppError } from '../utils/AppError';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { RefreshToken } from '../models/RefreshToken';
import crypto from 'crypto';

export class AuthService {
  static async signup(data: any): Promise<{ user: IUser; accessToken: string }> {
    const { firstName, lastName, email, password, role, vendorId } = data;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('Email already in use', 409, 'EMAIL_EXISTS');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      email,
      passwordHash,
      role,
      vendorId: role === 'VENDOR' ? vendorId : null,
      status: 'ACTIVE',
    });

    await user.save();

    const accessToken = this.generateAccessToken(user.id);
    await this.generateRefreshToken(user.id); // Typically we'd return this too, but skipping for simplicity in API response unless requested

    return { user, accessToken };
  }

  static async login(data: any): Promise<{ user: IUser; accessToken: string }> {
    const { email, password } = data;

    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    if (user.status !== 'ACTIVE') {
      throw new AppError('Account is not active', 403, 'ACCOUNT_INACTIVE');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= 5) {
        user.status = 'INACTIVE'; // simple lockout mechanism
      }
      await user.save();
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    user.failedLoginAttempts = 0;
    user.lastLoginAt = new Date();
    await user.save();

    const accessToken = this.generateAccessToken(user.id);

    return { user, accessToken };
  }

  private static generateAccessToken(userId: string): string {
    return jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as any });
  }

  private static async generateRefreshToken(userId: string): Promise<string> {
    const token = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await RefreshToken.create({ userId, token, expiresAt });
    return token;
  }
}
