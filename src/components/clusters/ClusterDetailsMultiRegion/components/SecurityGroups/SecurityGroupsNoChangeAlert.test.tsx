import React from 'react';

import links from '~/common/installLinks.mjs';
import { render, screen } from '~/testUtils';

import SecurityGroupsNoChangeAlert from './SecurityGroupsNoChangeAlert';

const renderComponent = (props: { isRosa: boolean; isHypershift: boolean }) =>
  render(<SecurityGroupsNoChangeAlert {...props} />);

describe('<SecurityGroupsNoChangeAlert />', () => {
  describe('Alert action link', () => {
    it.each([
      ['classic', true, false, links.ROSA_CLASSIC_SECURITY_GROUPS],
      ['hypershift', true, true, links.ROSA_SECURITY_GROUPS],
      ['OSD', false, false, links.OSD_SECURITY_GROUPS],
    ])(
      'renders the correct security groups link for %s cluster',
      (fieldLabel, isRosa, isHypershift, expectedLink) => {
        renderComponent({ isRosa, isHypershift });

        const link = screen.getByRole('link', { name: /View more information/i });

        expect(link).toHaveAttribute('href', expectedLink);
      },
    );
  });
});
