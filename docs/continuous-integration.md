
# Continuous integration

We use [Konflux][1] for CI, and own the 'ocm-ui-tenant' namespace which hosts the ['ocm-ui'][8] application.
            

## Build pipelines

The FE app is built onto container images, which are pushed into the quay.io registry; PR changes are built via the ['pull-request' pipeline][3] and long-lived branches (e.g. 'main') – via the ['push' pipeline][4] (see ['pipeline runs' in Konflux UI][9]).  Both are stored in a quay repo under the [redhat-user-workloads][2] org'.

Konflux will take care to take [snapshots][5] and create [releases][6], which are stored under the [redhat-services-prod][7] quay org'.
        

## Persisted configuration

Most of our Konflux configuration (e.g. our Konflux app, component, integration-test scenario, release-admission plans, user access) is persisted as yaml files in the [konflux-release-data][10] repository, and then parsed and displayed by Konflux UI.  
See there for more info on how to generate or update these configs.


## Our custom setup

Our repo declares a non-default pipeline-run config, which extends a remote pipeline config commonly used in HCC tenant-apps.  This config is equipped with an additional custom task for running additional verification (e.g. unit-tests, linter) during build.

See [docker-build-run-unit-tests][11] at the _RedHatInsights/konflux-pipelines_ repo.

 
## Getting help

To get assistance with Konflux CI, post an ask in the #konflux-users Slack channel.
   
      


[1]: https://konflux.pages.redhat.com/docs/users/index.html
[2]: https://quay.io/repository/redhat-user-workloads/ocm-ui-tenant/uhc-portal
[3]: https://github.com/RedHatInsights/uhc-portal/blob/main/.tekton/uhc-portal-pull-request.yaml
[4]: https://github.com/RedHatInsights/uhc-portal/blob/main/.tekton/uhc-portal-push.yaml
[5]: https://konflux-ui.apps.stone-prd-rh01.pg1f.p1.openshiftapps.com/ns/ocm-ui-tenant/applications/ocm-ui/snapshots
[6]: https://konflux-ui.apps.stone-prd-rh01.pg1f.p1.openshiftapps.com/ns/ocm-ui-tenant/applications/ocm-ui/releases
[7]: https://quay.io/repository/redhat-services-prod/ocm-ui-tenant/uhc-portal
[8]: https://konflux-ui.apps.stone-prd-rh01.pg1f.p1.openshiftapps.com/ns/ocm-ui-tenant/applications/ocm-ui/
[9]: https://konflux-ui.apps.stone-prd-rh01.pg1f.p1.openshiftapps.com/ns/ocm-ui-tenant/applications/ocm-ui/activity/pipelineruns
[10]: https://gitlab.cee.redhat.com/releng/konflux-release-data
[11]: https://github.com/RedHatInsights/konflux-pipelines/raw/main/pipelines/platform-ui/docker-build-run-unit-tests.yaml
