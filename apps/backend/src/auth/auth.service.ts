import { Injectable, Logger, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { Consultant } from '../generated';

interface OktaProfile {
  id: string;
  displayName: string;
  emails: Array<{ value: string }>;
  email?: string;
  name?: string;
}

interface JwtPayload {
  sub: string;          // External ID from Okta
  email?: string;
  name?: string;
  consultantId?: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateOktaUser(profile: OktaProfile): Promise<Consultant> {
    if (!profile || !profile.id) {
      this.logger.error('Invalid Okta profile provided');
      throw new BadRequestException('Invalid Okta profile');
    }

    const externalId = profile.id;
    const email = profile.emails?.[0]?.value || profile.email || '';
    const name = profile.displayName || profile.name || '';

    try {
      let consultant = await this.prisma.consultant.findUnique({
        where: { externalId },
      });

      if (!consultant) {
        this.logger.log(`Creating new consultant from Okta profile: ${externalId}`);
        consultant = await this.prisma.consultant.create({
          data: {
            externalId,
            name,
            email,
            etoBalance: 0,
            workingHoursPerPeriod: 40,
            paymentType: 'contract',
          },
        });
      } else {
        this.logger.log(`Found existing consultant: ${consultant.id}`);
      }

      return consultant;
    } catch (error) {
      this.logger.error(
        `Error validating Okta user ${externalId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  async generateJwt(consultant: Consultant): Promise<string> {
    if (!consultant || !consultant.externalId) {
      throw new BadRequestException('Invalid consultant: externalId required');
    }

    const payload = {
      sub: consultant.externalId,
      email: consultant.email,
      name: consultant.name,
      consultantId: consultant.id,
    };

    try {
      const token = this.jwtService.sign(payload);
      return token;
    } catch (error) {
      this.logger.error(
        `Error generating JWT for consultant ${consultant.id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  async validateJwtPayload(payload: JwtPayload): Promise<Consultant> {
    if (!payload || !payload.sub) {
      this.logger.warn('Invalid JWT payload');
      throw new UnauthorizedException('Invalid JWT payload');
    }

    try {
      const consultant = await this.prisma.consultant.findUnique({
        where: { externalId: payload.sub },
      });

      if (!consultant) {
        this.logger.warn(`Consultant not found for JWT payload: ${payload.sub}`);
        throw new UnauthorizedException('Consultant not found');
      }

      return consultant;
    } catch (error) {
      this.logger.error(
        `Error validating JWT payload: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  async login(consultant: Consultant): Promise<{ accessToken: string; expiresIn: string }> {
    const accessToken = await this.generateJwt(consultant);
    return {
      accessToken,
      expiresIn: '7d',
    };
  }

  /**
   * Find consultant by email address.
   * Used for mock authentication in development.
   *
   * @param email - Email address to search for
   * @returns Consultant if found, null otherwise
   */
  async findConsultantByEmail(email: string): Promise<Consultant | null> {
    try {
      const consultant = await this.prisma.consultant.findUnique({
        where: { email },
      });
      return consultant;
    } catch (error) {
      this.logger.error(
        `Error finding consultant by email ${email}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return null;
    }
  }
}
