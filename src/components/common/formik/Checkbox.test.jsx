import React from 'react';
import { Formik } from 'formik';

import { checkAccessibility, render, screen, userEvent } from '~/testUtils';

import Checkbox from './Checkbox';

describe('Checkbox', () => {
  it('is accessible', async () => {
    const { container } = render(
      <Formik initialValues={{}} onSubmit={() => {}}>
        <Checkbox fieldId="wat" label="my label" />
      </Formik>,
    );
    await checkAccessibility(container);
  });

  it('renders initial "checked" state', () => {
    render(
      <Formik initialValues={{ wat: true }} onSubmit={() => {}}>
        <Checkbox fieldId="wat" />
      </Formik>,
    );
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('toggles "checked" state', async () => {
    render(
      <Formik initialValues={{ wat: false }} onSubmit={() => {}}>
        <Checkbox fieldId="wat" />
      </Formik>,
    );
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
    await userEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });
});
