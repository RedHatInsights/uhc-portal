# :cookie: Deploy to Production

1. #### Pick the latest safe commit from 'main'

   Go to https://github.com/RedHatInsights/uhc-portal/commits/main/

   Look at commits and pick the last commit that has all pipelines passed. Click on the "copy full SHA" for the commit you chose, and save it for later use.

   Check that the [daily QE smoke-test runs][32] have passed. If failures, ensure that QE is aware of the failure and a fix is already planned/in progress.

1. #### Update [_deploy.yml_ in app-interface][17] to bump the Production deployment-target <sup>[1][footnotes]</sup>

   In your app-interface fork, create a new topic branch from `master`.  
   
   Under the section `# Production Deployment`, update `ref` to the new full-hash from step 2.

   Commit and push changes, and create an MR against the upstream repo' ([example MR][9]).
      
   Note this MR will get merged automatically <sup>[2][footnotes]</sup>, once approvers post a `/lgtm` comment.  Also note, that **you** are on the approvers list, which means you can self-approve.
    
   * There might be a period of time when the MR will show repeating errors (cannot merge, must rebase) a number of times.  Don't Panic!  The MR should eventually resolve itself and auto-merge (assuming /lgtm has been applied)

1. #### Ensure the deployment pipeline completes successfully

   Wait for a notification on [#ocm-ui-deploys][16].  It'd look like this:

   > **saas notifier**  
   > 🟢 SaaS file uhc-portal deployment to environment *insights-production*: Success (Open). Reason: https://gitlab.cee.redhat.com/service/app-interface/commit/d131c0ad282323f50b75ec6a452e9601285819be triggered by _openshift-saas-deploy-trigger-configs_

1. #### Create a GitHub-release & release notes

   From the [Releases page][35], click _Draft a new release_.

   For the 'Release title', enter the release date in full, human-readable form, e.g. _March 5, 2025_.

   - In the 'Choose a tag' dropdown, enter a tag name as date using the yyyy-mm-dd format (e.g. 2025-03-05), and click on '_+ Create new tag on publish_' at the bottom of the dropdown.  
   - In the 'Target: Master' dropdown, select 'Previous commits' tab and paste the commit SHA from step 2 into the filter, then select the SHA from the dropdown.
   - You can leave the _Previous tag_, as `auto`.

   Click _Generate release notes_, and then _Publish release_.

1. #### Announce the release on the [#ocm-osd-ui][13] public slack forum

   Use this message (just update the Release Notes link to the latest release, before posting):

   > Hey all,
   >
   > A new release of OCM UI is now available in [production][24].  
   > See the [Release Notes][35].
   >
   > ⛵


<br/>

# :pencil2: Footnotes

_<sup>1</sup> Updating this hash will trigger the deployment-queue, which publishes the newly built container-image to the Production env'._

_<sup>2</sup> App-interface offers "self-service" in many areas; it will spawn a bot on self-serviceable MRs, which will resolve the required reviewers ("approvers"), and post that list in a comment.  Once the MR gets a LGTM from every group on the approvers list, it will get merged.
For more details on self-service, see [User Content Approval Process][25] and [Granular Permission Model][26] on app-interface docs._






[9]: https://gitlab.cee.redhat.com/service/app-interface/-/merge_requests/116437
[13]: https://redhat.enterprise.slack.com/archives/C01G3PL29SS
[16]: https://redhat.enterprise.slack.com/archives/C03GKHGMX7U
[17]: https://gitlab.cee.redhat.com/service/app-interface/-/blob/master/data/services/ocm/ui/cicd/deploy.yml
[24]: https://console.redhat.com/openshift
[25]: https://gitlab.cee.redhat.com/service/app-interface/-/blob/master/docs/app-sre/continuous-delivery-in-app-interface.md?#user-content-approval-process
[26]: https://gitlab.cee.redhat.com/service/app-interface/-/blob/master/docs/app-sre/change-types.md#granular-permission-model.md
[32]: https://ci.int.devshift.net/job/RedHatInsights-uhc-portal-qe-gh-cypress-smoke/
[35]: https://github.com/RedHatInsights/uhc-portal/releases



[footnotes]: #pencil2-footnotes
