import React from 'react';

import { rosaHandsOnLinks } from './constants';

export const RosaHandsOnCustomerSuccessLink = ({ linkText }: { linkText: string }) => (
  <a href={rosaHandsOnLinks.customerSuccess}>{linkText}</a>
);
