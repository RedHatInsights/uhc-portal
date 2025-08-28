import React from 'react';

import { Skeleton } from '@patternfly/react-core';
import { ScalprumComponent } from '@scalprum/react-core';

const TechnologyPreview = ({ className }: { className?: string }) => {
  const techPreviewProps = {
    className: className ?? '',
  };

  return (
    <ScalprumComponent
      {...techPreviewProps}
      scope="assistedInstallerApp"
      module="./TechnologyPreview"
      fallback={
        <Skeleton fontSize="md" width="8em" className="pf-v6-u-display-inline-flex pf-v6-u-ml-md" />
      }
    />
  );
};

export default TechnologyPreview;
