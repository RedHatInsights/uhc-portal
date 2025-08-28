import React from 'react';

type Props = { children: React.ReactNode };

const ReleaseChannelName = ({ children }: Props) => (
  <dt className="pf-v6-c-description-list__term pf-v6-u-mt-md">{children}</dt>
);

export default ReleaseChannelName;
