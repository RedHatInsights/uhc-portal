import React from 'react';
import { Field } from 'formik';
import PropTypes from 'prop-types';

import Checkbox from './Checkbox';

/* Hidden/zero-height Checkbox which must be checked/true in order to pass
   field level validation.
   Typically used as an inner-anchor to scroll to upon field level validation error
   Validation can be handled asynchronously and set programmatically via:
     Ex: change('detected_ocm_and_user_roles', false|true);
*/
const HiddenCheckbox = ({ name }) => (
  <span className="pf-v6-u-display-none">
    <Field
      fieldId={name}
      component={Checkbox}
      name={`${name}`}
      validate={(value) => (value ? undefined : ' ')}
    />
  </span>
);

HiddenCheckbox.propTypes = {
  name: PropTypes.string.isRequired,
};

export default HiddenCheckbox;
