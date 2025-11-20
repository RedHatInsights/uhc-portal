import React from 'react';

import { ISortBy } from '@patternfly/react-table';

import { checkAccessibility, render, screen } from '~/testUtils';
import { AccessRequest, AccessRequestStatusState } from '~/types/access_transparency.v1';

import AccessRequestTable from '../AccessRequestTable';

jest.mock(
  '../AccessRequestStateIcon',
  () =>
    ({ accessRequest }: { accessRequest: AccessRequest }) => (
      <div data-testid="access-request-state-icon">{accessRequest.status?.state}</div>
    ),
);

describe('AccessRequestTable', () => {
  describe('is accessible', () => {
    it('isPending true', async () => {
      const { container } = render(
        <AccessRequestTable
          isPending
          sortBy={{} as ISortBy}
          setSorting={jest.fn()}
          openDetailsAction={jest.fn()}
        />,
      );

      await checkAccessibility(container);
    });
  });
  describe('it renders correctly', () => {
    it('isPending true', async () => {
      // Act
      const { container } = render(
        <AccessRequestTable
          isPending
          sortBy={{} as ISortBy}
          setSorting={jest.fn()}
          openDetailsAction={jest.fn()}
        />,
      );

      // Assert
      expect(container.querySelectorAll('tbody tr')).toHaveLength(10);
      expect(container.querySelectorAll('.pf-v6-c-skeleton').length).toBe(10);
    });

    describe('isPending false', () => {
      it('Undefined access request', async () => {
        // Act
        const { container } = render(
          <AccessRequestTable
            sortBy={{} as ISortBy}
            setSorting={jest.fn()}
            openDetailsAction={jest.fn()}
            isPending={false}
            accessRequestItems={[]}
          />,
        );

        // Assert
        expect(container.querySelectorAll('tbody tr')).toHaveLength(0);
        expect(container.querySelectorAll('.pf-v6-c-skeleton').length).toBe(0);
        expect(
          screen.getByRole('heading', { name: /no access request entries found/i }),
        ).toBeInTheDocument();
      });

      it('empty access request', async () => {
        // Act
        const { container } = render(
          <AccessRequestTable
            sortBy={{} as ISortBy}
            setSorting={jest.fn()}
            openDetailsAction={jest.fn()}
            accessRequestItems={[]}
          />,
        );

        // Assert
        expect(container.querySelectorAll('tbody tr')).toHaveLength(0);
        expect(container.querySelectorAll('.pf-v6-c-skeleton').length).toBe(0);
        expect(
          screen.getByRole('heading', { name: /no access request entries found/i }),
        ).toBeInTheDocument();
      });

      it('with access request', async () => {
        // Act
        const { container } = render(
          <AccessRequestTable
            sortBy={{} as ISortBy}
            setSorting={jest.fn()}
            openDetailsAction={jest.fn()}
            accessRequestItems={[
              {
                status: { state: AccessRequestStatusState.Approved },
                created_at: 'created_at1',
                id: 'id1',
                support_case_id: 'support_case_id1',
              },
              {
                status: { state: AccessRequestStatusState.Denied },
                created_at: 'created_at2',
                id: 'id2',
              },
            ]}
          />,
        );

        // Assert
        expect(container.querySelectorAll('tbody tr')).toHaveLength(2);
        expect(container.querySelectorAll('.pf-v6-c-skeleton').length).toBe(0);
        expect(screen.getByText(/approved/i)).toBeInTheDocument();
        expect(screen.getByText(/denied/i)).toBeInTheDocument();
      });
    });
  });
});
