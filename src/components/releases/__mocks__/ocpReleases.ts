import { Graph } from '~/types/upgrades_info.v1';

const ocpReleases: { data: Graph } = {
  data: {
    nodes: [
      {
        version: '4.5.1',
        payload:
          'quay.io/openshift-release-dev/ocp-release@sha256:a656048696e79a30f0536f5acd5a1e8ec5ae331d4c7d21ca62bc8de412c79dc4',
        metadata: {
          description: '',
          'io.openshift.upgrades.graph.previous.remove_regex': '.*',
          'io.openshift.upgrades.graph.release.channels':
            'candidate-4.5,fast-4.5,stable-4.5,candidate-4.6,fast-4.6,stable-4.6',
          'io.openshift.upgrades.graph.release.manifestref':
            'sha256:a656048696e79a30f0536f5acd5a1e8ec5ae331d4c7d21ca62bc8de412c79dc4',
          url: 'https://access.redhat.com/errata/RHBA-2020:2409',
        },
      },
      {
        version: '4.5.21',
        payload:
          'quay.io/openshift-release-dev/ocp-release@sha256:7684a3daa92827b313a682b3615f2a348a941f8557b5b509b736226f40e01e07',
        metadata: {
          description: '',
          'io.openshift.upgrades.graph.release.channels':
            'candidate-4.5,fast-4.5,stable-4.5,candidate-4.6,fast-4.6,stable-4.6',
          'io.openshift.upgrades.graph.release.manifestref':
            'sha256:7684a3daa92827b313a682b3615f2a348a941f8557b5b509b736226f40e01e07',
          url: 'https://access.redhat.com/errata/RHSA-2020:5194',
        },
      },
      {
        version: '4.5.23',
        payload:
          'quay.io/openshift-release-dev/ocp-release@sha256:368970a5052e600b467de7ab2868a04cdd6cdb991eb9dfbf3473a199d6fe4a4e',
        metadata: {
          description: '',
          'io.openshift.upgrades.graph.release.channels':
            'candidate-4.5,fast-4.5,stable-4.5,candidate-4.6,fast-4.6,stable-4.6',
          'io.openshift.upgrades.graph.release.manifestref':
            'sha256:368970a5052e600b467de7ab2868a04cdd6cdb991eb9dfbf3473a199d6fe4a4e',
          url: 'https://access.redhat.com/errata/RHSA-2020:5359',
        },
      },
      {
        version: '4.5.5',
        payload:
          'quay.io/openshift-release-dev/ocp-release@sha256:a58573e1c92f5258219022ec104ec254ded0a70370ee8ed2aceea52525639bd4',
        metadata: {
          description: '',
          'io.openshift.upgrades.graph.release.channels':
            'candidate-4.5,fast-4.5,stable-4.5,candidate-4.6,fast-4.6,stable-4.6',
          'io.openshift.upgrades.graph.release.manifestref':
            'sha256:a58573e1c92f5258219022ec104ec254ded0a70370ee8ed2aceea52525639bd4',
          url: 'https://access.redhat.com/errata/RHBA-2020:3188',
        },
      },
      {
        version: '4.5.20',
        payload:
          'quay.io/openshift-release-dev/ocp-release@sha256:78b878986d2d0af6037d637aa63e7b6f80fc8f17d0f0d5b077ac6aca83f792a0',
        metadata: {
          description: '',
          'io.openshift.upgrades.graph.release.channels':
            'candidate-4.5,fast-4.5,stable-4.5,candidate-4.6,fast-4.6,stable-4.6',
          'io.openshift.upgrades.graph.release.manifestref':
            'sha256:78b878986d2d0af6037d637aa63e7b6f80fc8f17d0f0d5b077ac6aca83f792a0',
          url: 'https://access.redhat.com/errata/RHBA-2020:5118',
        },
      },
      {
        version: '4.6.1',
        payload:
          'quay.io/openshift-release-dev/ocp-release@sha256:d78292e9730dd387ff6198197c8b0598da340be7678e8e1e4810b557a926c2b9',
        metadata: {
          description: '',
          'io.openshift.upgrades.graph.previous.remove_regex': '4\\.5\\..*',
          'io.openshift.upgrades.graph.release.channels':
            'candidate-4.6,eus-4.6,fast-4.6,stable-4.6',
          'io.openshift.upgrades.graph.release.manifestref':
            'sha256:d78292e9730dd387ff6198197c8b0598da340be7678e8e1e4810b557a926c2b9',
          url: 'https://access.redhat.com/errata/RHBA-2020:4196',
        },
      },
      {
        version: '4.5.22',
        payload:
          'quay.io/openshift-release-dev/ocp-release@sha256:38d0bcb5443666b93a0c117f41ce5d5d8b3602b411c574f4e164054c43408a01',
        metadata: {
          description: '',
          'io.openshift.upgrades.graph.release.channels':
            'candidate-4.5,fast-4.5,stable-4.5,candidate-4.6,fast-4.6,stable-4.6',
          'io.openshift.upgrades.graph.release.manifestref':
            'sha256:38d0bcb5443666b93a0c117f41ce5d5d8b3602b411c574f4e164054c43408a01',
          url: 'https://access.redhat.com/errata/RHBA-2020:5250',
        },
      },
      {
        version: '4.5.17',
        payload:
          'quay.io/openshift-release-dev/ocp-release@sha256:6dde1b3ad6bec35364b2b89172cfea0459df75c99a4031f6f7b2a94eb9b166cf',
        metadata: {
          description: '',
          'io.openshift.upgrades.graph.release.channels':
            'candidate-4.5,fast-4.5,stable-4.5,candidate-4.6,fast-4.6,stable-4.6',
          'io.openshift.upgrades.graph.release.manifestref':
            'sha256:6dde1b3ad6bec35364b2b89172cfea0459df75c99a4031f6f7b2a94eb9b166cf',
          url: 'https://access.redhat.com/errata/RHBA-2020:4325',
        },
      },
      {
        version: '4.5.19',
        payload:
          'quay.io/openshift-release-dev/ocp-release@sha256:bae5510f19324d8e9c313aaba767e93c3a311902f5358fe2569e380544d9113e',
        metadata: {
          description: '',
          'io.openshift.upgrades.graph.release.channels':
            'candidate-4.5,fast-4.5,stable-4.5,candidate-4.6,fast-4.6,stable-4.6',
          'io.openshift.upgrades.graph.release.manifestref':
            'sha256:bae5510f19324d8e9c313aaba767e93c3a311902f5358fe2569e380544d9113e',
          url: 'https://access.redhat.com/errata/RHBA-2020:5051',
        },
      },
      {
        version: '4.5.10',
        payload:
          'quay.io/openshift-release-dev/ocp-release@sha256:272a00b3dc91e1a8e45370969d4300f17bc89bc5cefb0f938f6c1b69333fe371',
        metadata: {
          description: '',
          'io.openshift.upgrades.graph.release.channels':
            'candidate-4.5,fast-4.5,candidate-4.6,fast-4.6,stable-4.6',
          'io.openshift.upgrades.graph.release.manifestref':
            'sha256:272a00b3dc91e1a8e45370969d4300f17bc89bc5cefb0f938f6c1b69333fe371',
          url: 'https://access.redhat.com/errata/RHBA-2020:3719',
        },
      },
      {
        version: '4.5.6',
        payload:
          'quay.io/openshift-release-dev/ocp-release@sha256:0147ab7622969c1cde71e8e5eb8796e8245137fdbf3a5cae63017189a9060f86',
        metadata: {
          description: '',
          'io.openshift.upgrades.graph.previous.remove_regex': '4\\.4\\.1[12]',
          'io.openshift.upgrades.graph.release.channels':
            'candidate-4.5,fast-4.5,stable-4.5,candidate-4.6,fast-4.6,stable-4.6',
          'io.openshift.upgrades.graph.release.manifestref':
            'sha256:0147ab7622969c1cde71e8e5eb8796e8245137fdbf3a5cae63017189a9060f86',
          url: 'https://access.redhat.com/errata/RHBA-2020:3330',
        },
      },
      {
        version: '4.5.18',
        payload:
          'quay.io/openshift-release-dev/ocp-release@sha256:72e3a1029884c70c584a0cadc00c36ee10764182425262fb23f77f32732ef366',
        metadata: {
          description: '',
          'io.openshift.upgrades.graph.release.channels':
            'candidate-4.5,fast-4.5,stable-4.5,candidate-4.6,fast-4.6,stable-4.6',
          'io.openshift.upgrades.graph.release.manifestref':
            'sha256:72e3a1029884c70c584a0cadc00c36ee10764182425262fb23f77f32732ef366',
          url: 'https://access.redhat.com/errata/RHBA-2020:4425',
        },
      },
      {
        version: '4.6.6',
        payload:
          'quay.io/openshift-release-dev/ocp-release@sha256:c7e8f18e8116356701bd23ae3a23fb9892dd5ea66c8300662ef30563d7104f39',
        metadata: {
          'io.openshift.upgrades.graph.previous.remove_regex': '.*',
          'io.openshift.upgrades.graph.release.channels':
            'candidate-4.6,eus-4.6,fast-4.6,stable-4.6,candidate-4.7',
          'io.openshift.upgrades.graph.release.manifestref':
            'sha256:c7e8f18e8116356701bd23ae3a23fb9892dd5ea66c8300662ef30563d7104f39',
        },
      },
      {
        version: '4.5.8',
        payload:
          'quay.io/openshift-release-dev/ocp-release@sha256:ae61753ad8c8a26ed67fa233eea578194600d6c72622edab2516879cfbf019fd',
        metadata: {
          description: '',
          'io.openshift.upgrades.graph.release.channels':
            'candidate-4.5,fast-4.5,stable-4.5,candidate-4.6,fast-4.6,stable-4.6',
          'io.openshift.upgrades.graph.release.manifestref':
            'sha256:ae61753ad8c8a26ed67fa233eea578194600d6c72622edab2516879cfbf019fd',
          url: 'https://access.redhat.com/errata/RHBA-2020:3510',
        },
      },
      {
        version: '4.5.3',
        payload:
          'quay.io/openshift-release-dev/ocp-release@sha256:eab93b4591699a5a4ff50ad3517892653f04fb840127895bb3609b3cc68f98f3',
        metadata: {
          description: '',
          'io.openshift.upgrades.graph.previous.remove_regex': '.*',
          'io.openshift.upgrades.graph.release.channels':
            'candidate-4.5,fast-4.5,stable-4.5,candidate-4.6,fast-4.6,stable-4.6',
          'io.openshift.upgrades.graph.release.manifestref':
            'sha256:eab93b4591699a5a4ff50ad3517892653f04fb840127895bb3609b3cc68f98f3',
          url: 'https://access.redhat.com/errata/RHBA-2020:2956',
        },
      },
      {
        version: '4.5.2',
        payload:
          'quay.io/openshift-release-dev/ocp-release@sha256:8f923b7b8efdeac619eb0e7697106c1d17dd3d262c49d8742b38600417cf7d1d',
        metadata: {
          description: '',
          'io.openshift.upgrades.graph.previous.remove_regex': '.*',
          'io.openshift.upgrades.graph.release.channels':
            'candidate-4.5,fast-4.5,stable-4.5,candidate-4.6,fast-4.6,stable-4.6',
          'io.openshift.upgrades.graph.release.manifestref':
            'sha256:8f923b7b8efdeac619eb0e7697106c1d17dd3d262c49d8742b38600417cf7d1d',
          url: 'https://access.redhat.com/errata/RHBA-2020:2909',
        },
      },
      {
        version: '4.5.13',
        payload:
          'quay.io/openshift-release-dev/ocp-release@sha256:8d104847fc2371a983f7cb01c7c0a3ab35b7381d6bf7ce355d9b32a08c0031f0',
        metadata: {
          description: '',
          'io.openshift.upgrades.graph.release.channels':
            'candidate-4.5,fast-4.5,stable-4.5,candidate-4.6,fast-4.6,stable-4.6',
          'io.openshift.upgrades.graph.release.manifestref':
            'sha256:8d104847fc2371a983f7cb01c7c0a3ab35b7381d6bf7ce355d9b32a08c0031f0',
          url: 'https://access.redhat.com/errata/RHBA-2020:3760',
        },
      },
      {
        version: '4.5.7',
        payload:
          'quay.io/openshift-release-dev/ocp-release@sha256:776b7e8158edf64c82f18f5ec4d6ef378ac3de81ba0dc2700b885ceb62e71279',
        metadata: {
          description: '',
          'io.openshift.upgrades.graph.previous.remove_regex': '4.4.12',
          'io.openshift.upgrades.graph.release.channels':
            'candidate-4.5,fast-4.5,stable-4.5,candidate-4.6,fast-4.6,stable-4.6',
          'io.openshift.upgrades.graph.release.manifestref':
            'sha256:776b7e8158edf64c82f18f5ec4d6ef378ac3de81ba0dc2700b885ceb62e71279',
          url: 'https://access.redhat.com/errata/RHBA-2020:3436',
        },
      },
      {
        version: '4.6.8',
        payload:
          'quay.io/openshift-release-dev/ocp-release@sha256:6ddbf56b7f9776c0498f23a54b65a06b3b846c1012200c5609c4bb716b6bdcdf',
        metadata: {
          description: '',
          'io.openshift.upgrades.graph.release.channels':
            'candidate-4.6,eus-4.6,fast-4.6,stable-4.6,candidate-4.7',
          'io.openshift.upgrades.graph.release.manifestref':
            'sha256:6ddbf56b7f9776c0498f23a54b65a06b3b846c1012200c5609c4bb716b6bdcdf',
          url: 'https://access.redhat.com/errata/RHSA-2020:5259',
        },
      },
      {
        version: '4.6.9',
        payload:
          'quay.io/openshift-release-dev/ocp-release@sha256:43d5c84169a4b3ff307c29d7374f6d69a707de15e9fa90ad352b432f77c0cead',
        metadata: {
          description: '',
          'io.openshift.upgrades.graph.previous.remove_regex': '.*',
          'io.openshift.upgrades.graph.release.channels':
            'candidate-4.6,eus-4.6,fast-4.6,stable-4.6,candidate-4.7',
          'io.openshift.upgrades.graph.release.manifestref':
            'sha256:43d5c84169a4b3ff307c29d7374f6d69a707de15e9fa90ad352b432f77c0cead',
          url: 'https://access.redhat.com/errata/RHBA-2020:5614',
        },
      },
      {
        version: '4.5.9',
        payload:
          'quay.io/openshift-release-dev/ocp-release@sha256:7ad540594e2a667300dd2584fe2ede2c1a0b814ee6a62f60809d87ab564f4425',
        metadata: {
          description: '',
          'io.openshift.upgrades.graph.previous.remove_regex': '4\\.4\\.21',
          'io.openshift.upgrades.graph.release.channels':
            'candidate-4.5,fast-4.5,stable-4.5,candidate-4.6,fast-4.6,stable-4.6',
          'io.openshift.upgrades.graph.release.manifestref':
            'sha256:7ad540594e2a667300dd2584fe2ede2c1a0b814ee6a62f60809d87ab564f4425',
          url: 'https://access.redhat.com/errata/RHBA-2020:3618',
        },
      },
      {
        version: '4.5.24',
        payload:
          'quay.io/openshift-release-dev/ocp-release@sha256:f3ce0aeebb116bbc7d8982cc347ffc68151c92598dfb0cc45aaf3ce03bb09d11',
        metadata: {
          description: '',
          'io.openshift.upgrades.graph.release.channels':
            'candidate-4.5,fast-4.5,stable-4.5,candidate-4.6,fast-4.6,stable-4.6',
          'io.openshift.upgrades.graph.release.manifestref':
            'sha256:f3ce0aeebb116bbc7d8982cc347ffc68151c92598dfb0cc45aaf3ce03bb09d11',
          url: 'https://access.redhat.com/errata/RHBA-2020:5468',
        },
      },
      {
        version: '4.5.14',
        payload:
          'quay.io/openshift-release-dev/ocp-release@sha256:95cfe9273aecb9a0070176210477491c347f8e69e41759063642edf8bb8aceb6',
        metadata: {
          description: '',
          'io.openshift.upgrades.graph.release.channels':
            'candidate-4.5,fast-4.5,stable-4.5,candidate-4.6,fast-4.6,stable-4.6',
          'io.openshift.upgrades.graph.release.manifestref':
            'sha256:95cfe9273aecb9a0070176210477491c347f8e69e41759063642edf8bb8aceb6',
          url: 'https://access.redhat.com/errata/RHBA-2020:3843',
        },
      },
      {
        version: '4.5.4',
        payload:
          'quay.io/openshift-release-dev/ocp-release@sha256:02dfcae8f6a67e715380542654c952c981c59604b1ba7f569b13b9e5d0fbbed3',
        metadata: {
          description: '',
          'io.openshift.upgrades.graph.previous.remove_regex': '4.4.12',
          'io.openshift.upgrades.graph.release.channels':
            'candidate-4.5,fast-4.5,stable-4.5,candidate-4.6,fast-4.6,stable-4.6',
          'io.openshift.upgrades.graph.release.manifestref':
            'sha256:02dfcae8f6a67e715380542654c952c981c59604b1ba7f569b13b9e5d0fbbed3',
          url: 'https://access.redhat.com/errata/RHBA-2020:3028',
        },
      },
      {
        version: '4.6.3',
        payload:
          'quay.io/openshift-release-dev/ocp-release@sha256:14986d2b9c112ca955aaa03f7157beadda0bd3c089e5e1d56f28020d2dd55c52',
        metadata: {
          description: '',
          'io.openshift.upgrades.graph.previous.remove_regex': '4\\.5\\..*',
          'io.openshift.upgrades.graph.release.channels':
            'candidate-4.6,eus-4.6,fast-4.6,stable-4.6',
          'io.openshift.upgrades.graph.release.manifestref':
            'sha256:14986d2b9c112ca955aaa03f7157beadda0bd3c089e5e1d56f28020d2dd55c52',
          url: 'https://access.redhat.com/errata/RHBA-2020:4339',
        },
      },
      {
        version: '4.6.12',
        payload:
          'quay.io/openshift-release-dev/ocp-release@sha256:5c3618ab914eb66267b7c552a9b51c3018c3a8f8acf08ce1ff7ae4bfdd3a82bd',
        metadata: {
          description: '',
          'io.openshift.upgrades.graph.release.channels':
            'candidate-4.6,fast-4.6,stable-4.6,candidate-4.7',
          'io.openshift.upgrades.graph.release.manifestref':
            'sha256:5c3618ab914eb66267b7c552a9b51c3018c3a8f8acf08ce1ff7ae4bfdd3a82bd',
          url: 'https://access.redhat.com/errata/RHSA-2021:0037',
        },
      },
      {
        version: '4.5.11',
        payload:
          'quay.io/openshift-release-dev/ocp-release@sha256:4d048ae1274d11c49f9b7e70713a072315431598b2ddbb512aee4027c422fe3e',
        metadata: {
          description: '',
          'io.openshift.upgrades.graph.release.channels':
            'candidate-4.5,fast-4.5,stable-4.5,candidate-4.6,fast-4.6,stable-4.6',
          'io.openshift.upgrades.graph.release.manifestref':
            'sha256:4d048ae1274d11c49f9b7e70713a072315431598b2ddbb512aee4027c422fe3e',
          url: 'https://access.redhat.com/errata/RHBA-2020:3719',
        },
      },
      {
        version: '4.5.12',
        payload:
          'quay.io/openshift-release-dev/ocp-release@sha256:d65574acbf8222bacf875f4b0128142d5ed9e687153ce8df2152ba6e0c3f2be3',
        metadata: {
          description: '',
          'io.openshift.upgrades.graph.release.channels':
            'candidate-4.5,fast-4.5,candidate-4.6,fast-4.6,stable-4.6',
          'io.openshift.upgrades.graph.release.manifestref':
            'sha256:d65574acbf8222bacf875f4b0128142d5ed9e687153ce8df2152ba6e0c3f2be3',
          url: 'https://access.redhat.com/errata/RHBA-2020:3760',
        },
      },
      {
        version: '4.5.16',
        payload:
          'quay.io/openshift-release-dev/ocp-release@sha256:adb5ef06c54ff75ca9033f222ac5e57f2fd82e49bdd84f737d460ae542c8af60',
        metadata: {
          description: '',
          'io.openshift.upgrades.graph.release.channels':
            'candidate-4.5,fast-4.5,stable-4.5,candidate-4.6,fast-4.6,stable-4.6',
          'io.openshift.upgrades.graph.release.manifestref':
            'sha256:adb5ef06c54ff75ca9033f222ac5e57f2fd82e49bdd84f737d460ae542c8af60',
          url: 'https://access.redhat.com/errata/RHBA-2020:4268',
        },
      },
      {
        version: '4.5.0-0.hotfix-2020-08-24-185832',
        payload:
          'quay.io/openshift-release-dev/ocp-release@sha256:3ad6bab0bfb5642ef18ebbfc9f011da6cdcd950f5f8ccbf5b34c6c5cc0b4c289',
        metadata: {
          'io.openshift.upgrades.graph.release.channels':
            'candidate-4.5,fast-4.5,stable-4.5,candidate-4.6,fast-4.6,stable-4.6',
          'io.openshift.upgrades.graph.release.manifestref':
            'sha256:3ad6bab0bfb5642ef18ebbfc9f011da6cdcd950f5f8ccbf5b34c6c5cc0b4c289',
        },
      },
      {
        version: '4.5.15',
        payload:
          'quay.io/openshift-release-dev/ocp-release@sha256:1df294ebe5b84f0eeceaa85b2162862c390143f5e84cda5acc22cc4529273c4c',
        metadata: {
          description: '',
          'io.openshift.upgrades.graph.release.channels':
            'candidate-4.5,fast-4.5,stable-4.5,candidate-4.6,fast-4.6,stable-4.6',
          'io.openshift.upgrades.graph.release.manifestref':
            'sha256:1df294ebe5b84f0eeceaa85b2162862c390143f5e84cda5acc22cc4529273c4c',
          url: 'https://access.redhat.com/errata/RHBA-2020:4228',
        },
      },
      {
        version: '4.6.4',
        payload:
          'quay.io/openshift-release-dev/ocp-release@sha256:6681fc3f83dda0856b43cecd25f2d226c3f90e8a42c7144dbc499f6ee0a086fc',
        metadata: {
          description: '',
          'io.openshift.upgrades.graph.previous.remove_regex': '4\\.5\\..*',
          'io.openshift.upgrades.graph.release.channels':
            'candidate-4.6,eus-4.6,fast-4.6,stable-4.6',
          'io.openshift.upgrades.graph.release.manifestref':
            'sha256:6681fc3f83dda0856b43cecd25f2d226c3f90e8a42c7144dbc499f6ee0a086fc',
          url: 'https://access.redhat.com/errata/RHBA-2020:4987',
        },
      },
    ],
    edges: [
      [19, 25],
      [9, 26],
      [17, 4],
      [16, 21],
      [11, 6],
      [23, 27],
      [14, 20],
      [9, 27],
      [16, 7],
      [15, 26],
      [30, 2],
      [10, 30],
      [8, 1],
      [4, 2],
      [26, 21],
      [23, 9],
      [5, 24],
      [14, 23],
      [7, 18],
      [26, 8],
      [17, 27],
      [1, 21],
      [16, 8],
      [4, 18],
      [1, 18],
      [26, 4],
      [15, 20],
      [28, 4],
      [7, 4],
      [20, 11],
      [3, 27],
      [0, 9],
      [15, 9],
      [30, 11],
      [28, 18],
      [0, 23],
      [17, 30],
      [10, 7],
      [13, 30],
      [23, 16],
      [15, 27],
      [15, 16],
      [22, 2],
      [15, 30],
      [22, 8],
      [4, 21],
      [22, 28],
      [26, 27],
      [4, 6],
      [17, 11],
      [17, 9],
      [20, 16],
      [13, 11],
      [14, 16],
      [8, 18],
      [0, 20],
      [16, 6],
      [14, 21],
      [29, 13],
      [15, 28],
      [13, 8],
      [22, 7],
      [3, 22],
      [7, 11],
      [14, 26],
      [23, 26],
      [22, 21],
      [6, 21],
      [13, 26],
      [20, 21],
      [10, 22],
      [3, 7],
      [11, 8],
      [15, 23],
      [7, 2],
      [8, 21],
      [20, 22],
      [1, 25],
      [15, 3],
      [29, 27],
      [3, 11],
      [17, 26],
      [23, 4],
      [10, 11],
      [5, 25],
      [13, 9],
      [28, 8],
      [7, 6],
      [10, 26],
      [14, 28],
      [14, 30],
      [1, 6],
      [0, 13],
      [4, 1],
      [13, 1],
      [20, 1],
      [16, 11],
      [0, 17],
      [11, 25],
      [18, 25],
      [22, 30],
      [14, 22],
      [0, 27],
      [10, 27],
      [14, 13],
      [5, 18],
      [15, 17],
      [23, 13],
      [17, 7],
      [4, 25],
      [24, 18],
      [3, 10],
      [17, 21],
      [26, 22],
      [30, 7],
      [13, 21],
      [17, 8],
      [22, 4],
      [8, 2],
      [16, 22],
      [20, 26],
      [1, 2],
      [0, 10],
      [3, 9],
      [14, 17],
      [14, 3],
      [23, 3],
      [27, 22],
      [2, 21],
      [28, 11],
      [8, 6],
      [23, 22],
      [31, 18],
      [6, 18],
      [10, 8],
      [28, 2],
      [15, 13],
      [12, 25],
      [3, 30],
      [14, 9],
      [2, 25],
      [26, 30],
      [23, 30],
      [26, 1],
      [16, 1],
      [22, 1],
      [30, 1],
      [3, 13],
      [28, 1],
      [7, 1],
      [0, 26],
      [26, 7],
      [13, 16],
      [17, 22],
      [30, 21],
      [13, 27],
      [11, 21],
      [23, 21],
      [13, 7],
      [11, 18],
      [13, 4],
      [10, 16],
      [20, 27],
      [11, 1],
      [20, 30],
      [28, 7],
      [3, 26],
      [14, 27],
      [10, 4],
      [16, 30],
      [31, 25],
      [5, 31],
      [29, 20],
      [27, 16],
      [10, 17],
      [23, 17],
      [20, 6],
      [24, 25],
      [26, 11],
      [20, 9],
      [20, 28],
      [0, 3],
      [23, 28],
      [26, 16],
      [7, 25],
      [3, 4],
      [15, 10],
      [14, 10],
      [3, 20],
      [10, 20],
      [17, 20],
      [30, 4],
      [8, 25],
      [10, 9],
      [6, 25],
      [0, 16],
      [20, 8],
      [8, 4],
      [7, 21],
      [23, 10],
      [22, 6],
      [3, 17],
      [23, 7],
      [13, 22],
      [3, 28],
      [10, 28],
      [17, 28],
      [28, 25],
      [26, 6],
      [26, 2],
      [11, 2],
      [17, 13],
      [13, 28],
      [23, 20],
      [13, 20],
      [16, 4],
      [22, 11],
      [6, 2],
      [26, 28],
      [20, 7],
      [9, 4],
      [11, 4],
      [24, 31],
      [15, 22],
      [20, 4],
      [10, 13],
      [0, 21],
      [15, 21],
      [10, 21],
      [27, 4],
      [16, 2],
      [17, 16],
      [0, 22],
      [30, 6],
      [28, 6],
      [16, 28],
      [21, 25],
      [30, 28],
      [30, 8],
      [3, 16],
      [2, 18],
      [14, 4],
      [7, 8],
      [29, 16],
      [12, 18],
      [28, 21],
    ],
    version: 1,
    conditionalEdges: [],
  },
};

export default ocpReleases;
