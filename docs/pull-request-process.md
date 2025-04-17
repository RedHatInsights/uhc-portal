# PR Process

Here is the process to move a PR from draft to merged:

1. :pencil2: Author creates a draft PR

1. :pencil2: Author reviews code and ensures it:

   - has the Jira item(s) in the PR title
   - builds
   - doesn't contain debugging statements and/or comments
   - contains updated/added unit tests OR a description why unit test were not added
   - has reasonable amount of unit test coverage (by running `yarn test-changes`)
   - passes all checks
   - is production ready

1. :pencil2: Author moves PR out of draft and changes corresponding Jira item(s) to "Code review" status

1. :pencil2: Author assigns 2 developers as reviewers. If the QE reviewer is known, they are also added as a reviewer

1. :eyes: Dev reviewers review code, add comments, ask questions etc

   - ensure code makes sense and easy to follow
   - ensure unit tests are added or modified. There are times where unit tests are not needed (refactor) and the author should have this noted in the "additional information" section. Not having enough time is not a valid reason.
   - ensure newly added code has reasonable unit test coverage (by running yarn test-changes)
   - runs the code and verifies changes in a browser

1. :eyes: Dev reviewers approve the PR once they feel it is production-ready

1. :pencil2: If there are any code changes after 2 dev approvals, then both approvals are removed by clicking on the "re-request review" button next to each reviewer

1. :pencil2: If QE reviewer is not assigned. the author adds the person assigned as the QA Contact in the Jira ticket as a reviewer on the PR. If this field is empty, add Jaya as a reviewer.

1. :pencil2: Once there are 2 dev approvals, author sets corresponding Jira item(s) to "Review" status

1. :notebook: QE reviewer reviews code and writes new tests if needed

1. :notebook: QE reviewer requests test-case review from the author (if needed)

1. :pencil2: Author reviews test-cases and adds 'tc-approved' on the Jira item(s)

1. :notebook: QE reviewer completes all tasks in the PR template (see QE Reviewer section of the PR)

1. :notebook: QE reviewer approves the PR once they feel the PR is production-ready

1. :pencil2: Author pulls in changes from master if needed and waits for all checks/tests to pass

1. :pencil2: Author merges the PR using the "squash commits" button once there are 3 approvals (2 developer and 1 QE)

1. :pencil2: Author verifies the change was deployed to staging by looking at the [build job](https://ci.int.devshift.net/job/RedHatInsights-uhc-portal-gh-build-master/) or the related deployment was mentioned on [#ocm-ui-deploys](https://redhat.enterprise.slack.com/archives/C03GKHGMX7U)

1. :pencil2: Author tests the feature in the staging environment

1. :pencil2: Author closes the corresponding Jira item(s)
