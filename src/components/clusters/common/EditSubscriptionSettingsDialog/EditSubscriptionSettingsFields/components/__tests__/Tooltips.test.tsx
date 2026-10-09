import React from 'react';

import { checkAccessibility, render, screen } from '~/testUtils';

import Tooltips from '../Tooltips';

describe('<Tooltips />', () => {
  const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('is accessible', async () => {
    // Act
    const { container } = render(<Tooltips isShown />);

    // Assert
    await checkAccessibility(container);
  });

  it('is shown', () => {
    // Act
    render(<Tooltips isShown />);

    // Assert
    // PatternFly's Tooltip now invokes triggerRef twice per instance (once for Popper
    // positioning, once for its aria-attribute wiring added in patternfly-react#11953),
    // so each of the 4 tooltips logs its "target not found" error twice.
    expect(consoleErrorMock).toHaveBeenCalledTimes(8);
  });

  it('is not shown', () => {
    // Act
    render(
      <div data-testid="parent-div">
        <Tooltips />
      </div>,
    );

    // Assert
    expect(consoleErrorMock).toHaveBeenCalledTimes(0);
    expect(screen.getByTestId('parent-div').children.length).toBe(0);
  });
});
