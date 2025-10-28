# OCM UI

This repository contains the UI components for the OpenShift Cluster
Manager site.

The UI is a JavaScript/TypeScript application written in React and Redux.

Slack channels: `#service-development` for OCM in general, `#ocm-osd-ui` for UI.

## Table of contents

- [Requirements](#requirements)
- [Setup](#setup)
- [Building](#building)
- [Running locally](#running-locally)
- [Environments and Deployments](#environments-and-deployments)
- [Contributing](#contributing)

## Requirements

- [NodeJS](https://nodejs.org/) `>= 18.12.0`
- [Yarn](https://classic.yarnpkg.com/lang/en/) `1.22.19` - (higher versions are not supported)
     
## Setup

For a first time setup, it's required to run `make dev-env-setup`.

This will ask for your `sudo` password, to add some entries to `/etc/hosts`.
 
If you intend to contribute code, also refer to the [Setup section of the Contributing guide](docs/contributing.md#setup).

## Building

To build the application run these commands:

```
yarn install
yarn build
```

## Running locally

Run `yarn install && yarn start`.

The UI will be available at https://prod.foo.redhat.com:1337/openshift/

By default, UI will use a real staging backend.
You can switch between real backends and mockserver (see below) at any time by
appending `?env=staging` / `?env=production` / `?env=mockdata` URL param.
(`src/config/` directory contains some more options, but they might not work.)

You can find more information about mocked data in the [mocked APIs guide](mockdata/README.md).

In development mode, analytics events are configured to be routed
to the [_OCM Web Portal_ development source on Segment](https://app.segment.com/redhat-devtools/sources/ocm_web_portal_dev/overview).
If you see them in the [production source](https://app.segment.com/redhat-devtools/sources/ocm_web_portal/overview) instead, reload the page once
(this will stick until local storage is cleared).

By default, UI run Assisted Installer without standalone mode. To run with Assisted Installer in standalone mode you need to follow these steps:
- Download https://github.com/openshift-assisted/assisted-installer-app project
- Inside assisted-installer-app run `npm install && npm run start:federated`
- In uhc-portal run `yarn start --env ai_standalone`

## Continuous integration

See [Continuous integration doc](docs/continuous-integration.md).

## Environments and Deployments

| uhc-portal branch            | deployed env                                            | insights-chrome | default backend |
|------------------------------| ------------------------------------------------------- | --------------- | --------------- |
| `main`                       | https://console.dev.redhat.com/openshift                | stable version  | staging         |
| `main` (specific revision) | https://console.redhat.com/openshift                    | stable version  | production      |


## Issues/Troubleshooting

If you get a timeout/network connection issue when running `yarn install`, try increasing the timeout e.g.
`yarn install --network-timeout 600000`.

## Contributing

See [Contributing guide](docs/contributing.md).

### Release

A detailed explanation of how to make a release can be found on the [Release to Production page](docs/releasing.md)
