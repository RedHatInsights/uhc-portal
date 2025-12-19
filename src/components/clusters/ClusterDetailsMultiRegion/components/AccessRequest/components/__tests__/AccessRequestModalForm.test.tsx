import React from 'react';
import * as reactRedux from 'react-redux';

import { closeModal } from '~/components/common/Modal/ModalActions';
import {
  useCanMakeDecision,
  usePostAccessRequestDecision,
} from '~/queries/ClusterDetailsQueries/AccessRequestTab/usePostAccessRequestDecision';
import { useGlobalState } from '~/redux/hooks';
import { act, render, screen, waitFor, within } from '~/testUtils';
import { AccessRequestStatusState } from '~/types/access_transparency.v1';

import AccessRequestModalForm from '../AccessRequestModalForm';

jest.mock('~/redux/hooks', () => ({
  useGlobalState: jest.fn(),
}));

jest.mock('~/queries/ClusterDetailsQueries/AccessRequestTab/usePostAccessRequestDecision', () => ({
  usePostAccessRequestDecision: jest.fn(),
  useCanMakeDecision: jest.fn(),
}));

jest.mock('../AccessRequestStateIcon', () => () => <div>access request state icon mock</div>);
jest.mock('../AccessRequestDetails', () => () => <div>access request details mock</div>);
jest.mock(
  '~/components/common/ErrorBox',
  () =>
    ({ response }: { response?: { errorDetails?: string } }) => (
      <div data-testid="error-box">
        error-box
        {response?.errorDetails && <div>{response.errorDetails}</div>}
      </div>
    ),
);

jest.mock('~/components/common/Modal/ModalActions', () => ({
  closeModal: jest.fn(),
}));
jest.mock('react-redux', () => {
  const config = {
    __esModule: true,
    ...jest.requireActual('react-redux'),
  };
  return config;
});

const useGlobalStateMock = useGlobalState as jest.Mock;
const closeModalMock = closeModal as jest.Mock;

const useCanMakeDecisionMock = useCanMakeDecision as jest.Mock;
const usePostAccessRequestDecisionMock = usePostAccessRequestDecision as jest.Mock;

describe('AccessRequestModalForm', () => {
  const REFRESH_TIMES = 1;
  const useDispatchMock = jest.spyOn(reactRedux, 'useDispatch');
  const dispatchMock = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
    useDispatchMock.mockReturnValue(dispatchMock);
    closeModalMock.mockReturnValue('closeModalValue');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('undefined access request', () => {
    // Arrange
    useGlobalStateMock.mockReturnValue({});
    usePostAccessRequestDecisionMock.mockReturnValue({});
    useCanMakeDecisionMock.mockReturnValue({});

    // Act
    render(
      <div data-testid="parent-div">
        <AccessRequestModalForm />
      </div>,
    );

    // Assert
    expect(screen.getByTestId('parent-div').children.length).toBe(0);
  });

  describe('is loading', () =>
    it.each([
      [
        'when access request empty',
        {},
        { mutate: jest.fn(), isPending: false, isError: false, error: null },
        { isLoading: false, isError: false, error: null, data: undefined },
      ],
      [
        'when postAccessRequestDecision is pending',
        { id: 'accessRequestId' },
        { mutate: jest.fn(), isPending: true, isError: false, error: null, isSuccess: false },
        { isLoading: false, isError: false, error: null, data: undefined },
      ],
      [
        'when canMakeDecision is pending',
        { id: 'accessRequestId' },
        { mutate: jest.fn(), isPending: false, isError: false, error: null, isSuccess: false },
        { isLoading: true, isError: false, error: null, data: undefined },
      ],
    ])(
      '%p',
      (
        _title: string,
        accessRequest: any,
        postAccessRequestDecisionState: any,
        canMakeDecisionState: any,
      ) => {
        // Arrange
        useGlobalStateMock.mockReturnValueOnce({ accessRequest });
        useGlobalStateMock.mockReturnValueOnce('organizationId');
        usePostAccessRequestDecisionMock.mockReturnValueOnce(postAccessRequestDecisionState);
        useCanMakeDecisionMock.mockReturnValueOnce(canMakeDecisionState);

        // Act
        render(<AccessRequestModalForm />);

        // Assert
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
        expect(screen.getByLabelText('Loading...')).toBeInTheDocument();
      },
    ));

  it('is not loading', () => {
    // Arrange
    for (let i = 0; i <= REFRESH_TIMES; i += 1) {
      useGlobalStateMock.mockReturnValueOnce({ accessRequest: { id: 'accessRequestId' } });
      useGlobalStateMock.mockReturnValueOnce('organizationId');
      usePostAccessRequestDecisionMock.mockReturnValueOnce({
        mutate: jest.fn(),
        isPending: false,
        isError: false,
        error: null,
        isSuccess: false,
      });
      useCanMakeDecisionMock.mockReturnValueOnce({
        isLoading: false,
        isError: false,
        error: null,
        data: { allowed: true },
      });
    }

    // Act
    render(<AccessRequestModalForm />);

    // Assert
    expect(screen.queryByText(/Loading.../i)).not.toBeInTheDocument();
  });

  describe('it renders properly', () => {
    it('is not editMode', () => {
      // Arrange
      for (let i = 0; i <= REFRESH_TIMES; i += 1) {
        useGlobalStateMock.mockReturnValueOnce({ accessRequest: { id: 'accessRequestId' } });
        useGlobalStateMock.mockReturnValueOnce('organizationId');
        usePostAccessRequestDecisionMock.mockReturnValueOnce({
          mutate: jest.fn(),
          isPending: false,
          isError: false,
          error: null,
          isSuccess: false,
        });
        useCanMakeDecisionMock.mockReturnValueOnce({
          isLoading: false,
          isError: false,
          error: null,
          data: { allowed: true },
        });
      }

      // Act
      render(<AccessRequestModalForm />);

      // Assert
      expect(
        within(
          screen.getByRole('heading', {
            name: /access request details/i,
          }),
        ).getByText(/access request details/i),
      ).toBeInTheDocument();
    });

    it('is editMode no rights for making a decision', async () => {
      // Arrange
      for (let i = 0; i <= REFRESH_TIMES; i += 1) {
        useGlobalStateMock.mockReturnValueOnce({
          accessRequest: {
            id: 'accessRequestId',
            status: { state: AccessRequestStatusState.Pending },
          },
        });
        useGlobalStateMock.mockReturnValueOnce('organizationId');
        usePostAccessRequestDecisionMock.mockReturnValueOnce({
          mutate: jest.fn(),
          isPending: false,
          isError: false,
          error: null,
          isSuccess: false,
        });
        useCanMakeDecisionMock.mockReturnValueOnce({
          isLoading: false,
          isError: false,
          error: null,
          data: { allowed: false },
        });
      }

      // Act
      // eslint-disable-next-line testing-library/no-unnecessary-act
      await act(() => render(<AccessRequestModalForm />));

      // Assert
      expect(
        within(
          screen.getByRole('heading', {
            name: /access request details/i,
          }),
        ).getByText(/access request details/i),
      ).toBeInTheDocument();
      expect(screen.getByText(/decision/i)).toBeInTheDocument();
      expect(screen.getByText(/No rights for making a decision/i)).toBeInTheDocument();
    });

    it('is editMode with rights for making a decision', async () => {
      // Arrange
      for (let i = 0; i <= REFRESH_TIMES; i += 1) {
        useGlobalStateMock.mockReturnValueOnce({
          accessRequest: {
            id: 'accessRequestId',
            status: { state: AccessRequestStatusState.Pending },
          },
        });
        useGlobalStateMock.mockReturnValueOnce('organizationId');
        usePostAccessRequestDecisionMock.mockReturnValueOnce({
          mutate: jest.fn(),
          isPending: false,
          isError: false,
          error: null,
          isSuccess: false,
        });
        useCanMakeDecisionMock.mockReturnValueOnce({
          isLoading: false,
          isError: false,
          error: null,
          data: { allowed: true },
        });
      }

      // Act
      // eslint-disable-next-line testing-library/no-unnecessary-act
      await act(() => render(<AccessRequestModalForm />));

      // Assert
      expect(
        within(
          screen.getByRole('heading', {
            name: /access request details/i,
          }),
        ).getByText(/access request details/i),
      ).toBeInTheDocument();
      expect(screen.getByText(/decision/i)).toBeInTheDocument();
      expect(screen.queryByText(/No rights for making a decision/i)).not.toBeInTheDocument();
    });

    it('shows error after submit error', async () => {
      // Arrange
      const onCloseMock = jest.fn();
      const mutateMock = jest.fn();

      // Initial render - form should be editable (no error)
      for (let i = 0; i <= REFRESH_TIMES; i += 1) {
        useGlobalStateMock.mockReturnValueOnce({
          accessRequest: {
            id: 'accessRequestId',
            status: { state: AccessRequestStatusState.Pending },
          },
          onClose: onCloseMock,
        });
        useGlobalStateMock.mockReturnValueOnce('organizationId');
        usePostAccessRequestDecisionMock.mockReturnValueOnce({
          mutate: mutateMock,
          isPending: false,
          isError: false, // Start with no error so form is editable
          error: null,
          isSuccess: false,
        });
        useCanMakeDecisionMock.mockReturnValueOnce({
          isLoading: false,
          isError: false,
          error: null,
          data: { allowed: true },
        });
      }

      const { user, rerender } = render(<AccessRequestModalForm />);

      // Click approve radio button
      await user.click(
        screen.getByRole('radio', {
          name: /approve/i,
        }),
      );

      // Click save button
      await user.click(
        within(screen.getByRole('contentinfo')).getByRole('button', {
          name: /save/i,
        }),
      );

      // Act - Rerender with error state after submit
      // Set up mocks for rerender - component calls hooks in this order:
      // 1. useGlobalState (accessRequest/onClose)
      // 2. useGlobalState (organizationId)
      // 3. usePostAccessRequestDecision
      // 4. useCanMakeDecision
      useGlobalStateMock.mockReturnValueOnce({
        accessRequest: {
          id: 'accessRequestId',
          status: { state: AccessRequestStatusState.Pending },
        },
        onClose: onCloseMock,
      });
      useGlobalStateMock.mockReturnValueOnce('organizationId');
      usePostAccessRequestDecisionMock.mockReturnValueOnce({
        mutate: mutateMock,
        isPending: false,
        isError: true, // Now show error after submit
        error: {
          error: {
            errorDetails: 'ERROR DETAILS',
            errorMessage: 'ERROR MESSAGE',
          },
        },
        isSuccess: false,
      });
      useCanMakeDecisionMock.mockReturnValueOnce({
        isLoading: false,
        isError: false,
        error: null,
        data: { allowed: true },
      });

      rerender(<AccessRequestModalForm />);

      // Assert
      await waitFor(() => {
        expect(mutateMock).toHaveBeenCalledTimes(1);
      });

      // The error box should be shown
      const errorBox = screen.getByTestId('error-box');
      expect(errorBox).toBeInTheDocument();

      // And it should surface the detailed error from the API, not just a generic message
      expect(screen.getByText(/ERROR DETAILS/i)).toBeInTheDocument();
      expect(onCloseMock).toHaveBeenCalledTimes(0);
      expect(dispatchMock).toHaveBeenCalledTimes(0);
    });
  });

  describe('modal functionallity', () => {
    it('closes', async () => {
      // Arrange
      const onCloseMock = jest.fn();
      for (let i = 0; i <= REFRESH_TIMES; i += 1) {
        useGlobalStateMock.mockReturnValueOnce({
          accessRequest: {
            id: 'accessRequestId',
            status: { state: AccessRequestStatusState.Pending },
          },
          onClose: onCloseMock,
        });
        useGlobalStateMock.mockReturnValueOnce('organizationId');
        usePostAccessRequestDecisionMock.mockReturnValueOnce({
          mutate: jest.fn(),
          isPending: false,
          isError: false,
          error: null,
          isSuccess: false,
        });
        useCanMakeDecisionMock.mockReturnValueOnce({
          isLoading: false,
          isError: false,
          error: null,
          data: { allowed: true },
        });
      }

      const { user } = render(<AccessRequestModalForm />);

      // Act
      await user.click(
        screen.getByRole('button', {
          name: /close/i,
        }),
      );

      // Assert
      expect(onCloseMock).toHaveBeenCalledTimes(1);
      expect(dispatchMock).toHaveBeenCalledTimes(1);
      expect(dispatchMock).toHaveBeenCalledWith('closeModalValue');
    });

    it('properly disable save button in case not filling form', async () => {
      // Arrange
      for (let i = 0; i <= REFRESH_TIMES; i += 1) {
        useGlobalStateMock.mockReturnValueOnce({
          accessRequest: {
            id: 'accessRequestId',
            status: { state: AccessRequestStatusState.Pending },
          },
        });
        usePostAccessRequestDecisionMock.mockReturnValueOnce({
          mutate: jest.fn(),
          isPending: false,
          isError: false,
          error: null,
          isSuccess: false,
        });
        useCanMakeDecisionMock.mockReturnValueOnce({
          isLoading: false,
          isError: false,
          error: null,
          data: { allowed: true },
        });
        useGlobalStateMock.mockReturnValueOnce('organizationId');
      }

      // Act
      // eslint-disable-next-line testing-library/no-unnecessary-act
      await act(() => render(<AccessRequestModalForm />));

      // Assert
      expect(
        screen.getByRole('button', {
          name: /save/i,
        }),
      ).toHaveAttribute('disabled');
      expect(
        screen.getByRole('button', {
          name: /cancel/i,
        }),
      ).not.toHaveAttribute('disabled');
    });

    it('properly enable save button in case of approve', async () => {
      // Arrange
      for (let i = 0; i <= REFRESH_TIMES; i += 1) {
        useGlobalStateMock.mockReturnValueOnce({
          accessRequest: {
            id: 'accessRequestId',
            status: { state: AccessRequestStatusState.Pending },
          },
        });
        usePostAccessRequestDecisionMock.mockReturnValueOnce({
          mutate: jest.fn(),
          isPending: false,
          isError: false,
          error: null,
          isSuccess: false,
        });
        useCanMakeDecisionMock.mockReturnValueOnce({
          isLoading: false,
          isError: false,
          error: null,
          data: { allowed: true },
        });
        useGlobalStateMock.mockReturnValueOnce('organizationId');
      }

      // Act
      const { user } = render(<AccessRequestModalForm />);
      await user.click(
        screen.getByRole('radio', {
          name: /approve/i,
        }),
      );

      // Assert
      expect(
        screen.getByRole('button', {
          name: /save/i,
        }),
      ).not.toHaveAttribute('disabled');
      expect(
        screen.getByRole('button', {
          name: /cancel/i,
        }),
      ).not.toHaveAttribute('disabled');
    });

    it('properly disable save button in case of deny', async () => {
      // Arrange
      for (let i = 0; i <= REFRESH_TIMES; i += 1) {
        useGlobalStateMock.mockReturnValueOnce({
          accessRequest: {
            id: 'accessRequestId',
            status: { state: AccessRequestStatusState.Pending },
          },
        });
        usePostAccessRequestDecisionMock.mockReturnValueOnce({
          mutate: jest.fn(),
          isPending: false,
          isError: false,
          error: null,
          isSuccess: false,
        });
        useCanMakeDecisionMock.mockReturnValueOnce({
          isLoading: false,
          isError: false,
          error: null,
          data: { allowed: true },
        });
        useGlobalStateMock.mockReturnValueOnce('organizationId');
      }

      // Act
      const { user } = render(<AccessRequestModalForm />);
      await user.click(
        screen.getByRole('radio', {
          name: /deny/i,
        }),
      );

      // Assert
      expect(
        screen.getByRole('button', {
          name: /save/i,
        }),
      ).toHaveAttribute('disabled');
      expect(
        screen.getByRole('button', {
          name: /cancel/i,
        }),
      ).not.toHaveAttribute('disabled');
    });

    it('properly enable save button in case of deny and form fields properly filled', async () => {
      // Arrange
      for (let i = 0; i <= REFRESH_TIMES; i += 1) {
        useGlobalStateMock.mockReturnValueOnce({
          accessRequest: {
            id: 'accessRequestId',
            status: { state: AccessRequestStatusState.Pending },
          },
        });
        usePostAccessRequestDecisionMock.mockReturnValueOnce({
          mutate: jest.fn(),
          isPending: false,
          isError: false,
          error: null,
          isSuccess: false,
        });
        useCanMakeDecisionMock.mockReturnValueOnce({
          isLoading: false,
          isError: false,
          error: null,
          data: { allowed: true },
        });
        useGlobalStateMock.mockReturnValueOnce('organizationId');
      }

      const { user } = render(<AccessRequestModalForm />);
      await user.click(
        screen.getByRole('radio', {
          name: /deny/i,
        }),
      );
      expect(
        screen.getByRole('button', {
          name: /save/i,
        }),
      ).toHaveAttribute('disabled');

      // Act
      await user.type(
        screen.getByRole('textbox', {
          name: /access request justification/i,
        }),
        '1234567890abcdef',
      );

      // Assert
      expect(
        screen.getByRole('button', {
          name: /save/i,
        }),
      ).not.toHaveAttribute('disabled');
    });

    it.each([['1234567890abcdef#'], [' ']])(
      'save button disabled in case of validation failure for text %p',
      async (justificationValue: string) => {
        // Arrange
        for (let i = 0; i <= REFRESH_TIMES; i += 1) {
          useGlobalStateMock.mockReturnValueOnce({
            accessRequest: {
              id: 'accessRequestId',
              status: { state: AccessRequestStatusState.Pending },
            },
          });
          usePostAccessRequestDecisionMock.mockReturnValueOnce({
            mutate: jest.fn(),
            isPending: false,
            isError: false,
            error: null,
            isSuccess: false,
          });
          useCanMakeDecisionMock.mockReturnValueOnce({
            isLoading: false,
            isError: false,
            error: null,
            data: { allowed: true },
          });
          useGlobalStateMock.mockReturnValueOnce('organizationId');
        }

        const { user } = render(<AccessRequestModalForm />);
        await user.click(
          screen.getByRole('radio', {
            name: /deny/i,
          }),
        );
        expect(
          screen.getByRole('button', {
            name: /save/i,
          }),
        ).toHaveAttribute('disabled');

        // Act
        await user.type(
          screen.getByRole('textbox', {
            name: /access request justification/i,
          }),
          justificationValue,
        );

        // Assert
        expect(
          screen.getByRole('button', {
            name: /save/i,
          }),
        ).toHaveAttribute('disabled');
      },
    );

    it('submits', async () => {
      // Arrange
      const onCloseMock = jest.fn();
      const mutateMock = jest.fn();
      for (let i = 0; i <= REFRESH_TIMES; i += 1) {
        useGlobalStateMock.mockReturnValueOnce({
          accessRequest: {
            id: 'accessRequestId',
            status: { state: AccessRequestStatusState.Pending },
          },
          onClose: onCloseMock,
        });
        usePostAccessRequestDecisionMock.mockReturnValueOnce({
          mutate: mutateMock,
          isPending: false,
          isError: false,
          error: null,
          isSuccess: false,
        });
        useCanMakeDecisionMock.mockReturnValueOnce({
          isLoading: false,
          isError: false,
          error: null,
          data: { allowed: true },
        });
        useGlobalStateMock.mockReturnValueOnce('organizationId');
      }

      const { user } = render(<AccessRequestModalForm />);
      await user.click(
        screen.getByRole('radio', {
          name: /approve/i,
        }),
      );

      // Act
      await user.click(
        within(screen.getByRole('contentinfo')).getByRole('button', {
          name: /save/i,
        }),
      );

      // Assert
      expect(mutateMock).toHaveBeenCalledTimes(1);
      expect(mutateMock).toHaveBeenCalledWith(
        {
          decision: 'Approved',
          justification: undefined,
        },
        expect.objectContaining({
          onSuccess: expect.any(Function), // Use expect.any(Function) to match any function
        }),
      );
    });

    it('closes after submit', async () => {
      // Arrange
      const onCloseMock = jest.fn();
      const mutateMock = jest.fn();
      for (let i = 0; i <= REFRESH_TIMES; i += 1) {
        useGlobalStateMock.mockReturnValueOnce({
          accessRequest: {
            id: 'accessRequestId',
            status: { state: AccessRequestStatusState.Pending },
          },
          onClose: onCloseMock,
        });
        usePostAccessRequestDecisionMock.mockReturnValueOnce({
          mutate: mutateMock,
          isPending: false,
          isError: false,
          error: null,
          isSuccess: false,
        });
        useCanMakeDecisionMock.mockReturnValueOnce({
          isLoading: false,
          isError: false,
          error: null,
          data: { allowed: true },
        });
        useGlobalStateMock.mockReturnValueOnce('organizationId');
      }

      const { user, rerender } = render(<AccessRequestModalForm />);
      await user.click(
        screen.getByRole('radio', {
          name: /approve/i,
        }),
      );
      await user.click(
        screen.getByRole('button', {
          name: /save/i,
        }),
      );

      // Act
      useGlobalStateMock.mockReturnValueOnce({
        accessRequest: {
          id: 'accessRequestId',
          status: { state: AccessRequestStatusState.Pending },
        },
        onClose: onCloseMock,
      });
      usePostAccessRequestDecisionMock.mockReturnValueOnce({
        mutate: mutateMock,
        isPending: false,
        isError: false,
        error: null,
        isSuccess: true,
      });
      useCanMakeDecisionMock.mockReturnValueOnce({
        isLoading: false,
        isError: false,
        error: null,
        data: { allowed: true },
      });
      useGlobalStateMock.mockReturnValueOnce('organizationId');

      rerender(<AccessRequestModalForm />);

      // Assert
      expect(onCloseMock).toHaveBeenCalledTimes(1);
      expect(dispatchMock).toHaveBeenCalledTimes(1);
      expect(mutateMock).toHaveBeenCalledTimes(1);
      expect(dispatchMock).toHaveBeenCalledWith('closeModalValue');
    });

    it('properly unmounts', async () => {
      // Arrange
      const mutateMock = jest.fn();
      for (let i = 0; i <= REFRESH_TIMES; i += 1) {
        useGlobalStateMock.mockReturnValueOnce({
          accessRequest: {
            id: 'accessRequestId',
            status: { state: AccessRequestStatusState.Pending },
          },
        });
        usePostAccessRequestDecisionMock.mockReturnValueOnce({
          mutate: mutateMock,
          isPending: false,
          isError: false,
          error: null,
          isSuccess: false,
        });
        useCanMakeDecisionMock.mockReturnValueOnce({
          isLoading: false,
          isError: false,
          error: null,
          data: { allowed: true },
        });
        useGlobalStateMock.mockReturnValueOnce('organizationId');
      }

      const { unmount } = render(<AccessRequestModalForm />);

      // Act
      unmount();

      // Assert
      expect(
        screen.queryByRole('heading', {
          name: /access request details/i,
        }),
      ).toBeNull();
    });
  });

  describe('error cases', () => {
    it('post access request decision error', () => {
      // Arrange
      for (let i = 0; i <= REFRESH_TIMES; i += 1) {
        useGlobalStateMock.mockReturnValueOnce({ accessRequest: { id: 'accessRequestId' } });
        usePostAccessRequestDecisionMock.mockReturnValueOnce({
          mutate: jest.fn(),
          isPending: false,
          isError: true,
          error: {
            error: {
              errorMessage: 'error',
              errorDetails: 'error',
            },
          },
          isSuccess: false,
        });
        useCanMakeDecisionMock.mockReturnValueOnce({
          isLoading: false,
          isError: false,
          error: null,
          data: { allowed: true },
        });
        useGlobalStateMock.mockReturnValueOnce('organizationId');
      }

      // Act
      render(<AccessRequestModalForm />);

      // Assert
      expect(screen.getByText(/error-box/i)).toBeInTheDocument();
    });

    it('can make decision error', () => {
      // Arrange
      for (let i = 0; i <= REFRESH_TIMES; i += 1) {
        useGlobalStateMock.mockReturnValueOnce({ accessRequest: { id: 'accessRequestId' } });
        usePostAccessRequestDecisionMock.mockReturnValueOnce({
          mutate: jest.fn(),
          isPending: false,
          isError: false,
          error: null,
          isSuccess: false,
        });
        useCanMakeDecisionMock.mockReturnValueOnce({
          isLoading: false,
          isError: true,
          error: {
            error: {
              errorMessage: 'error',
              errorDetails: 'error',
            },
          },
          data: { allowed: true },
        });
        useGlobalStateMock.mockReturnValueOnce('organizationId');
      }

      // Act
      render(<AccessRequestModalForm />);

      // Assert
      expect(screen.getByText(/error-box/i)).toBeInTheDocument();
    });
  });

  describe('canMakeDecision is triggered', () => {
    it('is triggered', () => {
      // Arrange
      for (let i = 0; i <= REFRESH_TIMES; i += 1) {
        useGlobalStateMock.mockReturnValueOnce({
          accessRequest: {
            id: 'accessRequestId',
            subscription_id: 'subscriptionId',
            status: { state: AccessRequestStatusState.Pending },
          },
        });
        usePostAccessRequestDecisionMock.mockReturnValueOnce({
          mutate: jest.fn(),
          isPending: false,
          isError: false,
          error: null,
          isSuccess: false,
        });
        useCanMakeDecisionMock.mockReturnValueOnce({
          isLoading: false,
          isError: false,
          error: null,
          data: undefined,
        });
        useGlobalStateMock.mockReturnValueOnce('organizationId');
      }

      // Act
      render(<AccessRequestModalForm />);

      // Assert
      expect(useCanMakeDecisionMock).toHaveBeenCalledWith('subscriptionId', 'organizationId', true);
    });

    it.each([
      [AccessRequestStatusState.Approved, 'subscriptionId', 'organizationId'],
      [AccessRequestStatusState.Pending, undefined, 'organizationId'],
      [AccessRequestStatusState.Pending, 'subscriptionId', undefined],
    ])(
      'is not triggered. Status %p, Subscription ID %p, OrganizationID %p',
      (
        state: AccessRequestStatusState | undefined,
        subscriptionId: string | undefined,
        organizationId: string | undefined,
      ) => {
        // Arrange
        for (let i = 0; i <= REFRESH_TIMES; i += 1) {
          useGlobalStateMock.mockReturnValueOnce({
            accessRequest: {
              id: 'accessRequestId',
              subscription_id: subscriptionId,
              status: { state },
            },
          });
          usePostAccessRequestDecisionMock.mockReturnValueOnce({
            mutate: jest.fn(),
            isPending: false,
            isError: false,
            error: null,
            isSuccess: false,
          });
          useCanMakeDecisionMock.mockReturnValueOnce({
            isLoading: false,
            isError: false,
            error: null,
            data: undefined,
          });
          useGlobalStateMock.mockReturnValueOnce(organizationId);
        }

        // Act
        render(<AccessRequestModalForm />);

        // Assert
        expect(useCanMakeDecisionMock).toHaveBeenCalledTimes(2);
      },
    );
  });
});
