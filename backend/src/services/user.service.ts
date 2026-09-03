import { User, IUser, UserRole } from '../models/User';
import { ApiError } from '../utils/apiError';

export class UserService {
  static async getAllUsers() {
    return User.find().select('-password').sort({ name: 1 });
  }

  static async getSalesTeam() {
    return User.find({ isActive: true }).select('name email role avatar').sort({ name: 1 });
  }

  static async createUser(data: { name: string; email: string; password?: string; role: UserRole }) {
    const existing = await User.findOne({ email: data.email.toLowerCase() });
    if (existing) {
      throw new ApiError(409, 'User with this email already exists.');
    }

    const defaultPassword = data.password || 'User@123';
    const user = await User.create({
      name: data.name,
      email: data.email,
      password: defaultPassword,
      role: data.role || 'SALES_EXECUTIVE',
    });

    const userObj = user.toObject();
    delete userObj.password;
    return userObj;
  }

  static async updateUser(userId: string, data: { name?: string; role?: UserRole; isActive?: boolean }) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found.');
    }

    if (data.name) user.name = data.name;
    if (data.role) user.role = data.role;
    if (data.isActive !== undefined) user.isActive = data.isActive;

    await user.save();
    const userObj = user.toObject();
    delete userObj.password;
    return userObj;
  }
}
