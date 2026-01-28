import React from 'react';

import { checkAccessibility, render, screen, userEvent } from '~/testUtils';

import ArchivedClusterListTable from '../ArchivedClusterListTable';

import { clusters, openModal, setSorting } from './ArchivedClusterListTable.fixtures';

describe('<ArchivedClusterListTable />', () => {
  describe('ArchivedClusterListTable', () => {
    it('is accessible', async () => {
      const { container } = render(
        <ArchivedClusterListTable
          clusters={clusters}
          openModal={openModal}
          setSort={setSorting}
          // @ts-ignore
          activeSortDirection="asc"
          activeSortIndex="display_name"
          isPending={false}
        />,
      );
      expect(await screen.findByRole('grid')).toBeInTheDocument();
      await checkAccessibility(container);
    });
    it('toggle sorting', async () => {
      render(
        <ArchivedClusterListTable
          clusters={clusters}
          openModal={openModal}
          setSort={setSorting}
          // @ts-ignore
          activeSortDirection="asc"
          activeSortIndex="display_name"
          isPending={false}
        />,
      );

      const nameBtn = screen.getByText('Name');

      await userEvent.click(nameBtn);

      expect(setSorting).toHaveBeenCalled();
    });

    it('no clusters found', async () => {
      render(
        <ArchivedClusterListTable
          clusters={[]}
          openModal={openModal}
          setSort={setSorting}
          // @ts-ignore
          activeSortDirection="asc"
          activeSortIndex="display_name"
          isPending={false}
        />,
      );

      expect(screen.getByText('No archived clusters found.')).toBeInTheDocument();
    });

    it('unarchive modal', async () => {
      render(
        <ArchivedClusterListTable
          clusters={clusters}
          openModal={openModal}
          setSort={setSorting}
          // @ts-ignore
          activeSortDirection="asc"
          activeSortIndex="display_name"
          isPending={false}
        />,
      );
      const unarchiveBtn = screen.getByText('Unarchive');

      await userEvent.click(unarchiveBtn);

      expect(openModal).toHaveBeenCalled();
    });
  });
});
