import * as utils from './utils';

describe('machinePools utils', () => {
  describe('getMaxNodeCountForMachinePool', () => {
    const selectedMPNodes = 1;
    const existingNodes = 4; // total from below)

    const defaultArgs = {
      cluster: {
        hypershift: { enabled: true },
        multi_az: false,
        ccs: { enabled: true }, // isByoc
        cloud_provider: { id: 'aws' },
        billing_model: 'marketplace-aws',
        product: { id: 'ROSA' },
        version: { raw_id: '4.16.0' },
      },
      machineTypeId: 'm5.xlarge',
      machinePools: [
        {
          autoscaling: { max_replicas: selectedMPNodes },
          id: 'workers-1',
          instance_type: 'm5.xlarge',
        },
        {
          autoscaling: { max_replicas: 1 },
          id: 'workers-2',
          instance_type: 'm5.xlarge',
        },
        {
          replicas: 2,
          id: 'workers-3',
          instance_type: 'm5.xlarge',
        },
      ],
      minNodes: 1,
      editMachinePoolId: 'workers-1',
    } as unknown as utils.GetMaxNodeCountForMachinePoolParams;

    const maxNodesHCP = utils.getMaxSupportedNodesHCP(defaultArgs.cluster.version?.raw_id);

    // In order to make  testing a little easier, mocking quota method
    const getAvailableQuotaMock = jest.spyOn(utils, 'getAvailableQuota').mockReturnValue(50990);
    afterAll(() => {
      getAvailableQuotaMock.mockReset();
    });
    describe('Adding a new machine pool', () => {
      const newMachinePoolArgs = {
        ...defaultArgs,
        editMachinePoolId: undefined,
      };
      it('returns expected max node count if hypershift and all same machine type', () => {
        const maxNodeCount = utils.getMaxNodeCountForMachinePool(newMachinePoolArgs);

        const expectedMaxNodes = maxNodesHCP - existingNodes;
        expect(maxNodeCount).toBe(expectedMaxNodes);
      });

      it('returns expected max node count if hypershift and different machine types', () => {
        const newMachinePoolArgsPlus = {
          ...newMachinePoolArgs,
          machinePools: [
            ...defaultArgs.machinePools,
            {
              replicas: 3,
              id: 'workers-3',
              instance_type: 'm5.myothertype',
            },
          ],
        };
        const maxNodeCount = utils.getMaxNodeCountForMachinePool(newMachinePoolArgsPlus);

        const expectedMaxNodes = maxNodesHCP - existingNodes - 3; // "3" is from machine pool added in this test
        expect(maxNodeCount).toBe(expectedMaxNodes);
      });

      it('returns expected max node count if not hypershift and all same machine type', () => {
        const newMachinePoolArgsNotHCP = {
          ...newMachinePoolArgs,
          cluster: {
            ...defaultArgs.cluster,
            hypershift: { enabled: false },
          },
        };

        const maxNodeCount = utils.getMaxNodeCountForMachinePool(newMachinePoolArgsNotHCP);

        const expectedMaxNodes = utils.getMaxWorkerNodes(defaultArgs.cluster.version?.raw_id);
        expect(maxNodeCount).toBe(expectedMaxNodes);
      });

      it('returns expected max node count if not hypershift and different machine types', () => {
        const newMachinePoolArgsNotHCP = {
          ...newMachinePoolArgs,
          cluster: {
            ...defaultArgs.cluster,
            hypershift: { enabled: false },
          },
          machinePools: [
            ...defaultArgs.machinePools,
            {
              replicas: 3,
              id: 'workers-3',
              instance_type: 'm5.myothertype',
            },
          ],
        };

        const maxNodeCount = utils.getMaxNodeCountForMachinePool(newMachinePoolArgsNotHCP);

        const expectedMaxNodes = utils.getMaxWorkerNodes(defaultArgs.cluster.version?.raw_id);
        expect(maxNodeCount).toBe(expectedMaxNodes);
      });
    });

    describe('Editing an existing machine pool', () => {
      it('returns expected max node count if hypershift and all same machine type', () => {
        const maxNodeCount = utils.getMaxNodeCountForMachinePool(defaultArgs);

        const expectedMaxNodes = maxNodesHCP - existingNodes + selectedMPNodes;
        expect(maxNodeCount).toBe(expectedMaxNodes);
      });

      it('returns expected max node count if hypershift and different machine types', () => {
        const newMachinePoolReplicas = 3;

        const newMachinePoolArgsPlus = {
          ...defaultArgs,
          machinePools: [
            ...defaultArgs.machinePools,
            {
              replicas: newMachinePoolReplicas,
              id: 'workers-3',
              instance_type: 'm5.myothertype',
            },
          ],
        };
        const maxNodeCount = utils.getMaxNodeCountForMachinePool(newMachinePoolArgsPlus);

        const existingNodesWithNewMP = existingNodes + newMachinePoolReplicas;
        const expectedMaxNodes = maxNodesHCP - existingNodesWithNewMP + selectedMPNodes;
        expect(maxNodeCount).toBe(expectedMaxNodes);
      });

      it('returns expected max node count if not hypershift and all same machine type', () => {
        const newMachinePoolArgsNotHCP = {
          ...defaultArgs,
          cluster: {
            ...defaultArgs.cluster,
            hypershift: { enabled: false },
          },
        };

        const maxNodeCount = utils.getMaxNodeCountForMachinePool(newMachinePoolArgsNotHCP);

        const expectedMaxNodes = utils.getMaxWorkerNodes(defaultArgs.cluster.version?.raw_id);
        expect(maxNodeCount).toBe(expectedMaxNodes);
      });

      it('returns expected max node count if not hypershift and different machine types', () => {
        const newMachinePoolArgsNotHCP = {
          ...defaultArgs,
          cluster: {
            ...defaultArgs.cluster,
            hypershift: { enabled: false },
          },
          machinePools: [
            ...defaultArgs.machinePools,
            {
              replicas: 3,
              id: 'workers-3',
              instance_type: 'm5.myothertype',
            },
          ],
        };

        const maxNodeCount = utils.getMaxNodeCountForMachinePool(newMachinePoolArgsNotHCP);

        const expectedMaxNodes = utils.getMaxWorkerNodes(defaultArgs.cluster.version?.raw_id);
        expect(maxNodeCount).toBe(expectedMaxNodes);
      });
    });

    describe('getMaxSupportedNodesHCP', () => {
      it.each([
        ['returns the default max nodes for HCP', '4.16.0', 500],
        ['version 4.14.19 gets insufficient version', '4.14.19', 90],
        ['version 4.15.14 gets insufficient version', '4.15.14', 90],
        ['version 4.14.19 gets insufficient version and max nodes', '4.14.19', 90],
        ['version 4.15.14 gets insufficient version and max nodes', '4.15.14', 90],
        ['version 4.16.0 allows 500 nodes', '4.16.0', 500],
        ['undefined version and undefined options gets default version', undefined, 500],
        ['undefined version and max nodes 500', undefined, 500],
        ['version 4.14.28 (4.14.x boundary) allows 500 nodes', '4.14.28', 500],
        ['version 4.14.27 (one below 4.14.x boundary) returns 90', '4.14.27', 90],
        ['version 4.15.15 (4.15.x boundary) allows 500 nodes', '4.15.15', 500],
        ['version 5.0.0 allows 500 nodes', '5.0.0', 500],
        ['version 5.1.0 allows 500 nodes', '5.1.0', 500],
        ['version 5.10.0 allows 500 nodes (not confused with 5.1)', '5.10.0', 500],
        ['version 5.10.5 allows 500 nodes', '5.10.5', 500],
      ])('%s', (_title: string, version: string | undefined, exptected: number) => {
        // Act
        const result = utils.getMaxSupportedNodesHCP(version);

        // Assert
        expect(result).toEqual(exptected);
      });
    });
    describe('getMaxNodes', () => {
      it.each([
        [
          'returns 249 + masterNodes + infraNodes for 4.15.0 single AZ',
          '4.15.0',
          false,
          249 + 3 + 2,
        ],
        ['returns 249 + masterNodes + infraNodes for 4.15.0 multi AZ', '4.15.0', true, 249 + 3 + 3],
        [
          'returns 249 + masterNodes + infraNodes for 4.14.16 single AZ',
          '4.14.16',
          false,
          249 + 3 + 2,
        ],
        [
          'returns 249 + masterNodes + infraNodes for 4.14.16 multi AZ',
          '4.14.16',
          true,
          249 + 3 + 3,
        ],
        [
          'returns 249 + masterNodes + infraNodes for 4.14.14 single AZ',
          '4.14.14',
          false,
          249 + 3 + 2,
        ],
        [
          'returns 249 + masterNodes + infraNodes for 4.14.14 multi AZ',
          '4.14.14',
          true,
          249 + 3 + 3,
        ],
        [
          'returns 180 + masterNodes + infraNodes for 4.14.12 single AZ',
          '4.14.12',
          false,
          180 + 3 + 2,
        ],
        [
          'returns 180 + masterNodes + infraNodes for 4.14.12 multi AZ',
          '4.14.12',
          true,
          180 + 3 + 3,
        ],
        [
          'returns 180 + masterNodes + infraNodes for 4.13.0 single AZ',
          '4.13.0',
          false,
          180 + 3 + 2,
        ],
        ['returns 180 + masterNodes + infraNodes for 4.13.0 multi AZ', '4.13.0', true, 180 + 3 + 3],
      ])('%s', (_title: string, version: string, isMultiAZ: boolean, exptected: number) => {
        // Act
        const result = utils.getMaxNodesTotalDefaultAutoscaler(version, isMultiAZ);

        // Assert
        expect(result).toEqual(exptected);
      });
    });
  });

  describe('getWorkerNodeVolumeSizeMinGiB', () => {
    it.each([
      ['returns 75 for ROSA HCP', true, 75],
      ['returns 128 for ROSA classic', false, 128],
    ])('%s', (_title, isHypershift, expected) => {
      const result = utils.getWorkerNodeVolumeSizeMinGiB(isHypershift);
      expect(result).toEqual(expected);
    });
  });

  describe('getWorkerNodeVolumeSizeMaxGiB', () => {
    it.each([
      ['returns 1024 by default, when version string is empty', '', 1024],
      ['returns 1024 when major version is lower than 4', '3.0.0', 1024],
      ['returns 1024 when major version is 4 and minor version is lower than 14', '4.13.0', 1024],
      ['returns 16384 when major version is higher than 4', '5.0.0', 16384],
      ['returns 16384 when major version is 4 and minor version is 14', '4.14.0', 16384],
      [
        'returns 16384 when major version is 4 and minor version is higher than 14',
        '4.15.0',
        16384,
      ],
    ])('%s', (_title, version, expected) => {
      const result = utils.getWorkerNodeVolumeSizeMaxGiB(version);
      expect(result).toEqual(expected);
    });
  });

  describe('getMaxWorkerNodes', () => {
    it.each([
      ['version 4.16.0 returns 249', '4.16.0', 249],
      ['version 4.15.0 returns 249', '4.15.0', 249],
      ['version 4.14.14 (boundary) returns 249', '4.14.14', 249],
      ['version 4.14.13 (one below boundary) returns 180', '4.14.13', 180],
      ['version 4.14.0 returns 180', '4.14.0', 180],
      ['version 4.13.0 returns 180', '4.13.0', 180],
      ['version 4.9.0 returns 180', '4.9.0', 180],
      ['undefined version returns 180', undefined, 180],
      ['version 5.0.0 returns 249', '5.0.0', 249],
      ['version 5.1.0 returns 249', '5.1.0', 249],
      ['version 5.10.0 returns 249 (not confused with 5.1)', '5.10.0', 249],
      ['version 5.10.5 returns 249', '5.10.5', 249],
    ])('%s', (_title: string, version: string | undefined, expected: number) => {
      const result = utils.getMaxWorkerNodes(version);
      expect(result).toBe(expected);
    });
  });

  describe('getMaxNodeCount', () => {
    const baseArgs = {
      available: 100,
      isEditingCluster: false,
      currentNodeCount: 0,
      minNodes: 2,
      included: 0,
      clusterVersion: '4.16.0' as string | undefined,
    };

    it('is not capped when available count is below the HCP version ceiling', () => {
      const result = utils.getMaxNodeCount({ ...baseArgs, isHypershift: true, available: 100 });
      expect(result).toBe(100);
    });

    it('caps at HCP ceiling (500) when quota exceeds version limit', () => {
      const result = utils.getMaxNodeCount({ ...baseArgs, isHypershift: true, available: 600 });
      expect(result).toBe(500);
    });

    it('caps at HCP insufficient-version ceiling (90)', () => {
      const result = utils.getMaxNodeCount({
        ...baseArgs,
        isHypershift: true,
        clusterVersion: '4.14.19',
        available: 200,
      });
      expect(result).toBe(90);
    });

    it('is not capped when available count is below the Classic version ceiling', () => {
      const result = utils.getMaxNodeCount({ ...baseArgs, isHypershift: false, available: 100 });
      expect(result).toBe(100);
    });

    it('caps at Classic ceiling (249) when quota exceeds version limit', () => {
      const result = utils.getMaxNodeCount({ ...baseArgs, isHypershift: false, available: 300 });
      expect(result).toBe(249);
    });

    it('caps at Classic insufficient-version ceiling (180)', () => {
      const result = utils.getMaxNodeCount({
        ...baseArgs,
        isHypershift: false,
        clusterVersion: '4.14.12',
        available: 300,
      });
      expect(result).toBe(180);
    });

    it('returns HCP version ceiling when available is Infinity (quota bypass)', () => {
      const result = utils.getMaxNodeCount({
        ...baseArgs,
        isHypershift: true,
        available: Infinity,
      });
      expect(result).toBe(500);
    });

    it('returns Classic version ceiling when available is Infinity (quota bypass)', () => {
      const result = utils.getMaxNodeCount({
        ...baseArgs,
        isHypershift: false,
        available: Infinity,
      });
      expect(result).toBe(249);
    });

    it('floors result to nearest multiple of increment for HCP with 3 pools', () => {
      // floor(500 / 3) * 3 = 498; caller then divides by 3 to get 166 per pool
      const result = utils.getMaxNodeCount({
        ...baseArgs,
        isHypershift: true,
        available: Infinity,
        increment: 3,
      });
      expect(result).toBe(498);
    });

    it('floors result to nearest multiple of increment when quota is not a multiple', () => {
      // available=100 < ceiling; floor(100 / 3) * 3 = 99
      const result = utils.getMaxNodeCount({
        ...baseArgs,
        isHypershift: false,
        available: 100,
        increment: 3,
      });
      expect(result).toBe(99);
    });

    it('adds included nodes to available when not editing', () => {
      // non-editing path: maxValue = available + included
      const result = utils.getMaxNodeCount({
        ...baseArgs,
        isHypershift: true,
        available: 90,
        included: 4,
      });
      expect(result).toBe(94);
    });

    it('uses available + currentNodeCount for Classic edit without HCP cap', () => {
      // Classic edit: maxValue = available + currentNodeCount, HCP cap is skipped
      const result = utils.getMaxNodeCount({
        ...baseArgs,
        isHypershift: false,
        isEditingCluster: true,
        available: 100,
        currentNodeCount: 50,
      });
      expect(result).toBe(150);
    });

    it('caps HCP edit-mode result to maxNodesHCP minus other-pool node count', () => {
      // currentNodeCount=450 (other pools) + available=100 would give 550, capped to 500 by version
      // limit, then further capped to maxNodesHCP - currentNodeCount = 500 - 450 = 50
      const result = utils.getMaxNodeCount({
        isHypershift: true,
        isEditingCluster: true,
        available: 100,
        currentNodeCount: 450,
        included: 0,
        minNodes: 2,
        clusterVersion: '4.16.0',
      });
      expect(result).toBe(50);
    });

    it('falls back to minNodes when quota is zero and not editing', () => {
      const result = utils.getMaxNodeCount({ ...baseArgs, available: 0, isEditingCluster: false });
      expect(result).toBe(baseArgs.minNodes);
    });
  });
});
