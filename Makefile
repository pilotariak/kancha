# SPDX-FileCopyrightText: Copyright (C) Nicolas Lamirault <nicolas.lamirault@gmail.com>
# SPDX-License-Identifier: Apache-2.0

BANNER = K A N C H A

APP = kancha

SHELL = /bin/bash -o pipefail

DIR = $(shell pwd)

# Colors for terminal output
NO_COLOR=\033[0m
OK_COLOR=\033[32;01m
ERROR_COLOR=\033[31;01m
WARN_COLOR=\033[33;01m
INFO_COLOR=\033[36m
WHITE_COLOR=\033[1m
MAKE_COLOR=\033[33;01m%-20s\033[0m

.DEFAULT_GOAL := help

# Define common messages
OK=[🟢]
KO=[🔴]
WARN=[🟠]
INFO=[🔵]


.PHONY: help
help:
	@echo -e "$(OK_COLOR)      $(BANNER)$(NO_COLOR)"
	@echo "------------------------------------------------------------------"
	@echo ""
	@awk 'BEGIN {FS = ":.*##"; printf "Usage: make ${INFO_COLOR}<target>${NO_COLOR}\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  ${INFO_COLOR}%-25s${NO_COLOR} %s\n", $$1, $$2 } /^##@/ { printf "\n${WHITE_COLOR}%s${NO_COLOR}\n", substr($$0, 5) } ' $(MAKEFILE_LIST)
	@echo ""

guard-%:
	@if [ "${${*}}" = "" ]; then \
		echo -e "$(ERROR_COLOR)Environment variable $* not set$(NO_COLOR)"; \
		exit 1; \
	fi

check-%:
	@if $$(hash $* 2> /dev/null); then \
		echo -e "$(OK_COLOR)$(OK)$(NO_COLOR) $*"; \
	else \
		echo -e "$(ERROR_COLOR)$(KO)$(NO_COLOR) $*"; \
	fi

.PHONY: clean
clean: ## Clean project
	@echo -e "$(INFO)$(INFO_COLOR)[Clean] Processing $(NO_COLOR)"


##@ Mobile / Dev

.PHONY: deps
deps: ## Install dependencies
	@echo -e "$(OK_COLOR)[$(APP)] Install dependencies$(NO_COLOR)" >&2
	@bun install

.PHONY: build-ios
build-ios: ## Build iOS
	bunx expo prebuild
	bunx expo run:ios

.PHONY: build-android
build-android: ## Build android
	bunx expo prebuild
	bunx expo run:android

run-expo: ## Run Expo Go
	bunx expo start

.PHONY: run-ios
run-ios: ## Run iOS
	bunx expo start --ios

.PHONY: run-android
run-android: ## Run android
	bunx expo start --android

.PHONY: run-web
run-web: ## Run web application
	bunx expo start --web

##@ Mobile / EAS

.PHONY: eas-login
eas-login: ## EAS authentication
	@echo -e "$(OK_COLOR)[$(APP)] EAS authentication$(NO_COLOR)" >&2
	bunx eas login -b

.PHONY: eas-configure
eas-configure: ## EAS project configuration
	@echo -e "$(OK_COLOR)[$(APP)] EAS project configuration$(NO_COLOR)" >&2
	bunx eas build:configure

.PHONY: eas-build-all
eas-build-all: guard-PROFILE ## EAS build all platforms (profile=development|production)
	@echo -e "$(OK_COLOR)[$(APP)] EAS project configuration$(NO_COLOR)" >&2
	bunx eas build -p all --profile $(PROFILE)

.PHONY: eas-build-ios
eas-build-ios: guard-PROFILE ## EAS build iOS (profile=development|production)
	@echo -e "$(OK_COLOR)[$(APP)] EAS build iOS$(NO_COLOR)" >&2
	bunx eas build -p ios --profile $(PROFILE)
	# bunx eas build -p ios --profile development --local

.PHONY: eas-build-android
eas-build-android: guard-PROFILE ## EAS build android (profile=development|production)
	@echo -e "$(OK_COLOR)[$(APP)] EAS build Android$(NO_COLOR)" >&2
	bunx eas build -p ios --profile $(PROFILE)
	# bunx eas build -p ios --profile $(PROFILE) --local

.PHONY: eas-export-web
eas-export-web: ## Expert web application
	@echo -e "$(OK_COLOR)[$(APP)] EAS export web$(NO_COLOR)" >&2
	bunx expo export --platform web

.PHONY: cf-deploy-web
cf-deploy-web: ## Deploy web application
	@echo -e "$(OK_COLOR)[$(APP)] Deploy web$(NO_COLOR)" >&2
	bunx wrangler pages deploy dist
