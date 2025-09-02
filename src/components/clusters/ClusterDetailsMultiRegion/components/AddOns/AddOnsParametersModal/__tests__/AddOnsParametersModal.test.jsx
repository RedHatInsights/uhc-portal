import React from 'react';

import * as reduxHooks from '~/redux/hooks';
import { checkAccessibility, render, screen } from '~/testUtils';

import fixtures from '../../../../__tests__/ClusterDetails.fixtures';
import AddOnsParametersModal from '../AddOnsParametersModal';

const dummyValue = 'dummy value';

describe('<AddOnsParametersModal />', () => {
  const useGlobalStateMock = jest.spyOn(reduxHooks, 'useGlobalState');
  const quota = {};

  const { clusterDetails } = fixtures;

  const props = {
    isOpen: true,
    clusterID: '1i4counta3holamvo1g5tp6n8p3a03bq',
    updateClusterAddOn: jest.fn(),
    isUpdateClusterAddOnError: false,
    addClusterAddOn: jest.fn(),
    isClusterAddOnError: false,
    isAddClusterAddOnPending: false,
    addOn: {
      description: 'Dummy Desc',
      enabled: true,
      editable: true,
      id: 'Dummy ID',
      name: 'Dummy Name',
      parameters: {
        items: [
          {
            id: 'dummy item',
            enabled: true,
            editable: true,
            default_value: dummyValue,
          },
        ],
      },
    },
    addOnInstallation: {
      id: 'Dummy ID',
      parameters: {
        items: [
          {
            id: 'dummy item',
          },
        ],
      },
    },
    quota,
    cluster: clusterDetails.cluster,
    pristine: false,
    clearClusterAddOnsResponses: jest.fn(),
    addClusterAddOnError: {},
    updateClusterAddOnError: {},
    closeModal: jest.fn(),
    handleSubmit: jest.fn(),
    isAddClusterAddOnError: false,
    isUpdateClusterAddOnPending: false,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  useGlobalStateMock.mockReturnValue({
    isOpen: true,
    addOn: {
      description: 'Dummy Desc',
      enabled: true,
      editable: true,
      id: 'Dummy ID',
      name: 'Dummy Name',
      parameters: {
        items: [
          {
            id: 'dummy item',
            enabled: true,
            editable: true,
            default_value: dummyValue,
          },
        ],
      },
    },
    addOnInstallation: {
      id: 'Dummy ID',
      parameters: {
        items: [
          {
            id: 'dummy item',
          },
        ],
      },
    },
    isUpdateForm: true,
  });

  it('is accessible', async () => {
    const { container } = render(<AddOnsParametersModal {...props} />);
    await checkAccessibility(container);
  });

  it('expect set default option button is be present if default_value present', () => {
    render(<AddOnsParametersModal {...props} />);

    expect(screen.getByRole('button', { name: `Use default: ${dummyValue}` })).toBeInTheDocument();
  });

  it('expect addon field to be enabled on create form', () => {
    render(<AddOnsParametersModal {...props} />);

    expect(screen.getByRole('textbox')).not.toBeDisabled();
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-disabled');
  });

  it('expect addon field placeholder to equal default value', () => {
    useGlobalStateMock.mockReturnValue({
      isOpen: true,
      addOn: {
        description: 'Dummy Desc',
        enabled: true,
        editable: true,
        id: 'Dummy ID',
        name: 'Dummy Name',
        parameters: {
          items: [
            {
              id: 'dummy item',
              enabled: true,
              editable: true,
              default_value: dummyValue,
            },
          ],
        },
      },
      isUpdateForm: false,
    });
    render(<AddOnsParametersModal {...props} />);
    expect(screen.getByPlaceholderText(dummyValue)).toBeInTheDocument();
  });

  it('expect set default option to be absent if no default_value is present', () => {
    useGlobalStateMock.mockReturnValue({
      isOpen: true,
      addOn: {
        description: 'Dummy Desc',
        enabled: true,
        editable: true,
        id: 'Dummy ID',
        name: 'Dummy Name',
        parameters: {
          items: [
            {
              id: 'dummy item',
              enabled: true,
              editable: true,
            },
          ],
        },
      },
      isUpdateForm: false,
    });

    render(<AddOnsParametersModal {...props} />);

    expect(screen.queryByRole('button', { name: /Use default/ })).not.toBeInTheDocument();
  });

  it('expect addon field to be disabled on update form, if param is not editable', () => {
    useGlobalStateMock.mockReturnValue({
      isOpen: true,
      addOn: {
        description: 'Dummy Desc',
        enabled: true,
        editable: true,
        id: 'Dummy ID',
        name: 'Dummy Name',
        parameters: {
          items: [
            {
              id: 'dummy item',
              enabled: true,
              editable: false,
            },
          ],
        },
      },
      addOnInstallation: {
        id: 'Dummy ID',
        parameters: {
          items: [
            {
              id: 'dummy item',
            },
          ],
        },
      },
      isUpdateForm: true,
    });

    render(<AddOnsParametersModal {...props} />);

    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('expect addon field to populate options', async () => {
    useGlobalStateMock.mockReturnValue({
      isOpen: true,
      addOn: {
        description: 'Dummy Desc',
        enabled: true,
        editable: true,
        id: 'Dummy ID',
        name: 'Dummy Name',
        parameters: {
          items: [
            {
              id: 'dummy item',
              options: [
                {
                  name: 'Option 1',
                  value: 'option1',
                },
              ],
              enabled: true,
              editable: true,
            },
          ],
        },
      },

      addOnInstallation: {
        id: 'Dummy ID',
        parameters: {
          items: [
            {
              id: 'dummy item',
            },
          ],
        },
      },
      isUpdateForm: true,
    });

    const { user } = render(<AddOnsParametersModal {...props} />);

    const combobox = screen.getByRole('button', { name: /Options menu/i });

    await user.click(combobox);

    expect(screen.getByText('Option 1')).toBeInTheDocument();
  });
});
