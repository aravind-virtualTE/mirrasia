# MCAP Legacy Migration Runbook

## Purpose
This document records:
1. What legacy-to-MCAP migration is implemented now.
2. How to run migration safely.
3. How to monitor and audit results.
4. How to extend migration for additional countries.

Target migration is from legacy incorporation collections to:
- `UnifiedCompany` (`maBackend/src/mcap/models/unified.model.js`)
- `UnifiedParty` (`maBackend/src/mcap/models/party.model.js`)
- `McapMigrationAudit` (`maBackend/src/mcap/models/migrationAudit.model.js`)

## Implemented Coverage

### Hong Kong (implemented)
- Legacy company source: `maBackend/src/models/hkincorporation.model.js`
- Party sources:
  - Inline parties from HK company doc (`parties[]`)
  - HK linked shareholders from `maBackend/src/models/shrReg.model.js`
  - Link bridge from `maBackend/src/models/shareHolderCompany.model.js`
- Controller handlers:
  - `migrateLegacyHkIncorporation`
  - `listLegacyHkMigrationReports`

### United States (implemented)
- Legacy company source: `maBackend/src/models/usIncorporation.model.js`
- Party sources:
  - Inline shareholders from US company doc (`shareHolders[]`)
  - Individual party profiles from `maBackend/src/models/usIndividualShrDir.model.js`
  - Corporate party profiles from `maBackend/src/models/usCorporateIndvShrDir.model.js`
- Controller handlers:
  - `migrateLegacyUsIncorporation`
  - `listLegacyUsMigrationReports`

### Singapore (implemented)
- Legacy company source: `maBackend/src/models/sgIncorporation.model.js`
- Party sources:
  - Inline parties from SG company doc (`parties[]`)
  - Individual profiles from `maBackend/src/models/sgIndShr.model.js`
  - Corporate profiles from `maBackend/src/models/sgCompMemberReg.model.js`
  - Link bridge from `maBackend/src/models/shareHolderCompany.model.js` (`SG_Individual` / `SG_Corporate`)
- Controller handlers:
  - `migrateLegacySgIncorporation`
  - `listLegacySgMigrationReports`

### Panama (implemented)
- Legacy company source: `maBackend/src/models/paIncorporation.model.js`
- Party sources:
  - Inline parties from Panama company doc (`shareHolders[]`)
  - Individual profiles from `maBackend/src/models/paInviteShrDir.model.js`
  - Corporate profiles from `maBackend/src/models/paCorporateShrHlderInvite.model.js`
  - Link bridge from `maBackend/src/models/shareHolderCompany.model.js` (`PA_Individual` / `PA_Corporate`)
- Controller handlers:
  - `migrateLegacyPaIncorporation`
  - `listLegacyPaMigrationReports`

### Panama Foundation (implemented)
- Legacy company source: `maBackend/src/models/PanamaFoundation.model.js`
- Party sources:
  - Inline parties from Panama Foundation doc (`founders[]`, `councilIndividuals[]`, `councilCorporate`, `protectors[]`, `beneficiaries[]`)
  - Member profiles from `maBackend/src/models/ppifMembers.model.js`
  - Link bridge from `maBackend/src/models/shareHolderCompany.model.js` (`PPIF`/`pif` country rows)
- Controller handlers:
  - `migrateLegacyPpifIncorporation`
  - `listLegacyPpifMigrationReports`

### Common Countries (implemented)
- Legacy company sources from `maBackend/src/constants/commonCountries.js`:
  - `AE`, `BZ`, `BVI`, `KY`, `CW`, `EE`, `MH`, `MT`, `CH`, `VC`, `SC`, `GB`, `CN-SZ`, `CR`
- Party sources:
  - Inline parties from each country model (`parties[]` or `shareHolders[]`)
- Controller handlers:
  - `migrateLegacyCommonIncorporation`
  - `listLegacyCommonMigrationReports`

## API Endpoints
Defined in `maBackend/src/mcap/routes/mcap.routes.js` under `/api/mcap`:

- HK:
  - `POST /migrations/hk-legacy`
  - `GET /migrations/hk-legacy/reports`
- US:
  - `POST /migrations/us-legacy`
  - `GET /migrations/us-legacy/reports`
- SG:
  - `POST /migrations/sg-legacy`
  - `GET /migrations/sg-legacy/reports`
- PA:
  - `POST /migrations/pa-legacy`
  - `GET /migrations/pa-legacy/reports`
- PPIF:
  - `POST /migrations/ppif-legacy`
  - `GET /migrations/ppif-legacy/reports`
- Common Countries:
  - `POST /migrations/common-legacy`
  - `GET /migrations/common-legacy/reports`

All endpoints are protected by auth middleware and require `admin` or `master` role.

## UI Trigger and Monitoring
- Page component: `frontend/src/mcap/McapMigrationAudit.tsx`
- Route: `frontend/src/App.tsx` -> `/incorporation-migrations`
- Supports target selection: `HK`, `US`, `SG`, `PA`, `PPIF`, `COMMON`
- Actions:
  - `Run Preview` (no writes)
  - `Execute Migration` (writes to unified collections)
  - `Refresh Audit History`
  - `Download Report` (JSON)
- Includes per-company unresolved drilldown (`shrDirId`, `email`, `linkId`, reason).

## Query Parameters for Execute/Preview
Supported query params (all countries):
- `preview=true|false`
  - default behavior in backend is preview mode unless explicitly set to `false`
- `force=true|false`
  - if `false`, existing `UnifiedCompany` record with same `_id` is skipped
  - if `true`, existing unified company is updated
- `id=<legacyObjectId>`
  - migrate one specific legacy record
- `limit=<number>`
  - process first N records by `_id` ascending
- `countryCode=<code[,code2,...]>` (COMMON migration only)
  - if omitted, all common countries are processed
  - examples: `countryCode=CR` or `countryCode=AE,BZ,BVI`

Example:
- Preview all SG:
  - `POST /api/mcap/migrations/sg-legacy?preview=true`
- Execute only one US record, forced:
  - `POST /api/mcap/migrations/us-legacy?preview=false&force=true&id=<legacyId>`
- Preview only Costa Rica from common countries:
  - `POST /api/mcap/migrations/common-legacy?preview=true&countryCode=CR`

## Migration Behavior (Important)

### 1) Company identity strategy
- Unified company `_id` is set to legacy company `_id`.
- This ensures deterministic upsert and easy traceability.

### 2) Party migration and dedupe
- Parties are built from legacy inline + linked profile sources.
- Dedupe is done by identity key priority:
  - email
  - legacy `shrDirId`
  - name/type fallback
- Merged parties carry `details.legacyMergedSources` and `details.legacyMergedKeys` where applicable.

### 3) Legacy metadata tagging
Every migrated party is tagged in `details` with:
- `legacySource`
- `legacyCompanyId`
- `legacyPartyKey`
- Additional source-specific fields and flags

This enables idempotent upsert and stale-party cleanup.

### 4) Stale migrated party cleanup
After each company migration:
- Parties in this company with matching legacy source but absent from current run keys are deleted.
- Non-legacy and manually managed parties are preserved.

### 5) Audit creation and resilience
- Each run creates an audit row in `McapMigrationAudit`.
- Audit creation/finalization errors do not block migration execution.
- On unhandled failures, audit `success=false` and `errorMessage` are updated when possible.

## Report Payload (Audit Result)
Primary fields:
- `preview`, `force`
- `totalLegacy`, `migrated`, `created`, `updated`, `skippedExisting`, `failed`
- `partiesFromLegacyDoc`, `partiesFromShareholderLinks`
- `linkRows`, `linkRowsWithShrDirId`, `linkRowsResolved`, `linkRowsUnresolved`
- `dedupedLinkedParties`, `finalParties`
- `unresolvedLinkedByCompany[]`
- `errors[]`
- `sample[]` (first up to 5)

`unresolvedLinkedByCompany[].rows[]` includes:
- `linkId`
- `shrDirId`
- `email`
- `name`
- `reason`
- `dataFilled`

## Safe Execution Procedure

### Pre-run checks
1. Ensure DB backup/snapshot exists.
2. Verify you are logged in as `admin` or `master`.
3. Confirm target country and expected source model count.

### Recommended run sequence
1. Run preview first (`preview=true`).
2. Review:
   - `failed`
   - `linkRowsUnresolved`
   - sample mappings
3. Resolve critical data issues if needed.
4. Execute (`preview=false`).
5. Re-run preview to confirm idempotent stable state.
6. Export report JSON for audit archive.

### Post-run validation
1. Open MCAP company dashboard and verify company count and key records.
2. Open random migrated companies and confirm:
   - applicant/company fields
   - parties and role mappings
   - payment/incorporation statuses
3. Validate unresolved linked party list for follow-up data correction.

## Country-Specific Notes

### HK notes
- Pulls linked party details from `shrReg` via `MultiShareHolderList.shrDirId`.
- Includes DCP role backfill if none explicitly present but resolvable from legacy form.

### US notes
- Merges inline `shareHolders[]` with profile collections (individual/corporate).
- Unresolved rows are generated when expected profile rows are missing by shareholder identity.

### SG notes
- Merges inline `parties[]` with SG individual/corporate profile collections.
- Uses SG link bridge rows (`SG_Individual`, `SG_Corporate`) to resolve `shrDirId`.
- Produces unresolved rows with per-party reason for missing profile/link identity gaps.

### PA notes
- Merges inline `shareHolders[]` with Panama individual/corporate profile collections.
- Uses PA link bridge rows (`PA_Individual`, `PA_Corporate`) to resolve `shrDirId`.
- Preserves legacy officer/shareholder role hints and DCP flags where present.
- Produces unresolved rows with per-party reason for missing profile/link identity gaps.

### PPIF notes
- Merges inline foundation parties (`founders`, `council`, `protectors`, `beneficiaries`) with `ppifmembers` profiles.
- Uses PPIF link bridge rows (`shareHolderCompany.country` = `PPIF`/`pif`) to resolve `shrDirId`.
- Preserves member-level compliance/profile payload from `ppifmembers` in `UnifiedParty.details.legacyRegistration`.
- Produces unresolved rows with `shrDirId`/`email`/`linkId` reason details when links cannot resolve member profiles.

### Common countries notes
- Uses `commonCountries` registry to iterate country models and migrate in one run.
- Supports optional filtering by `countryCode` query parameter (`AE`, `BZ`, `BVI`, `KY`, `CW`, `EE`, `MH`, `MT`, `CH`, `VC`, `SC`, `GB`, `CN-SZ`, `CR`).
- Maps inline parties from `parties[]` and `shareHolders[]` into `UnifiedParty`.
- Uses deterministic per-country legacy party source tagging for idempotent upsert and stale cleanup.

## Key Mapping Reference Sources
When validating mapping intent against legacy UI:
- SG: `frontend/src/pages/Company/Singapore/NewSgIncorporation.tsx`
- HK: `frontend/src/pages/Company/NewHKForm/NewHKIncorporation.tsx`
- US: `frontend/src/pages/Company/USA/UsIncorporation.tsx`
- PPIF: `frontend/src/pages/Company/PanamaFoundation/PaFIncorporation.tsx`

## Extending to a New Country (Template)
1. Add legacy model imports in `mcap.controller.js`.
2. Add legacy source constants (similar to `LEGACY_*_PARTY_SOURCES`).
3. Implement:
   - `buildLegacy<Country>Data`
   - party mappers
   - linked/profile fetch helper
   - `buildLegacy<Country>UnifiedPayload`
   - `migrateLegacy<Country>Incorporation`
   - `listLegacy<Country>MigrationReports`
4. Add routes in `mcap.routes.js`.
5. Add target selector in `McapMigrationAudit.tsx`.
6. Run checks:
   - `node --check` on backend files
   - `eslint` on changed frontend file
7. Run preview migration and verify unresolved drilldown.

## Current Status Summary
As of now, legacy migration into MCAP unified schema is implemented for:
- HK
- US
- SG
- PA
- PPIF
- COMMON (AE/BZ/BVI/KY/CW/EE/MH/MT/CH/VC/SC/GB/CN-SZ/CR)

The audit page supports running and monitoring all six targets.
