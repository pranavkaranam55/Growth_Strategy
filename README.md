# Campus Growth Engine

A working prototype for the NxtWave Growth Intern challenge: 500 verified registrations for the free workshop "Build Your First AI Project in 60 Minutes", in 7 days, with a ₹2,000 budget, using three campus ambassadors on one pilot campus.

## What it does

- **Ambassador onboarding:** captures name, WhatsApp number, department and UPI ID, then creates a unique referral code and link (targets: A1 250, A2 150, A3 100).
- **Student sign-up page:** opened from an ambassador's link; each registration has one traceable source.
- **Verified registrations only:** a WhatsApp number counts once (in any format), and only final-year students with complete details are counted.
- **Growth dashboard:** progress to 500, daily progress vs plan, conversion rate (link opens → verified), source and branch split.
- **WhatsApp notifications:** onboarding, launch and milestone messages at 25%, 50%, 75% and 100% of each target, each sent once. Sending is simulated.
- **Reward workflow:** ₹800 / ₹500 / ₹300 when the full target is reached, with Pending approval → Approved → Paid. ₹400 is kept as a reserve, so total planned spend is exactly ₹2,000. Payments are simulated.
- **Agile daily review:** Day 1–7 board with plan vs actual, and a daily Plan → Execute → Measure → Improve stand-up with suggested improvements.
- **Quality & CI/CD:** the business rules live in `logic.js` and are tested automatically.

## Automated tests

`tests/logic.test.js` checks the four rules from the CI/CD plan:

1. No duplicate registration counting
2. Correct referral attribution
3. Notifications only at milestones
4. Accurate reward calculation

Run them locally with Node.js 18 or newer:

```
npm test
```

## CI/CD pipeline

`.github/workflows/ci.yml` runs on every push:

1. Checks the JavaScript syntax
2. Runs the automated tests
3. Deploys to GitHub Pages **only if every test passes**

To roll back, revert the bad commit; the pipeline redeploys the previous version.

## Notes

- Data is stored in the visitor's browser and starts with clearly labelled demo data. Use **Settings → Reset demo data** or **Start an empty campaign**.
- A real launch would add the WhatsApp Business Platform, an authorised UPI payout service, a shared database and an organiser login.
- Targets and reward amounts are proposals, not guaranteed results.
