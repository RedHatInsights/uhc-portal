import React from 'react';
import { useLocation } from 'react-router-dom';

import {
  Button,
  Content,
  ContentVariants,
  EmptyState,
  EmptyStateBody,
  Spinner,
} from '@patternfly/react-core';

import { useNavigate } from '~/common/routing';
import type { PromiseReducerState } from '~/redux/stateTypes';
import type { TermsReviewResponse } from '~/types/accounts_mgmt.v1';

import getTermsAppLink from '../../../common/getTermsAppLink';
import Modal from '../Modal/Modal';
import Unavailable from '../Unavailable';

import { ViewTermsButton } from './ViewTermsButton';

import './TermsGuard.scss';

type Props = {
  children: React.ReactElement;
  gobackPath: string;
  selfTermsReview: () => void;
  selfTermsReviewResult: PromiseReducerState<TermsReviewResponse>;
};

const TermsGuard = ({ selfTermsReview, selfTermsReviewResult, children, gobackPath }: Props) => {
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    selfTermsReview();
    // only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCancel = React.useCallback(() => {
    navigate(gobackPath);
  }, [navigate, gobackPath]);

  const getTncAppURL = React.useCallback(
    (baseURL: string | undefined) => {
      // as long as user performs some action, he should be redirected to the same page.
      const redirectURL = window.location.host + location.pathname;
      // same as clicking "Cancel" in the dialog.≈
      const cancelURL = window.location.host + gobackPath;

      return getTermsAppLink(baseURL, redirectURL, cancelURL);
    },
    [location.pathname, gobackPath],
  );

  // block by error page if the terms service is unavailable.
  if (selfTermsReviewResult.error) {
    return <Unavailable response={selfTermsReviewResult} />;
  }

  if (!selfTermsReviewResult.fulfilled) {
    return (
      <EmptyState>
        <EmptyStateBody>
          <div className="pf-v6-u-text-align-center">
            <Spinner size="lg" aria-label="Loading..." />
          </div>
        </EmptyStateBody>
      </EmptyState>
    );
  }

  if (!selfTermsReviewResult.terms_required && !selfTermsReviewResult.terms_available) {
    return children;
  }

  const dialogTitle = selfTermsReviewResult.terms_required
    ? 'Terms and Conditions'
    : 'Updated Terms and Conditions';
  const dialogText = selfTermsReviewResult.terms_required ? (
    // required: user needs accept or cancel.
    <Content>
      <Content component={ContentVariants.p}>
        Red Hat has Terms and Conditions for its managed services.
      </Content>
      <Content component={ContentVariants.p}>
        <b>
          If you do not accept the terms, you will not be able to create new clusters or to alter
          existing clusters.
        </b>{' '}
        Existing clusters will not be affected, however access will be read-only.
      </Content>
    </Content>
  ) : (
    // optional: user needs accept, decline, defer, or cancel.
    <Content>
      <Content component={ContentVariants.p}>
        Red Hat has updated the Terms and Conditions for its managed services.
      </Content>
    </Content>
  );
  const tncAppURL = getTncAppURL(selfTermsReviewResult.redirect_url);
  const actions = [
    <ViewTermsButton href={tncAppURL} key="view-terms-and-conditions" />,
    <Button variant="secondary" key="cancel-terms-and-conditions" onClick={handleCancel}>
      Cancel
    </Button>,
  ];

  return (
    <>
      <Modal
        title={dialogTitle}
        className="terms-and-conditions-guard-modal"
        onClose={handleCancel}
        actions={actions}
      >
        {dialogText}
      </Modal>
      {React.cloneElement(React.Children.only(children), { blockedByTerms: true })}
    </>
  );
};

export default TermsGuard;
