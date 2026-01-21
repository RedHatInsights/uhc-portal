import React from 'react';
import { Form, Formik } from 'formik';

import { FieldId } from '~/components/clusters/wizards/rosa/constants';
import SharedVPCField from '~/components/clusters/wizards/rosa/NetworkingSection/SharedVPCField';
import { clusterService } from '~/services';
import { checkAccessibility, screen, waitFor, withState } from '~/testUtils';

const dnsDomains = [
  {
    Kind: 'DnsDomain',
    id: '1234.s1.devshift.org',
    href: '/api/clusters_mgmt/v1/dns_domains/1234.s1.devshift.org',
    organization: {
      kind: 'OrganizationLink',
      id: 'mD3zE0uSJQTQLS0JHEpEJ7AfQpM',
      href: '/api/accounts_mgmt/v1/organizations/mD3zE0uSJQTQLS0JHEpEJ7AfQpM',
    },
    user_defined: true,
  },
  {
    Kind: 'DnsDomain',
    id: 'abcd.s1.devshift.org',
    href: '/api/clusters_mgmt/v1/dns_domains/abcd.s1.devshift.org',
    organization: {
      kind: 'OrganizationLink',
      id: 'mD3zE0uSJQTQLS0JHEpEJ7AfQpM',
      href: '/api/accounts_mgmt/v1/organizations/mD3zE0uSJQTQLS0JHEpEJ7AfQpM',
    },
    user_defined: true,
  },
  {
    Kind: 'DnsDomain',
    id: 'efgh.s1.devshift.org',
    href: '/api/clusters_mgmt/v1/dns_domains/efgh.s1.devshift.org',
    organization: {
      kind: 'OrganizationLink',
      id: 'mD3zE0uSJQTQLS0JHEpEJ7AfQpM',
      href: '/api/accounts_mgmt/v1/organizations/mD3zE0uSJQTQLS0JHEpEJ7AfQpM',
    },
    user_defined: true,
  },
];

const newDomain = {
  Kind: 'DnsDomain',
  id: 'neww.s1.devshift.org',
  href: '/api/clusters_mgmt/v1/dns_domains/neww.s1.devshift.org',
  organization: {
    kind: 'OrganizationLink',
    id: 'mD3zE0uSJQTQLS0JHEpEJ7AfQpM',
    href: '/api/accounts_mgmt/v1/organizations/mD3zE0uSJQTQLS0JHEpEJ7AfQpM',
  },
  user_defined: true,
};

const baseState = {
  dnsDomains: {
    error: false,
    pending: false,
    fulfilled: true,
    isUpdatingDomains: false,
    createdDnsId: '',
    deletedDnsId: '',
    items: dnsDomains,
  },
};

const initialFormValue = {
  [FieldId.SharedVpc]: {
    is_allowed: true,
    is_selected: false,
    base_dns_domain: '',
    hosted_zone_id: '',
    hosted_zone_role_arn: '',
  },
};

jest.mock('~/services/clusterService');
clusterService.getDnsDomains = jest.fn();
clusterService.createNewDnsDomain = jest.fn();
clusterService.deleteDnsDomain = jest.fn();

describe('<SharedVPCField />', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('is accessible', async () => {
    const { container } = withState(baseState).render(
      <Formik onSubmit={() => {}} initialValues={{}}>
        <SharedVPCField hostedZoneDomainName="" />
      </Formik>,
    );

    await checkAccessibility(container);
  });

  it('handles filling out the form with values', async () => {
    const handleSubmit = jest.fn();
    const privateHostedZone = 'Z123';
    const vpcRole = 'arn:aws:iam::123456789012:role/role-name';
    const { user } = withState(baseState).render(
      <Formik onSubmit={handleSubmit} initialValues={initialFormValue}>
        <Form>
          <SharedVPCField hostedZoneDomainName="" />
          <button type="submit">Submit</button>
        </Form>
      </Formik>,
    );

    expect(await screen.findByText('Base DNS domain'));

    await user.click(screen.getByRole('button', { name: 'Options menu' }));
    await user.click(screen.getByRole('option', { name: dnsDomains[0].id }));
    await user.type(
      screen.getByRole('textbox', {
        name: /private hosted zone id/i,
      }),
      privateHostedZone,
    );
    await user.type(
      screen.getByRole('textbox', {
        name: /shared vpc role/i,
      }),
      vpcRole,
    );

    await user.click(screen.getByRole('button', { name: /submit/i }));

    expect(screen.queryByText(/field is required\./i)).not.toBeInTheDocument();

    expect(handleSubmit).toHaveBeenCalledTimes(1);
    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        [FieldId.SharedVpc]: {
          base_dns_domain: dnsDomains[0].id,
          hosted_zone_id: privateHostedZone,
          hosted_zone_role_arn: vpcRole,
          is_allowed: true,
          is_selected: false,
        },
      }),
      expect.anything(),
    );
  }, 40_000);

  it('validates required fields', async () => {
    const handleSubmit = jest.fn();
    const { user } = withState(baseState).render(
      <Formik onSubmit={handleSubmit} initialValues={initialFormValue}>
        <Form>
          <SharedVPCField hostedZoneDomainName="" />
          <button type="submit">Submit</button>
        </Form>
      </Formik>,
    );

    expect(await screen.findByText('Base DNS domain'));

    await user.click(screen.getByRole('button', { name: /submit/i }));

    expect(await screen.findAllByText(/field is required/i)).toHaveLength(3);
  });

  describe('DNS Domain (SharedVPCDomainSelect)', () => {
    const dnsDomainLabel = 'Base DNS domain';
    const dnsDomainPlaceholder = 'Select base DNS domain';
    const reservingDomainPlaceholder = 'Reserving new base DNS domain...';

    it('shows the default field name and placeholder', async () => {
      withState(baseState).render(
        <Formik onSubmit={() => {}} initialValues={initialFormValue}>
          <SharedVPCField hostedZoneDomainName="" />
        </Formik>,
      );

      expect(await screen.findByText(dnsDomainLabel));
      expect(screen.getByText(dnsDomainPlaceholder));
    });

    it('shows a list of available DNS domains', async () => {
      const { user } = withState(baseState).render(
        <Formik onSubmit={() => {}} initialValues={initialFormValue}>
          <SharedVPCField hostedZoneDomainName="" />
        </Formik>,
      );

      expect(await screen.findByText(dnsDomainLabel));
      expect(screen.getByRole('button', { name: 'Options menu' })).toBeInTheDocument();
      expect(clusterService.getDnsDomains).toHaveBeenCalledTimes(1);

      await user.click(screen.getByRole('button', { name: 'Options menu' }));

      expect(await screen.findAllByRole('option')).toHaveLength(dnsDomains.length);
      dnsDomains.forEach((dnsDomain) => {
        expect(screen.getByRole('option', { name: dnsDomain.id })).toBeInTheDocument();
      });
    });

    it('allows to select a DNS domain option', async () => {
      const { user } = withState(baseState).render(
        <Formik onSubmit={() => {}} initialValues={initialFormValue}>
          <SharedVPCField hostedZoneDomainName="" />
        </Formik>,
      );

      expect(await screen.findByText(dnsDomainLabel));
      expect(screen.queryByText(dnsDomains[0].id)).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Options menu' }));

      await user.click(screen.getByRole('option', { name: dnsDomains[0].id }));

      await waitFor(() => {
        expect(screen.queryByRole('option')).not.toBeInTheDocument();
      });
      expect(screen.getByText(dnsDomains[0].id)).toBeInTheDocument();
    });

    it('shows a loading message when creating a new dns domain', async () => {
      (clusterService.createNewDnsDomain as jest.Mock).mockReturnValue(
        new Promise((_resolve) => {}),
      );

      const { user } = withState(baseState).render(
        <Formik onSubmit={() => {}} initialValues={initialFormValue}>
          <SharedVPCField hostedZoneDomainName="" />
        </Formik>,
      );

      expect(await screen.findByText(dnsDomainLabel));
      expect(screen.getByText(dnsDomainPlaceholder));
      expect(screen.queryByText(reservingDomainPlaceholder)).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Options menu' }));
      await user.click(
        screen.getByRole('button', {
          name: /reserve new base dns domain/i,
        }),
      );

      expect(clusterService.createNewDnsDomain).toHaveBeenCalledTimes(1);
      expect(await screen.findByText(reservingDomainPlaceholder)).toBeInTheDocument();
      expect(screen.queryByText(dnsDomainPlaceholder)).not.toBeInTheDocument();
    });
    it('selects the newly created dns domain automatically', async () => {
      (clusterService.createNewDnsDomain as jest.Mock).mockReturnValue(
        new Promise((resolve) => {
          resolve({
            status: 200,
            statusText: '',
            headers: {},
            data: newDomain,
            config: {},
          });
        }),
      );

      const { user } = withState(baseState).render(
        <Formik onSubmit={() => {}} initialValues={{}}>
          <SharedVPCField hostedZoneDomainName="" />
        </Formik>,
      );

      expect(await screen.findByText(dnsDomainLabel));
      expect(screen.getByText(dnsDomainPlaceholder)).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Options menu' }));
      await user.click(
        screen.getByRole('button', {
          name: /reserve new base dns domain/i,
        }),
      );

      expect(await screen.findByText(newDomain.id)).toBeInTheDocument();
      await waitFor(() => {
        expect(screen.queryByRole('option')).not.toBeInTheDocument();
      });
      expect(screen.queryByText(dnsDomainPlaceholder)).not.toBeInTheDocument();
    });

    it('handle deleting a dns configuration', async () => {
      (clusterService.deleteDnsDomain as jest.Mock).mockReturnValue(
        new Promise((resolve) => {
          resolve({});
        }),
      );

      const { user } = withState(baseState).render(
        <Formik
          onSubmit={() => {}}
          initialValues={{
            [FieldId.SharedVpc]: {
              base_dns_domain: dnsDomains[0].id,
            },
          }}
        >
          <SharedVPCField hostedZoneDomainName="" />
        </Formik>,
      );

      expect(await screen.findByText(dnsDomainLabel));
      expect(screen.queryByText(dnsDomainPlaceholder)).not.toBeInTheDocument();
      expect(screen.getByText(dnsDomains[0].id)).toBeInTheDocument();

      await user.click(
        screen.getByRole('button', {
          name: /delete/i,
        }),
      );
      expect(clusterService.deleteDnsDomain).toHaveBeenCalledTimes(1);
      expect(clusterService.deleteDnsDomain).toHaveBeenCalledWith(dnsDomains[0].id);

      expect(await screen.findByText(dnsDomainPlaceholder)).toBeInTheDocument();
      expect(screen.queryByRole('option')).not.toBeInTheDocument();
    });
  });
});
