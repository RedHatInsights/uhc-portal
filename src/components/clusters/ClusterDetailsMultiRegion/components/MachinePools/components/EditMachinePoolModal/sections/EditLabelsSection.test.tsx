import React from 'react';
import { Formik } from 'formik';

import { render, screen } from '~/testUtils';

import EditLabelsSection from './EditLabelsSection';

describe('<EditLabelsSection />', () => {
  it('names the key and value inputs when the section renders', () => {
    render(
      <Formik initialValues={{ labels: [{ key: 'zone', value: 'multi' }] }} onSubmit={() => {}}>
        <EditLabelsSection />
      </Formik>,
    );

    expect(screen.getByRole('textbox', { name: 'Node label key' })).toHaveValue('zone');
    expect(screen.getByRole('textbox', { name: 'Node label value' })).toHaveValue('multi');
  });
});
