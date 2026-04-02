# MCAP Unified Form Engine: Agentic Plan

Last updated: 2026-03-23

## 1. Purpose
This document is the implementation-level source of truth for how MCAP incorporation and onboarding flows are built, validated, priced, and debugged.

Use this when you:
- add or update country configs
- change widgets (`ServiceSelectionWidget`, `InvoiceWidget`, `PaymentWidget`, `PartiesManager`, `RepeatableSection`)
- troubleshoot step ordering, journey selection/resume, fee totals, additional executive KYC pricing, DCP gating, invite flow, or payment mismatches

## 2. Baseline Flow
The runtime baseline is a normalized 10-stage journey:
1. `applicant`
2. `compliance`
3. `company` (includes parties for standard-flow countries)
4. `accounting`
5. `services`
6. `service-agreement`
7. `invoice`
8. `payment`
9. `review`
10. confirmation screen (post-submit view)

Country configs can define fewer/more raw steps, but `registry.ts` normalizes them.

### Journey policy
MCAP now supports two global journey types across all countries:
- `new_incorporation`
- `existing_company_onboarding`

Rules:
- `new_incorporation` keeps the full normalized flow.
- `existing_company_onboarding` keeps the same country questionnaire, keeps `service-agreement` and `review`, and removes pricing/payment stages globally:
  - `ServiceSelectionWidget`
  - `PanamaServiceSetupWidget`
  - `InvoiceWidget`
  - `PaymentWidget`
  - canonical step ids `services`, `invoice`, `payment`
- journey policy is applied after registry normalization so all current and future MCAP configs inherit it automatically when they use the shared step ids/widgets.

### Journey entry and persistence
Current runtime implementation:
- `src/mcap/McapDashboard.tsx` is the launcher entry point.
- Clicking `Start` opens a chooser dialog with:
  - `New Incorporation`
  - `Existing Company Onboarding`
- Resume flows opened with `companyId` skip the chooser and restore the saved `journeyType` from the company record.
- `journeyType` is stored top-level on the company document, not inside `data`.
- Backend normalization defaults missing/legacy values to `new_incorporation`.
- On create, backend persists the incoming normalized `journeyType`.
- On update, backend only backfills `journeyType` if the existing record has no value; it does not switch an already-created journey.
- `UnifiedFormEngine` always derives current step, sidebar, progress, review, and submit behavior from the journey-resolved config, not the raw country config.

### Onboarding-specific runtime UX
When `journeyType === existing_company_onboarding`:
- the shared `company` step is augmented with two required onboarding-only fields for every country:
  - `BRN No.`
  - `Incorporation Date`
- `UnifiedFormEngine` renders onboarding-specific title, banner, submit CTA, and confirmation copy.
- The success screen uses onboarding confirmation messaging and skips the standard country “What Happens Next?” step list.
- Pricing widgets and payment/invoice calculations do not run because those steps are removed before render.
- `McapCompanyDetail.tsx` resolves the same journey-filtered config, highlights BRN/incorporation date in the top summary, and hides pricing/payment detail surfaces for onboarding records.
- Backend admin notifications and status emails use onboarding wording instead of incorporation wording.

## 3. Registry Normalization Rules
`src/mcap/configs/registry.ts` applies normalization in this order:
1. `stripLegalTermsOutsideAgreement`
2. `ensureCommonServiceAgreement`
3. `mergePartiesIntoCompany` (for `STANDARD_FLOW_COUNTRIES`)
4. `ensureReviewStep`
5. `reorderSteps`
6. `attachComplianceGuard`

After normalization, frontend journey resolution applies onboarding policy filtering through:
- `src/mcap/journey.ts`

### Standard flow countries (current)
- `HK`, `US`, `SG`, `PA`, `PPIF`, `CR`, `UK`, `UAE`, `CH`, `CH_FOUNDATION`, `CH_LLC`, `EE`, `LT`, `IE`, `AU`, `HU`, `BVI`

Note:
- Swiss GmbH runtime code is `CH_LLC`.
- Swiss AG runtime code is `CH`.
- Registry-level compliance consultation guards are attached after step reordering so the canonical `compliance` step is already in place.
- If a config already defines `step.nextGuard`, registry does not overwrite it.

## 4. Fee Source-of-Truth Model
### Preferred model (new and required for new configs)
Define one shared fee helper in config and reuse it in:
- `services` step (`computeFees`)
- `invoice` step (`computeFees`)
- `payment` step (`computeFees`)

This keeps totals consistent across sections.

### Where calculations are done at runtime
1. `services` step:
- `ServiceSelectionWidget` triggers fee recompute on selection/currency changes.
- If step `computeFees` exists, it is called first and persisted to `formData.computedFees`.
- If a selected currency differs from the fee source currency and `computeFees` did not return matching FX metadata, widget performs source-to-target conversion and writes converted `items`, totals, and FX metadata.
- If step `computeFees` does not exist, widget computes from service metadata and persists `formData.computedFees`.
- `ServiceSelectionWidget` also owns the global additional-executive KYC toggle (`useAdditionalExecutiveKycService`) and live preview panel.
- For HK, `corr_addr` is the only party-managed service. Selection comes from Party KYC / party details per party, and every selected HK party adds one `USD 65` unit regardless of role or party type. The services table is a read-only mirror of the computed counts and pricing.
- The shared correspondence helper is hard-guarded to `HK`, so non-HK flows resolve zero correspondence pricing even if the helper is imported accidentally.
2. `invoice` and `payment` steps:
- `UnifiedFormEngine` resolves step fees from `computeFees`.
- For `InvoiceWidget`/`PaymentWidget`, engine recomputes fresh fees and falls back to cached converted `formData.computedFees` only if step output is missing requested converted FX metadata.
- `UnifiedFormEngine` also wraps fee output with `applyAdditionalExecutiveFeesToFees(...)` so invoice/payment stay aligned with the services-step toggle and current party list.
3. `invoice` and `payment` steps (Coupon Application):
- Coupons can now be applied and validated *after* core fee computation within both `InvoiceWidget.tsx` and `PaymentWidget.tsx`.
- They do not mutate `formData.computedFees` or the core invoice line items. This keeps the core fee source-of-truth clean.
- When valid, the widget dynamically subtracts `couponDiscount` to update the `finalSubtotal` and adjusts card fee recalculations before summing the final `amountToPay`/`grandTotal`.
- The reduced amount and `couponCode` are passed to `createPaymentIntent` in the payment step to generate the correct Stripe payload.

### Party-driven additional executive KYC
Current implementation lives in:
- `src/mcap/additionalExecutivePricing.ts`

Runtime behavior:
- one global toggle controls the feature: `useAdditionalExecutiveKycService`
- when disabled, preview remains visible but no fee is added
- when enabled, two managed service rows are injected:
  - `additional_executive_individuals`
  - `additional_executive_corporates`
- rows are read-only and marked `managedByPartyData`

Counting rules:
- `party.type === "person"` -> individual
- `party.type === "entity"` or legacy `party.isCorp === true` -> corporate
- pricing uses packs of two via `Math.ceil(count / 2)`

Current policy rates:
- `HK`: individual `65`, corporate `130`
- all other MCAP countries: individual `100`, corporate `150`

Currency behavior:
- policy rates are authored in `USD`
- for non-USD pricing-base countries, the helper converts USD policy rates into the pricing base currency before row creation
- current runtime cached fields:
  - `additionalExecutiveUsdToBaseRate`
  - `additionalExecutiveUsdToBaseCurrency`
- `UnifiedFormEngine` fetches and stores the USD-to-base rate when needed
- current active example: `EE` converts the `100/150` USD policy rates into `EUR`

### Services table row source-of-truth
- In `ServiceSelectionWidget`, row `Amount`/`Original` should render from `formData.computedFees.items` (matched by `id`) when available.
- If a computed item is missing or partial, fallback uses source item values plus runtime FX conversion (`exchangeRateUsed`) for the selected non-source currency.
- This prevents the mismatch where grand total updates but row values remain static.

### Supported structure returned by `computeFees`
- `items`
- `government`
- `service`
- `total`
- `currency`
- `cardFeePct`
- `cardFeeSurcharge`
- `grandTotal`
- `originalCurrency`
- `originalAmount`
- `exchangeRateUsed` (when converted)
- `originalAmountUsd` (legacy USD compatibility when source currency is USD)

For quantity-priced optional services, each item may also include:
- `quantity` (integer)
- unit `amount`/`original` (line total is `quantity * amount`)

For managed service rows, item metadata may also include:
- `managedByPartyData: true`
- `managedStatusLabel`
- `unitLabel`

Service selection state for quantity-priced options is persisted in:
- `data.serviceQuantities` (map of `serviceId -> quantity`)

### Legacy-safe fallback behavior
If a service step does not provide `computeFees`, `ServiceSelectionWidget` still computes and stores `formData.computedFees`.

`UnifiedFormEngine` now prefers computed step fees, but if requested non-USD conversion metadata is missing from step `computeFees`, it falls back to cached `formData.computedFees` to prevent invoice/payment FX mismatch.
`ServiceSelectionWidget` and `UnifiedFormEngine` both apply `applyAdditionalExecutiveFeesToFees(...)`, so service/invoice/payment share the same additional-executive KYC totals.
`exchangeRate.ts` is pair-based only. Pricing base currency is decided in the pricing layer:
- default base currency: `USD`
- `EE`: base currency `EUR`
- `HU`: base currency `EUR`
- official Frankfurter / ECB rates are preferred for pricing conversion
- Gemini is fallback only when official FX lookup fails

## 5. Currency Rules
### Runtime enforcement
- `supportedCurrencies` is now enforced in both widgets:
  - `ServiceSelectionWidget`
  - `PaymentWidget`
- If saved/loaded currency is unsupported, runtime normalizes to the first allowed currency.
- `ServiceSelectionWidget` derives the pricing source currency by country:
  - default source currency: `USD`
  - `EE`: source currency `EUR`
  - `HU`: source currency `EUR`
- `EE` and `HU` service pricing now default to `EUR` on load; legacy drafts are normalized back to `EUR` unless the user explicitly changed the currency selector.
- Additional executive KYC default policy rates are USD-authored and converted into the pricing base currency for non-USD base countries.
- Current cached fields used for this policy conversion:
  - `additionalExecutiveUsdToBaseRate`
  - `additionalExecutiveUsdToBaseCurrency`

### Current card surcharge policy
- USD card: 6%
- EUR card: 6%
- HKD card: 4%
- Applied only when `payMethod === "card"`

### Current Eustonia payment currencies
- `EE` currently supports `USD`, `HKD`, and `EUR` in both service selection and payment steps.
- `EE` prices are authored in `EUR`, load in `EUR`, and convert live from `EUR` to `USD` or `HKD` when selected.
- `EUR` follows the 6% card surcharge policy.

### Invoice requirements
`InvoiceWidget` must show:
- subtotal
- card fee line (`cardFeePct`, `cardFeeSurcharge`) when available
- total due (`grandTotal` when available; otherwise `total + surcharge`)
- FX details (`exchangeRateUsed`, `originalCurrency`, `originalAmount`) when converted pricing is present
- `originalAmountUsd` remains available only for legacy USD-source compatibility

## 6. DCP and Invite Validation Rules
### PartiesManager steps
`UnifiedFormEngine` enforces:
- minimum parties (`minParties`)
- DCP existence (`requireDcp`)
- all invited (`requirePartyInvite`)
- party coverage (`partyCoverageRules`)

PartiesManager role controls are now country-configurable through:
- `partyRoleOptions`
- `defaultPartyRoles`

Validation note:
- `partyCoverageRules` can target scalar values or array-valued fields such as root `roles`

When DCP KYC status is present, DCP must be at least one of:
- `in_progress`
- `submitted`
- `approved`

### RepeatableSection steps
For sections using `invite.includeDcpFromKey`, engine now enforces:
- at least one DCP-marked entry
- DCP invite completion before progression

This closes the historical PPIF DCP validation gap.

### Compliance consultation progression guard
`UnifiedFormEngine` also supports step-level business-rule gating through `McapStep.nextGuard`.

Current compliance consultation logic is centralized in:
- `src/mcap/configs/complianceGuards.ts`

Runtime execution order on `Next`:
1. if `saveDraftOnBlockedNext` is enabled and required-field validation fails, save draft first
2. required-field validation
3. `currentStep.nextGuard`
4. if blocked and `saveDraftBeforeBlock !== false`, save draft first
5. show consultation toast
6. do not advance to the next step

Use `nextGuard` when answers are valid form values but still require manual review before progression.

Implementation rules for new countries:
1. model allowed answers per field instead of only checking blocked answers
2. include both shared sanctions-risk questions and country-specific compliance questions
3. use the actual stored option values from the config (`no`, `unknown`, `self_handle`, `internal_resolution`, etc.)
4. prefer centralized mapping in `complianceGuards.ts` when the rule is country-wide
5. set `saveDraftOnBlockedNext: true` when admin must see partial or blocked answers even if the step does not advance
6. define `nextGuard` directly on the step when one country needs special copy or behavior beyond the standard consultation block

Current rule families:
- `HK`, `PPIF`: shared sanctions-risk questions must all be negative
- `SG`, `US`, `PA`: shared sanctions-risk questions must be negative and annual-renewal style questions must stay within allowed proceed values; `SG` also checks `sgAccountingDeclarationIssues`
- `CR`, `AU`: shared questions plus extra local risk questions such as `criminalHistory` or `corporateTaxAcknowledgement`
- `UK`, `UAE`, `CH`, `CH_FOUNDATION`, `CH_LLC`, `IE`, `LT`, `EE`, `HU`: renamed equivalents of the same consultation pattern with country-specific field names and allowed values
- compliance steps with registry-attached guards also enable `saveDraftOnBlockedNext` so admin can inspect selected answers even when the user remains on the same step

## 7. Translation Rules
No user-facing hardcoded text in engine/widget controls.

Use `t(key, fallback)` for:
- validation messages
- navigation labels
- review summary labels

For MCAP country configs:
1. Reuse `mcap.common.*` first for shared text (yes/no/options, common field labels, shared step labels).
2. Add `mcap.<country>.*` only for country-specific wording.
3. Do not redeclare the same sentence under multiple keys in the same locale.
4. If two countries use identical wording, move it to `mcap.common.*` and reference that key from both configs.
5. Keep locale key paths aligned:
- `en.json` is key-path source-of-truth.
- `ko.json` and `zh-TW.json` must mirror new MCAP key paths.
6. Before merge, run a missing-key check for `mcap` across `en` -> `ko/zh-TW`.
7. Before merge, run a duplicate-string review to prevent avoidable translation bloat and debugging drift.
8. Shared onboarding/incorporation journey copy lives under `mcap.journey.*` and must stay aligned across `en`, `ko`, and `zh-TW`.

## 8. Review Step Rules
### Signature field standard
`UnifiedFormEngine` now supports a dedicated `signature` field type rendered through `UnifiedSignatureField`.

Current standard behavior:
- `signature` supports typed signature, drawn signature, and uploaded signature image
- `InlineSignatureCreator` normalizes the signature to a previewable image value before handoff
- `UnifiedFormEngine` calls `ensureDraft()` before persisting a signature so a `companyId` exists
- signature assets are uploaded through `POST /mcap/companies/:id/signature`
- the returned remote asset URL is stored in form data (`data.eSign`)
- remove is guarded by the shared `ConfirmDialog` and uses `DELETE /mcap/companies/:id/signature/:field`
- current country review steps that use `eSign` should use `type: "signature"` instead of `type: "text"`
- registry fallback `buildReviewStep()` also uses `type: "signature"` so normalized review steps stay aligned with country-specific review steps

Implementation note:
- backend signature upload/delete is currently allowlisted for `eSign`
- if a new MCAP signature field is introduced, update the backend allowlist before using `type: "signature"` for that new field
- replacing a remote signature deletes the previous S3 asset on the backend after the new upload succeeds
- legacy inline `data:image/...` signature values still render and can be cleared, but they do not trigger S3 deletion

### Review summary source-of-truth
`McapConfig` now supports:
- `reviewSummary?: McapReviewSummaryRow[]`

Row contract:
- `id`
- `kind`: `field` | `parties` | `services`
- `label?`
- `fieldNames?`
- `useFieldLabel?`
- `showWhenEmpty?`

Runtime behavior:
1. if `config.reviewSummary` exists, engine uses that row definition and order
2. if it does not exist, engine falls back to shared alias-based heuristics
3. `field` rows resolve values from the first non-empty key in `fieldNames`
4. `field` rows render option labels from config metadata instead of raw stored values
5. `services` rows resolve labels from `computedFees.items` or service-step `serviceItems`, never raw service IDs when metadata exists
6. `parties` rows only render when the flow uses `PartiesManager`, unless `showWhenEmpty` is true

### Review summary layout standard
The review summary card is now:
- full-width within the review-step grid (`col-span-full`)
- responsive tile layout:
  - 1 column on mobile
  - 2 columns on small/medium screens
  - 4 columns on wide screens
- long-label/long-value safe via `min-w-0` and `break-words`

Use this layout standard for future review-step enhancements instead of inserting narrow half-width summary blocks.

## 9. Debug Playbook
### A. Wrong step order
Check:
1. `registry.ts` normalization pipeline
2. whether `countryCode` is in `STANDARD_FLOW_COUNTRIES`
3. final normalized `config.steps` order in runtime

### I. Parties step uses unexpected roles or defaults
Check:
1. `currentStep.partyRoleOptions`
2. `currentStep.defaultPartyRoles`
3. fallback defaults in `PartyWidget`
4. whether `partyCoverageRules` are targeting scalar fields or array-valued `roles`

### B. Invoice and payment totals differ
Check in this order:
1. service step selection payload (`optionalFeeIds`, `serviceItemsSelected`, `paymentCurrency`)
2. `computeFees` output shape
3. presence of `exchangeRateUsed`, `originalCurrency`, and `originalAmount` for converted states
4. card fee fields (`cardFeePct`, `cardFeeSurcharge`, `grandTotal`)
5. if additional executive KYC is enabled, verify:
   - `useAdditionalExecutiveKycService`
   - `additional_executive_individuals` / `additional_executive_corporates` rows
   - cached USD-to-base fields for non-USD pricing base countries

### C. Currency selector shows unexpected options
Check:
1. step-level `supportedCurrencies`
2. payment step `supportedCurrencies`
3. normalized runtime currency in `formData.paymentCurrency`
4. pricing base currency returned by `getPricingBaseCurrency(countryCode)`
5. for `EE`, whether `paymentCurrencyTouched` was already persisted from a user override
6. for additional executive KYC in non-USD base countries, whether `additionalExecutiveUsdToBaseRate` has been populated

### D. Cannot proceed from parties/company stage
Check:
1. DCP presence
2. invite statuses
3. party coverage rules
4. DCP KYC status (if available)

### E. RepeatableSection DCP issues (PPIF-like)
Check section config:
- `invite.includeDcpFromKey`
- `invite.statusKey`

Then verify section item data has:
- DCP flag value
- invite flags/status

### F. Additional executive KYC preview or rows are wrong
Check in this order:
1. `useAdditionalExecutiveKycService`
2. party types (`person` vs `entity`)
3. computed managed rows:
   - `additional_executive_individuals`
   - `additional_executive_corporates`
4. `applyAdditionalExecutiveFeesToFees(...)` call sites:
   - `ServiceSelectionWidget`
   - `UnifiedFormEngine`
5. for `EE`, cached USD-to-EUR conversion fields:
   - `additionalExecutiveUsdToBaseRate`
   - `additionalExecutiveUsdToBaseCurrency`

### G. Review summary shows dashes or wrong labels
Check in this order:
1. `config.reviewSummary` field names match actual stored data keys
2. country config field names still match the step definitions
3. summary rows that use `useFieldLabel` point to real config fields
4. `computedFees.items` or `serviceItems` provide labels for selected service IDs
5. fallback alias-based summary is not masking a missing country-level `reviewSummary`

### H. Review step still shows text input instead of signature widget
Check:
1. country config `eSign` field uses `type: "signature"`
2. registry fallback `buildReviewStep()` is in effect for normalized review steps
3. `UnifiedFormEngine` still routes `field.type === "signature"` to `UnifiedSignatureField`

### I. Signature upload or delete does not persist correctly
Check in this order:
1. `ensureDraft()` can create or reuse a `companyId` before signature upload
2. `POST /mcap/companies/:id/signature` returns `success: true` and a `data.url`
3. stored `data.eSign` is a remote `http(s)` URL after save
4. remove confirmation completes `DELETE /mcap/companies/:id/signature/:field`
5. if the stored value is an old `data:image/...` string, clearing works but no S3 delete will occur

## 10. Country Config Build Standard
For every new country:
1. follow normalized step IDs
2. keep fee constants centralized
3. add one shared `computeFees` helper
4. set `supportedCurrencies`
5. define parties requirements (`minParties`, `requireDcp`, `requirePartyInvite`) where applicable
6. define compliance consultation gating:
- add/update the country mapping in `src/mcap/configs/complianceGuards.ts`, or
- define `nextGuard` directly on the `compliance` step when country behavior is custom
 - enable `saveDraftOnBlockedNext` if blocked or incomplete compliance answers must still be persisted for admin review
7. add KYC mapping in party registry
8. verify dashboard/restore by `countryCode`
9. i18n requirements:
- wire config text to `mcap.*` keys only (no hardcoded display text)
- reuse `mcap.common.*` for shared phrases
- add only country-specific copy under `mcap.<country>.*`
- update `ko.json` and `zh-TW.json` for added `mcap` key paths
- avoid duplicate phrase declarations across MCAP translation trees
10. review-step requirements:
- prefer explicit `reviewSummary` rows per country instead of relying on shared fallback aliases
- use `type: "signature"` for `eSign`
- verify service labels in the summary render translated labels, not raw service IDs
- verify signature upload, replace, and remove persist remote URLs and delete storage assets when applicable

## 11. Change Protocol
Every core behavior update must include:
1. code change
2. `agenticPlan.md` update
3. `unifiedEngineDoc.md` update
4. smoke checks for at least:
- one standard config (HK/UK)
- one CH/EE/LT config
- one extended flow config (PA/PPIF)

## 12. Changelog
- 2026-04-02
  - documented that `InvoiceWidget.tsx` now supports matching coupon validation and dynamic UI deductions identically to `PaymentWidget.tsx`
  - documented that `McapCompanyDetail.tsx` surfaces historical coupon applications and deductions in the admin invoice summary
- 2026-03-30
  - added `BVI` to standard flow countries
  - documented `McapUserDashboard.tsx` application tracking hub
  - documented `McapDocumentsHub.tsx` and `McapMigrationAudit.tsx`
  - documented pre-payment summary email dispatch before capture
- 2026-03-23
  - added global MCAP journey types `new_incorporation` and `existing_company_onboarding`
  - documented post-normalization journey filtering for onboarding mode in `src/mcap/journey.ts`
  - documented that onboarding keeps country questions, agreement, and review but removes pricing/payment steps for all countries including PA/PPIF
  - documented launcher chooser flow, resume-by-`companyId` behavior, and top-level `journeyType` persistence/backfill rules
  - documented global onboarding augmentation of the `company` step with required `BRN No.` and `Incorporation Date` fields
  - documented onboarding-specific engine UI overrides for page title, banner, submit CTA, and confirmation behavior
  - documented onboarding-specific admin notification/email wording, detail-page BRN/incorporation summary, and pricing suppression
- 2026-03-10
  - documented party-driven additional executive KYC as the shared cross-country pricing layer in `src/mcap/additionalExecutivePricing.ts`
  - documented the `useAdditionalExecutiveKycService` toggle, live preview, and managed service rows `additional_executive_individuals` / `additional_executive_corporates`
  - documented HK correspondence as the only remaining HK party-managed service and removed stale references to `dcp_headcount`
  - documented non-USD pricing-base conversion for additional executive KYC using cached USD-to-base fields, currently active for `EE` (`USD -> EUR`)
  - documented that both `ServiceSelectionWidget` and `UnifiedFormEngine` wrap fees with `applyAdditionalExecutiveFeesToFees(...)`
- 2026-03-03
  - documented dedicated `signature` field type for MCAP review-step `eSign`
  - documented S3-backed signature upload/delete flow and shared delete confirmation for review-step signatures
  - documented config-driven `reviewSummary` row model and responsive full-width review summary card
  - documented fallback/default review-step use of the shared signature widget
  - documented country-config requirement to prefer explicit review-summary rows over shared aliases
  - documented EE EUR payment support and generalized non-USD FX fallback/card-fee rules
  - documented compliance consultation progression guards via `McapStep.nextGuard`
  - documented registry attachment of country-level compliance guards from `complianceGuards.ts`
  - documented new-country guidance for shared sanctions-risk questions plus country-specific compliance questions
  - documented `saveDraftOnBlockedNext` for persisting blocked/incomplete compliance answers
- 2026-03-02
  - moved HK correspondence-address pricing from manual service quantities into Party KYC party details
  - made HK `corr_addr` rows read-only in service selection and invoice, sourced from Party KYC counts
- 2026-02-27
  - added HK quantity-priced optional service `corr_addr` with per-party caps
  - documented `serviceQuantities` payload for quantity-based service selection
  - added MCAP i18n DRY rules for new country forms
  - documented `mcap.common` reuse requirement and duplicate-key avoidance policy
  - documented locale key-path parity requirement across `en`/`ko`/`zh-TW`
- 2026-02-26
  - documented runtime fee calculation flow across `services`/`invoice`/`payment`
  - documented services table row amount source-of-truth (`computedFees.items` with FX fallback)
- 2026-02-23
  - enforced `supportedCurrencies` in service/payment widgets
  - updated invoice to render card fee and grand total correctly
  - added DCP validation for RepeatableSection invite-driven flows
  - added DCP KYC readiness check when status is present
  - added engine fallback for HKD cached converted fees when compute output misses FX metadata
  - aligned docs with runtime country code `CH_LLC` for Swiss GmbH
