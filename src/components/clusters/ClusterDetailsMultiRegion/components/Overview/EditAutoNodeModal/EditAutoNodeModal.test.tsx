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

      expect(screen.getByRole('heading', { name: 'Edit AutoNode settings' })).toBeInTheDocument();
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

    it('calls editCluster with disabled mode when saving with toggle off', async () => {
      const { user } = render(<EditAutoNodeModal cluster={enabledCluster} onClose={onClose} />);

      await user.click(screen.getByLabelText('Enable Autonode'));
      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(mockEditCluster).toHaveBeenCalledWith(
        expect.objectContaining({
          cluster: expect.objectContaining({
            auto_node: { mode: 'disabled' },
          }),
        }),
        expect.any(Object),
      );
    });

    it('enables Save button when Autonode is disabled (toggle off)', () => {
      render(<EditAutoNodeModal cluster={defaultCluster} onClose={onClose} />);

      expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
    });
  });
});
