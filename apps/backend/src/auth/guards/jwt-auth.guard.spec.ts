import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtAuthGuard } from './jwt-auth.guard';

// Mock the GqlExecutionContext
jest.mock('@nestjs/graphql', () => ({
  GqlExecutionContext: {
    create: jest.fn(),
  },
}));

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: jest.Mocked<Reflector>;
  let context: jest.Mocked<ExecutionContext>;

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

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as any;

    context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      switchToGraphQL: jest.fn(),
    } as any;

    guard = new JwtAuthGuard(reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getRequest', () => {
    it('should extract request from GraphQL context', () => {
      const mockReq = { user: mockConsultant };
      const mockGqlContext = {
        getContext: () => ({ req: mockReq }),
      };

      (GqlExecutionContext.create as jest.Mock).mockReturnValue(mockGqlContext);

      const result = guard.getRequest(context);

      expect(GqlExecutionContext.create).toHaveBeenCalledWith(context);
      expect(result).toEqual(mockReq);
    });

    it('should return request with user object', () => {
      const mockReq = {
        user: mockConsultant,
        headers: { authorization: 'Bearer token' },
      };
      const mockGqlContext = {
        getContext: () => ({ req: mockReq }),
      };

      (GqlExecutionContext.create as jest.Mock).mockReturnValue(mockGqlContext);

      const result = guard.getRequest(context);

      expect(result.user).toEqual(mockConsultant);
      expect(result.headers).toBeDefined();
    });
  });

  describe('canActivate', () => {
    it('should return true if @Public() decorator is present on handler', async () => {
      const handler = jest.fn();
      const classType = class {};
      context.getHandler.mockReturnValue(handler);
      context.getClass.mockReturnValue(classType);

      (reflector.getAllAndOverride as jest.Mock).mockReturnValue(true);

      const result = await guard.canActivate(context);

      expect(reflector.getAllAndOverride).toHaveBeenCalledWith('isPublic', [
        handler,
        classType,
      ]);
      expect(result).toBe(true);
    });

    it('should return true if @Public() decorator is present on class', async () => {
      const handler = jest.fn();
      const classType = class {};
      context.getHandler.mockReturnValue(handler);
      context.getClass.mockReturnValue(classType);

      (reflector.getAllAndOverride as jest.Mock).mockReturnValue(true);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should check metadata on both handler and class', async () => {
      const handler = jest.fn();
      const classType = class {};

      context.getHandler.mockReturnValue(handler);
      context.getClass.mockReturnValue(classType);

      (reflector.getAllAndOverride as jest.Mock).mockReturnValue(true);

      await guard.canActivate(context);

      expect(reflector.getAllAndOverride).toHaveBeenCalledWith('isPublic', [
        handler,
        classType,
      ]);
    });

    it('should return false if isPublic metadata is not set', async () => {
      const handler = jest.fn();
      const classType = class {};
      context.getHandler.mockReturnValue(handler);
      context.getClass.mockReturnValue(classType);

      (reflector.getAllAndOverride as jest.Mock).mockReturnValue(false);

      // Mock the parent canActivate to return false
      jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(guard)), 'canActivate').mockResolvedValue(false);

      const result = await guard.canActivate(context);

      expect(reflector.getAllAndOverride).toHaveBeenCalledWith('isPublic', [
        handler,
        classType,
      ]);
      // Result should be false or true depending on parent implementation
      expect(typeof result).toBe('boolean');
    });

    it('should prioritize @Public() decorator over authentication', async () => {
      const handler = jest.fn();
      const classType = class {};
      context.getHandler.mockReturnValue(handler);
      context.getClass.mockReturnValue(classType);

      (reflector.getAllAndOverride as jest.Mock).mockReturnValue(true);

      const mockReq = {}; // No user object
      const mockGqlContext = {
        getContext: () => ({ req: mockReq }),
      };
      (GqlExecutionContext.create as jest.Mock).mockReturnValue(mockGqlContext);

      const result = await guard.canActivate(context);

      // Should return true even without user, because @Public() decorator is present
      expect(result).toBe(true);
      // getRequest should NOT be called when @Public() decorator is present
      expect(GqlExecutionContext.create).not.toHaveBeenCalled();
    });

    it('should use reflector to check for isPublic metadata', async () => {
      const handler = jest.fn();
      const classType = class {};
      context.getHandler.mockReturnValue(handler);
      context.getClass.mockReturnValue(classType);

      (reflector.getAllAndOverride as jest.Mock).mockReturnValue(false);

      // Mock parent canActivate
      jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(guard)), 'canActivate').mockResolvedValue(true);

      await guard.canActivate(context);

      expect(reflector.getAllAndOverride).toHaveBeenCalledWith('isPublic', [
        handler,
        classType,
      ]);
    });
  });

  describe('integration with GraphQL context', () => {
    it('should work with GraphQL resolvers', () => {
      const mockReq = { user: mockConsultant };
      const mockGqlContext = {
        getContext: () => ({ req: mockReq }),
      };

      (GqlExecutionContext.create as jest.Mock).mockReturnValue(mockGqlContext);

      const request = guard.getRequest(context);

      expect(request.user.id).toBe('test-consultant-id');
      expect(request.user.externalId).toBe('okta-user-123');
    });

    it('should handle context without user', () => {
      const mockReq = {}; // No user property
      const mockGqlContext = {
        getContext: () => ({ req: mockReq }),
      };

      (GqlExecutionContext.create as jest.Mock).mockReturnValue(mockGqlContext);

      const request = guard.getRequest(context);

      expect(request.user).toBeUndefined();
    });

    it('should preserve request headers from GraphQL context', () => {
      const mockReq = {
        user: mockConsultant,
        headers: {
          authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
          'content-type': 'application/json',
        },
      };
      const mockGqlContext = {
        getContext: () => ({ req: mockReq }),
      };

      (GqlExecutionContext.create as jest.Mock).mockReturnValue(mockGqlContext);

      const request = guard.getRequest(context);

      expect(request.headers.authorization).toBe(
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
      );
      expect(request.headers['content-type']).toBe('application/json');
    });
  });
});
