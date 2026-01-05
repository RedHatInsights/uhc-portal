import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { Alert, AlertActionLink } from '@patternfly/react-core';

import getTermsAppLink from '~/common/getTermsAppLink';
import { getLocation } from '~/common/location';
import { normalizedProducts } from '~/common/subscriptionTypes';
import { selfTermsReview } from '~/redux/actions/userActions';
import { useGlobalState } from '~/redux/hooks';
import { Subscription, SubscriptionCommonFieldsStatus } from '~/types/accounts_mgmt.v1';

type TermsAlertProps = {
  subscription: Subscription;
  setHasTermsAlert?: (isTrue: boolean) => void;
};

const TermsAlert = ({ subscription, setHasTermsAlert }: TermsAlertProps) => {
  const dispatch = useDispatch();

  const selfTermsReviewResult = useGlobalState((state) => state.userProfile.selfTermsReviewResult);
  const [prevSubscription, setPrevSubscription] = useState<Subscription | undefined>(undefined);

  const getTncAppURL = (baseURL?: string) =>
    getTermsAppLink(baseURL, getLocation().href, getLocation().href);

  const isTermsReviewRequired = (subscription: Subscription) =>
    subscription.status !== SubscriptionCommonFieldsStatus.Deprovisioned &&
    [normalizedProducts.OSD, normalizedProducts.RHMI, normalizedProducts.ROSA].includes(
      subscription.plan?.type ?? '',
    );

  useEffect(() => {
    if (
      (prevSubscription === undefined || subscription.id !== prevSubscription.id) &&
      isTermsReviewRequired(subscription)
    ) {
      dispatch(selfTermsReview());
    }
    setPrevSubscription(subscription);
  }, [subscription, prevSubscription, dispatch]);

  const hasTermsAlert =
    isTermsReviewRequired(subscription) &&
    selfTermsReviewResult.fulfilled &&
    selfTermsReviewResult.terms_required;

  if (hasTermsAlert && setHasTermsAlert) {
    setHasTermsAlert(true);
  }

  return isTermsReviewRequired(subscription) &&
    selfTermsReviewResult.fulfilled &&
    selfTermsReviewResult.terms_required ? (
    <Alert
      id="terms-alert"
      variant="warning"
      isInline
      title="You must accept the Terms and Conditions"
      actionLinks={
        <AlertActionLink
          key="terms-alert-link"
          component="a"
          href={getTncAppURL(selfTermsReviewResult.redirect_url)}
          data-testid="terms-alert-link"
        >
          View Terms and Conditions
        </AlertActionLink>
      }
      data-testid="terms-alert"
    >
      <p>Access to this cluster will be read-only until you accept the Terms and Conditions.</p>
    </Alert>
  ) : null;
};

export default TermsAlert;
