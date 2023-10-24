# newcrashreporter


newcrashreporter is a solution to find new crashes for a mobile app. Also setup an alert to notify when a new crash occures



## Features

- Check for crashes for a configureable time window and an occurance count. A dashboard to review crash data.


## Installation

- First install the dashboard - dashboard.json
1. Edit dashboard and replace <your_account_id> with the account ID of the mobile apps
2. Use the NR UI to import the dashboards [NR Docs Import](https://docs.newrelic.com/docs/query-your-data/explore-query-data/dashboards/introduction-dashboards/#dashboards-import)
3. Get the dashboard URL and save
- Install Alert
1. Log into your NR account.
2. Go to the Alerts & AI section of the NR UI and create a policy
3. Get the Policy ID in the upper left hand corner [Condition Image](image.png)
4. Update the AccountID with the account ID
5. Update the Policy ID with the one created in the earlier step
6. open [graphQL UI](https://one.newrelic.com/nerdgraph-graphiql)
7. Paste in update alert_setup.js
8. Execute query
9. Update runbook URL to the saved dashboard URL
- Install Synthetics Script
1. update the crashscript.js with the following
-   minCrashLevel: this is how many of the same crash should be considered to call it a new crash.
-   appname: name of the app in the NR Mobile UI
-   accountid: is the id of the account being monitored
-   graphQLKey: this is a API user Key [docs](https://docs.newrelic.com/docs/apis/intro-apis/new-relic-api-keys/)
-   insightsinsertkey: [docs](https://docs.newrelic.com/docs/apis/intro-apis/new-relic-api-keys/)
-   recommened we manage those with New Relic secure credentials [docs](https://docs.newrelic.com/docs/synthetics/synthetic-monitoring/using-monitors/store-secure-credentials-scripted-browsers-api-tests/)
2. Create Synthetics API test [docs](https://docs.newrelic.com/docs/synthetics/synthetic-monitoring/scripting-monitors/write-synthetic-api-tests/)
3. Run validate to test script

## Results
There are two tables created in the NRDB:
- CrashHistory that will keep a running list of crashes
- CrashNewRecord this is what the alerts are looking at to send the new crash as an alert