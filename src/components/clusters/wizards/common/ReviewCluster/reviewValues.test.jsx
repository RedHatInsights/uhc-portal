import React from 'react';

import { render, screen } from '~/testUtils';

import reviewValues from './reviewValues';

describe('reviewValues', () => {
  describe('defaultRouterSelectors', () => {
    const { title, valueTransform } = reviewValues.defaultRouterSelectors;

    it('uses the expected review title', () => {
      expect(title).toBe('Route selectors');
    });

    it('shows None specified when value is missing or empty', () => {
      expect(valueTransform('')).toBe('None specified');
      expect(valueTransform(undefined)).toBe('None specified');
    });

    it('shows None specified when parsing yields no pairs', () => {
      expect(valueTransform('   ')).toBe('None specified');
    });

    it('renders each route selector as a blue label', () => {
      render(<>{valueTransform('route=external,shard=blue')}</>);
      expect(screen.getByText('route = external')).toBeInTheDocument();
      expect(screen.getByText('shard = blue')).toBeInTheDocument();
    });
    it('renders each route selector as a blue label', () => {
      render(<>{valueTransform('route=external,shard=')}</>);
      expect(screen.getByText('route = external')).toBeInTheDocument();
      expect(screen.getByText('shard =')).toBeInTheDocument();
    });
  });

  describe('defaultRouterExcludeNamespaceSelectors', () => {
    const { title, valueTransform } = reviewValues.defaultRouterExcludeNamespaceSelectors;

    it('uses the expected review title', () => {
      expect(title).toBe('Exclude namespace selectors');
    });

    it('shows None specified when rows are missing or empty', () => {
      expect(valueTransform(undefined)).toBe('None specified');
      expect(valueTransform(null)).toBe('None specified');
      expect(valueTransform([])).toBe('None specified');
    });

    it('shows None specified when only placeholder or whitespace keys are present', () => {
      expect(
        valueTransform([
          { id: '1', key: '', value: '' },
          { key: '   ', value: 'x' },
        ]),
      ).toBe('None specified');
    });

    it('shows None specified when a key has no non-empty values after parsing', () => {
      expect(valueTransform([{ key: 'env', value: '' }])).toBe('None specified');
      expect(valueTransform([{ key: 'env', value: '  ,  ' }])).toBe('None specified');
    });

    it('formats a single selector row as a blue label', () => {
      render(<>{valueTransform([{ key: 'type', value: 'customer' }])}</>);
      expect(screen.getByText('type = customer')).toBeInTheDocument();
    });

    it('formats comma-separated values and trims keys', () => {
      render(<>{valueTransform([{ key: '  department  ', value: 'finance, HR, legal' }])}</>);
      expect(screen.getByText('department = finance, HR, legal')).toBeInTheDocument();
    });

    it('renders multiple selector rows as separate labels', () => {
      render(
        <>
          {valueTransform([
            { key: 'department', value: 'finance' },
            { key: 'type', value: 'customer' },
          ])}
        </>,
      );
      expect(screen.getByText('department = finance')).toBeInTheDocument();
      expect(screen.getByText('type = customer')).toBeInTheDocument();
    });
  });

  describe('defaultRouterExcludedNamespacesFlag', () => {
    const { valueTransform } = reviewValues.defaultRouterExcludedNamespacesFlag;

    it('shows None specified when value is empty or missing', () => {
      expect(valueTransform('')).toBe('None specified');
      expect(valueTransform(undefined)).toBe('None specified');
    });

    it('renders trimmed namespaces as blue labels', () => {
      render(<>{valueTransform('kube-system, openshift-monitoring ')}</>);
      expect(screen.getByText('kube-system')).toBeInTheDocument();
      expect(screen.getByText('openshift-monitoring')).toBeInTheDocument();
    });
  });
});
