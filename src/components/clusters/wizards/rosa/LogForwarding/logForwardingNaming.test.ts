import * as clusterRolesHelper from '~/components/clusters/wizards/rosa/ClusterRolesScreen/clusterRolesHelper';

import { createCloudWatchLogGroupName } from './logForwardingNaming';

describe('createCloudWatchLogGroupName', () => {
  it('delegates to createOperatorRolesPrefix', () => {
    const spy = jest
      .spyOn(clusterRolesHelper, 'createOperatorRolesPrefix')
      .mockReturnValue('my-rosa-cluster-mockhash');

    expect(createCloudWatchLogGroupName('my-rosa-cluster')).toBe('my-rosa-cluster-mockhash');
    expect(spy).toHaveBeenCalledWith('my-rosa-cluster');

    spy.mockRestore();
  });

  it('includes a hyphen-separated 4-character suffix', () => {
    const name = createCloudWatchLogGroupName('test-cluster');
    expect(name).toMatch(/^test-cluster-[a-z][a-z0-9]{3}$/);
  });
});
