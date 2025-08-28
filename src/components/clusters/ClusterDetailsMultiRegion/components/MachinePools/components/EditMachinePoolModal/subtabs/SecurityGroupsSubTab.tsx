import React from 'react';
import { FormikErrors } from 'formik';

import { Form, Tab, TabContent } from '@patternfly/react-core';

import { isCompatibleFeature, SupportedFeature } from '~/common/featureCompatibility';
import { ClusterFromSubscription } from '~/types/types';

import { EditMachinePoolValues } from '../hooks/useMachinePoolFormik';
import EditSecurityGroupsSection from '../sections/SecurityGroups/EditSecurityGroupsSection';

import { hasErrors, tabTitle } from './subTabHelpers';

const fieldsInTab = ['securityGroupIds'];

type Props = {
  cluster: ClusterFromSubscription;
  isReadOnly: boolean;
  tabKey: number | string;
  initialTabContentShown?: boolean;
};

export const useSecurityGroupsSubTab = ({
  cluster,
  isReadOnly,
  tabKey,
  initialTabContentShown,
}: Props): [
  (errors: FormikErrors<EditMachinePoolValues>) => React.JSX.Element | null,
  () => React.JSX.Element | null,
] => {
  const showSecurityGroupTab = isCompatibleFeature(SupportedFeature.SECURITY_GROUPS, cluster);
  const contentRef1 = React.createRef<HTMLElement>();

  const tab = (errors: FormikErrors<EditMachinePoolValues>) => {
    const tabErrors = hasErrors(errors, fieldsInTab);

    return showSecurityGroupTab ? (
      <Tab
        eventKey={tabKey}
        title={tabTitle('Security groups', tabErrors)}
        tabContentRef={contentRef1}
      />
    ) : null;
  };

  const content = () =>
    showSecurityGroupTab ? (
      <TabContent
        eventKey={tabKey}
        id="securityGroupsSubTabContent"
        ref={contentRef1}
        hidden={!initialTabContentShown}
        className="pf-v6-u-pt-md"
      >
        <Form>
          <EditSecurityGroupsSection cluster={cluster} isReadOnly={isReadOnly} />
        </Form>
      </TabContent>
    ) : null;
  return [tab, content];
};
