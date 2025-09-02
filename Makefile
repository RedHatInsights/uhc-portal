#
# Copyright (c) 2018 Red Hat, Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

# Default target
.PHONY: setup
setup: node_modules insights-proxy-check

.PHONY: node_modules
node_modules:
	yarn install

.PHONY: app
app: node_modules
	yarn build:prod

# Marking git clones .PHONY so we can git pull even if they already exist.

.PHONY: run/insights-proxy
run/insights-proxy:
	[ -e $@ ] || git clone https://github.com/RedHatInsights/insights-proxy --depth=1 $@

.PHONY: openapi
openapi:
	# --root-types-no-schema-prefix can't be used since there schema objects and enums with the same name. It would be good to use it once https://github.com/openapi-ts/openapi-typescript/issues/2099 is solved
	yarn run openapi-typescript https://api.stage.openshift.com/api/accounts_mgmt/v1/openapi -o src/types/accounts_mgmt.v1/index.ts --root-types --root-types-no-schema-prefix --enum
	# --root-types-no-schema-prefix can't be used since there schema objects and enums with the same name. It would be good to use it once https://github.com/openapi-ts/openapi-typescript/issues/2099 is solved
	yarn run openapi-typescript https://console.redhat.com/api/cost-management/v1/openapi.json -o src/types/cost-management.v1/index.ts --root-types --enum
	yarn run openapi-typescript https://api.stage.openshift.com/api/access_transparency/v1/openapi -o src/types/access_transparency.v1/index.ts --root-types --root-types-no-schema-prefix --enum
	yarn run openapi-typescript https://console.redhat.com/api/insights-results-aggregator/v1/openapi.json -o src/types/insights-results-aggregator.v1/index.ts --root-types --root-types-no-schema-prefix --enum
	yarn run openapi-typescript https://console.redhat.com/api/insights-results-aggregator/v2/openapi.json -o src/types/insights-results-aggregator.v2/index.ts --root-types --root-types-no-schema-prefix --enum
	yarn run openapi-typescript https://api.stage.openshift.com/api/service_logs/v1/openapi -o src/types/service_logs.v1/index.ts --root-types --root-types-no-schema-prefix --enum
	yarn run openapi-typescript https://api.stage.openshift.com/api/upgrades_info/v1/openapi -o src/types/upgrades_info.v1/index.ts --root-types --root-types-no-schema-prefix --enum

	curl https://api.stage.openshift.com/api/clusters_mgmt/v1/openapi | jq . > openapi/clusters_mgmt.v1.json
	# due to https://github.com/openapi-ts/openapi-typescript/issues/2099 and waiting for a workaround or solution for it...
	# the idea is about to generate index.ts file without enums, and specific one with enums (prefixing objects with `Schema` avoiding `--root-types-no-schema-prefix` usage )
	# this way model will be kept up to date and future refactoring will be easier
	yarn run openapi-typescript ./openapi/clusters_mgmt.v1.json -o src/types/clusters_mgmt.v1/index.ts --root-types --root-types-no-schema-prefix
	yarn run openapi-typescript ./openapi/clusters_mgmt.v1.json -o src/types/clusters_mgmt.v1/enums.ts --root-types --enum

	yarn prettier:fix

# Patching /etc/hosts is needed (once) for development with local server;
.PHONY: insights-proxy-check
.SILENT: insights-proxy-check
insights-proxy-check: run/insights-proxy
	if ! grep --with-filename qa.foo.redhat.com /etc/hosts \
        || ! grep --with-filename prod.foo.redhat.com /etc/hosts; \
	then \
		echo "ERROR: Need aliases in /etc/hosts to access the UI."; \
		echo "       To add them run: make dev-env-setup"; \
		exit 1; \
	fi

.PHONY: dev-env-setup
dev-env-setup: run/insights-proxy
	sudo bash -x run/insights-proxy/scripts/patch-etc-hosts.sh

.PHONY: insights-proxy-setup
insights-proxy-setup: dev-env-setup
	run/podman-or-docker.sh pull quay.io/redhat-sd-devel/insights-proxy:3.2.1

.PHONY: clean
clean:
	rm -rf \
		$(binaries) \
		dist \
		node_modules \
		run/cucushift \
		run/insights-proxy \
		run/verification-tests \
		$(NULL)
