import React from 'react';

import { render, screen, userEvent } from '~/testUtils';

import DrawerPanel from '../components/common/DrawerPanel';
import { DRAWER_PANEL_TEST_CASES } from '../components/fixtures';

import '@testing-library/jest-dom';

describe('DrawerPanel', () => {
  it('renders an opened DrawerPanel + checks functionality', async () => {
    render(<DrawerPanel {...DRAWER_PANEL_TEST_CASES.OPENED} />);

    const { toggleDrawer } = DRAWER_PANEL_TEST_CASES.OPENED;

    expect(screen.getByText(/example drawer panel content head/i)).toBeInTheDocument();
    expect(screen.getByText(/example drawer panel content body/i)).toBeInTheDocument();

    expect(screen.getByTestId('children-of-drawer-panel')).toBeInTheDocument();
    expect(screen.getByTestId('drawer-panel-divider')).toBeInTheDocument();

    const closeBtn = screen.getByTestId('drawer-close-button');
    expect(closeBtn).toBeInTheDocument();
    await userEvent.click(closeBtn);
    expect(toggleDrawer).toHaveBeenCalled();
  });
});
