import React from 'react';
import { Form, Formik } from 'formik';

import { mockLogForwardingGroupTree } from '~/components/common/GroupsApplicationsSelector/logForwardingGroupTreeData';
import { LOG_FORWARDING_OTHER_GROUP_NAME } from '~/components/common/GroupsApplicationsSelector/logForwardingGroupTreeFromApi';
import { useFetchLogForwardingApplications } from '~/queries/RosaWizardQueries/useFetchLogForwardingApplications';
import { useFetchLogForwardingGroups } from '~/queries/RosaWizardQueries/useFetchLogForwardingGroups';
import { render, screen } from '~/testUtils';

import { ClusterLogForwardingGroupsApplicationsSelector } from './ClusterLogForwardingGroupsApplicationsSelector';

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
      data-has-other={String(
        treeData.some((node) => node.text === LOG_FORWARDING_OTHER_GROUP_NAME),
      )}
    />
  ),
}));

const mockUseFetchLogForwardingApplications = useFetchLogForwardingApplications as jest.Mock;
const mockUseFetchLogForwardingGroups = useFetchLogForwardingGroups as jest.Mock;

const fieldName = 'selectedItems';

const renderSelector = () =>
  render(
    <Formik
      initialValues={{
        [fieldName]: [] as string[],
      }}
      onSubmit={jest.fn()}
    >
      <Form noValidate>
        <ClusterLogForwardingGroupsApplicationsSelector name={fieldName} isRequired />
      </Form>
    </Formik>,
  );

describe('ClusterLogForwardingGroupsApplicationsSelector', () => {
  beforeEach(() => {
    mockUseFetchLogForwardingApplications.mockReset();
    mockUseFetchLogForwardingApplications.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
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

  it('always requests groups and applications with both destinations enabled', () => {
    renderSelector();

    expect(mockUseFetchLogForwardingGroups).toHaveBeenCalledWith({ s3On: true, cwOn: true });
    expect(mockUseFetchLogForwardingApplications).toHaveBeenCalledWith({ s3On: true, cwOn: true });
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
    expect(screen.getByTestId('groups-applications-selector')).toBeInTheDocument();
  });

  it('passes merged tree data including Other group into the selector', () => {
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
  });
});
