import React from 'react';

import { checkAccessibility, render, screen, within } from '~/testUtils';

import DynamicSelect from './DynamicSelect';

type DynamicSelectProps = React.ComponentProps<typeof DynamicSelect>;

describe('<DynamicSelect>', () => {
  const loadData = jest.fn();
  const onChange = jest.fn();
  const onBlur = jest.fn();

  const baseProps = {
    loadData,
    input: {
      onChange,
      onBlur,
      value: '',
      name: 'myName',
    },
    meta: {
      invalid: false,
      error: '',
      touched: false,
    },
    label: 'Label',
    placeholder: 'Select foo',
    emptyAlertTitle: 'No foos',
    noDependenciesPlaceholder: 'Must select bar first',
    requestErrorTitle: 'Failed listing foos',
    hasDependencies: true,
    matchesDependencies: true,
    requestStatus: {
      pending: false,
      fulfilled: false,
      error: false,
    },
    items: ['Foo', 'Bar'],
  } as DynamicSelectProps;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('displays single option with no dependencies', async () => {
    const { container } = render(<DynamicSelect {...baseProps} hasDependencies={false} />);

    // TODO - Having information information (like "loading" or directions) should not be an option
    expect(screen.getByRole('option')).toHaveTextContent('Must select bar first');
    expect(loadData).not.toHaveBeenCalled();
    await checkAccessibility(container);
  });

  it('loading icon is shown during loading and disappears when loading is complete', () => {
    const { rerender } = render(<DynamicSelect {...baseProps} matchesDependencies={false} />);
    expect(loadData).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('option', { name: 'Loading...' })).not.toBeInTheDocument();

    // loading has started
    const loadingProps = {
      ...baseProps,
      requestStatus: { pending: true, fulfilled: false, error: false },
      matchesDependencies: true,
    } as DynamicSelectProps;

    rerender(<DynamicSelect {...loadingProps} />);

    expect(screen.getByRole('option')).toHaveTextContent('Loading...');

    // loading is complete
    const fulfilledProps = {
      ...baseProps,
      requestStatus: { pending: false, fulfilled: true, error: false },
      matchesDependencies: true,
    } as DynamicSelectProps;

    rerender(<DynamicSelect {...fulfilledProps} />);

    expect(screen.getAllByRole('option')).toHaveLength(3);
    expect(screen.getAllByRole('option')[0]).toHaveTextContent('Select foo');
    expect(loadData).toHaveBeenCalledTimes(1); // AKA loadData has not been called again since initial render

    expect(screen.queryByRole('option', { name: 'Loading...' })).not.toBeInTheDocument();
  });

  it('empty option and error is shown when no data is returned', () => {
    const emptyDataProps = {
      ...baseProps,
      requestStatus: { pending: false, fulfilled: true, error: false },
      items: [],
    } as DynamicSelectProps;

    render(<DynamicSelect {...emptyDataProps} />);
    expect(loadData).not.toHaveBeenCalled();

    // TODO having an empty option without a label is not accessible
    expect(screen.getByRole('option')).toHaveTextContent('');

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(within(screen.getByRole('alert')).getByText('No foos', { exact: false }));
  });

  it('displays a single option when there is an error but untouched', () => {
    const untouchedProps = {
      ...baseProps,
      meta: { invalid: true, error: 'Bad!', touched: false },
    } as DynamicSelectProps;

    render(<DynamicSelect {...untouchedProps} />);

    expect(screen.getByRole('option')).toHaveTextContent('Must select bar first');
    expect(screen.queryByText('Bad!')).not.toBeInTheDocument();
  });

  it('error, touched', () => {
    const touchedProps = {
      ...baseProps,
      meta: { invalid: true, error: 'Bad!', touched: true },
    } as DynamicSelectProps;

    render(<DynamicSelect {...touchedProps} />);

    // TODO the error is set as aria-hidden and is not accessible to assistive technologies
    // TODO the error text is not programmatically tied (via the aria-describedby attribute) tied to the select input
    expect(screen.getByText('Bad!')).toBeInTheDocument();
  });

  it('resets when selected value no longer valid option', () => {
    const newProps = {
      ...baseProps,
      requestStatus: { pending: false, fulfilled: true, error: false },
      input: { value: 'Foo', onChange, onBlur, name: 'myName' },
    } as DynamicSelectProps;

    const { rerender } = render(<DynamicSelect {...newProps} />);
    expect(loadData).not.toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();

    const changedProps = {
      ...newProps,
      items: ['Bar', 'Baz'],
    };

    rerender(<DynamicSelect {...changedProps} />);
    expect(onChange).toHaveBeenCalledWith('');

    const setInputProps = {
      ...changedProps,
      input: { value: '', onChange, onBlur, name: 'myName' },
    };

    rerender(<DynamicSelect {...setInputProps} />);

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(3);

    expect(options[0]).toHaveTextContent('Select foo');
    expect(options[1]).toHaveTextContent('Bar');
    expect(options[2]).toHaveTextContent('Baz');
  });

  it('resets on lost dependencies', () => {
    const fulfilledProps = {
      ...baseProps,
      input: { value: 'Foo', onChange, onBlur, name: 'myName' },
      requestStatus: { pending: false, fulfilled: true, error: false },
    } as DynamicSelectProps;

    const { rerender } = render(<DynamicSelect {...fulfilledProps} />);
    expect(loadData).not.toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();

    const noDependenciesProps = {
      ...fulfilledProps,
      hasDependencies: false,
      matchesDependencies: false,
    };
    rerender(<DynamicSelect {...noDependenciesProps} />);
    expect(onChange).toHaveBeenCalledWith('');

    const setInputProps = {
      ...noDependenciesProps,
      input: { value: '', onChange, onBlur, name: 'myName' },
    };

    rerender(<DynamicSelect {...setInputProps} />);
    expect(screen.getByRole('option')).toHaveTextContent('Must select bar first');
  });
});
