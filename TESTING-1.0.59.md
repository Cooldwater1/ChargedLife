# ChargedLife Pre-Alpha 1.0.59 Testing

1. Load an existing Pre-Alpha 1.0.58 save.
2. Open Businesses and select Manage.
3. Confirm the Overview tab contains no restaurant exterior/avatar image.
4. Confirm operational status, employees, inventory, supplier, fixed cost and value are visible.
5. Confirm opening progress appears while the location is not open.
6. Confirm Customize, Continue Setup/Open/Close and Owner Shift actions still work.
7. Test the business overview at 1920×1080, 1600×900, 1440×900 and 1366×768 at 100% browser zoom.
8. Confirm text is readable and the page does not require zooming out.
9. Run `npm run verify:v1059`.
10. Run `npx tsc --noEmit`, `npm run lint` and `npm run build` when dependencies are available.
