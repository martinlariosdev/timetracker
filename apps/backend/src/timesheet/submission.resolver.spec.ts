import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { SubmissionResolver } from './submission.resolver';
import { SubmissionService } from './submission.service';

describe('SubmissionResolver', () => {
  let resolver: SubmissionResolver;
  let service: SubmissionService;

  const mockUser = {
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

  const mockTeamLead = {
    id: 'teamlead-1',
    externalId: 'ext-teamlead-1',
    name: 'Jane Manager',
    email: 'jane@example.com',
    teamLeadId: null,
    teamLeadName: null,
    teamLeadEmail: null,
    etoBalance: 0,
    workingHoursPerPeriod: 88,
    paymentType: 'Hourly',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

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
    consultant: mockUser,
    payPeriod: {
      id: 'period-1',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-14'),
      displayText: 'January 1-14, 2024',
      isCurrent: true,
      deadlineDate: new Date('2024-01-15'),
      createdAt: new Date(),
    },
  };

  beforeEach(async () => {
    const mockSubmissionService = {
      submitTimesheet: jest.fn(),
      approveTimesheet: jest.fn(),
      rejectTimesheet: jest.fn(),
      getSubmission: jest.fn(),
      getSubmissionsByConsultant: jest.fn(),
      getSubmissionsForTeamLead: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubmissionResolver,
        {
          provide: SubmissionService,
          useValue: mockSubmissionService,
        },
      ],
    }).compile();

    resolver = module.get<SubmissionResolver>(SubmissionResolver);
    service = module.get<SubmissionService>(SubmissionService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('submitTimesheet', () => {
    it('should submit a timesheet for the current user', async () => {
      jest.spyOn(service, 'submitTimesheet').mockResolvedValue(mockSubmission);

      const input = { payPeriodId: 'period-1' };
      const result = await resolver.submitTimesheet(input, mockUser as any);

      expect(result).toEqual(mockSubmission);
      expect(service.submitTimesheet).toHaveBeenCalledWith('consultant-1', 'period-1');
    });
  });

  describe('approveTimesheet', () => {
    it('should approve a timesheet as a team lead', async () => {
      const approvedSubmission = {
        ...mockSubmission,
        status: 'approved',
        approvedAt: new Date(),
        approvedBy: 'ext-teamlead-1',
      };

      jest.spyOn(service, 'approveTimesheet').mockResolvedValue(approvedSubmission);

      const input = { submissionId: 'submission-1', comments: 'Looks good' };
      const result = await resolver.approveTimesheet(input, mockTeamLead as any);

      expect(result).toEqual(approvedSubmission);
      expect(service.approveTimesheet).toHaveBeenCalledWith(
        'submission-1',
        'ext-teamlead-1',
        'Looks good',
      );
    });

    it('should approve a timesheet without comments', async () => {
      const approvedSubmission = {
        ...mockSubmission,
        status: 'approved',
        approvedAt: new Date(),
        approvedBy: 'ext-teamlead-1',
      };

      jest.spyOn(service, 'approveTimesheet').mockResolvedValue(approvedSubmission);

      const input = { submissionId: 'submission-1' };
      const result = await resolver.approveTimesheet(input, mockTeamLead as any);

      expect(result).toEqual(approvedSubmission);
      expect(service.approveTimesheet).toHaveBeenCalledWith(
        'submission-1',
        'ext-teamlead-1',
        undefined,
      );
    });
  });

  describe('rejectTimesheet', () => {
    it('should reject a timesheet as a team lead', async () => {
      const rejectedSubmission = {
        ...mockSubmission,
        status: 'rejected',
        rejectedAt: new Date(),
        rejectedBy: 'ext-teamlead-1',
        comments: 'Please fix hours for Jan 5',
      };

      jest.spyOn(service, 'rejectTimesheet').mockResolvedValue(rejectedSubmission);

      const input = {
        submissionId: 'submission-1',
        comments: 'Please fix hours for Jan 5',
      };
      const result = await resolver.rejectTimesheet(input, mockTeamLead as any);

      expect(result).toEqual(rejectedSubmission);
      expect(service.rejectTimesheet).toHaveBeenCalledWith(
        'submission-1',
        'ext-teamlead-1',
        'Please fix hours for Jan 5',
      );
    });
  });

  describe('timesheetSubmission', () => {
    it('should return submission for the owner', async () => {
      jest.spyOn(service, 'getSubmission').mockResolvedValue(mockSubmission);

      const result = await resolver.timesheetSubmission('submission-1', mockUser as any);

      expect(result).toEqual(mockSubmission);
      expect(service.getSubmission).toHaveBeenCalledWith('submission-1');
    });

    it('should return submission for the team lead', async () => {
      jest.spyOn(service, 'getSubmission').mockResolvedValue(mockSubmission);

      const result = await resolver.timesheetSubmission(
        'submission-1',
        mockTeamLead as any,
      );

      expect(result).toEqual(mockSubmission);
    });

    it('should throw ForbiddenException if user is not authorized', async () => {
      const otherUser = {
        ...mockUser,
        id: 'other-consultant',
        externalId: 'ext-other-consultant',
      };

      jest.spyOn(service, 'getSubmission').mockResolvedValue(mockSubmission);

      await expect(
        resolver.timesheetSubmission('submission-1', otherUser as any),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('myTimesheetSubmissions', () => {
    it('should return all submissions for the current user', async () => {
      const submissions = [mockSubmission];
      jest.spyOn(service, 'getSubmissionsByConsultant').mockResolvedValue(submissions);

      const result = await resolver.myTimesheetSubmissions(mockUser as any);

      expect(result).toEqual(submissions);
      expect(service.getSubmissionsByConsultant).toHaveBeenCalledWith('consultant-1');
    });
  });

  describe('pendingTimesheetSubmissions', () => {
    it('should return pending submissions for team lead review', async () => {
      const submissions = [mockSubmission];
      jest
        .spyOn(service, 'getSubmissionsForTeamLead')
        .mockResolvedValue(submissions);

      const result = await resolver.pendingTimesheetSubmissions(mockTeamLead as any);

      expect(result).toEqual(submissions);
      expect(service.getSubmissionsForTeamLead).toHaveBeenCalledWith('ext-teamlead-1');
    });
  });
});
