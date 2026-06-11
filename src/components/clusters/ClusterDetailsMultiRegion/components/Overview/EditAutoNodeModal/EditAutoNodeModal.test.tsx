import * as React from 'react';

import { render, screen } from '~/testUtils';
import { ClusterFromSubscription } from '~/types/types';

import EditAutoNodeModal from './EditAutoNodeModal';

const mockEditCluster = jest.fn();
jest.mock('~/queries/ClusterDetailsQueries/useEditCluster', () => ({
  useEditCluster: () => ({
    mutate: mockEditCluster,
    isPending: false,
    isError: false,
    error: null,
  }),
}));

const defaultCluster = {
  id: 'test-cluster-id',
  aws: {
    auto_node: {
      role_arn: '',
    },
  },
  auto_node: {
    mode: 'disabled',
  },
} as unknown as ClusterFromSubscription;

const enabledCluster = {
  ...defaultCluster,
  auto_node: { mode: 'enabled' },
  aws: {
    auto_node: {
      role_arn: 'arn:aws:iam::123456789012:role/ManagedOpenShift-Autonode-Role',
    },
  },
} as unknown as ClusterFromSubscription;

const onClose = jest.fn();

describe('<EditAutoNodeModal />', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('renders', () => {
    it('displays the modal title and description', () => {
      render(<EditAutoNodeModal cluster={defaultCluster} onClose={onClose} />);

      expect(screen.getByRole('heading', { name: 'Edit Autonode settings' })).toBeInTheDocument();
      expect(screen.getByText(/Configure Autonode for this cluster/)).toBeInTheDocument();
    });

    it('displays the Enable Autonode switch', () => {
      render(<EditAutoNodeModal cluster={defaultCluster} onClose={onClose} />);

      expect(screen.getByLabelText('Enable Autonode')).toBeInTheDocument();
    });

    it('displays Save and Cancel buttons', () => {
      render(<EditAutoNodeModal cluster={defaultCluster} onClose={onClose} />);

      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    it('initializes switch to off when auto_node mode is disabled', () => {
      render(<EditAutoNodeModal cluster={defaultCluster} onClose={onClose} />);

      expect(screen.getByLabelText('Enable Autonode')).not.toBeChecked();
    });

    it('initializes switch to on when auto_node mode is enabled', () => {
      render(<EditAutoNodeModal cluster={enabledCluster} onClose={onClose} />);

      expect(screen.getByLabelText('Enable Autonode')).toBeChecked();
    });

    it('pre-fills the ARN field when cluster has an existing role_arn', () => {
      render(<EditAutoNodeModal cluster={enabledCluster} onClose={onClose} />);

      expect(
        screen.getByDisplayValue('arn:aws:iam::123456789012:role/ManagedOpenShift-Autonode-Role'),
      ).toBeInTheDocument();
    });

    it('shows warning alert when enabling AutoNode for the first time', async () => {
      const { user } = render(<EditAutoNodeModal cluster={defaultCluster} onClose={onClose} />);

      await user.click(screen.getByLabelText('Enable Autonode'));

      expect(screen.getByText('Enabling Autonode cannot be undone')).toBeInTheDocument();
      expect(screen.getByText(/Ensure you have created the required IAM role/)).toBeInTheDocument();
    });

    it('does not show warning alert when Autonode is already enabled', () => {
      render(<EditAutoNodeModal cluster={enabledCluster} onClose={onClose} />);

      expect(screen.queryByText('Enabling Autonode cannot be undone')).not.toBeInTheDocument();
    });

    it('does not call editCluster when cluster.id is missing', async () => {
      const clusterWithoutId = {
        ...defaultCluster,
        id: undefined,
        auto_node: { mode: 'disabled' },
      } as unknown as ClusterFromSubscription;
      const { user } = render(<EditAutoNodeModal cluster={clusterWithoutId} onClose={onClose} />);

      await user.click(screen.getByLabelText('Enable Autonode'));
      await user.type(
        screen.getByPlaceholderText(
          'arn:aws:iam::123456789012:role/ManagedOpenShift-Autonode-Role',
        ),
        'arn:aws:iam::123456789012:role/TestRole',
      );
      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(mockEditCluster).not.toHaveBeenCalled();
    });

    it('clears ARN validation error when input is cleared', async () => {
      const { user } = render(<EditAutoNodeModal cluster={defaultCluster} onClose={onClose} />);

      await user.click(screen.getByLabelText('Enable Autonode'));
      const input = screen.getByPlaceholderText(
        'arn:aws:iam::123456789012:role/ManagedOpenShift-Autonode-Role',
      );

      await user.type(input, 'invalid-arn');
      expect(screen.getByText(/ARN value should be in the format/)).toBeInTheDocument();

      await user.clear(input);
      expect(screen.queryByText(/ARN value should be in the format/)).not.toBeInTheDocument();
      expect(
        screen.getByText('The ARN of the IAM Role with the required Autonode policy.'),
      ).toBeInTheDocument();
    });

    it('disables the switch when AutoNode is already enabled', () => {
      render(<EditAutoNodeModal cluster={enabledCluster} onClose={onClose} />);

      expect(screen.getByLabelText('Enable Autonode')).toBeDisabled();
    });

    it('renders the popover hint for ARN field', () => {
      render(<EditAutoNodeModal cluster={defaultCluster} onClose={onClose} />);

      expect(
        screen.getByRole('button', { name: 'Autonode IAM role ARN information' }),
      ).toBeInTheDocument();
    });

    it('shows ARN whitespace validation error', async () => {
      const { user } = render(<EditAutoNodeModal cluster={defaultCluster} onClose={onClose} />);

      await user.click(screen.getByLabelText('Enable Autonode'));
      await user.type(
        screen.getByPlaceholderText(
          'arn:aws:iam::123456789012:role/ManagedOpenShift-Autonode-Role',
        ),
        'arn:aws:iam::123456789012:role/My Role',
      );

      expect(screen.getByText(/must not contain whitespaces/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    });
  });

  describe('interactions', () => {
    it('disables Save button when Autonode is enabled but ARN is empty', async () => {
      const { user } = render(<EditAutoNodeModal cluster={defaultCluster} onClose={onClose} />);

      await user.click(screen.getByLabelText('Enable Autonode'));

      expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    });

    it('enables Save button when Autonode is enabled and ARN is valid', async () => {
      const { user } = render(<EditAutoNodeModal cluster={defaultCluster} onClose={onClose} />);

      await user.click(screen.getByLabelText('Enable Autonode'));
      await user.type(
        screen.getByPlaceholderText(
          'arn:aws:iam::123456789012:role/ManagedOpenShift-Autonode-Role',
        ),
        'arn:aws:iam::123456789012:role/TestRole',
      );

      expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
    });

    it('disables the ARN text input when Autonode is disabled', () => {
      render(<EditAutoNodeModal cluster={defaultCluster} onClose={onClose} />);

      expect(
        screen.getByPlaceholderText(
          'arn:aws:iam::123456789012:role/ManagedOpenShift-Autonode-Role',
        ),
      ).toBeDisabled();
    });

    it('enables the ARN text input when Autonode is enabled', async () => {
      const { user } = render(<EditAutoNodeModal cluster={defaultCluster} onClose={onClose} />);

      await user.click(screen.getByLabelText('Enable Autonode'));

      expect(
        screen.getByPlaceholderText(
          'arn:aws:iam::123456789012:role/ManagedOpenShift-Autonode-Role',
        ),
      ).toBeEnabled();
    });

    it('shows validation error for invalid ARN format', async () => {
      const { user } = render(<EditAutoNodeModal cluster={defaultCluster} onClose={onClose} />);

      await user.click(screen.getByLabelText('Enable Autonode'));
      await user.type(
        screen.getByPlaceholderText(
          'arn:aws:iam::123456789012:role/ManagedOpenShift-Autonode-Role',
        ),
        'invalid-arn',
      );

      expect(screen.getByText(/ARN value should be in the format/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    });

    it('shows default helper text when ARN is valid', async () => {
      const { user } = render(<EditAutoNodeModal cluster={defaultCluster} onClose={onClose} />);

      await user.click(screen.getByLabelText('Enable Autonode'));
      await user.type(
        screen.getByPlaceholderText(
          'arn:aws:iam::123456789012:role/ManagedOpenShift-Autonode-Role',
        ),
        'arn:aws:iam::123456789012:role/TestRole',
      );

      expect(
        screen.getByText('The ARN of the IAM Role with the required Autonode policy.'),
      ).toBeInTheDocument();
    });

    it('calls onClose when Cancel button is clicked', async () => {
      const { user } = render(<EditAutoNodeModal cluster={defaultCluster} onClose={onClose} />);

      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls editCluster with enabled mode and ARN when saving', async () => {
      const { user } = render(<EditAutoNodeModal cluster={defaultCluster} onClose={onClose} />);

      await user.click(screen.getByLabelText('Enable Autonode'));
      await user.type(
        screen.getByPlaceholderText(
          'arn:aws:iam::123456789012:role/ManagedOpenShift-Autonode-Role',
        ),
        'arn:aws:iam::123456789012:role/TestRole',
      );
      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(mockEditCluster).toHaveBeenCalledWith(
        {
          clusterID: 'test-cluster-id',
          cluster: {
            auto_node: { mode: 'enabled' },
            aws: { auto_node: { role_arn: 'arn:aws:iam::123456789012:role/TestRole' } },
          },
        },
        expect.objectContaining({ onSuccess: expect.any(Function) }),
      );
    });

    it('keeps enabled mode when cluster is already enabled', async () => {
      const { user } = render(<EditAutoNodeModal cluster={enabledCluster} onClose={onClose} />);

      const input = screen.getByDisplayValue(
        'arn:aws:iam::123456789012:role/ManagedOpenShift-Autonode-Role',
      );
      await user.clear(input);
      await user.type(input, 'arn:aws:iam::999999999999:role/NewRole');
      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(mockEditCluster).toHaveBeenCalledWith(
        expect.objectContaining({
          cluster: expect.objectContaining({
            auto_node: { mode: 'enabled' },
          }),
        }),
        expect.any(Object),
      );
    });

    it('disables Save button when no changes have been made', () => {
      render(<EditAutoNodeModal cluster={defaultCluster} onClose={onClose} />);

      expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    });

    it('disables Save button when no changes have been made on an enabled cluster', () => {
      render(<EditAutoNodeModal cluster={enabledCluster} onClose={onClose} />);

      expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    });

    it('enables Save button when ARN is changed from its original value', async () => {
      const { user } = render(<EditAutoNodeModal cluster={enabledCluster} onClose={onClose} />);

      const input = screen.getByDisplayValue(
        'arn:aws:iam::123456789012:role/ManagedOpenShift-Autonode-Role',
      );
      await user.clear(input);
      await user.type(input, 'arn:aws:iam::123456789012:role/UpdatedRole');

      expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
    });

    it('disables Save button when ARN is reverted to its original value', async () => {
      const { user } = render(<EditAutoNodeModal cluster={enabledCluster} onClose={onClose} />);

      const input = screen.getByDisplayValue(
        'arn:aws:iam::123456789012:role/ManagedOpenShift-Autonode-Role',
      );
      await user.clear(input);
      await user.type(input, 'arn:aws:iam::123456789012:role/UpdatedRole');
      expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();

      await user.clear(input);
      await user.type(input, 'arn:aws:iam::123456789012:role/ManagedOpenShift-Autonode-Role');
      expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    });

    it('enables Save button when Autonode toggle is changed', async () => {
      const { user } = render(<EditAutoNodeModal cluster={defaultCluster} onClose={onClose} />);

      await user.click(screen.getByLabelText('Enable Autonode'));

      // Still disabled because ARN is empty (isValid is false)
      expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();

      await user.type(
        screen.getByPlaceholderText(
          'arn:aws:iam::123456789012:role/ManagedOpenShift-Autonode-Role',
        ),
        'arn:aws:iam::123456789012:role/TestRole',
      );

      expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
    });

    it('disables Save button when Autonode toggle is reverted back', async () => {
      const { user } = render(<EditAutoNodeModal cluster={defaultCluster} onClose={onClose} />);

      await user.click(screen.getByLabelText('Enable Autonode'));
      await user.click(screen.getByLabelText('Enable Autonode'));

      expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    });

    it('disables Save button when Autonode is enabled, ARN is typed, then Autonode is disabled again', async () => {
      const { user } = render(<EditAutoNodeModal cluster={defaultCluster} onClose={onClose} />);
      await user.click(screen.getByLabelText('Enable Autonode'));
      await user.type(
        screen.getByPlaceholderText(
          'arn:aws:iam::123456789012:role/ManagedOpenShift-Autonode-Role',
        ),
        'test',
      );
      await user.click(screen.getByLabelText('Enable Autonode'));
      expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    });

    it('resets ARN field to initial value when Autonode is toggled off', async () => {
      const { user } = render(<EditAutoNodeModal cluster={defaultCluster} onClose={onClose} />);

      await user.click(screen.getByLabelText('Enable Autonode'));
      const input = screen.getByPlaceholderText(
        'arn:aws:iam::123456789012:role/ManagedOpenShift-Autonode-Role',
      );
      await user.type(input, 'arn:aws:iam::123456789012:role/SomeRole');
      await user.click(screen.getByLabelText('Enable Autonode'));

      expect(input).toHaveValue('');
    });

    it('clears ARN validation error when Autonode is toggled off', async () => {
      const { user } = render(<EditAutoNodeModal cluster={defaultCluster} onClose={onClose} />);

      await user.click(screen.getByLabelText('Enable Autonode'));
      await user.type(
        screen.getByPlaceholderText(
          'arn:aws:iam::123456789012:role/ManagedOpenShift-Autonode-Role',
        ),
        'invalid-arn',
      );
      expect(screen.getByText(/ARN value should be in the format/)).toBeInTheDocument();

      await user.click(screen.getByLabelText('Enable Autonode'));

      expect(screen.queryByText(/ARN value should be in the format/)).not.toBeInTheDocument();
    });
  });
});
