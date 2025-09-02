import { renderHook, waitFor } from '~/testUtils';

import demoExperienceService from './demoExperienceService';
import useDemoExperiencePolling from './useDemoExperiencePolling';

jest.mock('./demoExperienceService', () => ({
  getDemoExperience: jest.fn(),
}));

describe('useDemoExperiencePolling', () => {
  const mockDemoExperience = {
    quota: {},
  };

  const mockError = new Error('Mock error');

  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(window, 'setInterval');
    (demoExperienceService.getDemoExperience as jest.Mock).mockResolvedValue({
      data: mockDemoExperience,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('should initialize and start polling', async () => {
    const { result } = renderHook(() => useDemoExperiencePolling());

    expect(result.current.initializing).toBe(true);
    expect(result.current.demoExperience).toEqual(mockDemoExperience);
    expect(result.current.initializeError).toBeUndefined();

    await waitFor(() => expect(result.current.initializing).toBe(false));

    expect(result.current.initializing).toBe(false);
    expect(result.current.demoExperience).toEqual(mockDemoExperience);
    expect(result.current.initializeError).toBeUndefined();
    expect(demoExperienceService.getDemoExperience).toHaveBeenCalledTimes(1);
  });

  it('should handle polling errors', async () => {
    (demoExperienceService.getDemoExperience as jest.Mock).mockRejectedValue(mockError);

    const { result } = renderHook(() => useDemoExperiencePolling());

    await waitFor(() => expect(result.current.initializing).toBe(false));

    expect(result.current.demoExperience).toEqual(mockDemoExperience);
    expect(result.current.initializeError).toBe(mockError);
    expect(demoExperienceService.getDemoExperience).toHaveBeenCalledTimes(1);
  });

  it('should restart polling with new demoExperience', async () => {
    const newDemoExperience = {
      quota: {},
    };

    const { result } = renderHook(() => useDemoExperiencePolling(), {
      initialProps: {
        restartPolling: (demoExperience: any) => {
          result.current.restartPolling(demoExperience);
        },
      },
    });

    expect(result.current.demoExperience).toEqual(mockDemoExperience);
    await waitFor(() => expect(result.current.initializing).toBe(false));
    expect(result.current.initializeError).toBeUndefined();

    result.current.restartPolling(newDemoExperience);

    await waitFor(() => expect(result.current.initializing).toBe(false));

    await waitFor(() => expect(demoExperienceService.getDemoExperience).toHaveBeenCalledTimes(1));

    expect(result.current.demoExperience).toEqual(newDemoExperience);

    expect(result.current.initializeError).toBeUndefined();

    // Ensure this is slightly over SHORT_POLLING_INTERVAL set in useDemoExperiencePolling.ts
    jest.advanceTimersByTime(5500);

    await waitFor(() => expect(demoExperienceService.getDemoExperience).toHaveBeenCalledTimes(2));
  });
});
