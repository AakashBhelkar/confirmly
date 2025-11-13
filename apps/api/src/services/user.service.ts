import { User, IUser } from '../models/User';
import { Merchant } from '../models/Merchant';
import { AppError } from '../middlewares/error-handler';
import { hashPassword, validatePasswordStrength } from '../utils/password';
import mongoose from 'mongoose';

export interface CreateUserData {
  email: string;
  name: string;
  role: 'owner' | 'admin' | 'member' | 'support';
  merchantId: string;
  password?: string;
}

export interface UpdateUserData {
  name?: string;
  role?: 'owner' | 'admin' | 'member' | 'support';
  password?: string;
}

export class UserService {
  async createUser(data: CreateUserData): Promise<IUser> {
    // Check if user exists
    const existingUser = await User.findOne({
      email: data.email,
      merchantId: data.merchantId,
    });
    if (existingUser) {
      throw new AppError(409, 'USER_EXISTS', 'User with this email already exists in this merchant');
    }

    // Verify merchant exists
    const merchant = await Merchant.findById(data.merchantId);
    if (!merchant) {
      throw new AppError(404, 'MERCHANT_NOT_FOUND', 'Merchant not found');
    }

    // Hash password if provided
    let passwordHash: string | undefined;
    if (data.password) {
      if (!validatePasswordStrength(data.password)) {
        throw new AppError(
          400,
          'WEAK_PASSWORD',
          'Password must be at least 8 characters with uppercase, lowercase, and number'
        );
      }
      passwordHash = await hashPassword(data.password);
    }

    const user = await User.create({
      merchantId: data.merchantId,
      email: data.email,
      name: data.name,
      role: data.role,
      passwordHash,
    });

    return user;
  }

  async getUserById(userId: string, merchantId?: string): Promise<IUser> {
    const query: any = { _id: userId };
    if (merchantId) {
      query.merchantId = merchantId;
    }

    const user = await User.findOne(query);
    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
    }

    return user;
  }

  async getUsersByMerchant(merchantId: string): Promise<IUser[]> {
    return User.find({ merchantId });
  }

  async updateUser(userId: string, data: UpdateUserData, merchantId?: string): Promise<IUser> {
    const query: any = { _id: userId };
    if (merchantId) {
      query.merchantId = merchantId;
    }

    const user = await User.findOne(query);
    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
    }

    if (data.name) {
      user.name = data.name;
    }

    if (data.role) {
      user.role = data.role;
    }

    if (data.password) {
      if (!validatePasswordStrength(data.password)) {
        throw new AppError(
          400,
          'WEAK_PASSWORD',
          'Password must be at least 8 characters with uppercase, lowercase, and number'
        );
      }
      user.passwordHash = await hashPassword(data.password);
    }

    await user.save();
    return user;
  }

  async deleteUser(userId: string, merchantId?: string): Promise<void> {
    const query: any = { _id: userId };
    if (merchantId) {
      query.merchantId = merchantId;
    }

    const user = await User.findOne(query);
    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
    }

    // Prevent deleting owner
    if (user.role === 'owner') {
      throw new AppError(400, 'CANNOT_DELETE_OWNER', 'Cannot delete merchant owner');
    }

    await User.deleteOne({ _id: userId });
  }
}

export const userService = new UserService();

