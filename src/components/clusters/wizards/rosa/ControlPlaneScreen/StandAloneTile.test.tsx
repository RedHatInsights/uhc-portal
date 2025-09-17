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
    await user.click(screen.getByLabelText('ROSA classic architecture'));

    // Assert
    expect(handleChange).toHaveBeenCalledWith('false');
  });

  it('is accessible', async () => {
    // Arrange & Act
    const { container } = render(<StandAloneTile {...defaultProps} />);

    // Assert
    expect(screen.getByText('ROSA classic architecture')).toBeInTheDocument();

    await checkAccessibility(container);
  });
});
