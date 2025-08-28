import React from 'react';

import modals from '~/components/common/Modal/modals';
import { checkAccessibility, render, screen } from '~/testUtils';

import AddNotificationContactButton from '../AddNotificationContactButton';

describe('<AddNotificationContactButton />', () => {
  it.each([[true], [false]])('is accessible. canEdit %p', async (canEdit: boolean) => {
    // Act
    const { container } = render(
      <AddNotificationContactButton canEdit={canEdit} openModal={() => {}} />,
    );

    // Assert
    await checkAccessibility(container);
  });

  it.each([[true, false]])('canEdit %p', (canEdit: boolean) => {
    // Act
    render(<AddNotificationContactButton canEdit={canEdit} openModal={() => {}} />);

    // Assert
    if (canEdit) {
      expect(screen.getByRole('button', { name: /add notification contact/i })).toBeEnabled();
    } else {
      expect(screen.getByRole('button', { name: /add notification contact/i })).not.toBeEnabled();
    }
  });

  it('opens the modal', async () => {
    // Arrange
    const openModalMock = jest.fn();
    const { user } = render(<AddNotificationContactButton canEdit openModal={openModalMock} />);
    expect(openModalMock).toHaveBeenCalledTimes(0);

    // Act
    await user.click(screen.getByRole('button', { name: /add notification contact/i }));

    // Assert
    expect(openModalMock).toHaveBeenCalledTimes(1);
    expect(openModalMock).toHaveBeenCalledWith(modals.ADD_NOTIFICATION_CONTACT);
  });
});
