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
setup: node_modules dev-env-check

.PHONY: node_modules
node_modules:
	npm install

.PHONY: app
app: node_modules
	npm run build:prod

.PHONY: openapi
openapi:
	# --root-types-no-schema-prefix can't be used since there schema objects and enums with the same name. It would be good to use it once https://github.com/openapi-ts/openapi-typescript/issues/2099 is solved
	npm exec openapi-typescript -- https://api.stage.openshift.com/api/accounts_mgmt/v1/openapi -o src/types/accounts_mgmt.v1/index.ts --root-types --root-types-no-schema-prefix --enum
	# --root-types-no-schema-prefix can't be used since there schema objects and enums with the same name. It would be good to use it once https://github.com/openapi-ts/openapi-typescript/issues/2099 is solved
	npm exec openapi-typescript -- https://console.redhat.com/api/cost-management/v1/openapi.json -o src/types/cost-management.v1/index.ts --root-types --enum
	npm exec openapi-typescript -- https://api.stage.openshift.com/api/access_transparency/v1/openapi -o src/types/access_transparency.v1/index.ts --root-types --root-types-no-schema-prefix --enum
	npm exec openapi-typescript -- https://console.redhat.com/api/insights-results-aggregator/v1/openapi.json -o src/types/insights-results-aggregator.v1/index.ts --root-types --root-types-no-schema-prefix --enum
	npm exec openapi-typescript -- https://console.redhat.com/api/insights-results-aggregator/v2/openapi.json -o src/types/insights-results-aggregator.v2/index.ts --root-types --root-types-no-schema-prefix --enum
	npm exec openapi-typescript -- https://api.stage.openshift.com/api/service_logs/v1/openapi -o src/types/service_logs.v1/index.ts --root-types --root-types-no-schema-prefix --enum
	npm exec openapi-typescript -- https://api.stage.openshift.com/api/upgrades_info/v1/openapi -o src/types/upgrades_info.v1/index.ts --root-types --root-types-no-schema-prefix --enum

	curl https://api.stage.openshift.com/api/clusters_mgmt/v1/openapi | jq . > openapi/clusters_mgmt.v1.json
	# due to https://github.com/openapi-ts/openapi-typescript/issues/2099 and waiting for a workaround or solution for it...
	# the idea is about to generate index.ts file without enums, and specific one with enums (prefixing objects with `Schema` avoiding `--root-types-no-schema-prefix` usage )
	# this way model will be kept up to date and future refactoring will be easier
	npm exec openapi-typescript -- ./openapi/clusters_mgmt.v1.json -o src/types/clusters_mgmt.v1/index.ts --root-types --root-types-no-schema-prefix
	npm exec openapi-typescript -- ./openapi/clusters_mgmt.v1.json -o src/types/clusters_mgmt.v1/enums.ts --root-types --enum

	npm run prettier:fix

# Patching /etc/hosts is needed (once) for development with local server;
.PHONY: dev-env-check
.SILENT: dev-env-check
dev-env-check:
	if ! grep --with-filename qa.foo.redhat.com /etc/hosts \
        || ! grep --with-filename prod.foo.redhat.com /etc/hosts; \
	then \
		echo "ERROR: Need aliases in /etc/hosts to access the UI."; \
		echo "       To add them run: make dev-env-setup"; \
		exit 1; \
	fi

.PHONY: dev-env-setup
dev-env-setup: node_modules
	sudo npm exec -- fec patch-etc-hosts

.PHONY: clean
clean:
	rm -rf \
		$(binaries) \
		dist \
		node_modules \
		$(NULL)
