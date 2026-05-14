#!/bin/bash -ex
# cypress-qe-triggers.sh helps to trigger test case execution from external Jenkins source.
# This is starting point of the executions.

node --version

# Common parameters supplies to the script from jenkins job. 
# Below parameters will be populated from Jenkins workarea.
# NOTE : Enable inline ENVIRONMENT, BROWSER and TAGS variables and modify the values for debug runs from local setup.
# ENVIRONMENT="staging"
# BROWSER="chrome"
# TAGS="fedramp"
echo "$BROWSER"
echo "$TAGS"

# Install all the required plugins/packages for QE execution enviroument.
# Installation will be done on the dynamic nodes or your machine as per place of call of this file.
npm ci

sh "${PWD}/run/cypress-qe-executor-fedramp.sh"
