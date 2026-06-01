import * as React from 'react';

import { render, screen } from '~/testUtils';

import AutoNodeKarpenterCount from './AutoNodeKarpenterCount';

describe('<AutoNodeKarpenterCount />', () => {
  it('renders the container with correct test id', () => {
    render(<AutoNodeKarpenterCount count={5} />);

    expect(screen.getByTestId('autoNodeKarpenterCountContainer')).toBeInTheDocument();
  });

  it('displays the correct node count', () => {
    render(<AutoNodeKarpenterCount count={5} />);

    expect(screen.getByTestId('autoNodeKarpenterCount')).toHaveTextContent('5');
  });

  it('displays a count of 0', () => {
    render(<AutoNodeKarpenterCount count={0} />);

    expect(screen.getByTestId('autoNodeKarpenterCount')).toHaveTextContent('0');
  });

  it('displays the label text', () => {
    render(<AutoNodeKarpenterCount count={3} />);

    expect(screen.getByText('Autonode (Karpenter):')).toBeInTheDocument();
  });

  it('renders the popover hint', () => {
    render(<AutoNodeKarpenterCount count={1} />);

    expect(
      screen.getByRole('button', { name: 'More information about Autonode Karpenter nodes' }),
    ).toBeInTheDocument();
  });

  it('displays large node counts correctly', () => {
    render(<AutoNodeKarpenterCount count={100} />);

    expect(screen.getByTestId('autoNodeKarpenterCount')).toHaveTextContent('100');
  });
});
