import React from 'react';

import { HelperText, HelperTextItem, TreeViewDataItem } from '@patternfly/react-core';

import { checkAccessibility, render, screen } from '~/testUtils';

import { TreeViewData, TreeViewSelect, TreeViewSelectMenuItem } from './TreeViewSelect';

const machineTypeMap: TreeViewData[] = [
  {
    category: 'Compute optimized',
    name: 'Compute optimized',
    children: [
      {
        category: 'Compute optimized',
        id: 'c5a.xlarge',
        descriptionLabel: '4 vCPU 8 GiB RAM',
        nameLabel: 'c5a.xlarge',
        name: <TreeViewSelectMenuItem name="c5a.xlarge" description="4 vCPU 8 GiB RAM" />,
      },
      {
        category: 'Compute optimized',
        id: 'm24.xlarge',
        descriptionLabel: '4 vCPU 8 GiB RAM',
        nameLabel: 'm24.xlarge',
        name: <TreeViewSelectMenuItem name="m24.xlarge" description="4 vCPU 8 GiB RAM" />,
      },
    ],
  },
  {
    category: 'Storage optimized',
    name: 'Storage optimized',
    children: [
      {
        category: 'Storage optimized',
        id: 'nk9.4xlarge',
        descriptionLabel: '4 vCPU 8 GiB RAM',
        nameLabel: 'nk9.4xlarge',
        name: (
          <TreeViewSelectMenuItem
            name="nk9.4xlarge"
            description="4 vCPU 8 GiB RAM"
            popoverText="This option is from part of a filtered set of machine types"
          />
        ),
      },
    ],
  },
];

const machineTypeMapFiltered: TreeViewData[] = [
  {
    category: 'Compute optimized',
    name: 'Compute optimized',
    children: [
      {
        category: 'Compute optimized',
        id: 'c5a.xlarge',
        name: <TreeViewSelectMenuItem name="c5a.xlarge" description="4 vCPU 8 GiB RAM" />,
      },
      {
        category: 'Compute optimized',
        id: 'm24.metal',
        name: <TreeViewSelectMenuItem name="m24.metal" description="4 vCPU 8 GiB RAM" />,
      },
      {
        category: 'Compute optimized',
        id: 'u-6tb1.112',
        name: <TreeViewSelectMenuItem name="u-6tb1.112" description="448 vCPU 6 TiB RAM" />,
      },
    ],
  },
];

const TreeViewSelectTestWrapper = (props: { allExpanded?: boolean }) => {
  const { allExpanded } = props;
  const [selected, setSelected] = React.useState<TreeViewDataItem>();
  const [filteredByRegion, setFilteredByRegion] = React.useState(true);
  const [activeMachineTypes, setActiveMachineTypes] =
    React.useState<TreeViewData[]>(machineTypeMapFiltered);

  React.useEffect(() => {
    if (filteredByRegion) {
      setActiveMachineTypes(machineTypeMapFiltered);
    } else {
      setActiveMachineTypes(machineTypeMap);
    }
  }, [filteredByRegion]);

  const selectionText = selected?.id!;

  return (
    <TreeViewSelect
      data-testid="tree-view-select"
      selected={selected}
      setSelected={(_, selection) => setSelected(selection)}
      selectionPlaceholderText={selectionText}
      treeViewSelectionMap={activeMachineTypes}
      treeViewSwitchActive={filteredByRegion}
      setTreeViewSwitchActive={setFilteredByRegion}
      includeFilterSwitch
      helperText={
        !filteredByRegion && (
          <HelperText>
            <HelperTextItem variant="warning">Selection is from a filtered set</HelperTextItem>
          </HelperText>
        )
      }
      placeholder="Select instance type"
      searchPlaceholder="Find an instance size"
      switchLabelOnText="Show compatible instances only"
      ariaLabel="TreeViewSelect"
      allExpanded={allExpanded}
    />
  );
};

describe('TreeViewSelect ', () => {
  it('renders tree view', async () => {
    const { container, user } = render(<TreeViewSelectTestWrapper />);

    expect(screen.getByText('Select instance type')).toBeInTheDocument();
    await user.click(screen.getByLabelText('TreeViewSelect toggle'));
    expect(screen.getByRole('tree').parentElement).toHaveClass('pf-v6-c-tree-view');
    await checkAccessibility(container);
  });

  it('search can filter for machine id', async () => {
    const { container, user } = render(<TreeViewSelectTestWrapper />);

    expect(screen.getByText('Select instance type')).toBeInTheDocument();
    await user.click(screen.getByLabelText('TreeViewSelect toggle'));
    expect(screen.getByRole('tree').parentElement).toHaveClass('pf-v6-c-tree-view');

    const input = await screen.findByLabelText('TreeViewSelect search field');
    await user.type(input, machineTypeMapFiltered[0].children![0].id!);
    expect(screen.getByText(machineTypeMapFiltered[0].children![0].id!)).toBeInTheDocument();
    await checkAccessibility(container);
  });

  it('search can filter for category', async () => {
    const { container, user } = render(<TreeViewSelectTestWrapper />);

    expect(screen.getByText('Select instance type')).toBeInTheDocument();
    await user.click(screen.getByLabelText('TreeViewSelect toggle'));
    expect(screen.getByRole('tree').parentElement).toHaveClass('pf-v6-c-tree-view');

    await user.click(screen.getByTestId('display-switch'));

    const input = await screen.findByLabelText('TreeViewSelect search field');
    await user.type(input, machineTypeMap[1].category!);
    expect(screen.getByText(machineTypeMap[1].category!)).toBeInTheDocument();
    await checkAccessibility(container);
  });

  it('search can filter includes non-perfect matches within one character of match', async () => {
    const { container, user } = render(<TreeViewSelectTestWrapper />);

    expect(screen.getByText('Select instance type')).toBeInTheDocument();
    await user.click(screen.getByLabelText('TreeViewSelect toggle'));
    expect(screen.getByRole('tree').parentElement).toHaveClass('pf-v6-c-tree-view');

    const input = await screen.findByLabelText('TreeViewSelect search field');
    await user.type(input, 'c5a.Olarge');
    expect(screen.getByText(machineTypeMapFiltered[0].children![0].id!)).toBeInTheDocument();
    await checkAccessibility(container);
  });

  it('search can filter does not include distant non-perfect matches', async () => {
    const { container, user } = render(<TreeViewSelectTestWrapper />);

    expect(screen.getByText('Select instance type')).toBeInTheDocument();
    await user.click(screen.getByLabelText('TreeViewSelect toggle'));
    expect(screen.getByRole('tree').parentElement).toHaveClass('pf-v6-c-tree-view');

    const input = await screen.findByLabelText('TreeViewSelect search field');
    await user.type(input, 'c5a.false');
    expect(screen.queryAllByText(machineTypeMapFiltered[0].category!).length).toBeFalsy();
    expect(screen.queryAllByText(machineTypeMapFiltered[0].children![0].id!).length).toBeFalsy();
    await checkAccessibility(container);
  });

  it('search filter resets after menu is reopened', async () => {
    const { container, user } = render(<TreeViewSelectTestWrapper allExpanded />);

    expect(screen.getByText('Select instance type')).toBeInTheDocument();
    await user.click(screen.getByLabelText('TreeViewSelect toggle'));

    const input = await screen.findByLabelText('TreeViewSelect search field');
    await user.type(input, machineTypeMapFiltered[0].children![0].id!);

    // the two other node options should be filtered out of dropdown
    expect(screen.queryAllByText(machineTypeMapFiltered[0].children![1].id!).length).toBeFalsy();
    expect(screen.queryAllByText(machineTypeMapFiltered[0].children![2].id!).length).toBeFalsy();
    await user.click(screen.getByText(machineTypeMapFiltered[0].children![0].id!));

    // the two other node options should reappear after menu is reopened
    await user.click(screen.getByLabelText('TreeViewSelect toggle'));
    expect(screen.queryAllByText(machineTypeMapFiltered[0].children![0].id!).length).toBeTruthy();
    expect(screen.queryAllByText(machineTypeMapFiltered[0].children![1].id!).length).toBeTruthy();
    expect(screen.queryAllByText(machineTypeMapFiltered[0].children![2].id!).length).toBeTruthy();
    await checkAccessibility(container);
  });

  it('renders helpertext', async () => {
    const { container, user } = render(<TreeViewSelectTestWrapper allExpanded />);

    expect(screen.getByText('Select instance type')).toBeInTheDocument();
    await user.click(screen.getByLabelText('TreeViewSelect toggle'));
    expect(screen.getByRole('tree').parentElement).toHaveClass('pf-v6-c-tree-view');
    await user.click(screen.getByTestId('display-switch'));
    expect(screen.getByText('Selection is from a filtered set')).toBeInTheDocument();

    await checkAccessibility(container);
  });
});
