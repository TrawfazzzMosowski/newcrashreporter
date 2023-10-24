mutation {
  alertsNrqlConditionStaticCreate(
    accountId: <your_account_id>
    policyId: <your_policy_id>
    condition: {
      enabled: true
      name:  "CrashChecker"
      description:  """
      Copy CrashLocation from crashLocation Tag.
      Click runbook URL.  
      Paste crash Location into dashboard upper left.
      """
      nrql: {
        query:  "SELECT count(*) from CrashNewRecord facet crashLocation"
      }
      expiration: null
      runbookUrl:  "https://one.newrelic.com/dashboards/detail/OTQ0OTA4fFZJWnxEQVNIQk9BUkR8ZGE6NDQxNzQ0Mw"
      signal: {
        aggregationWindow: 600
        fillOption: NONE
        aggregationDelay: null
        aggregationMethod: EVENT_TIMER
        aggregationTimer: 600
        fillValue: null
        slideBy: 30
        evaluationDelay: null
      }
      terms: [
        {
          operator: ABOVE_OR_EQUALS
          threshold: 1
          priority: CRITICAL
          thresholdDuration: 60
          thresholdOccurrences: ALL
        }
      ]
      violationTimeLimitSeconds: 1200
    }
  ) {
    id
  }
}