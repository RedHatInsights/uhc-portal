import React from 'react';
import * as reactRedux from 'react-redux';

import * as notifications from '@redhat-cloud-services/frontend-components-notifications';
import { act, waitFor } from '@testing-library/react';

import { checkAccessibility, render, screen } from '~/testUtils';

import { useAddGrant } from '../../../../../../../queries/ClusterDetailsQueries/AccessControlTab/NetworkSelfServiceQueries/useAddGrant';
import { useFetchGrants } from '../../../../../../../queries/ClusterDetailsQueries/AccessControlTab/NetworkSelfServiceQueries/useFetchGrants';
import { useFetchRoles } from '../../../../../../../queries/ClusterDetailsQueries/AccessControlTab/NetworkSelfServiceQueries/useFetchRoles';
import NetworkSelfServiceSection from '../NetworkSelfServiceSection';

jest.useFakeTimers({
  legacyFakeTimers: true, // TODO 'modern'
});

jest.mock('@redhat-cloud-services/frontend-components-notifications', () => {
  const config = {
    __esModule: true,
    ...jest.requireActual('@redhat-cloud-services/frontend-components-notifications'),
  };
  return config;
});

jest.mock(
  '../../../../../../../queries/ClusterDetailsQueries/AccessControlTab/NetworkSelfServiceQueries/useFetchRoles',
  () => ({
    useFetchRoles: jest.fn(),
  }),
);
jest.mock(
  '../../../../../../../queries/ClusterDetailsQueries/AccessControlTab/NetworkSelfServiceQueries/useFetchGrants',
  () => ({
    useFetchGrants: jest.fn(),
    refetchGrants: jest.fn(),
  }),
);
jest.mock(
  '../../../../../../../queries/ClusterDetailsQueries/AccessControlTab/NetworkSelfServiceQueries/useAddGrant',
  () => ({
    useAddGrant: jest.fn(),
  }),
);

jest.mock('react-redux', () => {
  const config = {
    __esModule: true,
    ...jest.requireActual('react-redux'),
  };
  return config;
});

const fakeAddGrantResponse = {
  data: {
    user_arn: 'fake-arn',
    state: 'failed',
    role: {
      id: 'network-mgmt',
    },
    id: 'fake-id-1',
    roleName: 'Network Management',
    console_url: 'http://example.com',
  },
};

const fakeGrants = [
  {
    user_arn: 'fake-arn',
    state: 'pending',
    role: {
      id: 'network-mgmt',
    },
    id: 'fake-id-1',
    roleName: 'Network Management',
    console_url: 'http://example.com',
  },
  {
    user_arn: 'fake-arn2',
    state: 'pending',
    role: {
      id: 'read-only',
    },
    id: 'fake-id-2',
    roleName: 'Read Only',
    console_url: 'http://example.com',
  },
];

describe('<NetworkSelfServiceSection />', () => {
  const useFetchGrantsMock = useFetchGrants;
  const useFetchRolesMock = useFetchRoles;
  const useAddGrantMock = useAddGrant;

  const useAddNotificationsMock = jest.spyOn(notifications, 'useAddNotification');
  const mockedAddNotification = jest.fn();
  useAddNotificationsMock.mockReturnValue(mockedAddNotification);

  const deleteGrant = jest.fn();
  const openAddGrantModal = jest.fn();
  // const addNotification = jest.fn();

  const useDispatchMock = jest.spyOn(reactRedux, 'useDispatch');
  const dispatchMock = jest.fn();

  const props = {
    canEdit: true,
    deleteGrant,
    openAddGrantModal,
    // addNotification,
    clusterHibernating: false,
    isReadOnly: false,
  };

  useAddGrantMock.mockReturnValue({
    data: fakeAddGrantResponse,
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('is accessible with no data', async () => {
    useFetchGrantsMock.mockReturnValue({
      data: [],
      isLoading: true,
      isError: false,
      error: null,
    });
    useFetchRolesMock.mockReturnValue({
      data: [],
      isLoading: true,
      isError: false,
      error: null,
    });
    const { container } = render(<NetworkSelfServiceSection {...props} />);
    // Use real timers for accessibility testing since axe-core requires real timers
    jest.useRealTimers();
    await checkAccessibility(container);
    // Restore fake timers for other tests
    jest.useFakeTimers({
      legacyFakeTimers: true,
    });
  });

  it('should call getGrants and getRoles on mount', () => {
    expect(useFetchGrantsMock).not.toHaveBeenCalled();
    expect(useFetchRolesMock).not.toHaveBeenCalled();

    useFetchGrantsMock.mockReturnValue({
      data: [],
      isLoading: true,
      isError: false,
      error: null,
    });
    useFetchRolesMock.mockReturnValue({
      data: [],
      isLoading: true,
      isError: false,
      error: null,
    });
    render(<NetworkSelfServiceSection {...props} />);

    expect(useFetchRolesMock).toHaveBeenCalled();
    expect(useFetchGrantsMock).toHaveBeenCalled();
  });

  it('should open modal when needed', async () => {
    useFetchGrantsMock.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    });
    useFetchRolesMock.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    });
    const { user } = render(<NetworkSelfServiceSection {...props} />);
    expect(openAddGrantModal).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Grant role' }));

    await act(async () => {
      jest.runAllTimers();
    });
    expect(
      await screen.findByRole('dialog', {
        name: 'Grant AWS infrastructure role',
      }),
    ).toBeInTheDocument();
  });

  it('should call getGrants() when a grant is added', () => {
    expect(useFetchGrantsMock).not.toHaveBeenCalled();
    useFetchGrantsMock.mockReturnValue({
      data: [],
      isLoading: true,
      isError: false,
      error: null,
    });

    const { rerender } = render(<NetworkSelfServiceSection {...props} />);
    expect(useFetchGrantsMock).toHaveBeenCalledTimes(1);
    useFetchGrantsMock.mockReturnValue({
      data: [
        {
          user_arn: 'fake-arn',
          state: 'pending',
          role: {
            id: 'network-mgmt',
          },
          id: 'fake-id-1',
          roleName: 'Network Management',
          console_url: 'http://example.com',
        },
      ],
      isLoading: false,
      isError: false,
      error: null,
    });

    rerender(<NetworkSelfServiceSection {...props} />);

    expect(useFetchGrantsMock).toHaveBeenCalledTimes(3);
  });

  it('should call getGrants() when a grant is removed', () => {
    expect(useFetchGrantsMock).not.toHaveBeenCalled();
    useFetchGrantsMock.mockReturnValue({
      data: [
        {
          user_arn: 'fake-arn',
          state: 'pending',
          role: {
            id: 'network-mgmt',
          },
          id: 'fake-id-1',
          roleName: 'Network Management',
          console_url: 'http://example.com',
        },
      ],
      isLoading: false,
      isError: false,
      error: null,
    });

    const { rerender } = render(<NetworkSelfServiceSection {...props} />);
    expect(useFetchGrantsMock).toHaveBeenCalledTimes(2);

    useFetchGrantsMock.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    });

    rerender(<NetworkSelfServiceSection {...props} />);

    expect(useFetchGrantsMock).toHaveBeenCalledTimes(4);
  });

  it('should render skeleton when pending and no grants are set', () => {
    useFetchGrantsMock.mockReturnValue({
      data: [],
      isLoading: true,
      isError: false,
      error: null,
    });

    const { container } = render(<NetworkSelfServiceSection {...props} />);
    // There isn't an easy besides class to find skeletons
    // eslint-disable-next-line testing-library/no-node-access
    expect(container.querySelectorAll('.pf-v6-c-skeleton').length).toBeGreaterThan(0);
  });

  it('displays grant arns in table cells', async () => {
    useFetchGrantsMock.mockReturnValue({
      data: fakeGrants,
      isLoading: false,
      isError: false,
      error: null,
    });

    render(<NetworkSelfServiceSection {...props} />);
    expect(screen.getByText('fake-arn')).toBeInTheDocument();
    expect(screen.getByText('fake-arn2')).toBeInTheDocument();
  });

  it('should notify when a grant fails', () => {
    useDispatchMock.mockReturnValue(dispatchMock);
    useFetchGrantsMock.mockReturnValue({
      data: fakeGrants,
      isLoading: true,
      isFetching: true,
      isError: false,
      error: null,
    });

    const { rerender } = render(<NetworkSelfServiceSection {...props} />);

    expect(mockedAddNotification).not.toHaveBeenCalled();
    useFetchGrantsMock.mockReturnValue({
      data: [
        {
          ...fakeGrants[0],
          state: 'failed',
          state_description: 'some failure',
        },
        fakeGrants[1],
      ],
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
    });

    rerender(<NetworkSelfServiceSection {...props} />);
    expect(mockedAddNotification).toHaveBeenCalledWith({
      variant: 'danger',
      title: 'Role creation failed for fake-arn',
      description: 'some failure',
      dismissDelay: 8000,
      dismissable: false,
    });
  });

  it('should notify when a grant succeeds', async () => {
    useDispatchMock.mockReturnValue(dispatchMock);
    useAddGrantMock.mockReturnValue({
      data: {
        data: {
          user_arn: 'fake-arn2',
          state: 'pending',
          role: {
            id: 'read-only',
          },
          id: 'fake-id-2',
          roleName: 'Read Only',
          console_url: 'http://example.com',
        },
      },
      isPending: false,
      isError: false,
      error: null,
      mutateAsync: jest.fn(),
      reset: jest.fn(),
    });
    useFetchRolesMock.mockReturnValue({
      data: [
        {
          id: 'read-only',
          displayName: 'Read Only',
        },
        {
          id: 'network-mgmt',
          displayName: 'Network Management',
        },
      ],
      isLoading: false,
      isError: false,
      error: null,
    });
    useFetchGrantsMock.mockReturnValue({
      data: fakeGrants,
      isLoading: true,
      isFetching: true,
      isError: false,
      error: null,
    });
    const { rerender } = render(<NetworkSelfServiceSection {...props} />);

    expect(mockedAddNotification).not.toHaveBeenCalled();
    useFetchGrantsMock.mockReturnValue({
      data: [
        fakeGrants[0],
        {
          ...fakeGrants[1],
          state: 'ready',
        },
      ],
      isLoading: true,
      isFetching: true,
      isError: false,
      error: null,
    });

    rerender(<NetworkSelfServiceSection {...props} />);
    await waitFor(() => {
      expect(mockedAddNotification).toHaveBeenCalledWith({
        variant: 'success',
        title: 'Read Only role successfully created for fake-arn2',
        dismissDelay: 8000,
        dismissable: false,
      });
    });
  });

  it('should disable add button when canEdit is false', () => {
    useFetchGrantsMock.mockReturnValue({
      data: fakeGrants,
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
    });
    render(
      <NetworkSelfServiceSection canEdit={false} clusterHibernating={false} isReadOnly={false} />,
    );

    expect(screen.getByRole('button', { name: 'Grant role' })).not.toBeEnabled();
  });

  it('should disable add button when hibernating', () => {
    useFetchGrantsMock.mockReturnValue({
      data: fakeGrants,
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
    });
    render(<NetworkSelfServiceSection canEdit clusterHibernating isReadOnly={false} />);
    expect(screen.getByRole('button', { name: 'Grant role' })).not.toBeEnabled();
  });

  it('should disable add button when read_only', () => {
    useFetchGrantsMock.mockReturnValue({
      data: fakeGrants,
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
    });
    render(<NetworkSelfServiceSection canEdit clusterHibernating={false} isReadOnly />);
    expect(screen.getByRole('button', { name: 'Grant role' })).not.toBeEnabled();
  });
});
