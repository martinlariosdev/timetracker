import {
  Resolver,
  Mutation,
  Query,
  Args,
} from '@nestjs/graphql';
import {
  UseGuards,
  Logger,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { LoginInput, AuthResponse, UserType, TokenResponse, MockLoginInput } from './dto';
import type { Consultant } from '../generated';

/**
 * GraphQL resolver for authentication operations.
 * Handles login, token refresh, and user profile queries.
 */
@Resolver()
export class AuthResolver {
  private readonly logger = new Logger(AuthResolver.name);

  constructor(private authService: AuthService) {}

  /**
   * Login mutation - authenticates user with Okta token.
   * This endpoint is public and does not require authentication.
   *
   * @param input - Login input containing Okta token
   * @returns Authentication response with JWT token and user data
   * @throws BadRequestException if Okta token is invalid
   * @throws UnauthorizedException if authentication fails
   */
  @Mutation(() => AuthResponse, {
    description: 'Authenticate user with Okta token and receive JWT',
  })
  @Public()
  async login(@Args('input') input: LoginInput): Promise<AuthResponse> {
    this.logger.log('Login mutation called');

    if (!input.oktaToken) {
      throw new BadRequestException('Okta token is required');
    }

    try {
      // In a real implementation, you would validate the Okta token here
      // For now, we'll assume the token contains the Okta profile
      // This is a simplified version - in production, you'd decode/verify the Okta JWT

      // Mock Okta profile for demonstration
      // In production, you would:
      // 1. Verify the Okta token signature
      // 2. Decode the token to get user profile
      // 3. Optionally call Okta API to get full profile

      // For now, we'll create a mock profile
      // TODO: Implement proper Okta token validation
      const oktaProfile = {
        id: 'okta-user-id', // This should come from token
        displayName: 'Test User',
        emails: [{ value: 'test@example.com' }],
      };

      // Validate Okta user and get/create consultant
      const consultant = await this.authService.validateOktaUser(oktaProfile);

      // Generate JWT token
      const { accessToken, expiresIn } = await this.authService.login(consultant);

      // Map consultant to UserType
      const user: UserType = {
        id: consultant.id,
        externalId: consultant.externalId,
        name: consultant.name,
        email: consultant.email,
        etoBalance: consultant.etoBalance,
        workingHoursPerPeriod: consultant.workingHoursPerPeriod ?? undefined,
        paymentType: consultant.paymentType ?? undefined,
      };

      this.logger.log(`User ${consultant.id} logged in successfully`);

      return {
        accessToken,
        expiresIn,
        user,
      };
    } catch (error) {
      this.logger.error(
        `Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      if (error instanceof BadRequestException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Authentication failed');
    }
  }

  /**
   * Mock login mutation - authenticates user by email (development only).
   * This endpoint bypasses Okta and directly authenticates a user by email.
   *
   * ⚠️ ONLY ENABLED WHEN ENABLE_MOCK_AUTH=true IN ENVIRONMENT
   * ⚠️ NEVER USE IN PRODUCTION
   *
   * @param input - Mock login input containing email
   * @returns Authentication response with JWT token and user data
   * @throws UnauthorizedException if mock auth is disabled or user not found
   */
  @Mutation(() => AuthResponse, {
    description: 'Mock authentication by email (DEVELOPMENT ONLY)',
  })
  @Public()
  async mockLogin(@Args('input') input: MockLoginInput): Promise<AuthResponse> {
    this.logger.log('Mock login mutation called');

    // Check if mock auth is enabled
    const mockAuthEnabled = process.env.ENABLE_MOCK_AUTH === 'true';
    if (!mockAuthEnabled) {
      this.logger.warn('Mock login attempted but ENABLE_MOCK_AUTH is not set to true');
      throw new UnauthorizedException(
        'Mock authentication is disabled. Set ENABLE_MOCK_AUTH=true in .env to enable (development only)'
      );
    }

    try {
      // Find consultant by email
      const consultant = await this.authService.findConsultantByEmail(input.email);

      if (!consultant) {
        throw new UnauthorizedException(`No consultant found with email: ${input.email}`);
      }

      // Generate JWT token
      const { accessToken, expiresIn } = await this.authService.login(consultant);

      // Map consultant to UserType
      const user: UserType = {
        id: consultant.id,
        externalId: consultant.externalId,
        name: consultant.name,
        email: consultant.email,
        etoBalance: consultant.etoBalance,
        workingHoursPerPeriod: consultant.workingHoursPerPeriod ?? undefined,
        paymentType: consultant.paymentType ?? undefined,
      };

      this.logger.log(`Mock login successful for ${consultant.email}`);

      return {
        accessToken,
        expiresIn,
        user,
      };
    } catch (error) {
      this.logger.error(
        `Mock login failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Mock authentication failed');
    }
  }

  /**
   * Me query - returns current authenticated user's profile.
   * Requires valid JWT authentication.
   *
   * @param user - Current authenticated consultant (injected by JwtAuthGuard)
   * @returns User profile information
   */
  @Query(() => UserType, {
    description: 'Get current authenticated user profile',
  })
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: Consultant): Promise<UserType> {
    this.logger.log(`Me query called for user ${user.id}`);

    return {
      id: user.id,
      externalId: user.externalId,
      name: user.name,
      email: user.email,
      etoBalance: user.etoBalance,
      workingHoursPerPeriod: user.workingHoursPerPeriod ?? undefined,
      paymentType: user.paymentType ?? undefined,
    };
  }

  /**
   * Refresh token mutation - generates a new JWT token.
   * Requires valid JWT authentication.
   *
   * @param user - Current authenticated consultant
   * @returns New token response with refreshed JWT
   */
  @Mutation(() => TokenResponse, {
    description: 'Refresh JWT token for authenticated user',
  })
  @UseGuards(JwtAuthGuard)
  async refreshToken(@CurrentUser() user: Consultant): Promise<TokenResponse> {
    this.logger.log(`Refresh token called for user ${user.id}`);

    const { accessToken, expiresIn } = await this.authService.login(user);

    return {
      accessToken,
      expiresIn,
    };
  }
}
