import React from 'react';

import { checkAccessibility, render, screen } from '~/testUtils';

import ButtonWithTooltip from './ButtonWithTooltip';

describe('<ButtonWithTooltip>', () => {
  it('displays as enabled button without disableReason', async () => {
    const { container, user } = render(
      <ButtonWithTooltip className="myClassIsPassedToButton">My button text</ButtonWithTooltip>,
    );

    expect(screen.getByRole('button')).not.toHaveAttribute('aria-disabled');
    expect(screen.getByRole('button')).toBeEnabled();
    expect(screen.getByRole('button')).toHaveClass('myClassIsPassedToButton');

    await checkAccessibility(container);

    // make sure tooltip is not present
    await user.hover(screen.getByRole('button'));
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('displays as enabled button with only  an empty disableReason', async () => {
    const { user } = render(<ButtonWithTooltip disableReason="">My button text</ButtonWithTooltip>);

    expect(screen.getByRole('button')).not.toHaveAttribute('aria-disabled');
    expect(screen.getByRole('button')).toBeEnabled();

    // make sure tooltip is not present
    await user.hover(screen.getByRole('button'));
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('displays as a disabled button if only isAriaDisabled is true', async () => {
    const { user } = render(<ButtonWithTooltip isAriaDisabled>My button text</ButtonWithTooltip>);

    expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');

    // make sure tooltip is not present
    await user.hover(screen.getByRole('button'));
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('displays as disabled and with tooltip if only disableReason is provided', async () => {
    const { user, container } = render(
      <ButtonWithTooltip disableReason={<h2>I am a tooltip</h2>}>My button text</ButtonWithTooltip>,
    );
    expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
    await user.hover(screen.getByRole('button'));

    expect(await screen.findByRole('tooltip')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'I am a tooltip' })).toBeInTheDocument();

    await checkAccessibility(container);
  });

  it('displays as disabled button with tooltip if disableReason is provided and isAriaDisabled is false', async () => {
    const { user } = render(
      <ButtonWithTooltip disableReason={<h2>I am a tooltip</h2>} isAriaDisabled={false}>
        My button text
      </ButtonWithTooltip>,
    );
    expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
    await user.hover(screen.getByRole('button'));

    expect(await screen.findByRole('tooltip')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'I am a tooltip' })).toBeInTheDocument();
  });
});
