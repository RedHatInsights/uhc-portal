import React from 'react';

import { Content } from '@patternfly/react-core';

import links from '~/common/installLinks.mjs';
import ErrorModal from '~/components/common/ErrorModal';
import { ErrorModalProps } from '~/components/common/ErrorModal/ErrorModal';
import ExternalLink from '~/components/common/ExternalLink';

// 'closeModal' is omitted from component API because it's already
// populated by the ErrorModal index module (imported above)
type Props = Omit<ErrorModalProps, 'closeModal'>;

const ShieldedVmErrorModal = (props: Props) => (
  <ErrorModal {...props}>
    <Content component="p" className="pf-v6-u-mt-sm">
      <ExternalLink href={links.OSD_CCS_GCP_SHEILDED_VM}>Learn more about Secure Boot</ExternalLink>
    </Content>
  </ErrorModal>
);

export default ShieldedVmErrorModal;
