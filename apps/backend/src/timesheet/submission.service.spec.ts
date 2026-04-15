import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SubmissionService } from './submission.service';
import { PrismaService } from '../prisma/prisma.service';

describe('SubmissionService', () => {
  let service: SubmissionService;
  let prisma: PrismaService;

  const mockConsultant = {
    id: 'consultant-1',
    externalId: 'ext-consultant-1',
    name: 'John Doe',
    email: 'john@example.com',
    teamLeadId: 'ext-teamlead-1',
    teamLeadName: 'Jane Manager',
    teamLeadEmail: 'jane@example.com',
    etoBalance: 0,
    workingHoursPerPeriod: 88,
    paymentType: 'Hourly',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPayPeriod = {
    id: 'period-1',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-14'),
    displayText: 'January 1-14, 2024',
    isCurrent: true,
    deadlineDate: new Date('2024-01-15'),
    createdAt: new Date(),
  };

  const mockTimeEntries = [
    {
      id: 'entry-1',
      consultantId: 'consultant-1',
      payPeriodId: 'period-1',
      date: new Date('2024-01-01'),
      projectTaskNumber: 'PROJ-123',
      clientName: 'Client A',
      description: 'Development work',
      inTime1: new Date('2024-01-01T09:00:00'),
      outTime1: new Date('2024-01-01T17:00:00'),
      inTime2: null,
      outTime2: null,
      totalHours: 8,
      synced: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    // Add more entries to meet minimum hours
    ...Array.from({ length: 9 }, (_, i) => ({
      id: `entry-${i + 2}`,
      consultantId: 'consultant-1',
      payPeriodId: 'period-1',
      date: new Date(`2024-01-${String(i + 2).padStart(2, '0')}`),
      projectTaskNumber: 'PROJ-123',
      clientName: 'Client A',
      description: 'Development work',
      inTime1: new Date(`2024-01-${String(i + 2).padStart(2, '0')}T09:00:00`),
      outTime1: new Date(`2024-01-${String(i + 2).padStart(2, '0')}T17:00:00`),
      inTime2: null,
      outTime2: null,
      totalHours: 8,
      synced: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
  ];

  const mockSubmission = {
    id: 'submission-1',
    consultantId: 'consultant-1',
    payPeriodId: 'period-1',
    status: 'submitted',
    submittedAt: new Date(),
    approvedAt: null,
    approvedBy: null,
    rejectedAt: null,
    rejectedBy: null,
    comments: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    consultant: mockConsultant,
    payPeriod: mockPayPeriod,
  };

  beforeEach(async () => {
    const mockPrismaService = {
      payPeriod: {
        findUnique: jest.fn(),
      },
      timesheetSubmission: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        upsert: jest.fn(),
        update: jest.fn(),
      },
      timeEntry: {
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubmissionService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<SubmissionService>(SubmissionService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('submitTimesheet', () => {
    it('should successfully submit a timesheet with valid entries', async () => {
      jest
        .spyOn(prisma.payPeriod, 'findUnique')
        .mockResolvedValue(mockPayPeriod);
      jest
        .spyOn(prisma.timesheetSubmission, 'findUnique')
        .mockResolvedValue(null);
      jest
        .spyOn(prisma.timeEntry, 'findMany')
        .mockResolvedValue(mockTimeEntries);
      jest
        .spyOn(prisma.timesheetSubmission, 'upsert')
        .mockResolvedValue(mockSubmission);

      const result = await service.submitTimesheet('consultant-1', 'period-1');

      expect(result).toEqual(mockSubmission);
      expect(prisma.timesheetSubmission.upsert).toHaveBeenCalledWith({
        where: {
          consultantId_payPeriodId: {
            consultantId: 'consultant-1',
            payPeriodId: 'period-1',
          },
        },
        update: expect.objectContaining({
          status: 'submitted',
        }),
        create: expect.objectContaining({
          consultantId: 'consultant-1',
          payPeriodId: 'period-1',
          status: 'submitted',
        }),
      });
    });

    it('should throw NotFoundException if pay period does not exist', async () => {
      jest.spyOn(prisma.payPeriod, 'findUnique').mockResolvedValue(null);

      await expect(
        service.submitTimesheet('consultant-1', 'period-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if already submitted', async () => {
      jest
        .spyOn(prisma.payPeriod, 'findUnique')
        .mockResolvedValue(mockPayPeriod);
      jest.spyOn(prisma.timesheetSubmission, 'findUnique').mockResolvedValue({
        ...mockSubmission,
        status: 'submitted',
      });

      await expect(
        service.submitTimesheet('consultant-1', 'period-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if no time entries exist', async () => {
      jest
        .spyOn(prisma.payPeriod, 'findUnique')
        .mockResolvedValue(mockPayPeriod);
      jest
        .spyOn(prisma.timesheetSubmission, 'findUnique')
        .mockResolvedValue(null);
      jest.spyOn(prisma.timeEntry, 'findMany').mockResolvedValue([]);

      await expect(
        service.submitTimesheet('consultant-1', 'period-1'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.submitTimesheet('consultant-1', 'period-1'),
      ).rejects.toThrow('No time entries found');
    });

    it('should throw BadRequestException if minimum hours not met', async () => {
      const insufficientEntries = [mockTimeEntries[0]]; // Only 8 hours

      jest
        .spyOn(prisma.payPeriod, 'findUnique')
        .mockResolvedValue(mockPayPeriod);
      jest
        .spyOn(prisma.timesheetSubmission, 'findUnique')
        .mockResolvedValue(null);
      jest
        .spyOn(prisma.timeEntry, 'findMany')
        .mockResolvedValue(insufficientEntries);

      await expect(
        service.submitTimesheet('consultant-1', 'period-1'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.submitTimesheet('consultant-1', 'period-1'),
      ).rejects.toThrow('less than minimum required');
    });
  });

  describe('approveTimesheet', () => {
    it('should successfully approve a submitted timesheet', async () => {
      jest
        .spyOn(prisma.timesheetSubmission, 'findUnique')
        .mockResolvedValue(mockSubmission);
      jest.spyOn(prisma.timesheetSubmission, 'update').mockResolvedValue({
        ...mockSubmission,
        status: 'approved',
        approvedAt: new Date(),
        approvedBy: 'ext-teamlead-1',
      });

      const result = await service.approveTimesheet(
        'submission-1',
        'ext-teamlead-1',
      );

      expect(result.status).toBe('approved');
      expect(result.approvedBy).toBe('ext-teamlead-1');
      expect(prisma.timesheetSubmission.update).toHaveBeenCalledWith({
        where: { id: 'submission-1' },
        data: expect.objectContaining({
          status: 'approved',
          approvedBy: 'ext-teamlead-1',
        }),
      });
    });

    it('should throw NotFoundException if submission does not exist', async () => {
      jest
        .spyOn(prisma.timesheetSubmission, 'findUnique')
        .mockResolvedValue(null);

      await expect(
        service.approveTimesheet('submission-1', 'ext-teamlead-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if submission is not in submitted status', async () => {
      jest.spyOn(prisma.timesheetSubmission, 'findUnique').mockResolvedValue({
        ...mockSubmission,
        status: 'approved',
      });

      await expect(
        service.approveTimesheet('submission-1', 'ext-teamlead-1'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.approveTimesheet('submission-1', 'ext-teamlead-1'),
      ).rejects.toThrow('Cannot approve timesheet with status');
    });

    it('should throw BadRequestException if user is not the team lead', async () => {
      jest
        .spyOn(prisma.timesheetSubmission, 'findUnique')
        .mockResolvedValue(mockSubmission);

      await expect(
        service.approveTimesheet('submission-1', 'wrong-teamlead-id'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.approveTimesheet('submission-1', 'wrong-teamlead-id'),
      ).rejects.toThrow('not authorized to approve');
    });
  });

  describe('rejectTimesheet', () => {
    it('should successfully reject a submitted timesheet with comments', async () => {
      jest
        .spyOn(prisma.timesheetSubmission, 'findUnique')
        .mockResolvedValue(mockSubmission);
      jest.spyOn(prisma.timesheetSubmission, 'update').mockResolvedValue({
        ...mockSubmission,
        status: 'rejected',
        rejectedAt: new Date(),
        rejectedBy: 'ext-teamlead-1',
        comments: 'Please fix hours for Jan 5',
      });

      const result = await service.rejectTimesheet(
        'submission-1',
        'ext-teamlead-1',
        'Please fix hours for Jan 5',
      );

      expect(result.status).toBe('rejected');
      expect(result.rejectedBy).toBe('ext-teamlead-1');
      expect(result.comments).toBe('Please fix hours for Jan 5');
      expect(prisma.timesheetSubmission.update).toHaveBeenCalledWith({
        where: { id: 'submission-1' },
        data: expect.objectContaining({
          status: 'rejected',
          rejectedBy: 'ext-teamlead-1',
          comments: 'Please fix hours for Jan 5',
        }),
      });
    });

    it('should throw BadRequestException if comments are empty', async () => {
      await expect(
        service.rejectTimesheet('submission-1', 'ext-teamlead-1', ''),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.rejectTimesheet('submission-1', 'ext-teamlead-1', ''),
      ).rejects.toThrow('Comments are required');
    });

    it('should throw NotFoundException if submission does not exist', async () => {
      jest
        .spyOn(prisma.timesheetSubmission, 'findUnique')
        .mockResolvedValue(null);

      await expect(
        service.rejectTimesheet('submission-1', 'ext-teamlead-1', 'Invalid'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if submission is not in submitted status', async () => {
      jest.spyOn(prisma.timesheetSubmission, 'findUnique').mockResolvedValue({
        ...mockSubmission,
        status: 'approved',
      });

      await expect(
        service.rejectTimesheet('submission-1', 'ext-teamlead-1', 'Invalid'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if user is not the team lead', async () => {
      jest
        .spyOn(prisma.timesheetSubmission, 'findUnique')
        .mockResolvedValue(mockSubmission);

      await expect(
        service.rejectTimesheet('submission-1', 'wrong-teamlead-id', 'Invalid'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.rejectTimesheet('submission-1', 'wrong-teamlead-id', 'Invalid'),
      ).rejects.toThrow('not authorized to reject');
    });
  });

  describe('getSubmission', () => {
    it('should return a submission by ID', async () => {
      jest
        .spyOn(prisma.timesheetSubmission, 'findUnique')
        .mockResolvedValue(mockSubmission);

      const result = await service.getSubmission('submission-1');

      expect(result).toEqual(mockSubmission);
      expect(prisma.timesheetSubmission.findUnique).toHaveBeenCalledWith({
        where: { id: 'submission-1' },
        include: {
          consultant: true,
          payPeriod: true,
        },
      });
    });

    it('should throw NotFoundException if submission does not exist', async () => {
      jest
        .spyOn(prisma.timesheetSubmission, 'findUnique')
        .mockResolvedValue(null);

      await expect(service.getSubmission('submission-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getSubmissionsByConsultant', () => {
    it('should return all submissions for a consultant', async () => {
      const submissions = [mockSubmission];
      jest
        .spyOn(prisma.timesheetSubmission, 'findMany')
        .mockResolvedValue(submissions);

      const result = await service.getSubmissionsByConsultant('consultant-1');

      expect(result).toEqual(submissions);
      expect(prisma.timesheetSubmission.findMany).toHaveBeenCalledWith({
        where: { consultantId: 'consultant-1' },
        include: {
          payPeriod: true,
        },
        orderBy: {
          submittedAt: 'desc',
        },
      });
    });
  });

  describe('getSubmissionsForTeamLead', () => {
    it('should return pending submissions for a team lead', async () => {
      const submissions = [mockSubmission];
      jest
        .spyOn(prisma.timesheetSubmission, 'findMany')
        .mockResolvedValue(submissions);

      const result = await service.getSubmissionsForTeamLead('ext-teamlead-1');

      expect(result).toEqual(submissions);
      expect(prisma.timesheetSubmission.findMany).toHaveBeenCalledWith({
        where: {
          consultant: {
            teamLeadId: 'ext-teamlead-1',
          },
          status: 'submitted',
        },
        include: {
          consultant: true,
          payPeriod: true,
        },
        orderBy: {
          submittedAt: 'asc',
        },
      });
    });
  });
});
