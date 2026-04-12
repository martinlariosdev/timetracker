import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { LoginInput } from './dto';

// Mock the generated types to avoid import.meta issues in Jest
jest.mock('../generated', () => ({
  Consultant: {},
  PrismaClient: class MockPrismaClient {
    consultant = {};
    payPeriod = {};
    timeEntry = {};
    etoTransaction = {};
    timesheetSubmission = {};
    syncLog = {};
  },
}));

type Consultant = {
  id: string;
  externalId: string;
  name: string;
  email: string;
  etoBalance: number;
  workingHoursPerPeriod: number | null;
  paymentType: string | null;
  teamLeadId: string | null;
  teamLeadName: string | null;
  teamLeadEmail: string | null;
  createdAt: Date;
  updatedAt: Date;
};

describe('AuthResolver', () => {
  let resolver: AuthResolver;
  let authService: jest.Mocked<AuthService>;

  const mockConsultant: Consultant = {
    id: 'consultant-123',
    externalId: 'okta-user-123',
    name: 'John Doe',
    email: 'john@example.com',
    etoBalance: 40,
    workingHoursPerPeriod: 40,
    paymentType: 'contract',
    teamLeadId: null,
    teamLeadName: null,
    teamLeadEmail: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAuthService = {
    validateOktaUser: jest.fn(),
    generateJwt: jest.fn(),
    login: jest.fn(),
    validateJwtPayload: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthResolver,
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    resolver = module.get<AuthResolver>(AuthResolver);
    authService = module.get(AuthService);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('login', () => {
    const loginInput: LoginInput = {
      oktaToken: 'valid-okta-token',
    };

    it('should successfully login with valid Okta token', async () => {
      authService.validateOktaUser.mockResolvedValue(mockConsultant);
      authService.login.mockResolvedValue({
        accessToken: 'jwt-token-123',
        expiresIn: '7d',
      });

      const result = await resolver.login(loginInput);

      expect(result).toEqual({
        accessToken: 'jwt-token-123',
        expiresIn: '7d',
        user: {
          id: mockConsultant.id,
          externalId: mockConsultant.externalId,
          name: mockConsultant.name,
          email: mockConsultant.email,
          etoBalance: mockConsultant.etoBalance,
          workingHoursPerPeriod: mockConsultant.workingHoursPerPeriod,
          paymentType: mockConsultant.paymentType,
        },
      });

      expect(authService.validateOktaUser).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.any(String),
          displayName: expect.any(String),
          emails: expect.any(Array),
        }),
      );
      expect(authService.login).toHaveBeenCalledWith(mockConsultant);
    });

    it('should throw BadRequestException if Okta token is missing', async () => {
      const invalidInput: LoginInput = {
        oktaToken: '',
      };

      await expect(resolver.login(invalidInput)).rejects.toThrow(
        BadRequestException,
      );

      expect(authService.validateOktaUser).not.toHaveBeenCalled();
      expect(authService.login).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if validateOktaUser fails', async () => {
      authService.validateOktaUser.mockRejectedValue(
        new UnauthorizedException('Invalid Okta user'),
      );

      await expect(resolver.login(loginInput)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(authService.validateOktaUser).toHaveBeenCalled();
      expect(authService.login).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if JWT generation fails', async () => {
      authService.validateOktaUser.mockResolvedValue(mockConsultant);
      authService.login.mockRejectedValue(new Error('JWT generation failed'));

      await expect(resolver.login(loginInput)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(authService.validateOktaUser).toHaveBeenCalled();
      expect(authService.login).toHaveBeenCalledWith(mockConsultant);
    });

    it('should handle consultant with null optional fields', async () => {
      const consultantWithNulls: Consultant = {
        ...mockConsultant,
        workingHoursPerPeriod: null,
        paymentType: null,
      };

      authService.validateOktaUser.mockResolvedValue(consultantWithNulls);
      authService.login.mockResolvedValue({
        accessToken: 'jwt-token-123',
        expiresIn: '7d',
      });

      const result = await resolver.login(loginInput);

      expect(result.user.workingHoursPerPeriod).toBeUndefined();
      expect(result.user.paymentType).toBeUndefined();
    });
  });

  describe('me', () => {
    it('should return current user profile', async () => {
      const result = await resolver.me(mockConsultant);

      expect(result).toEqual({
        id: mockConsultant.id,
        externalId: mockConsultant.externalId,
        name: mockConsultant.name,
        email: mockConsultant.email,
        etoBalance: mockConsultant.etoBalance,
        workingHoursPerPeriod: mockConsultant.workingHoursPerPeriod,
        paymentType: mockConsultant.paymentType,
      });
    });

    it('should handle consultant with null optional fields', async () => {
      const consultantWithNulls: Consultant = {
        ...mockConsultant,
        workingHoursPerPeriod: null,
        paymentType: null,
      };

      const result = await resolver.me(consultantWithNulls);

      expect(result.workingHoursPerPeriod).toBeUndefined();
      expect(result.paymentType).toBeUndefined();
    });
  });

  describe('refreshToken', () => {
    it('should successfully refresh token', async () => {
      authService.login.mockResolvedValue({
        accessToken: 'new-jwt-token-456',
        expiresIn: '7d',
      });

      const result = await resolver.refreshToken(mockConsultant);

      expect(result).toEqual({
        accessToken: 'new-jwt-token-456',
        expiresIn: '7d',
      });

      expect(authService.login).toHaveBeenCalledWith(mockConsultant);
    });

    it('should throw error if token generation fails', async () => {
      authService.login.mockRejectedValue(new Error('Token generation failed'));

      await expect(resolver.refreshToken(mockConsultant)).rejects.toThrow(
        'Token generation failed',
      );

      expect(authService.login).toHaveBeenCalledWith(mockConsultant);
    });
  });
});
