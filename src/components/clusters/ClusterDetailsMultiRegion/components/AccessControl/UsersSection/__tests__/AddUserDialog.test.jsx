import React from 'react';

import { render, screen } from '~/testUtils';

import links from '../../../../../../../common/installLinks.mjs';
import AddUserDialog from '../AddUserDialog';

describe('<AddUserDialog />', () => {
  const props = {
    isOpen: true,
    canAddClusterAdmin: true,
    addUserMutate: jest.fn(),
    isAddUserPending: false,
    isAddUserError: false,
    addUserError: null,
    isAddUserSuccess: false,
    resetAddUserMutate: jest.fn(),
    isROSA: true,
    isHypershift: true,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it.each([
    ['classic', true, false, links.ROSA_CLASSIC_AWS_IAM_OPERATOR_ROLES],
    ['hypershift', true, true, links.ROSA_AWS_IAM_OPERATOR_ROLES],
    ['OSD', false, false, links.OSD_DEDICATED_ADMIN_ROLE],
  ])(
    'renders the correct operator roles link for %s cluster',
    (fieldLabel, isRosa, isHypershift, expectedLink) => {
      render(<AddUserDialog {...props} isROSA={isRosa} isHypershift={isHypershift} />);

      const link = screen.getByText('documentation');

      expect(link).toHaveAttribute('href', expectedLink);
    },
  );
});
