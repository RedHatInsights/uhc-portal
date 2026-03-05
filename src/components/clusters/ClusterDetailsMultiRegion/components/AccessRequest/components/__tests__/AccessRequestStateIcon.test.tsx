import React from 'react';

import { checkAccessibility, render, screen } from '~/testUtils';
import { AccessRequestStatusState } from '~/types/access_transparency.v1';

import AccessRequestStateIcon from '../AccessRequestStateIcon';

jest.mock('@patternfly/react-core', () => ({
  Label: ({ color, icon, children }: { color: string; icon?: React.ReactNode; children: any }) => (
    <div data-testid="label-mock" style={{ color: color ?? 'undefined' }}>
      {children}
      {icon}
    </div>
  ),
}));

jest.mock('@patternfly/react-icons/dist/esm/icons/check-circle-icon', () => ({
  CheckCircleIcon: () => <div>check-circle-icon</div>,
}));
jest.mock('@patternfly/react-icons/dist/esm/icons/outlined-clock-icon', () => ({
  OutlinedClockIcon: () => <div>outlined-clock-icon</div>,
}));
jest.mock('@patternfly/react-icons/dist/esm/icons/times-circle-icon', () => ({
  TimesCircleIcon: () => <div>times-circle-icon</div>,
}));
jest.mock('@patternfly/react-icons/dist/esm/icons/exclamation-triangle-icon', () => ({
  ExclamationTriangleIcon: () => <div>exclamation-triangle-icon</div>,
}));

describe('AccessRequestStateIcon', () => {
  it('empty content', () => {
    render(
      <div data-testid="parent-div">
        <AccessRequestStateIcon />
      </div>,
    );
    expect(screen.getByTestId('parent-div').children.length).toBe(0);
  });

  it('is accessible', async () => {
    const { container } = render(
      <AccessRequestStateIcon
        accessRequest={{ status: { state: AccessRequestStatusState.Approved } }}
      />,
    );
    await checkAccessibility(container);
  });

  describe('renders proper state for different states', () => {
    it.each([
      [AccessRequestStatusState.Approved, 'green', 'check-circle-icon'],
      [AccessRequestStatusState.Denied, 'red', 'times-circle-icon'],
      [AccessRequestStatusState.Expired, 'undefined', 'outlined-clock-icon'],
      [AccessRequestStatusState.Pending, 'orange', 'exclamation-triangle-icon'],
    ])(
      '"%s" state',
      (state: AccessRequestStatusState, expectedColor: string, expectedIconName: string) => {
        // Act
        render(<AccessRequestStateIcon accessRequest={{ status: { state } }} />);

        // Assert
        expect(screen.getByText(new RegExp(state, 'i'))).toHaveStyle(`color: ${expectedColor}`);
        expect(screen.getByText(new RegExp(expectedIconName, 'i'))).toBeInTheDocument();
      },
    );
  });
});
