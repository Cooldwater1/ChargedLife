# ChargedLife Pre-Alpha 1.0.57 Testing

1. Open Business Overview and verify only four summary cards and the business list are shown.
2. Confirm each business row has a Manage button on the left.
3. Click Manage and verify the selected business management center opens.
4. Verify the header reads `<Business Name> Overview` on the Overview tab.
5. Test all business tabs: Overview, Inventory & Supplies, Locations, Marketing, Employees, Analytics & Reports and Upgrades.
6. Confirm Overview displays the existing restaurant overview content.
7. Open Inventory & Supplies and verify stock summary cards, inventory rows, supplier selection and order summary.
8. Select a supplier and place an order.
9. Confirm pending deliveries display correctly.
10. Refresh and confirm the selected business and save state remain intact.
11. Run `npm run verify:v1057`.
12. Run `npx tsc --noEmit`, `npm run lint` and `npm run build` in an environment with dependencies installed.
