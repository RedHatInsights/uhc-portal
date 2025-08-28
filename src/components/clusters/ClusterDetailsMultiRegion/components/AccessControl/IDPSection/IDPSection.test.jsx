import React from 'react';
import * as reactRedux from 'react-redux';

import { useFetchIDPsWithHTPUsers } from '~/queries/ClusterDetailsQueries/AccessControlTab/UserQueries/useFetchIDPsWithHTPUsers';
import { ENHANCED_HTPASSWRD } from '~/queries/featureGates/featureConstants';
import {
  checkAccessibility,
  mockUseFeatureGate,
  render,
  screen,
  userEvent,
  within,
  withState,
} from '~/testUtils';

import fixtures from '../../../__tests__/ClusterDetails.fixtures';
import { singleUserHtpasswdMessage } from '../../IdentityProvidersPage/components/HtpasswdDetails/htpasswdUtilities';

import IDPSection from './IDPSection';

jest.mock('~/queries/ClusterDetailsQueries/useFetchClusterIdentityProviders', () => ({
  useFetchClusterIdentityProviders: jest.fn(),
}));

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

jest.mock(
  '~/queries/ClusterDetailsQueries/AccessControlTab/UserQueries/useFetchIDPsWithHTPUsers',
  () => ({
    useFetchIDPsWithHTPUsers: jest.fn(),
  }),
);

const baseIDPs = {
  clusterIDPList: [],
  pending: false,
  fulfilled: true,
  error: false,
};

const clusterUrls = {
  console: 'https://console-openshift-console.apps.test-liza.wiex.s1.devshift.org',
  api: 'https://api.test-liza.wiex.s1.devshift.org:6443',
};

const openModal = jest.fn();
const props = {
  cluster: fixtures.clusterDetails.cluster,
  idpActions: {
    list: true,
    delete: true,
  },
  clusterID: '1i4counta3holamvo1g5tp6n8p3a03bq',
  subscriptionID: '1msoogsgTLQ4PePjrTOt3UqvMzX',
  identityProviders: baseIDPs,
  clusterHibernating: false,
  isReadOnly: false,
  isHypershift: false,
  openModal,
  clusterUrls,
};

describe('<IDPSection />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const useFetchIDPSWithHTPUsersMock = useFetchIDPsWithHTPUsers;

  it('should render (no IDPs)', async () => {
    useFetchIDPSWithHTPUsersMock.mockReturnValue({
      clusterIdentityProviders: [],
      isLoading: false,
      isError: false,
    });
    const { container } = render(<IDPSection {...props} />);
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
    expect(container.querySelectorAll('.pf-v6-c-skeleton').length).toBe(0);
    await checkAccessibility(container);
  });

  it('should render (IDPs pending)', async () => {
    useFetchIDPSWithHTPUsersMock.mockReturnValue({
      clusterIdentityProviders: [],
      isLoading: true,
      isError: false,
    });

    const { container } = render(<IDPSection {...props} />);
    expect(container.querySelectorAll('.pf-v6-c-skeleton').length).toBeGreaterThan(0);
    await checkAccessibility(container);
  });

  describe('should render (with IDPs)', () => {
    it('non-Hypershift cluster', async () => {
      useFetchIDPSWithHTPUsersMock.mockReturnValue({
        data: [
          {
            name: 'hello',
            type: 'GithubIdentityProvider',
            id: 'id1',
          },
          {
            name: 'hi',
            type: 'GoogleIdentityProvider',
            id: 'id2',
          },
        ],

        isLoading: false,
        isError: false,
      });
      const { container } = render(<IDPSection {...props} />);
      expect(await screen.findByRole('grid')).toBeInTheDocument();
      expect(await screen.findByRole('cell', { name: 'hi' })).toBeInTheDocument();
      expect(await screen.findByRole('cell', { name: 'hello' })).toBeInTheDocument();
      expect(container.querySelectorAll('.pf-v6-c-skeleton').length).toBe(0);

      await checkAccessibility(container);
    });

    it('Hypershift cluster', async () => {
      useFetchIDPSWithHTPUsersMock.mockReturnValue({
        data: [
          {
            name: 'hello',
            type: 'GithubIdentityProvider',
            id: 'id1',
          },
          {
            name: 'hi',
            type: 'GoogleIdentityProvider',
            id: 'id2',
          },
        ],
        isLoading: false,
        isError: false,
      });
      const newProps = { ...props, isHypershift: true };
      const { container } = render(<IDPSection {...newProps} />);
      expect(await screen.findByRole('grid')).toBeInTheDocument();
      expect(await screen.findByRole('cell', { name: 'hi' })).toBeInTheDocument();
      expect(await screen.findByRole('cell', { name: 'hello' })).toBeInTheDocument();
      expect(container.querySelectorAll('.pf-v6-c-skeleton').length).toBe(0);
      await checkAccessibility(container);
    });

    it('should call open delete IDP modal', async () => {
      const useDispatchMock = jest.spyOn(reactRedux, 'useDispatch');
      const mockedDispatch = jest.fn();
      useDispatchMock.mockReturnValue(mockedDispatch);

      useFetchIDPSWithHTPUsersMock.mockReturnValue({
        data: [
          {
            name: 'hello',
            type: 'GithubIdentityProvider',
            id: 'id1',
          },
        ],

        isLoading: false,
        isError: false,
      });

      const initialState = {
        modal: {
          modalName: 'delete-idp',
          data: {
            clusterID: 'myclusterid',
            idpId: 'id1',
            idpName: 'hello',
            idpType: 'GithubIdentityProvider',
          },
        },
      };

      withState(initialState, true).render(<IDPSection {...props} />);
      expect(await screen.findByRole('grid')).toBeInTheDocument();
      expect(await screen.findByRole('cell', { name: 'hello' })).toBeInTheDocument();
      const toggleKebab = screen.getByLabelText('Kebab toggle');
      await userEvent.click(toggleKebab);

      const deleteBtn = screen.getByRole('menuitem', { name: 'Delete' });

      await userEvent.click(deleteBtn);

      expect(mockedDispatch).toHaveBeenCalledWith({
        error: undefined,
        meta: undefined,
        type: 'OPEN_MODAL',
        payload: {
          data: {
            clusterID: '1i4counta3holamvo1g5tp6n8p3a03bq',
            idpID: 'id1',
            idpName: 'hello',
            idpType: 'GitHub',
            region: undefined,
          },
          name: 'delete-idp',
        },
      });
    });

    it('shows tooltip for idp actions where the user does not have access', async () => {
      mockUseFeatureGate([[ENHANCED_HTPASSWRD, true]]);
      useFetchIDPSWithHTPUsersMock.mockReturnValue({
        data: [
          {
            name: 'myHtpasswd',
            type: 'HTPasswdIdentityProvider',
            id: 'id2',
          },
        ],
        isLoading: false,
        isError: false,
      });
      const newProps = {
        ...props,
        isHypershift: true,
        idpActions: {
          list: true,
          update: false,
          delete: false,
        },
      };
      const { user } = render(<IDPSection {...newProps} />);
      expect(await screen.findByRole('grid')).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Kebab toggle' }));

      expect(screen.getByRole('menuitem', { name: 'Edit' })).toHaveAttribute(
        'aria-disabled',
        'true',
      );
      expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveAttribute(
        'aria-disabled',
        'true',
      );

      await user.click(screen.getByRole('menuitem', { name: 'Edit' }));

      expect(
        within(screen.getByRole('tooltip')).getByText(
          'You do not have permission to edit an identity provider.',
          {
            exact: false,
          },
        ),
      ).toBeInTheDocument();
    });

    it('shows tooltip if single user htpasswd', async () => {
      useFetchIDPSWithHTPUsersMock.mockReturnValue({
        data: [
          {
            name: 'myHtpasswd',
            type: 'HTPasswdIdentityProvider',
            id: 'id2',
            htpasswd: {
              username: 'mySingleUserName',
            },
          },
        ],
        isLoading: false,
        isError: false,
      });
      const newProps = {
        ...props,
        isHypershift: true,
        idpActions: {
          list: true,
          update: true,
          delete: true,
        },
      };
      const { user } = render(<IDPSection {...newProps} />);
      expect(await screen.findByRole('grid')).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Kebab toggle' }));

      expect(screen.getByRole('menuitem', { name: 'Edit' })).toHaveAttribute(
        'aria-disabled',
        'true',
      );

      await user.click(screen.getByRole('menuitem', { name: 'Edit' }));

      expect(
        within(screen.getByRole('tooltip')).getByText(singleUserHtpasswdMessage),
      ).toBeInTheDocument();
    });
  });
  describe('htpasswd', () => {
    const createUsers = (num) =>
      [...Array(num)].map((user, index) => ({
        kind: 'HTPasswdUser',
        id: `userId${index}`,
        username: `user${index}`,
      }));

    it('displays expandable section with htpasswd users', async () => {
      mockUseFeatureGate([[ENHANCED_HTPASSWRD, true]]);

      useFetchIDPSWithHTPUsersMock.mockReturnValue({
        data: [
          {
            name: 'hello',
            type: 'HTPasswdIdentityProvider',
            id: 'id1',
            htpUsers: createUsers(3),
          },
          {
            name: 'hi',
            type: 'HTPasswdIdentityProvider',
            id: 'id2',
          },
        ],
        isLoading: false,
        isError: false,
      });

      const newProps = {
        ...props,
        idpActions: {
          list: true,
          delete: true,
          update: true,
        },
      };

      const { container } = render(<IDPSection {...newProps} />);
      expect(await screen.findByRole('grid')).toBeInTheDocument();
      expect(await screen.findByRole('cell', { name: 'hi' })).toBeInTheDocument();
      expect(await screen.findByRole('cell', { name: 'hello' })).toBeInTheDocument();

      const expandRowToggle = screen.getByTestId('expandable-row');
      expect(expandRowToggle).toBeInTheDocument();
      expect(container.querySelectorAll('.pf-v6-c-skeleton').length).toBe(0);
      await checkAccessibility(container);
    });

    it('does not display expandable section for htpasswd users without update access', async () => {
      mockUseFeatureGate([[ENHANCED_HTPASSWRD, true]]);

      useFetchIDPSWithHTPUsersMock.mockReturnValue({
        data: [
          {
            name: 'hello',
            type: 'HTPasswdIdentityProvider',
            id: 'id1',
            htpUsers: createUsers(3),
          },
          {
            name: 'hi',
            type: 'HTPasswdIdentityProvider',
            id: 'id2',
          },
        ],
        isLoading: false,
        isError: false,
      });

      const newProps = {
        ...props,
        idpActions: {
          list: true,
          delete: true,
          update: false,
        },
      };

      render(<IDPSection {...newProps} />);
      expect(await screen.findByRole('grid')).toBeInTheDocument();
      expect(await screen.findByRole('cell', { name: 'hi' })).toBeInTheDocument();
      expect(await screen.findByRole('cell', { name: 'hello' })).toBeInTheDocument();

      const expandRowToggle = screen.queryByTestId('expandable-row');
      expect(expandRowToggle).not.toBeInTheDocument();
    });

    it('shows link of how may more users when user does have update access ', async () => {
      const newProps = {
        ...props,
        isHypershift: true,
        idpActions: {
          list: true,
          update: true,
          delete: false,
        },
      };
      useFetchIDPSWithHTPUsersMock.mockReturnValue({
        data: [
          {
            name: 'hello',
            type: 'HTPasswdIdentityProvider',
            id: 'id1',
            htpUsers: createUsers(7),
          },
        ],
      });
      const { user } = render(<IDPSection {...newProps} />);

      await user.click(screen.getByRole('button', { name: 'Details' }));

      const listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(6);

      expect(within(listItems[listItems.length - 1]).getByRole('link')).toHaveTextContent(
        'View all users (7)',
      );
    });
  });
});
