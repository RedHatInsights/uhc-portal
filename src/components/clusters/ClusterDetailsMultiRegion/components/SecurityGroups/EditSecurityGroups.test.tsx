import * as React from 'react';

import { render, screen, UserEvent, within } from '~/testUtils';

import EditSecurityGroups from './EditSecurityGroups';

const persistedSecurityGroup = {
  id: 'sg-xyz',
  name: 'hello xyz',
};

const clusterVpc = {
  id: 'vpc-id',
  aws_security_groups: [
    {
      id: 'sg-abc',
      name: 'abc is my name',
    },
    {
      id: 'sg-group-without-a-name',
      name: '',
    },
    persistedSecurityGroup,
  ],
};

const openPFSecurityGroupsSelect = async (user: UserEvent) => {
  await user.click(screen.getByRole('button', { name: 'Options menu' }));
};

const renderComponent = ({
  isReadOnly,
  selectedGroupIds,
}: {
  isReadOnly: boolean;
  selectedGroupIds: string[];
}) =>
  render(
    <EditSecurityGroups
      selectedGroupIds={selectedGroupIds}
      selectedVPC={clusterVpc}
      onChange={() => null}
      isReadOnly={isReadOnly}
      isHypershift={false}
    />,
  );

describe('<EditSecurityGroups />', () => {
  describe('In edit mode', () => {
    it('shows a list of read-only chips', () => {
      renderComponent({
        isReadOnly: true,
        selectedGroupIds: [persistedSecurityGroup.id],
      });

      const securityGroupItems = screen.getAllByRole('listitem');
      expect(within(securityGroupItems[0]).getByText('hello xyz')).toBeInTheDocument();
    });

    it('are shown as read-only when in editing mode', () => {
      renderComponent({
        isReadOnly: true,
        selectedGroupIds: [persistedSecurityGroup.id],
      });

      const securityGroupItems = screen.getAllByRole('listitem');
      expect(within(securityGroupItems[0]).getByText('hello xyz')).toBeInTheDocument();
    });

    it('does not show the Select component', () => {
      renderComponent({
        isReadOnly: true,
        selectedGroupIds: [],
      });

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  describe('In creation mode', () => {
    it('shows a list of chips with a close button', () => {
      renderComponent({
        isReadOnly: false,
        selectedGroupIds: [persistedSecurityGroup.id],
      });

      const securityGroupChips = screen.getAllByRole('listitem');
      expect(
        within(securityGroupChips[0]).getByRole('button', { name: /Close hello xyz/ }),
      ).toBeInTheDocument();
    });

    it('Has a Select showing all security groups', async () => {
      const { user } = renderComponent({
        isReadOnly: false,
        selectedGroupIds: [],
      });

      await openPFSecurityGroupsSelect(user);

      expect(within(screen.getByRole('menu')).getByText('sg-abc')).toBeInTheDocument();
      expect(within(screen.getByRole('menu')).getByText('sg-xyz')).toBeInTheDocument();
    });

    it('Shows the name as empty and the id as the description if the group has no name', async () => {
      const { user } = renderComponent({
        isReadOnly: false,
        selectedGroupIds: [],
      });

      await openPFSecurityGroupsSelect(user);

      expect(within(screen.getByRole('menu')).getByText('--')).toBeInTheDocument();
      expect(
        within(screen.getByRole('menu')).getByText('sg-group-without-a-name'),
      ).toBeInTheDocument();
    });

    it('Has a SelectOption with a checkbox for each security group with the correct selection status', async () => {
      const { user } = renderComponent({
        isReadOnly: false,
        selectedGroupIds: [persistedSecurityGroup.id],
      });

      await openPFSecurityGroupsSelect(user);

      expect(
        within(screen.getByRole('menu')).getByRole('checkbox', { name: /sg-abc/ }),
      ).not.toBeChecked();
      expect(
        within(screen.getByRole('menu')).getByRole('checkbox', { name: /sg-xyz/ }),
      ).toBeChecked();
    });

    it('should not clear the selected security groups if they belong to the current VPC', () => {
      const onChangeSpy = jest.fn();
      render(
        <EditSecurityGroups
          onChange={onChangeSpy}
          selectedGroupIds={['sg-abc']}
          selectedVPC={clusterVpc}
          isReadOnly={false}
          isHypershift={false}
        />,
      );
      expect(onChangeSpy).not.toHaveBeenCalled();
    });
  });
});
