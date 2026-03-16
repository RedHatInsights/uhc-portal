import React from 'react';

import docLinks from '~/common/docLinks.mjs';
import { render, screen } from '~/testUtils';

import SecurityGroupsNoChangeAlert from './SecurityGroupsNoChangeAlert';

describe('<SecurityGroupsNoChangeAlert />', () => {
  describe('Alert action link', () => {
    it.each([
      ['classic', true, false, docLinks.ROSA_CLASSIC_SECURITY_GROUPS],
      ['hypershift', true, true, docLinks.ROSA_SECURITY_GROUPS],
      ['OSD', false, false, docLinks.OSD_SECURITY_GROUPS],
    ])(
      'renders the correct security groups link for %s cluster',
      (fieldLabel, isRosa, isHypershift, expectedLink) => {
        render(<SecurityGroupsNoChangeAlert isRosa={isRosa} isHypershift={isHypershift} />);

        const link = screen.getByRole('link', { name: /View more information/i });

        expect(link).toHaveAttribute('href', expectedLink);
      },
    );
  });
});
