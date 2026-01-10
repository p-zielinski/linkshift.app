import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';
import { JwtService } from './jwt.service';
import { RegisterDto, LoginDto } from '../zod-schames/auth.schemas';
import { AppEntity, createCustomCuid } from '../utils';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(data: RegisterDto) {
    // 1. Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        email: data.email,
        deletedAt: null,
      },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // 2. Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);

    // 3. Create organization and user in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Create organization
      const organization = await tx.organization.create({
        data: {
          id: createCustomCuid(AppEntity.Organization),
          name: data.organizationName,
        },
      });

      // Create user as owner
      const user = await tx.user.create({
        data: {
          id: createCustomCuid(AppEntity.User),
          email: data.email,
          passwordHash,
          organizationId: organization.id,
          isOwner: true,
        },
        select: {
          id: true,
          email: true,
          isOwner: true,
          organizationId: true,
          createdAt: true,
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return { user, organization };
    });

    // 4. Generate JWT token
    const tokens = this.jwtService.generateTokens({
      userId: result.user.id,
      organizationId: result.user.organizationId,
    });

    return {
      user: result.user,
      ...tokens,
    };
  }

  async login(data: LoginDto) {
    // 1. Find user
    const user = await this.prisma.user.findFirst({
      where: {
        email: data.email,
        deletedAt: null,
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // 2. Verify password
    const isPasswordValid = await bcrypt.compare(
      data.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // 3. Remove passwordHash from response
    const { passwordHash, ...userWithoutPassword } = user;

    // 4. Generate JWT token
    const tokens = this.jwtService.generateTokens({
      userId: user.id,
      organizationId: user.organizationId,
    });

    return {
      user: userWithoutPassword,
      ...tokens,
    };
  }

  async refreshTokens(refreshToken: string) {
    const payload = this.jwtService.verifyRefreshToken(refreshToken);
    if (!payload) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId },
    });
    if (!user) throw new UnauthorizedException('User not found');

    return this.jwtService.generateTokens({
      userId: payload.userId,
      organizationId: payload.organizationId,
    });
  }
}
