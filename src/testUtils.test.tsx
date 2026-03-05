import React, { useEffect } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';

import { render, screen, withState } from '~/testUtils';

import { GlobalState } from './redux/stateTypes';

// Small components to exercise rendering, redux connection and re-rendering.

const mappedState = jest.fn();
const didMount = jest.fn();
const rendered = jest.fn();

type Props = { pending: boolean; other: string; loadData: () => any };

class PresentationalComponent extends React.Component<Props> {
  componentDidMount() {
    didMount();
  }

  render() {
    rendered(this.props);
    const { loadData, other, pending } = this.props;
    return (
      <span>
        <button onClick={loadData} type="button">
          Load
        </button>
        pending: {pending ? 'y' : 'n'}
        other: {other}
      </span>
    );
  }
}

const mapStateToProps = (state: GlobalState) => {
  mappedState(state.flavours);
  // Depend on pending but not fulfilled, so we can test changes that do / do not re-render.
  return {
    pending: state.flavours.pending,
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadData: () => dispatch({ type: 'GET_DEFAULT_FLAVOUR_PENDING' }),
});
const ConnectedComponent = connect(mapStateToProps, mapDispatchToProps)(PresentationalComponent);

const FunctionalHookComponent = (props: { other: string }) => {
  const pending = useSelector((state: GlobalState) => state.flavours.pending);
  const dispatch = useDispatch();
  const loadData = () => dispatch({ type: 'GET_DEFAULT_FLAVOUR_PENDING' });

  useEffect(didMount, []);
  rendered(pending, props);

  const { other } = props;
  return (
    <span>
      <button onClick={loadData} type="button">
        Load
      </button>
      pending: {pending ? 'y' : 'n'}
      other: {other}
    </span>
  );
};

describe('render() with default state', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('renders', () => {
    it('Class component + connect()', () => {
      render(<ConnectedComponent other="1" />);

      expect(mappedState).toHaveBeenCalledTimes(1);
      expect(rendered).toHaveBeenCalledTimes(1);
      expect(didMount).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/pending: n.*other: 1/)).toBeInTheDocument();
    });

    it('Functional component + hooks', () => {
      render(<FunctionalHookComponent other="1" />);

      expect(rendered).toHaveBeenCalledTimes(1);
      expect(didMount).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/pending: n.*other: 1/)).toBeInTheDocument();
    });
  });

  describe('re-renders on prop change', () => {
    it('Class component + connect()', () => {
      const { rerender } = render(<ConnectedComponent other="2" />);

      rerender(<ConnectedComponent other="3" />);

      expect(didMount).toHaveBeenCalledTimes(1); // it remained mounted
      // Seems mapStateToProps's result is reused without calling it again.
      // Nice optimization but not essential to this test.
      // expect(mappedState).toHaveBeenCalledTimes(1);
      expect(rendered).toHaveBeenCalledTimes(2);
      expect(screen.getByText(/other: 3/)).toBeInTheDocument();
    });

    it('Functional component + hooks', () => {
      const { rerender } = render(<FunctionalHookComponent other="2" />);

      rerender(<FunctionalHookComponent other="3" />);

      expect(didMount).toHaveBeenCalledTimes(1); // it remained mounted
      expect(rendered).toHaveBeenCalledTimes(2);
      expect(screen.getByText(/other: 3/)).toBeInTheDocument();
    });
  });
});

describe('withState()', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('uses provided state', () => {
    it('Class component + connect()', () => {
      const { render, store, getState } = withState({ flavours: { pending: true } });

      expect(getState().flavours.pending).toBe(true);
      expect(store.getState().flavours.pending).toBe(true);

      render(<ConnectedComponent other="4" />);

      expect(mappedState).toHaveBeenCalledTimes(1);
      expect(rendered).toHaveBeenLastCalledWith(
        expect.objectContaining({ pending: true, other: '4' }),
      );
      expect(didMount).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/pending: y/)).toBeInTheDocument();
    });

    it('Functional component + hooks', () => {
      const { render, store, getState } = withState({ flavours: { pending: true } });

      expect(getState().flavours.pending).toBe(true);
      expect(store.getState().flavours.pending).toBe(true);

      render(<FunctionalHookComponent other="4" />);

      expect(rendered).toHaveBeenLastCalledWith(true, { other: '4' });
      expect(didMount).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/pending: y/)).toBeInTheDocument();
    });
  });

  describe('after redux action affecting props', () => {
    it('Class component + connect()', () => {
      const { render, getState, dispatch } = withState({});
      render(<ConnectedComponent other="5" />);

      expect(mappedState).toHaveBeenCalledTimes(1);
      expect(rendered).toHaveBeenCalledTimes(1);
      expect(didMount).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/pending: n/)).toBeInTheDocument();

      dispatch({ type: 'GET_DEFAULT_FLAVOUR_PENDING' });

      expect(getState().flavours.pending).toBe(true);
      expect(didMount).toHaveBeenCalledTimes(1); // it remained mounted
      expect(mappedState).toHaveBeenCalledTimes(2);
      expect(rendered).toHaveBeenCalledTimes(2);
      expect(screen.getByText(/pending: y/)).toBeInTheDocument();
    });

    it('Functional component + hooks', () => {
      const { render, getState, dispatch } = withState({});
      render(<FunctionalHookComponent other="5" />);

      expect(rendered).toHaveBeenCalledTimes(1);
      expect(didMount).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/pending: n/)).toBeInTheDocument();

      dispatch({ type: 'GET_DEFAULT_FLAVOUR_PENDING' });

      expect(getState().flavours.pending).toBe(true);
      expect(didMount).toHaveBeenCalledTimes(1); // it remained mounted
      expect(rendered).toHaveBeenCalledTimes(2);
      expect(screen.getByText(/pending: y/)).toBeInTheDocument();
    });
  });

  describe('after redux action irrelevant to mapStateToProps', () => {
    it('Class component + connect()', () => {
      const { render, dispatch } = withState({});
      render(<ConnectedComponent other="6" />);

      expect(mappedState).toHaveBeenCalledTimes(1);
      expect(rendered).toHaveBeenCalledTimes(1);
      expect(didMount).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/pending: n/)).toBeInTheDocument();

      dispatch({ type: 'GET_DEFAULT_FLAVOUR_FULFILLED', payload: { data: {} } });

      expect(didMount).toHaveBeenCalledTimes(1); // it remained mounted
      expect(mappedState).toHaveBeenCalledTimes(2);
      expect(rendered).toHaveBeenCalledTimes(1); // re-render was skipped
    });

    it('Functional component + hooks', () => {
      const { render, dispatch } = withState({});
      render(<FunctionalHookComponent other="6" />);

      expect(rendered).toHaveBeenCalledTimes(1);
      expect(didMount).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/pending: n/)).toBeInTheDocument();

      dispatch({ type: 'GET_DEFAULT_FLAVOUR_FULFILLED', payload: { data: {} } });

      expect(didMount).toHaveBeenCalledTimes(1); // it remained mounted
      expect(rendered).toHaveBeenCalledTimes(1); // re-render was skipped
    });
  });

  describe('component can affect redux', () => {
    it('Class component + connect()', async () => {
      const { render, getState } = withState({});
      const { user } = render(<ConnectedComponent other="7" />);

      expect(getState().flavours.pending).toBe(false);

      await user.click(screen.getByText(/Load/));

      expect(getState().flavours.pending).toBe(true);
      expect(screen.getByText(/pending: y/)).toBeInTheDocument();
    });

    it('Functional component + hooks', async () => {
      const { render, getState } = withState({});
      const { user } = render(<FunctionalHookComponent other="7" />);

      expect(getState().flavours.pending).toBe(false);

      await user.click(screen.getByText(/Load/));

      expect(getState().flavours.pending).toBe(true);
      expect(screen.getByText(/pending: y/)).toBeInTheDocument();
    });
  });

  it('render(), unmount(), render() with shared state', () => {
    const { render, dispatch } = withState({});
    const view = render(<ConnectedComponent other="A" />);

    expect(mappedState).toHaveBeenCalledTimes(1);
    expect(rendered).toHaveBeenCalledTimes(1);
    expect(rendered).toHaveBeenLastCalledWith(
      expect.objectContaining({ pending: false, other: 'A' }),
    );
    expect(didMount).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/other: A/)).toBeInTheDocument();

    view.unmount();
    dispatch({ type: 'GET_DEFAULT_FLAVOUR_PENDING' });

    expect(screen.queryByText(/other: A/)).not.toBeInTheDocument();
    expect(mappedState).toHaveBeenCalledTimes(1); // not called - nothing mounted.

    render(<FunctionalHookComponent other="B" />);

    expect(rendered).toHaveBeenCalledTimes(2);
    expect(rendered).toHaveBeenLastCalledWith(true, { other: 'B' });
    expect(didMount).toHaveBeenCalledTimes(2);
    expect(screen.getByText(/pending: y.*other: B/)).toBeInTheDocument();
  });

  it('multiple render() mounted simultaneously with shared state', async () => {
    const { render } = withState({});
    const { user } = render(<FunctionalHookComponent other="A" />);
    const buttonA = screen.getByText(/Load/);

    render(<ConnectedComponent other="B" />);

    expect(mappedState).toHaveBeenCalledTimes(1);
    expect(rendered).toHaveBeenCalledTimes(2);
    expect(rendered).toHaveBeenNthCalledWith(1, false, { other: 'A' });
    expect(rendered).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ pending: false, other: 'B' }),
    );
    expect(didMount).toHaveBeenCalledTimes(2);
    expect(screen.getByText(/pending: n.*other: A/)).toBeInTheDocument();
    expect(screen.getByText(/pending: n.*other: B/)).toBeInTheDocument();

    await user.click(buttonA);

    expect(rendered).toHaveBeenCalledTimes(4);
    expect(rendered).toHaveBeenCalledWith(true, { other: 'A' });
    expect(rendered).toHaveBeenCalledWith(expect.objectContaining({ pending: true, other: 'B' }));
    expect(screen.getByText(/pending: y.*other: A/)).toBeInTheDocument();
    expect(screen.getByText(/pending: y.*other: B/)).toBeInTheDocument();
  });
});
