import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

// Mock the PrismaService module to avoid importing generated client
jest.mock('../prisma/prisma.service');

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: any;
  let jwtService: any;

  const mockConsultant = {
    id: 'test-consultant-id',
    externalId: 'okta-user-123',
    name: 'Test User',
    email: 'test@example.com',
    teamLeadId: null,
    teamLeadName: null,
    teamLeadEmail: null,
    etoBalance: 0,
    workingHoursPerPeriod: 40,
    paymentType: 'contract',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockOktaProfile = {
    id: 'okta-user-123',
    displayName: 'Test User',
    emails: [{ value: 'test@example.com' }],
    email: 'test@example.com',
  };

  beforeEach(async () => {
    const mockPrismaService = {
      consultant: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    const mockJwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    };

    prismaService = mockPrismaService;
    jwtService = mockJwtService;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateOktaUser', () => {
    it('should create a new consultant if not exists', async () => {
      (prismaService.consultant.findUnique as jest.Mock).mockResolvedValue(
        null,
      );
      (prismaService.consultant.create as jest.Mock).mockResolvedValue(
        mockConsultant,
      );

      const result = await service.validateOktaUser(mockOktaProfile);

      expect(prismaService.consultant.findUnique).toHaveBeenCalledWith({
        where: { externalId: 'okta-user-123' },
      });
      expect(prismaService.consultant.create).toHaveBeenCalledWith({
        data: {
          externalId: 'okta-user-123',
          name: 'Test User',
          email: 'test@example.com',
          etoBalance: 0,
          workingHoursPerPeriod: 40,
          paymentType: 'contract',
        },
      });
      expect(result).toEqual(mockConsultant);
    });

    it('should find existing consultant if exists', async () => {
      (prismaService.consultant.findUnique as jest.Mock).mockResolvedValue(
        mockConsultant,
      );

      const result = await service.validateOktaUser(mockOktaProfile);

      expect(prismaService.consultant.findUnique).toHaveBeenCalledWith({
        where: { externalId: 'okta-user-123' },
      });
      expect(prismaService.consultant.create).not.toHaveBeenCalled();
      expect(result).toEqual(mockConsultant);
    });

    it('should throw error for invalid profile', async () => {
      await expect(
        service.validateOktaUser({
          id: '',
          displayName: 'Test',
          emails: [],
        }),
      ).rejects.toThrow('Invalid Okta profile');
    });

    it('should throw error for null profile', async () => {
      await expect(service.validateOktaUser(null as any)).rejects.toThrow(
        'Invalid Okta profile',
      );
    });
  });

  describe('generateJwt', () => {
    it('should generate a valid JWT token', async () => {
      const mockToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0LWNvbnN1bHRhbnQtaWQiLCJpYXQiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      (jwtService.sign as jest.Mock).mockReturnValue(mockToken);

      const result = await service.generateJwt('test-consultant-id');

      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 'test-consultant-id',
      });
      expect(result).toEqual(mockToken);
    });

    it('should throw error if jwt signing fails', async () => {
      (jwtService.sign as jest.Mock).mockImplementation(() => {
        throw new Error('JWT signing failed');
      });

      await expect(service.generateJwt('test-consultant-id')).rejects.toThrow(
        'JWT signing failed',
      );
    });
  });

  describe('validateJwtPayload', () => {
    it('should validate JWT payload and return consultant', async () => {
      (prismaService.consultant.findUnique as jest.Mock).mockResolvedValue(
        mockConsultant,
      );

      const payload = { sub: 'test-consultant-id' };
      const result = await service.validateJwtPayload(payload);

      expect(prismaService.consultant.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-consultant-id' },
      });
      expect(result).toEqual(mockConsultant);
    });

    it('should throw error if consultant not found', async () => {
      (prismaService.consultant.findUnique as jest.Mock).mockResolvedValue(
        null,
      );

      const payload = { sub: 'non-existent-id' };
      await expect(service.validateJwtPayload(payload)).rejects.toThrow(
        'Consultant not found',
      );
    });

    it('should throw error for invalid payload', async () => {
      await expect(
        service.validateJwtPayload({ invalid: 'payload' }),
      ).rejects.toThrow('Invalid JWT payload');
    });

    it('should throw error for null payload', async () => {
      await expect(service.validateJwtPayload(null)).rejects.toThrow(
        'Invalid JWT payload',
      );
    });
  });
});
