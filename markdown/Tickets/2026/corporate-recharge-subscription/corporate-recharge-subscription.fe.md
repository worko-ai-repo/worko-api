

1. 
`GET` `https://api.dev.worko.work/corporate-subs-pricing-config/entityType/:entityType/planType/:planType`
```json
// Response
  /**
   * Price per entity per month (INR)
   * RECRUITER QUARTERLY → 2000
   * RECRUITER ANNUALLY  → 1500
   * EVALUATOR QUARTERLY → 666.6
   * EVALUATOR ANNUALLY  → 500
   */
{
   "id": "EVALUATOR#ANNUALLY",
   "createdAt": "2026-03-31T11:59:38.247+00:00",
   "updatedAt": "2026-03-31T11:59:38.247+00:00",
   "entityType": "EVALUATOR",
   "planType": "ANNUALLY",
   "durationMonths": 12,
   "pricePerEntityPerMonth": 500
}
```