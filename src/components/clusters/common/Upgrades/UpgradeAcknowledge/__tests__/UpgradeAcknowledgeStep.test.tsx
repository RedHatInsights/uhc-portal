import React from 'react';

import { checkAccessibility, render, screen } from '~/testUtils';
import { VersionGate } from '~/types/clusters_mgmt.v1';

import UpgradeAcknowledgeStep from '../UpgradeAcknowledgeStep';

describe('<UpgradeAcknowledgeStep>', () => {
  const ackWord = 'Acknowledge';
  const confirmedMock = jest.fn<void, [boolean]>();

  const ackArray: VersionGate[] = [
    {
      description: 'my upgrade gate',
      warning_message: 'my ack warning message',
      documentation_url: 'my doc url',
    } as VersionGate,
    {
      description: 'my other upgrade gate',
      warning_message: 'my other ack warning message',
      documentation_url: 'my other doc url',
    } as VersionGate,
  ];

  const defaultProps = {
    confirmed: confirmedMock,
    unmetAcknowledgements: ackArray,
    fromVersion: '4.8.2',
    toVersion: '4.9.12',
  };

  afterEach(() => {
    confirmedMock.mockClear();
  });

  it('should render correctly on load', async () => {
    const { container } = render(<UpgradeAcknowledgeStep {...defaultProps} />);

    expect(screen.getAllByRole('listitem')).toHaveLength(ackArray.length);

    await checkAccessibility(container);
  });

  it.each(ackArray)('acknowledgement %o is displayed', (ackItem) => {
    render(<UpgradeAcknowledgeStep {...defaultProps} />);
    expect(screen.getByText(ackItem.description!)).toBeInTheDocument();
  });

  it('should not be confirmed on empty confirm text', async () => {
    const { user } = render(<UpgradeAcknowledgeStep {...defaultProps} />);
    await user.clear(screen.getByRole('textbox'));

    expect(confirmedMock).toHaveBeenLastCalledWith(false);
  });

  it('should not be confirmed if wrong confirm word is typed', async () => {
    const { user } = render(<UpgradeAcknowledgeStep {...defaultProps} />);
    await user.clear(screen.getByRole('textbox'));
    await user.type(screen.getByRole('textbox'), 'notCorrectWord');
    expect(confirmedMock).toHaveBeenLastCalledWith(false);
  });

  it('should confirm if correct confirm word is typed', async () => {
    const { user } = render(<UpgradeAcknowledgeStep {...defaultProps} />);
    await user.clear(screen.getByRole('textbox'));
    await user.type(screen.getByRole('textbox'), ackWord);

    expect(confirmedMock).toHaveBeenLastCalledWith(true);
  });

  it('is confirmed on load if initiallyConfirmed is true', () => {
    const newProps = {
      ...defaultProps,
      initiallyConfirmed: true,
    };
    render(<UpgradeAcknowledgeStep {...newProps} />);
    expect(confirmedMock).toHaveBeenLastCalledWith(true);
  });
});
