# ChargedLife Pre-Alpha 1.0.55

## Dashboard
- Rebuilt the first-page Dashboard into a simpler company overview designed to fit at normal browser zoom.
- Removed restaurant artwork from the Dashboard business table.
- Removed the redundant Performance Snapshot panel and combined events and activity into one compact Today panel.
- Added a clean company summary, six portfolio metrics, a compact business table, top-earner ranking, and four contextual recommendations.
- Improved empty states for new companies and businesses without completed days.

## New-game flow
- New players now enter their player name and company name before creating a business.
- Added a dedicated industry step with Fast Food as the only currently available industry.
- The existing fast-food creation flow begins after company setup.
- Added separate company and business names to prepare the save structure for multiple industries.

## Cleanup
- Removed unused AI icon source folders, legacy pages, legacy game modules, old generated UI kits, obsolete images, and historical verification files.
- Reduced the project footprint while preserving all currently used restaurant assets and the dashboard background.

## Technical
- Updated the version to 1.0.55.
- Preserved the save key `chargedlife-save-v0601`.
- Added migration defaults for `companyName`, `companyCreated`, and `selectedIndustry`.
