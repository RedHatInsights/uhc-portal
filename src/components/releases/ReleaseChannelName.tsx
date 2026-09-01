import React from 'react';

type Props = {
  children: React.ReactNode;
  highlight?: boolean;
};

const ReleaseChannelName = ({ children, highlight }: Props) => {
  const content = React.useMemo(() => children, [children]);

  return (
    <dt
      className="pf-v6-c-description-list__term pf-v6-u-mt-md"
      style={highlight ? { fontWeight: 700 } : undefined}
    >
      {content}
    </dt>
  );
};

export default ReleaseChannelName;
