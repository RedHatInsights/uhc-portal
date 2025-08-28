import React from 'react';
import * as reactRedux from 'react-redux';

import { render, screen } from '~/testUtils';

import AddOnsDrawerParameterList from './AddOnsDrawerParameterList';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

const defaultProps = {
  installedAddOn: {
    parameters: {
      items: [
        { id: 'param1', value: 'true', value_type: 'boolean' },
        { id: 'param2', value: 'my second param value' },
        { id: 'param3', value: 'myOptionValue' },
        { id: 'myOtherAddon', value: 'false', value_type: 'boolean' },
      ],
    },
  },

  activeCard: {
    parameters: {
      items: [
        { id: 'param1', name: 'param name 1' },
        { id: 'param2', name: 'param name 2' },
        {
          id: 'param3',
          name: 'param name 3',
          options: [
            { value: 'myOptionValue', name: 'my option name' },
            { value: 'myNotUsedOptionValue', name: 'This option should not be used' },
          ],
        },
      ],
    },
  },
  activeCardId: 'card1',
  cluster: { id: 'myCluster', canEdit: true },
};

describe('AddOnsDrawerParameterList', () => {
  const useDispatchMock = jest.spyOn(reactRedux, 'useDispatch');
  const mockedDispatch = jest.fn();
  useDispatchMock.mockReturnValue(mockedDispatch);

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('displays AddOnsDrawerParameterList with parameters and configure button', () => {
    render(<AddOnsDrawerParameterList {...defaultProps} />);

    expect(screen.getByText('Configuration')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'edit configuration' }));

    // Ensure both param name and value are showing
    expect(screen.getByText('param name 1')).toBeInTheDocument();
    expect(screen.getByText('true')).toBeInTheDocument();
    expect(screen.getByText('param name 2')).toBeInTheDocument();
    expect(screen.getByText('my second param value')).toBeInTheDocument();
    expect(screen.getByText('param name 3')).toBeInTheDocument();
    expect(screen.getByText('my option name')).toBeInTheDocument();
  });

  test('does not render AddOnsDrawerParameterList when no parameters are available', () => {
    const newProps = {
      ...defaultProps,
      activeCard: {
        parameters: {
          items: [],
        },
      },
    };
    const { container } = render(<AddOnsDrawerParameterList {...newProps} />);
    expect(container).toBeEmptyDOMElement();
  });

  test('opens modal when configure button is clicked', async () => {
    const { user } = render(<AddOnsDrawerParameterList {...defaultProps} />);

    expect(screen.getByText('Configuration')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'edit configuration' }));

    const mockedDispatchCall = mockedDispatch.mock.calls[0][0];

    expect(mockedDispatchCall.type).toEqual('OPEN_MODAL');
    expect(mockedDispatchCall.payload.name).toEqual('add-ons-parameters-modal');
  });
});
