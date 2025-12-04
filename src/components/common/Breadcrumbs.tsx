import React from 'react';

import { Breadcrumb, BreadcrumbItem } from '@patternfly/react-core';

import { CLUSTER_LIST_PATH, Link } from '~/common/routing';

export type BreadcrumbPath = { label: string; path?: string };

type Props = {
  path: BreadcrumbPath[];
};

const Breadcrumbs = ({ path }: Props) => (
  <Breadcrumb>
    {path.map((item, i) => {
      const itemLabel = item.label;

      if (i < path.length - 1) {
        let itemPath = item.path;
        if (itemLabel === 'Cluster List' && !itemPath) {
          itemPath = CLUSTER_LIST_PATH;
        }

        return (
          <BreadcrumbItem
            key={itemLabel}
            render={({ className, ariaCurrent }) => (
              <Link
                to={`${itemPath || '/overview'}`}
                className={className}
                aria-current={ariaCurrent}
              >
                {itemLabel}
              </Link>
            )}
          />
        );
      }
      return (
        <BreadcrumbItem key={itemLabel} isActive>
          {itemLabel}
        </BreadcrumbItem>
      );
    })}
  </Breadcrumb>
);

export default Breadcrumbs;
