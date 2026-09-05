# ChargedLife Pre-Alpha 1.0.55 Testing

## New game
- Confirm a new save opens the Founder step.
- Enter a player name and continue.
- Enter a company name and continue.
- Confirm Fast Food is the only selectable industry.
- Create the company and confirm the fast-food business setup opens.
- Complete restaurant creation and confirm player name, company name, and business name are preserved.

## Dashboard
- Confirm no restaurant exterior image appears on the Dashboard.
- Confirm the Dashboard fits at 100% browser zoom at 1920x1080, 1600x900, 1440x900, and 1366x768.
- Confirm the business table, Today panel, Top Earning Businesses, and Recommended Actions are readable.
- Confirm all Dashboard buttons navigate correctly.
- Test with no completed reports, one report, and several reports.

## Migration
- Load a 1.0.54 save and confirm it does not reopen onboarding.
- Confirm existing founder, business, cash, inventory, staff, reports, and branding remain intact.

## Commands
- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`
- `npm run verify:v1055`
