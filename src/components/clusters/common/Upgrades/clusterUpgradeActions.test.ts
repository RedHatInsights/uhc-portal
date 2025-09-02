/* eslint-disable no-unused-vars */
import createMockStore from 'redux-mock-store';

import clusterService from '../../../../services/clusterService';

import { getSchedules, postSchedule } from './clusterUpgradeActions';
import { initialState } from './clusterUpgradeReducer';

const {
  getControlPlaneUpgradeSchedules,
  getUpgradeSchedules,
  getUpgradeScheduleState,

  postControlPlaneUpgradeSchedule,
  postUpgradeSchedule,
} = clusterService;

jest.mock('../../../../services/clusterService', () => ({
  getControlPlaneUpgradeSchedules: jest.fn(),
  getUpgradeSchedules: jest.fn(),
  getUpgradeScheduleState: jest.fn(),
  postControlPlaneUpgradeSchedule: jest.fn(),
  postUpgradeSchedule: jest.fn(),
  deleteControlPlaneUpgradeSchedule: jest.fn(),
  deleteUpgradeSchedule: jest.fn(),
  patchControlPlaneUpgradeSchedule: jest.fn(),
  patchUpgradeSchedule: jest.fn(),
}));
describe('clusterUpgradeActions', () => {
  const mockDispatch = jest.fn();
  beforeEach(() => {
    mockDispatch.mockClear();
  });

  describe('schedules', () => {
    const mockStore = createMockStore();
    const store = mockStore(initialState);
    const schedule = {
      cluster_id: 'cluster_id',
      id: 'id',
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    describe('getSchedules', () => {
      it('when isHypershift is true', async () => {
        // Arrange
        (getControlPlaneUpgradeSchedules as jest.Mock).mockResolvedValueOnce({
          data: { items: [schedule] },
        });

        // Act
        const payload = await Promise.resolve(
          store.dispatch(getSchedules('clusterID', true)).payload,
        );

        // Assert
        expect(getUpgradeSchedules).toHaveBeenCalledTimes(0);
        expect(getControlPlaneUpgradeSchedules).toHaveBeenCalledTimes(1);
        expect(getControlPlaneUpgradeSchedules).toHaveBeenCalledWith('clusterID');
        expect(getUpgradeScheduleState).toHaveBeenCalledTimes(0);
        expect(payload.data.items?.length).toBe(1);
        expect(payload.data.items?.[0]).toStrictEqual(schedule);
      });

      it('when isHypershift is false', async () => {
        // Arrange
        (getUpgradeSchedules as jest.Mock).mockResolvedValueOnce({ data: { items: [schedule] } });
        (getUpgradeScheduleState as jest.Mock).mockResolvedValueOnce({ data: 'ready' });

        // Act
        const payload = await Promise.resolve(
          store.dispatch(getSchedules('clusterID', false)).payload,
        );

        // Assert
        expect(getControlPlaneUpgradeSchedules).toHaveBeenCalledTimes(0);
        expect(getUpgradeSchedules).toHaveBeenCalledTimes(1);
        expect(getUpgradeSchedules).toHaveBeenCalledWith('clusterID');
        expect(getUpgradeScheduleState).toHaveBeenCalledTimes(1);
        expect(getUpgradeScheduleState).toHaveBeenCalledWith(schedule.cluster_id, schedule.id);
        expect(payload.data.items?.length).toBe(1);
        expect(payload.data.items?.[0]).toStrictEqual({
          ...schedule,
          state: 'ready',
        });
      });

      it('when isHypershift is false and items undefined', async () => {
        // Arrange
        (getUpgradeSchedules as jest.Mock).mockResolvedValueOnce({ data: { items: undefined } });

        // Act
        const payload = await Promise.resolve(
          store.dispatch(getSchedules('clusterID', false)).payload,
        );

        // Assert
        expect(getControlPlaneUpgradeSchedules).toHaveBeenCalledTimes(0);
        expect(getUpgradeSchedules).toHaveBeenCalledTimes(1);
        expect(getUpgradeSchedules).toHaveBeenCalledWith('clusterID');
        expect(getUpgradeScheduleState).toHaveBeenCalledTimes(0);
        expect(payload.data.items?.length).toBe(0);
      });

      it('when isHypershift is false and items empty', async () => {
        // Arrange
        (getUpgradeSchedules as jest.Mock).mockResolvedValueOnce({ data: { items: [] } });

        // Act
        const payload = await Promise.resolve(
          store.dispatch(getSchedules('clusterID', false)).payload,
        );

        // Assert
        expect(getControlPlaneUpgradeSchedules).toHaveBeenCalledTimes(0);
        expect(getUpgradeSchedules).toHaveBeenCalledTimes(1);
        expect(getUpgradeSchedules).toHaveBeenCalledWith('clusterID');
        expect(getUpgradeScheduleState).toHaveBeenCalledTimes(0);
        expect(payload.data.items?.length).toBe(0);
      });
    });

    describe('postSchedule', () => {
      it('when isHypershift is true', () => {
        // Arrange
        (postControlPlaneUpgradeSchedule as jest.Mock).mockResolvedValueOnce('response');

        // Act
        postSchedule('clusterID', schedule, true)(store.dispatch);

        // Assert
        expect(postUpgradeSchedule).toHaveBeenCalledTimes(0);
        expect(postControlPlaneUpgradeSchedule).toHaveBeenCalledTimes(1);
        expect(postControlPlaneUpgradeSchedule).toHaveBeenCalledWith('clusterID', schedule);
      });

      it('when isHypershift is false', () => {
        // Arrange
        (postUpgradeSchedule as jest.Mock).mockResolvedValueOnce('response');

        // Act
        postSchedule('clusterID', schedule, false)(store.dispatch);

        // Assert
        expect(postControlPlaneUpgradeSchedule).toHaveBeenCalledTimes(0);
        expect(postUpgradeSchedule).toHaveBeenCalledTimes(1);
        expect(postUpgradeSchedule).toHaveBeenCalledWith('clusterID', schedule);
      });
    });
  });
});
