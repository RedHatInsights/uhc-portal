import React from 'react';
import PropTypes from 'prop-types';

import { CodeIcon } from '@patternfly/react-icons/dist/esm/icons/code-icon';

import { Link } from '~/common/routing';

import './DeveloperPreviewSection.scss';

const DeveloperPreviewSection = ({
  isDevPreview = false,
  devPreviewLink = '/install/pre-release',
}) => (
  <>
    <span className="pf-v6-c-label pf-m-compact dev-preview-label">
      <CodeIcon /> Developer Preview
    </span>{' '}
    <Link to={devPreviewLink}>{isDevPreview ? 'About' : 'Download'} pre-release builds</Link>
  </>
);

DeveloperPreviewSection.propTypes = {
  isDevPreview: PropTypes.bool,
  devPreviewLink: PropTypes.string,
};

export default DeveloperPreviewSection;
