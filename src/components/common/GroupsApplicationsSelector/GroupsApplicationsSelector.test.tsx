import React from 'react';
import { Form, Formik } from 'formik';

import { checkAccessibility, render, screen, within } from '~/testUtils';

import { GroupsApplicationsSelector } from './GroupsApplicationsSelector';
import type { LogForwardingGroupTreeNode } from './logForwardingGroupTreeData';
import { mockLogForwardingGroupTree } from './logForwardingGroupTreeData';

const FIELD_NAME = 'groupsApplicationsSelection';

const minimalTree: LogForwardingGroupTreeNode[] = [
  {
    id: 'grp',
    text: 'Group A',
    children: [
      { id: 'leaf-1', text: 'App One' },
      { id: 'leaf-2', text: 'App Two' },
    ],
  },
  { id: 'solo-leaf', text: 'Standalone' },
];

/** minimalTree plus grp → nested → leaf (three levels) to guard depth > 2 regressions. */
const minimalTreeWithDeepNesting: LogForwardingGroupTreeNode[] = [
  ...minimalTree,
  {
    id: 'grp-top',
    text: 'Top Group',
    children: [
      {
        id: 'nested',
        text: 'Nested',
        children: [{ id: 'deep-leaf', text: 'Deep App' }],
      },
    ],
  },
];

function TestShell({
  children,
  initialValues = { [FIELD_NAME]: [] as string[] },
  onSubmit = jest.fn(),
}: {
  children: React.ReactNode;
  initialValues?: Record<string, unknown>;
  onSubmit?: jest.Mock;
}) {
  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit}>
      <Form noValidate>
        {children}
        <button type="submit">Submit</button>
      </Form>
    </Formik>
  );
}

describe('<GroupsApplicationsSelector />', () => {
  it('is accessible', async () => {
    const { container } = render(
      <TestShell>
        <GroupsApplicationsSelector name={FIELD_NAME} treeData={minimalTree} />
      </TestShell>,
    );
    await checkAccessibility(container);
  });

  it('renders default pane titles and empty chosen panel', () => {
    render(
      <TestShell>
        <GroupsApplicationsSelector name={FIELD_NAME} treeData={minimalTree} />
      </TestShell>,
    );

    expect(screen.getByText('Select groups and applications')).toBeInTheDocument();
    expect(screen.getByText('Selected groups and applications')).toBeInTheDocument();
    expect(screen.getByText('No groups or applications selected')).toBeInTheDocument();
  });

  it('renders custom titles', () => {
    render(
      <TestShell>
        <GroupsApplicationsSelector
          name={FIELD_NAME}
          treeData={minimalTree}
          availableTitle="Available items"
          chosenTitle="Chosen items"
        />
      </TestShell>,
    );

    expect(screen.getByText('Available items')).toBeInTheDocument();
    expect(screen.getByText('Chosen items')).toBeInTheDocument();
  });

  it('shows required markers on both panes when isRequired', () => {
    const { container } = render(
      <TestShell>
        <GroupsApplicationsSelector name={FIELD_NAME} treeData={minimalTree} isRequired />
      </TestShell>,
    );

    expect(container.querySelectorAll('.pf-v6-c-form__label-required')).toHaveLength(2);
  });

  it('selecting a leaf-only root adds it to the chosen panel and submit payload', async () => {
    const onSubmit = jest.fn();
    const { user } = render(
      <TestShell onSubmit={onSubmit}>
        <GroupsApplicationsSelector name={FIELD_NAME} treeData={minimalTree} />
      </TestShell>,
    );

    await user.click(screen.getByRole('checkbox', { name: 'Select Standalone' }));

    expect(screen.getByRole('button', { name: 'Remove Standalone' })).toBeInTheDocument();
    expect(screen.queryByText('No groups or applications selected')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Submit' }));
    expect(onSubmit).toHaveBeenCalledWith({ [FIELD_NAME]: ['solo-leaf'] }, expect.anything());
  });

  it('selecting a parent group selects all descendant leaves', async () => {
    const onSubmit = jest.fn();
    const { user } = render(
      <TestShell onSubmit={onSubmit}>
        <GroupsApplicationsSelector name={FIELD_NAME} treeData={minimalTree} />
      </TestShell>,
    );

    await user.click(screen.getByRole('checkbox', { name: 'Select Group A' }));

    expect(screen.getByText('App One')).toBeInTheDocument();
    expect(screen.getByText('App Two')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Submit' }));
    expect(onSubmit).toHaveBeenCalledWith(
      { [FIELD_NAME]: expect.arrayContaining(['leaf-1', 'leaf-2']) },
      expect.anything(),
    );
    const submitted = onSubmit.mock.calls[0][0][FIELD_NAME] as string[];
    expect(submitted).toHaveLength(2);
  });

  it('includes deeply nested leaves when selecting a top-level group (depth > 2)', async () => {
    const onSubmit = jest.fn();
    const { user } = render(
      <TestShell onSubmit={onSubmit}>
        <GroupsApplicationsSelector name={FIELD_NAME} treeData={minimalTreeWithDeepNesting} />
      </TestShell>,
    );

    await user.click(screen.getByRole('checkbox', { name: 'Select Top Group' }));

    expect(screen.getByRole('button', { name: 'Remove Deep App' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Submit' }));
    expect(onSubmit).toHaveBeenCalledWith(
      { [FIELD_NAME]: expect.arrayContaining(['deep-leaf']) },
      expect.anything(),
    );
    const submitted = onSubmit.mock.calls[0][0][FIELD_NAME] as string[];
    expect(submitted).toContain('deep-leaf');
  });

  it('unchecking a parent group clears its leaves from the value', async () => {
    const { user } = render(
      <TestShell>
        <GroupsApplicationsSelector name={FIELD_NAME} treeData={minimalTree} />
      </TestShell>,
    );

    const parent = screen.getByRole('checkbox', { name: 'Select Group A' });
    await user.click(parent);
    expect(screen.getByText('App One')).toBeInTheDocument();

    await user.click(parent);
    expect(screen.queryByText('App One')).not.toBeInTheDocument();
    expect(screen.getByText('No groups or applications selected')).toBeInTheDocument();
  });

  it('removes a single leaf via label close', async () => {
    const onSubmit = jest.fn();
    const { user } = render(
      <TestShell onSubmit={onSubmit}>
        <GroupsApplicationsSelector name={FIELD_NAME} treeData={minimalTree} />
      </TestShell>,
    );

    await user.click(screen.getByRole('checkbox', { name: 'Select Group A' }));
    await user.click(screen.getByRole('button', { name: 'Remove App One' }));

    await user.click(screen.getByRole('button', { name: 'Submit' }));
    expect(onSubmit).toHaveBeenCalledWith({ [FIELD_NAME]: ['leaf-2'] }, expect.anything());
  });

  it('removes an entire group via label group close', async () => {
    const onSubmit = jest.fn();
    const { user } = render(
      <TestShell onSubmit={onSubmit}>
        <GroupsApplicationsSelector name={FIELD_NAME} treeData={minimalTree} />
      </TestShell>,
    );

    await user.click(screen.getByRole('checkbox', { name: 'Select Group A' }));
    await user.click(
      screen.getByRole('button', {
        name: (accessibleName) => accessibleName.includes('Remove all applications in Group A'),
      }),
    );

    expect(screen.getByText('No groups or applications selected')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    expect(onSubmit).toHaveBeenCalledWith({ [FIELD_NAME]: [] }, expect.anything());
  });

  it('respects initial Formik values', async () => {
    const { user } = render(
      <TestShell initialValues={{ [FIELD_NAME]: ['leaf-1'] }}>
        <GroupsApplicationsSelector name={FIELD_NAME} treeData={minimalTree} />
      </TestShell>,
    );

    expect(screen.getByText('App One')).toBeInTheDocument();

    const groupRow = screen.getByRole('treeitem', { name: /Group A/ });
    await user.click(within(groupRow).getByRole('button'));

    expect(screen.getByRole('checkbox', { name: 'Select App One' })).toBeChecked();
  });

  it('disables tree checkboxes and label removal when isDisabled', async () => {
    const { user } = render(
      <TestShell initialValues={{ [FIELD_NAME]: ['leaf-1'] }}>
        <GroupsApplicationsSelector name={FIELD_NAME} treeData={minimalTree} isDisabled />
      </TestShell>,
    );

    expect(screen.getByRole('checkbox', { name: 'Select Group A' })).toBeDisabled();

    await user.click(screen.getByRole('checkbox', { name: 'Select Group A' }));
    expect(screen.getByRole('checkbox', { name: 'Select Group A' })).not.toBeChecked();

    expect(screen.queryByRole('button', { name: 'Remove App One' })).not.toBeInTheDocument();
  });

  it('works with full mock tree used by stories', async () => {
    const onSubmit = jest.fn();
    const { user } = render(
      <TestShell onSubmit={onSubmit}>
        <GroupsApplicationsSelector name={FIELD_NAME} treeData={mockLogForwardingGroupTree} />
      </TestShell>,
    );

    await user.click(screen.getByRole('checkbox', { name: 'Select API' }));

    expect(screen.getByText('audit')).toBeInTheDocument();
    expect(screen.getByText('apiserver')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Submit' }));
    expect(onSubmit).toHaveBeenCalledWith(
      { [FIELD_NAME]: expect.arrayContaining(['api-audit', 'api-server']) },
      expect.anything(),
    );
  });
});
