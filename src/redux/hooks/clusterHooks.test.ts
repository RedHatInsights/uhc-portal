import axios from 'axios';
import * as reactRedux from 'react-redux';

import { renderHook } from '@testing-library/react';

import apiRequest from '~/services/apiRequest';

import { GlobalState } from '../state';

import { techPreviewStatusSelector, useGetTechPreviewStatus } from './clusterHooks';

type MockedJest = jest.Mocked<typeof axios> & jest.Mock;
const apiRequestMock = apiRequest as unknown as MockedJest;

jest.mock('react-redux', () => {
  const config = {
    __esModule: true,
    ...jest.requireActual('react-redux'),
  };
  return config;
});

describe('useGetTechPreviewStatus hook', () => {
  const useSelectorSpy = jest.spyOn(reactRedux, 'useSelector');
  const useDispatchMock = jest.spyOn(reactRedux, 'useDispatch');
  const mockedDispatch = jest.fn();

  beforeEach(() => {
    useSelectorSpy.mockReturnValue(false);
    useDispatchMock.mockReturnValue(mockedDispatch);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  it('Calls pending and fulfilled actions with successful api call', async () => {
    apiRequestMock.get.mockResolvedValueOnce({ data: { what: 'myData' } });
    const getPreview = renderHook(() => useGetTechPreviewStatus('myProject', 'myType')).result
      .current;
    await getPreview();

    expect(mockedDispatch).toHaveBeenCalledTimes(2);

    expect(mockedDispatch.mock.calls[0][0]).toEqual({
      type: 'GET_TECH_PREVIEW_PENDING',
      payload: { product: 'myProject', type: 'myType' },
    });

    expect(mockedDispatch.mock.calls[1][0]).toEqual({
      type: 'GET_TECH_PREVIEW_FULFILLED',
      payload: { product: 'myProject', type: 'myType', data: { what: 'myData' } },
    });
  });

  it('calls error with failed api call', async () => {
    apiRequestMock.get.mockRejectedValueOnce({ data: { what: 'myData' } });
    const getPreview = renderHook(() => useGetTechPreviewStatus('myProject', 'myType')).result
      .current;

    await getPreview();

    expect(mockedDispatch).toHaveBeenCalledTimes(2);

    expect(mockedDispatch.mock.calls[0][0]).toEqual({
      type: 'GET_TECH_PREVIEW_PENDING',
      payload: { product: 'myProject', type: 'myType' },
    });

    expect(mockedDispatch.mock.calls[1][0]).toEqual({
      type: 'GET_TECH_PREVIEW_REJECTED',
      payload: { product: 'myProject', type: 'myType' },
    });
  });

  it('techPreviewStatusSelector returns the status when value is in global state ', () => {
    const state = {
      clusters: {
        techPreview: {
          rosa: {
            hcp: 'My-tech-preview-object',
          },
        },
      },
    } as unknown as GlobalState;

    expect(techPreviewStatusSelector(state, 'rosa', 'hcp')).toEqual('My-tech-preview-object');
  });

  it('techPreviewStatusSelector returns undefined when value is not in redux', () => {
    const state = {
      clusters: {
        techPreview: {
          rosa: {},
        },
      },
    } as unknown as GlobalState;

    expect(techPreviewStatusSelector(state, 'rosa', 'hcp')).toBeUndefined();
    expect(techPreviewStatusSelector(state, 'i_do_not_exist', 'nope')).toBeUndefined();
  });
});
