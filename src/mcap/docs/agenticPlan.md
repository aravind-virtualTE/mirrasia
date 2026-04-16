# MCAP Unified Form Engine: Agentic Plan

Last updated: 2026-04-16

## 1. Purpose
This document is the implementation-level reference for how MCAP incorporation and onboarding flows are built, resolved, priced, validated, and debugged.

Use this when you:
- add or update country configs
- change runtime engine behavior
- change pricing widgets or payment logic
- troubleshoot Swiss subtype routing, journey restore, additional executive pricing, or currency issues

## 2. Baseline Flow
The normalized MCAP flow is:
1. `applicant`
2. `compliance`
3. `company`
4. `accounting`
5. `services`
6. `service-agreement`
7. `invoice`
8. `payment`
9. `review`
10. confirmation screen

Country configs can define raw steps differently, but `registry.ts` normalizes them into the shared runtime order.

## 3. Runtime Resolution
Some configs resolve into different runtime subtypes based on `formData`.

Current contract:
- `runtimeResolutionKeys: string[]`
- `resolveRuntimeConfig({ data, parties, journeyType })`
- `resolveCountryContext({ data, parties, journeyType })`
- `onFieldChange(...)` for field-driven runtime actions such as blocking or resetting dependent state

### Swiss rules
Swiss is now a single runtime source of truth in `src/mcap/configs/ch-unified-full.ts`.

Rules:
- first question is `chIncorporationType`
- fixed page title stays `Swiss Company Incorporation`
- runtime subtype still changes steps, services, pricing, and persistence country context
- new unified submissions still persist split country codes:
  - `ag -> CH`
  - `gmbh -> CH_LLC`
  - `foundation -> CH_FOUNDATION`
- changing `chIncorporationType` clears only service and pricing state:
  - `optionalFeeIds`
  - `serviceItemsSelected`
  - `serviceQuantities`
  - `computedFees`
  - coupon fields
  - payment intent metadata
- applicant and core company data must stay intact on Swiss type change

### UAE unified rules
UAE now uses a single runtime source of truth in `src/mcap/configs/uae-unified-full.ts`.

Rules:
- only 4 jurisdictions are active:
  - `dubai-ifza`
  - `abu-dhabi-mainland`
  - `meydan-jafza`
  - `ras-al-khaimah`
- `meydan-jafza` requires sub-selection `uaeMeydanJafzaZone` (`meydan` or `jafza`)
- IFZA keeps an applicant hint that company names should end with `FZCO`
- changing UAE jurisdiction or Meydan/JAFZA sub-selection clears pricing state only:
  - `optionalFeeIds`
  - `serviceItemsSelected`
  - `serviceQuantities`
  - `computedFees`
  - coupon fields
  - payment intent metadata
- RAK is quote-only for now:
  - runtime removes `services`, `invoice`, and `payment` steps
  - applicant/questionnaire, agreement, and review still run
  - pricing note must explain that admin pricing is pending

### Critical invariant
Changing a `runtimeResolutionKeys` field causes `defaultData` to recompute.
That re-triggers the hydration merge in `UnifiedFormEngine`.
Without a guard, loaded `initialData` can overwrite the user's new subtype selection.

Rule:
- never remove the merge guard that preserves user-changed resolution keys
- every field that drives runtime subtype selection must be listed in `runtimeResolutionKeys`

## 4. Journey Policy And Persistence
MCAP supports two journey types:
- `new_incorporation`
- `existing_company_onboarding`

Rules:
- `new_incorporation` uses the full normalized flow
- `existing_company_onboarding` keeps the questionnaire, service agreement, and review
- onboarding removes shared pricing and payment stages globally:
  - `ServiceSelectionWidget`
  - `PanamaServiceSetupWidget`
  - `InvoiceWidget`
  - `PaymentWidget`
  - canonical step ids `services`, `invoice`, `payment`
- onboarding augments the shared `company` step with:
  - `BRN No.`
  - `Incorporation Date`

### Launcher and restore
Current runtime implementation:
- `src/mcap/McapDashboard.tsx` is the launcher entry point
- `Start` opens journey selection for new records
- resume by `companyId` skips the chooser and restores the saved journey
- `journeyType` is stored top-level on the company record
- legacy records default to `new_incorporation`

### Company-aware config resolution
Do not restore MCAP flows from raw `countryCode` alone.

Use:
- `resolveMcapConfigForCompany(...)` to get the correct base config for the record
- `resolveMcapRuntimeConfig(...)` to get the active runtime subtype from current record data

This is required for:
- unified Swiss records
- legacy Swiss records
- detail rendering
- dashboard resume behavior

### Ownership rule
`UnifiedFormEngine` sends `userId` only on create.
Admin updates, step changes, and status changes must not transfer ownership of an existing company record.

## 5. Registry Normalization Rules
`src/mcap/configs/registry.ts` applies normalization in this order:
1. `stripLegalTermsOutsideAgreement`
2. `ensureCommonServiceAgreement`
3. `mergePartiesIntoCompany` for standard-flow countries
4. `ensureReviewStep`
5. `reorderSteps`
6. `attachComplianceGuard`

Standard-flow countries currently include:
- `HK`, `US`, `SG`, `PA`, `PPIF`, `CR`, `UK`, `UAE`, `CH`, `CH_LLC`, `CH_FOUNDATION`, `EE`, `LT`, `IE`, `AU`, `HU`, `BVI`

Notes:
- Swiss AG runtime code is `CH`
- Swiss GmbH runtime code is `CH_LLC`
- registry must not overwrite an already-defined `step.nextGuard`

## 6. Fee Source Of Truth
Preferred model:
- define one shared fee helper per config
- reuse it in `services`, `invoice`, and `payment`

### Services step
`ServiceSelectionWidget`:
- recomputes fees on service and currency changes
- uses step `computeFees` when available
- falls back to widget-side computation for legacy configs
- persists `computedFees`
- can receive an explicit `fees` prop from the engine; when present, those rows are the runtime source of truth

### Invoice and payment steps
`UnifiedFormEngine`:
- recomputes step fees for invoice and payment
- prefers current step fee output
- falls back to cached converted `formData.computedFees` only when step output is missing required FX metadata
- wraps fee output with `applyAdditionalExecutiveFeesToFees(...)`

UAE pricing contract:
- UAE `computeFees` must always return:
  - `items[]` with `kind` (`government` or `service`)
  - `government`, `service`, `total`
  - `currency`
  - card fee fields
- `ServiceSelectionWidget` and `InvoiceWidget` must consume the same computed fee shape
- optional UAE add-ons use manual quantity controls with explicit caps (not party-count-only caps)

### Coupon rule
Coupons are applied after base fee computation inside invoice and payment widgets.
They should not mutate the core source-of-truth service fee model.

## 7. Additional Executive KYC
Shared implementation lives in `src/mcap/additionalExecutivePricing.ts`.

Runtime behavior:
- one global toggle controls the feature: `useAdditionalExecutiveKycService`
- when enabled, managed rows are injected:
  - `additional_executive_individuals`
  - `additional_executive_corporates`
- rows are read-only and marked `managedByPartyData`

Counting rules:
- `party.type === "person"` counts as individual
- `party.type === "entity"` or legacy `party.isCorp === true` counts as corporate
- pricing is charged in packs of two via `Math.ceil(count / 2)`
- `HK` excludes the first two parties from additional-executive billing; only parties after index `1` are billable

Policy rates:
- `HK`: individual `65`, corporate `130`
- all other MCAP countries: individual `100`, corporate `150`

Currency behavior:
- policy rates are authored in `USD`
- for non-USD pricing-base countries, the engine caches:
  - `additionalExecutiveUsdToBaseRate`
  - `additionalExecutiveUsdToBaseCurrency`
- current live example: `EE` converts the default USD policy rates into EUR

## 8. Currency Rules And FX
Runtime enforcement:
- `supportedCurrencies` is enforced in `ServiceSelectionWidget` and `PaymentWidget`
- unsupported saved currency values are normalized to the first allowed currency
- pricing base currency is country-driven:
  - default base currency: `USD`
  - `EE`: `EUR`
  - `HU`: `EUR`
- `EE` and `HU` default to EUR unless the user explicitly changed the selector

FX provider rules:
- primary live lookup is Frankfurter v2
- fallback live lookup is Frankfurter v1
- if live lookup fails after cache warmup, stale cached rates may still be used
- FX provider logic lives in `src/services/exchangeRate.ts`

Service-step fallback behavior:
- if requested conversion fails, `ServiceSelectionWidget` can fall back to the base allowed currency
- when that happens, `computedFees` persists:
  - `conversionFallback: true`
  - `requestedCurrency`

Card surcharge policy:
- USD card: 6%
- EUR card: 6%
- HKD card: 4%

## 9. Validation And Progression
### PartiesManager
`UnifiedFormEngine` enforces:
- `minParties`
- `requireDcp`
- `requirePartyInvite`
- `partyCoverageRules`
- DCP KYC readiness when status exists

### RepeatableSection
For sections using `invite.includeDcpFromKey`, engine enforces:
- at least one DCP-marked entry
- DCP invite completion before progression

### Compliance consultation
Use `McapStep.nextGuard` for business-rule blocks after required-field validation.

Execution order on `Next`:
1. save draft first when `saveDraftOnBlockedNext` applies to invalid required fields
2. required-field validation
3. `currentStep.nextGuard`
4. optional save before block toast
5. block or advance

## 10. Review Step Rules
### Review summary
Preferred behavior:
- use explicit `reviewSummary` rows per country where possible
- render translated option labels, not raw stored values
- render service labels from `computedFees.items` or service metadata

### Signature field
Use `type: "signature"` for `eSign`.

Runtime behavior:
- engine ensures a draft exists before upload
- signature assets upload to backend and store a remote URL in form data
- delete is confirmation-guarded
- legacy inline `data:image/...` values can still render and clear

## 11. Debug Playbook
### A. Wrong step order
Check:
1. registry normalization pipeline
2. `STANDARD_FLOW_COUNTRIES`
3. final normalized runtime `config.steps`

### B. Runtime resolution value reverts
Check:
1. `runtimeResolutionKeys` declares every resolution field
2. hydration merge still preserves user-changed resolution keys
3. field is rendered through the standard change handler
4. Swiss type change still only clears service and pricing state

### C. Invoice and payment totals differ
Check:
1. `optionalFeeIds`, `serviceItemsSelected`, `serviceQuantities`, `paymentCurrency`
2. step `computeFees` output shape
3. FX metadata: `exchangeRateUsed`, `originalCurrency`, `originalAmount`
4. card fee fields
5. additional executive wrapping in services, invoice, and payment

### D. Currency behavior looks wrong
Check:
1. `supportedCurrencies`
2. normalized `paymentCurrency`
3. pricing base currency for the country
4. `paymentCurrencyTouched` for EE and HU
5. `computedFees.conversionFallback`
6. `computedFees.requestedCurrency`
7. Frankfurter lookup and stale-cache behavior

### E. Additional executive rows are wrong
Check:
1. `useAdditionalExecutiveKycService`
2. party types
3. for `HK`, confirm the first two parties are intentionally excluded
4. managed row ids in `computedFees.items`
5. cached USD-to-base conversion fields for non-USD pricing-base countries

### F. Review step or signature is wrong
Check:
1. `reviewSummary` field names match stored data
2. service labels resolve from computed fees or service metadata
3. `eSign` uses `type: "signature"`
4. signature upload/delete endpoints are succeeding

## 12. Country Config Build Standard
For every new country:
1. follow canonical step ids
2. centralize price constants
3. use one shared `computeFees`
4. set `supportedCurrencies`
5. define parties and DCP requirements when needed
6. wire compliance consultation gating through `complianceGuards.ts` or a custom `nextGuard`
7. add party KYC mapping
8. verify dashboard resume and detail rendering
9. keep config text on `mcap.*` translation keys only
10. prefer explicit `reviewSummary` rows
11. use `type: "signature"` for `eSign`

## 13. Change Protocol
Every core behavior change should include:
1. code change
2. `agenticPlan.md` update
3. `unifiedEngineDoc.md` update
4. smoke validation on:
   - one standard country
   - one Swiss or Baltic runtime-resolved country
   - one extended flow such as `PA` or `PPIF`

## 14. Changelog
- 2026-04-16
  - UAE unified flow now uses 4 jurisdictions only (`IFZA`, `Abu Dhabi Mainland`, `Meydan/JAFZA`, `Ras Al Khaimah`)
  - added required `uaeMeydanJafzaZone` sub-selection for combined Meydan/JAFZA jurisdiction
  - moved UAE pricing to one typed unified contract with explicit `government` vs `service` item kinds
  - enabled manual quantity-based add-ons for all priced UAE jurisdictions
  - RAK now runs in quote-only mode by stripping `services`, `invoice`, and `payment` steps at runtime
  - registry now resolves UAE through unified runtime config only (legacy UAE runtime routes retired)
  - retained IFZA applicant hint so proposed company names explicitly end with `FZCO`
- 2026-04-09
  - consolidated Swiss config logic into `src/mcap/configs/ch-unified-full.ts`
  - kept Swiss runtime title fixed while preserving subtype-driven steps, services, pricing, and split-code persistence
  - documented Swiss pricing-only reset on `chIncorporationType` change
  - documented company-aware restore via `resolveMcapConfigForCompany(...)` and `resolveMcapRuntimeConfig(...)`
  - documented create-only `userId` persistence so admin updates do not transfer ownership
  - documented HK first-two-party exclusion for additional executive billing
  - documented `ServiceSelectionWidget` external `fees` support and currency fallback persistence
  - documented Frankfurter v2 primary, Frankfurter v1 fallback, and stale-cache FX fallback
  - documented the `runtimeResolutionKeys` hydration-merge invariant
- 2026-03-23
  - documented global `new_incorporation` and `existing_company_onboarding` journey behavior
- 2026-03-10
  - documented shared additional executive pricing and HK correspondence service rules
- 2026-03-03
  - documented review summary behavior, signature uploads, and compliance consultation guards
- 2026-02-26
  - documented services, invoice, and payment fee alignment rules
