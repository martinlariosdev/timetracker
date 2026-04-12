import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { TimesheetResolver } from './timesheet.resolver';
import { TimesheetService } from './timesheet.service';
import { Consultant } from '../generated';

describe('TimesheetResolver', () => {
  let resolver: TimesheetResolver;
  let service: TimesheetService;

  const mockConsultant: Consultant = {
    id: 'consultant-123',
    oktaId: 'okta-123',
    email: 'test@example.com',
    name: 'Test Consultant',
    avatarUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTimeEntry = {
    id: 'entry-123',
    consultantId: 'consultant-123',
    payPeriodId: 'period-123',
    date: new Date('2024-01-15'),
    projectTaskNumber: 'PROJ-001',
    clientName: 'Test Client',
    description: 'Test work',
    inTime1: new Date('2024-01-15T09:00:00Z'),
    outTime1: new Date('2024-01-15T17:00:00Z'),
    inTime2: null,
    outTime2: null,
    totalHours: 8,
    synced: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTimesheetService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TimesheetResolver,
        {
          provide: TimesheetService,
          useValue: mockTimesheetService,
        },
      ],
    }).compile();

    resolver = module.get<TimesheetResolver>(TimesheetResolver);
    service = module.get<TimesheetService>(TimesheetService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('timeEntries', () => {
    it('should return all time entries for the current user', async () => {
      const mockEntries = [mockTimeEntry];
      mockTimesheetService.findAll.mockResolvedValue(mockEntries);

      const result = await resolver.timeEntries({}, mockConsultant);

      expect(result).toEqual(mockEntries);
      expect(service.findAll).toHaveBeenCalledWith({
        consultantId: mockConsultant.id,
      });
    });

    it('should override consultantId filter to current user', async () => {
      const mockEntries = [mockTimeEntry];
      mockTimesheetService.findAll.mockResolvedValue(mockEntries);

      const filters = { consultantId: 'other-consultant-id', payPeriodId: 'period-123' };
      await resolver.timeEntries(filters, mockConsultant);

      expect(service.findAll).toHaveBeenCalledWith({
        consultantId: mockConsultant.id,
        payPeriodId: 'period-123',
      });
    });

    it('should pass through other filters', async () => {
      const mockEntries = [mockTimeEntry];
      mockTimesheetService.findAll.mockResolvedValue(mockEntries);

      const filters = {
        payPeriodId: 'period-123',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
      };

      await resolver.timeEntries(filters, mockConsultant);

      expect(service.findAll).toHaveBeenCalledWith({
        ...filters,
        consultantId: mockConsultant.id,
      });
    });
  });

  describe('timeEntry', () => {
    it('should return a single time entry when user owns it', async () => {
      mockTimesheetService.findOne.mockResolvedValue(mockTimeEntry);

      const result = await resolver.timeEntry('entry-123', mockConsultant);

      expect(result).toEqual(mockTimeEntry);
      expect(service.findOne).toHaveBeenCalledWith('entry-123');
    });

    it('should throw ForbiddenException when user does not own the entry', async () => {
      const otherUserEntry = { ...mockTimeEntry, consultantId: 'other-consultant-id' };
      mockTimesheetService.findOne.mockResolvedValue(otherUserEntry);

      await expect(resolver.timeEntry('entry-123', mockConsultant)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(resolver.timeEntry('entry-123', mockConsultant)).rejects.toThrow(
        'You can only view your own time entries',
      );
    });

    it('should propagate NotFoundException from service', async () => {
      mockTimesheetService.findOne.mockRejectedValue(
        new NotFoundException('TimeEntry with ID entry-999 not found'),
      );

      await expect(resolver.timeEntry('entry-999', mockConsultant)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createTimeEntry', () => {
    it('should create a time entry for the current user', async () => {
      const input = {
        payPeriodId: 'period-123',
        date: '2024-01-15',
        clientName: 'Test Client',
        description: 'Test work',
        inTime1: '09:00',
        outTime1: '17:00',
        consultantId: 'ignored-consultant-id', // Should be overridden
      };

      mockTimesheetService.create.mockResolvedValue(mockTimeEntry);

      const result = await resolver.createTimeEntry(input, mockConsultant);

      expect(result).toEqual(mockTimeEntry);
      expect(service.create).toHaveBeenCalledWith({
        ...input,
        consultantId: mockConsultant.id,
      });
    });

    it('should override consultantId with current user', async () => {
      const input = {
        consultantId: 'some-other-id',
        payPeriodId: 'period-123',
        date: '2024-01-15',
        clientName: 'Test Client',
        description: 'Test work',
        inTime1: '09:00',
        outTime1: '17:00',
      };

      mockTimesheetService.create.mockResolvedValue(mockTimeEntry);

      await resolver.createTimeEntry(input, mockConsultant);

      expect(service.create).toHaveBeenCalledWith({
        ...input,
        consultantId: mockConsultant.id,
      });
    });

    it('should handle service validation errors', async () => {
      const input = {
        consultantId: 'consultant-123',
        payPeriodId: 'period-123',
        date: '2024-01-15',
        clientName: 'Test Client',
        description: 'Test work',
        inTime1: '09:00',
        outTime1: '17:00',
      };

      mockTimesheetService.create.mockRejectedValue(new Error('Validation failed'));

      await expect(resolver.createTimeEntry(input, mockConsultant)).rejects.toThrow(
        'Validation failed',
      );
    });
  });

  describe('updateTimeEntry', () => {
    it('should update a time entry when user owns it', async () => {
      const input = {
        id: 'entry-123',
        description: 'Updated description',
      };

      const updatedEntry = { ...mockTimeEntry, description: 'Updated description' };

      mockTimesheetService.findOne.mockResolvedValue(mockTimeEntry);
      mockTimesheetService.update.mockResolvedValue(updatedEntry);

      const result = await resolver.updateTimeEntry('entry-123', input, mockConsultant);

      expect(result).toEqual(updatedEntry);
      expect(service.findOne).toHaveBeenCalledWith('entry-123');
      expect(service.update).toHaveBeenCalledWith('entry-123', input);
    });

    it('should throw ForbiddenException when user does not own the entry', async () => {
      const otherUserEntry = { ...mockTimeEntry, consultantId: 'other-consultant-id' };
      const input = {
        id: 'entry-123',
        description: 'Updated description',
      };

      mockTimesheetService.findOne.mockResolvedValue(otherUserEntry);

      await expect(resolver.updateTimeEntry('entry-123', input, mockConsultant)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(resolver.updateTimeEntry('entry-123', input, mockConsultant)).rejects.toThrow(
        'You can only update your own time entries',
      );

      expect(service.update).not.toHaveBeenCalled();
    });

    it('should propagate NotFoundException from service', async () => {
      const input = {
        id: 'entry-999',
        description: 'Updated description',
      };

      mockTimesheetService.findOne.mockRejectedValue(
        new NotFoundException('TimeEntry with ID entry-999 not found'),
      );

      await expect(resolver.updateTimeEntry('entry-999', input, mockConsultant)).rejects.toThrow(
        NotFoundException,
      );

      expect(service.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteTimeEntry', () => {
    it('should delete a time entry when user owns it', async () => {
      mockTimesheetService.findOne.mockResolvedValue(mockTimeEntry);
      mockTimesheetService.delete.mockResolvedValue(mockTimeEntry);

      const result = await resolver.deleteTimeEntry('entry-123', mockConsultant);

      expect(result).toBe(true);
      expect(service.findOne).toHaveBeenCalledWith('entry-123');
      expect(service.delete).toHaveBeenCalledWith('entry-123');
    });

    it('should throw ForbiddenException when user does not own the entry', async () => {
      const otherUserEntry = { ...mockTimeEntry, consultantId: 'other-consultant-id' };
      mockTimesheetService.findOne.mockResolvedValue(otherUserEntry);

      await expect(resolver.deleteTimeEntry('entry-123', mockConsultant)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(resolver.deleteTimeEntry('entry-123', mockConsultant)).rejects.toThrow(
        'You can only delete your own time entries',
      );

      expect(service.delete).not.toHaveBeenCalled();
    });

    it('should propagate NotFoundException from service', async () => {
      mockTimesheetService.findOne.mockRejectedValue(
        new NotFoundException('TimeEntry with ID entry-999 not found'),
      );

      await expect(resolver.deleteTimeEntry('entry-999', mockConsultant)).rejects.toThrow(
        NotFoundException,
      );

      expect(service.delete).not.toHaveBeenCalled();
    });
  });
});
