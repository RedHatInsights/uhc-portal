import React from 'react';

import TechnologyPreview from '~/components/common/TechnologyPreview';

const HibernateClusterModalTitle = ({ title }: { title: string }) => (
  <>
    {title} <TechnologyPreview className="pf-v6-u-ml-0" />
  </>
);

export default HibernateClusterModalTitle;
