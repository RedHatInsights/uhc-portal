import React from 'react';
import { Form, Formik } from 'formik';

import { FieldId } from '~/components/clusters/wizards/rosa/constants';
import { mockLogForwardingGroupTree } from '~/components/common/GroupsApplicationsSelector/logForwardingGroupTreeData';
import { useFetchLogForwardingApplications } from '~/queries/RosaWizardQueries/useFetchLogForwardingApplications';
import { useFetchLogForwardingGroups } from '~/queries/RosaWizardQueries/useFetchLogForwardingGroups';
import { render, screen } from '~/testUtils';

import { LogForwardingGroupsApplicationsSelector } from './LogForwardingGroupsApplicationsSelector';

jest.mock('~/queries/RosaWizardQueries/useFetchLogForwardingApplications');
jest.mock('~/queries/RosaWizardQueries/useFetchLogForwardingGroups');

jest.mock('~/components/common/GroupsApplicationsSelector/GroupsApplicationsSelector', () => ({
  GroupsApplicationsSelector: ({
    treeData,
    name,
  }: {
    treeData: { id: string; text: string }[];
    name: string;
  }) => (
    <div
      data-testid="groups-applications-selector"
      data-name={name}
      data-tree-size={treeData.length}
      data-has-other={String(treeData.some((node) => node.text === 'Other'))}
    />
  ),
}));

const mockUseFetchLogForwardingApplications = useFetchLogForwardingApplications as jest.Mock;
const mockUseFetchLogForwardingGroups = useFetchLogForwardingGroups as jest.Mock;

const fieldName = FieldId.LogForwardingS3SelectedItems;

const renderSelector = () =>
  render(
    <Formik
      initialValues={{
        [fieldName]: [] as string[],
      }}
      onSubmit={jest.fn()}
    >
      <Form noValidate>
        <LogForwardingGroupsApplicationsSelector name={fieldName} isRequired />
      </Form>
    </Formik>,
  );

describe('<LogForwardingGroupsApplicationsSelector />', () => {
  beforeEach(() => {
    mockUseFetchLogForwardingApplications.mockReset();
    mockUseFetchLogForwardingApplications.mockReturnValue({
      data: [],
      isLoading: false,
    });

    mockUseFetchLogForwardingGroups.mockReset();
    mockUseFetchLogForwardingGroups.mockReturnValue({
      data: mockLogForwardingGroupTree,
      isLoading: false,
      isError: false,
      error: null,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shows a spinner while groups are loading and the tree is empty', () => {
    mockUseFetchLogForwardingGroups.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    });
    mockUseFetchLogForwardingApplications.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    renderSelector();

    expect(screen.getByLabelText('Loading groups and applications')).toBeInTheDocument();
    expect(screen.queryByTestId('groups-applications-selector')).not.toBeInTheDocument();
  });

  it('renders the selector when groups are loaded even if applications are still loading', () => {
    mockUseFetchLogForwardingGroups.mockReturnValue({
      data: mockLogForwardingGroupTree,
      isLoading: false,
      isError: false,
      error: null,
    });
    mockUseFetchLogForwardingApplications.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    renderSelector();

    expect(screen.queryByLabelText('Loading groups and applications')).not.toBeInTheDocument();
    expect(screen.getByTestId('groups-applications-selector')).toBeInTheDocument();
  });

  it('shows a warning and still renders the selector when loading applications fails', () => {
    mockUseFetchLogForwardingApplications.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: { errorMessage: 'Service unavailable' },
    });

    renderSelector();

    expect(
      screen.getByText(
        'Could not load all applications. Some options may be missing from the list.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('Service unavailable')).toBeInTheDocument();
    expect(screen.getByTestId('groups-applications-selector')).toBeInTheDocument();
    expect(screen.getByTestId('groups-applications-selector')).toHaveAttribute(
      'data-has-other',
      'false',
    );
  });

  it('shows an error alert when loading groups fails', () => {
    mockUseFetchLogForwardingGroups.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: { errorMessage: 'Service unavailable' },
    });

    renderSelector();

    expect(screen.getByText('Could not load log forwarding groups')).toBeInTheDocument();
    expect(screen.getByText('Service unavailable')).toBeInTheDocument();
    expect(screen.queryByTestId('groups-applications-selector')).not.toBeInTheDocument();
  });

  it('falls back to a generic error message when the error has no details', () => {
    mockUseFetchLogForwardingGroups.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: {},
    });

    renderSelector();

    expect(screen.getByTestId('alert-error')).toBeInTheDocument();
    expect(screen.getByText('Could not load log forwarding groups')).toBeInTheDocument();
  });

  it('passes the groups tree and synthetic Other group into the selector on success', () => {
    mockUseFetchLogForwardingApplications.mockReturnValue({
      data: [{ enabled: true, name: 'orphan-app' }],
      isLoading: false,
    });

    renderSelector();

    const selector = screen.getByTestId('groups-applications-selector');
    expect(selector).toHaveAttribute('data-name', fieldName);
    expect(selector).toHaveAttribute(
      'data-tree-size',
      String(mockLogForwardingGroupTree.length + 1),
    );
    expect(selector).toHaveAttribute('data-has-other', 'true');
    expect(selector.getAttribute('data-tree-size')).not.toBe(
      String(mockLogForwardingGroupTree.length),
    );
  });
});
