import React from 'react';
import PropTypes from 'prop-types';

import { FormSelect, FormSelectOption, Split, SplitItem } from '@patternfly/react-core';

import { architectureOptions, tools } from '../../../../../../common/installLinks.mjs';
import DownloadButton from '../DownloadButton';

const RHCOSDownloadAndSelect = ({ token, pendoID, rhcosDownloads }) => {
  const [selection, setSelection] = React.useState({ selection: 'x86' });

  const options = [
    { value: 'Select architecture', label: 'Select architecture', disabled: true },
    ...architectureOptions.map(({ value, label }) => ({ value, label, disabled: false })),
  ];

  const onChange = (selection) => setSelection({ selection });

  const downloadButtons = () => {
    const rhcosDownloadsArray = Array.isArray(rhcosDownloads) ? rhcosDownloads : [rhcosDownloads];

    const buttons = rhcosDownloadsArray.map((download) => {
      const { archURL, buttonText, name } = download;
      return (
        <SplitItem key={name}>
          <DownloadButton
            disabled={!!token.error}
            url={archURL[selection]}
            tool={tools.RHCOS}
            text={buttonText}
            name={name}
            pendoID={pendoID}
          />
        </SplitItem>
      );
    });

    return buttons;
  };

  return (
    <Split hasGutter className="os-based-download">
      <SplitItem key="select-arch">
        <FormSelect
          value={selection}
          onChange={(_event, selection) => onChange(selection)}
          aria-label="select-arch-dropdown"
        >
          {options.map((option) => (
            <FormSelectOption
              isDisabled={option.disabled}
              key={`arch.${option.value}`}
              value={option.value}
              label={option.label}
            />
          ))}
        </FormSelect>
      </SplitItem>
      <SplitItem key="download-buttons">
        <Split hasGutter>{downloadButtons()}</Split>
      </SplitItem>
    </Split>
  );
};

RHCOSDownloadAndSelect.propTypes = {
  token: PropTypes.object.isRequired,
  pendoID: PropTypes.string,
  rhcosDownloads: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
};

export default RHCOSDownloadAndSelect;
