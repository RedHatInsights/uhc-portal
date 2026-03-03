import React from 'react';

import * as hooks from '~/redux/hooks';
import { checkAccessibility, screen, within, withState } from '~/testUtils';

import { createdPostGa, GA_DATE_STR, PreviewLabel } from './PreviewLabel';

const expectLabelToBePresent = (container: HTMLElement) => {
  expect(container.querySelector('.pf-v6-c-label')).toBeInTheDocument();
  expect(screen.queryByText(/Preview/)).toBeInTheDocument();
};

const expectLabelToBeAbsent = (container: HTMLElement) => {
  expect(container.querySelector('.pf-v6-c-label')).not.toBeInTheDocument();
  expect(screen.queryByText(/Preview/)).not.toBeInTheDocument();
};

describe('PreviewLabel', () => {
  const gaDateStr = '2023-12-01T00:00:00Z';
  const gaDate = new Date(gaDateStr);

  const defaultState = {
    clusters: {
      techPreview: {
        rosa: {
          hcp: {
            fulfilled: true,
            end_date: gaDateStr,
            additional_text: 'Foo https://example.com bar',
          },
        },
      },
    },
  };

  const mockedGetPreview = jest.fn();
  const mockedUseGetTechPreviewStatus = jest.fn(() => mockedGetPreview);
  jest.spyOn(hooks, 'useGetTechPreviewStatus').mockImplementation(mockedUseGetTechPreviewStatus);

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shows preview label when pre GA date', async () => {
    const createdDate = new Date(gaDateStr);
    createdDate.setSeconds(gaDate.getSeconds() - 1);
    const createdDateStr = createdDate.toISOString();

    expect(createdPostGa(createdDateStr, gaDateStr)).toBeFalsy();

    const { container, user } = withState(defaultState).render(
      <PreviewLabel creationDateStr={createdDateStr} />,
    );
    expectLabelToBePresent(container);

    // Test popover
    await user.click(screen.getByText(/Preview/));
    const badge = screen.getByText(/Foo/);
    expect(within(badge).getByRole('link')).toHaveAttribute('href', 'https://example.com');

    await checkAccessibility(container);
  });

  it('does not display preview label if GA date is API call as not finished (aka fulfilled = false)', () => {
    const createdDate = new Date(gaDateStr);
    createdDate.setSeconds(gaDate.getSeconds() - 1);
    const createdDateStr = createdDate.toISOString();

    expect(createdPostGa(createdDateStr, gaDateStr)).toBeFalsy();

    const newState = {
      clusters: { techPreview: { rosa: { hcp: { fulfilled: false, end_date: gaDateStr } } } },
    };

    const { container } = withState(newState).render(
      <PreviewLabel creationDateStr={createdDateStr} />,
    );

    expectLabelToBeAbsent(container);
  });

  it('displays preview label if api call fails and is before hard-coded date', () => {
    const createdDateStr = '2023-12-03T00:00:00Z';

    expect(createdPostGa(createdDateStr, GA_DATE_STR)).toBeFalsy();

    const newState = {
      clusters: { techPreview: { rosa: { hcp: { fulfilled: true, end_date: undefined } } } },
    };
    const { container } = withState(newState).render(
      <PreviewLabel creationDateStr={createdDateStr} />,
    );

    expectLabelToBePresent(container);
  });

  it('does not display preview label if api call fails and is after hard-coded date', () => {
    const createdDateStr = '2023-12-05T00:00:00Z';

    expect(createdPostGa(createdDateStr, GA_DATE_STR)).toBeTruthy();

    const newState = {
      clusters: { techPreview: { rosa: { hcp: { fulfilled: true, end_date: undefined } } } },
    };
    const { container } = withState(newState).render(
      <PreviewLabel creationDateStr={createdDateStr} />,
    );

    expectLabelToBeAbsent(container);
  });

  it('does not display preview label on GA date', () => {
    const createdDate = new Date(gaDateStr);
    const createdDateStr = createdDate.toISOString();

    expect(createdPostGa(createdDateStr, gaDateStr)).toBeTruthy();

    const { container } = withState(defaultState).render(
      <PreviewLabel creationDateStr={createdDateStr} />,
    );

    expectLabelToBeAbsent(container);
  });

  it('does not display preview label after GA date', () => {
    const createdDate = new Date(gaDateStr);
    createdDate.setSeconds(gaDate.getSeconds() + 1);
    const createdDateStr = createdDate.toISOString();

    expect(createdPostGa(createdDateStr, gaDateStr)).toBeTruthy();

    const { container } = withState(defaultState).render(
      <PreviewLabel creationDateStr={createdDateStr} />,
    );

    expectLabelToBeAbsent(container);
  });

  it('calls useGetTechPreviewStatus on load with "rosa" and "hcp"', () => {
    const createdDateStr = '2023-11-03T00:00:00Z';

    withState(defaultState).render(<PreviewLabel creationDateStr={createdDateStr} />);

    expect(mockedUseGetTechPreviewStatus).toHaveBeenCalledTimes(1);
    expect(mockedUseGetTechPreviewStatus).toHaveBeenCalledWith('rosa', 'hcp');

    // This is not called because it is known in the redux state
    expect(mockedGetPreview).toHaveBeenCalledTimes(0);
  });

  it('calls useGetTechPreviewStatus on load with with custom product and type', () => {
    const createdDateStr = '2023-11-03T00:00:00Z';

    withState(defaultState).render(
      <PreviewLabel creationDateStr={createdDateStr} product="myProduct" type="myType" />,
    );

    expect(mockedUseGetTechPreviewStatus).toHaveBeenCalledTimes(1);
    expect(mockedUseGetTechPreviewStatus).toHaveBeenCalledWith('myProduct', 'myType');

    // This is called because 'myProduct' is not in the redux state
    expect(mockedGetPreview).toHaveBeenCalledTimes(1);
  });
});
