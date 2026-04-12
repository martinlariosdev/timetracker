import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

interface OktaProfile {
  id: string;
  displayName: string;
  emails: Array<{ value: string }>;
  [key: string]: any;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateOktaUser(profile: OktaProfile) {
    if (!profile || !profile.id) {
      this.logger.error('Invalid Okta profile provided');
      throw new Error('Invalid Okta profile');
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

  async generateJwt(userId: string): Promise<string> {
    const payload = {
      sub: userId,
    };

    try {
      const token = this.jwtService.sign(payload);
      return token;
    } catch (error) {
      this.logger.error(
        `Error generating JWT for user ${userId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  async validateJwtPayload(payload: any) {
    if (!payload || !payload.sub) {
      this.logger.warn('Invalid JWT payload');
      throw new Error('Invalid JWT payload');
    }

    try {
      const consultant = await this.prisma.consultant.findUnique({
        where: { id: payload.sub },
      });

      if (!consultant) {
        this.logger.warn(`Consultant not found for JWT payload: ${payload.sub}`);
        throw new Error('Consultant not found');
      }

      return consultant;
    } catch (error) {
      this.logger.error(
        `Error validating JWT payload: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }
}
