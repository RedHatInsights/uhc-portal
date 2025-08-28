import React from 'react';

import { checkAccessibility, render, screen } from '~/testUtils';

import { hypershiftValue } from './ControlPlaneCommon';
import { StandAloneTile } from './StandAloneTile';

// fixtures
const handleChange = jest.fn((_value: hypershiftValue) => {});

const defaultProps = {
  handleChange,
  isSelected: false,
};

describe('<StandAloneTile />', () => {
  it('calls handleChange on click', async () => {
    // Arrange
    const { user } = render(<StandAloneTile {...defaultProps} handleChange={handleChange} />);

    // Act
    const tile = screen.getByText('ROSA classic architecture');
    expect(tile).toBeInTheDocument();
    await user.click(tile);

    // Assert
    expect(handleChange).toHaveBeenCalledWith('false');
  });

  it('is accessible', async () => {
    // Arrange & Act
    const { container } = render(
      <div role="listbox" aria-label="dummy-just-for-accessibility-requirements-of-PF">
        <StandAloneTile {...defaultProps} />
      </div>,
    );

    // Assert
    expect(screen.getByText('ROSA classic architecture')).toBeInTheDocument();

    await checkAccessibility(container);
  });
});
