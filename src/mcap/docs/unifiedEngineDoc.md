# Unified Form Engine Documentation

Version: 1.7
Last updated: 2026-03-23

## Overview
`UnifiedFormEngine.tsx` is a config-driven workflow engine for multi-country incorporation.

Core characteristics:
- config-first step rendering
- widget-based composition
- runtime step normalization through registry
- post-normalization journey policy resolution (`new_incorporation` vs `existing_company_onboarding`)
- journey-aware launcher, resume, and UI copy
- per-step validation and draft autosave
- reusable fee computation contract across service/invoice/payment

## Primary Files
- `src/mcap/UnifiedFormEngine.tsx`
- `src/mcap/McapDashboard.tsx`
- `src/mcap/journey.ts`
- `src/mcap/configs/registry.ts`
- `src/mcap/configs/complianceGuards.ts`
- `src/mcap/configs/types.ts`
- `src/mcap/additionalExecutivePricing.ts`
- `src/mcap/fields/PartyWidget.tsx`
- `src/mcap/fields/SignatureField.tsx`
- `src/components/pdfPage/InlineSignatureCreator.tsx`
- `src/components/shared/ConfirmDialog.tsx`
- `src/mcap/fields/ServiceSelectionWidget.tsx`
- `src/mcap/fields/PanamaServiceSetupWidget.tsx`
- `src/mcap/fields/InvoiceWidget.tsx`
- `src/mcap/fields/PaymentWidget.tsx`
- `src/mcap/fields/RepeatableSectionWidget.tsx`
- `src/mcap/correspondenceService.ts`
- `src/mcap/McapCompanyDetail.tsx`

## Type Model (Essentials)
### `McapConfig`
- `id`, `countryCode`, `countryName`, `currency`
- `steps: McapStep[]`
- `reviewSummary?: McapReviewSummaryRow[]`
- `entityMeta` (optional)

### `McapJourneyType`
- `"new_incorporation" | "existing_company_onboarding"`
- passed into `UnifiedFormEngine` as `journeyType`
- stored top-level on the company record and normalized on read/write

### `McapReviewSummaryRow`
- `id`
- `kind: "field" | "parties" | "services"`
- `label?`
- `fieldNames?`
- `useFieldLabel?`
- `showWhenEmpty?`

### `McapStep`
Important runtime properties:
- `id`, `title`, `description`, `fields`
- `widget`
- `computeFees`
- `supportedCurrencies`
- `serviceItems`
- `minParties`, `requireDcp`, `requirePartyInvite`
- `partyFields`, `partyCoverageRules`
- `partyRoleOptions`, `defaultPartyRoles`
- `widgetConfig` (RepeatableSection)
- `nextGuard`
- `saveDraftOnBlockedNext`

### `McapField`
Review-step relevant addition:
- `type: "signature"`

### `McapStepGuard`
- receives `{ data, parties, entityMeta }`
- returns either `null` or a block result
- block result can set:
  - `title`
  - `description`
  - `variant`
  - `saveDraftBeforeBlock`

## Registry Normalization
`registry.ts` normalization pipeline:
1. remove duplicate legal terms fields outside service agreement
2. inject/normalize common service agreement step
3. merge `parties` into `company` for standard-flow countries
4. ensure `review` step exists
5. reorder into canonical flow order
6. attach compliance `nextGuard` by `countryCode`

This keeps cross-country behavior consistent while allowing country-specific step definitions.

## Journey Resolution
After registry normalization, MCAP applies one global journey policy layer:
- `new_incorporation`
- `existing_company_onboarding`

Current implementation lives in:
- `src/mcap/journey.ts`

Runtime behavior:
- `new_incorporation` returns the normalized config unchanged
- `existing_company_onboarding` removes pricing-related stages for every country by shared widget/id rules:
  - `ServiceSelectionWidget`
  - `PanamaServiceSetupWidget`
  - `InvoiceWidget`
  - `PaymentWidget`
  - step ids `services`, `invoice`, `payment`
- `existing_company_onboarding` also augments the shared `company` step with two required fields:
  - `BRN No.`
  - `Incorporation Date`
- the same country questionnaire, `service-agreement`, and `review` remain in place
- `journeyType` is persisted at the company record level and defaults legacy records to `new_incorporation`

Implementation guardrail:
- if a new pricing-related widget or canonical step id is introduced, update `src/mcap/journey.ts` or onboarding mode will not strip it automatically

## Launcher and Restore Flow
Current launcher behavior lives in:
- `src/mcap/McapDashboard.tsx`

Runtime behavior:
- clicking `Start` opens a chooser dialog for:
  - `New Incorporation`
  - `Existing Company Onboarding`
- the selected journey type is passed into `UnifiedFormEngine` as `journeyType`
- resume flows loaded with `companyId` skip the chooser and restore the saved `journeyType`
- backend create persists the normalized `journeyType`
- backend update only backfills `journeyType` if the existing record is legacy and missing that field

## Journey-Specific UI Behavior
When `journeyType === "existing_company_onboarding"`:
- `UnifiedFormEngine` switches the page title to onboarding wording
- the top section shows an onboarding banner
- the primary submit action uses onboarding wording
- the success view uses onboarding confirmation title/message
- the standard country-specific “What Happens Next?” list is skipped
- progress, sidebar, current step, and review all derive from the already-filtered `runtimeConfig.steps`
- service selection, invoice, and payment widgets never render because the journey layer removed those steps first

Related surfaces:
- `McapCompanyDetail.tsx` surfaces onboarding `BRN No.` and `Incorporation Date` in the top company summary and suppresses duplicate rendering in the lower questionnaire cards
- `McapCompanyDetail.tsx` resolves the same journey-filtered config so onboarding records hide pricing/payment detail cards and dialogs
- backend admin notifications and status emails branch on `journeyType`

## Widget Responsibilities
### ServiceSelectionWidget
- renders mandatory + optional service line items
- enforces allowed currencies via `supportedCurrencies`
- computes and stores `computedFees`
- uses step `computeFees` when provided (preferred)
- legacy fallback computes fees locally for old configs
- supports live source-to-target FX conversion when step `computeFees` does not provide matching FX metadata
- renders the global additional-executive KYC toggle: `useAdditionalExecutiveKycService`
- renders a live additional-executive preview panel (individual, corporate, total)
- injects read-only managed rows when enabled:
  - `additional_executive_individuals`
  - `additional_executive_corporates`
- re-applies `applyAdditionalExecutiveFeesToFees(...)` after local or step `computeFees` output so service-step totals stay aligned with invoice/payment
- resolves pricing base currency by country:
  - default base currency: `USD`
  - `EE`: base currency `EUR`
  - `HU`: base currency `EUR`
- for `EE` and `HU`, opens in `EUR` by default and preserves user-selected overrides via `paymentCurrencyTouched`
- supports quantity-priced optional services via `item.quantityControl`
  - quantity state persisted in `formData.serviceQuantities`
  - quantity can drive selection (`qty > 0`) and line totals (`qty * unit price`)
- supports item-specific managed-row status copy through `item.managedStatusLabel`

### PanamaServiceSetupWidget
- used by `PA` and `PPIF`
- renders setup/service options for those flows
- now also renders the same additional-executive KYC toggle and preview card
- displays the combined setup total + additional-executive preview total in the service-step UI
- final fee persistence still flows through `UnifiedFormEngine` fee wrapping so invoice/payment stay consistent

### InvoiceWidget
- renders grouped fee items
- renders subtotal, card fee line, and total due
- renders FX metadata when present
- translates item `info` keys before rendering tooltips/details

### PaymentWidget
- enforces allowed currencies via `supportedCurrencies`
- supports Stripe card and bank transfer proof upload
- applies card surcharge only when method is `card`
- supports admin-review status flow for bank proofs

### UnifiedSignatureField
- used when `field.type === "signature"`
- supports typed signature, drawn signature, and uploaded signature image
- uses `InlineSignatureCreator` to normalize typed/drawn/uploaded input before persistence
- `UnifiedFormEngine` ensures a draft company exists before upload
- uploads the signature asset through `POST /mcap/companies/:id/signature`
- stores the returned remote asset URL in form state (for example `data.eSign`)
- remove is guarded by the shared `ConfirmDialog`
- confirmed removal calls `DELETE /mcap/companies/:id/signature/:field` and clears the field only after backend success
- legacy inline `data:image/...` values remain renderable and removable, but only remote `http(s)` URLs trigger storage deletion
- review/detail rendering should treat the value as an image-capable field rather than plain text

### RepeatableSectionWidget
- handles list/object repeating blocks
- supports per-section invite actions
- supports invite metadata mapping (role, email key, type, DCP marker)

## Fee Lifecycle
Recommended flow:
1. service step updates selection and currency
2. shared `computeFees` returns normalized fee structure
3. `applyAdditionalExecutiveFeesToFees(...)` wraps that fee structure when the global additional-executive toggle is enabled
4. invoice and payment steps reuse same `computeFees`
5. `UnifiedFormEngine` wraps invoice/payment fee output with the same additional-executive helper
6. payment method toggles card surcharge behavior

### Additional executive KYC contract
Shared implementation:
- `src/mcap/additionalExecutivePricing.ts`

User control:
- `useAdditionalExecutiveKycService`

Managed row ids:
- `additional_executive_individuals`
- `additional_executive_corporates`

Counting rules:
- `party.type === "person"` -> individual
- `party.type === "entity"` or `party.isCorp === true` -> corporate
- pricing uses packs of two via `Math.ceil(count / 2)`

Current policy rates:
- `HK`: individual `65`, corporate `130`
- all other MCAP countries: individual `100`, corporate `150`

Currency behavior:
- policy rates are authored in `USD`
- for non-USD pricing-base countries, `UnifiedFormEngine` caches:
  - `additionalExecutiveUsdToBaseRate`
  - `additionalExecutiveUsdToBaseCurrency`
- service/invoice/payment use those cached values to convert policy rates before row creation
- current live use case: `EE` dynamically converts the default `100/150` USD policy rates to `EUR`

Expected fee object fields:
- `items`, `government`, `service`, `total`, `currency`
- `cardFeePct`, `cardFeeSurcharge`, `grandTotal`
- `originalCurrency`, `originalAmount`
- `exchangeRateUsed` when converted
- `originalAmountUsd` for legacy USD-source compatibility
- quantity-priced rows may include `quantity` per item (with unit `amount`)

Legacy compatibility:
- if step `computeFees` lacks requested non-USD FX metadata, engine can fall back to cached converted `formData.computedFees`
- HK correspondence-address pricing uses shared party-driven metadata from `src/mcap/correspondenceService.ts` and is computed inside the HK config fee flow
- `CORRESPONDENCE_SERVICE_FIELD` is currently wired only for HK PartyWidget / Party KYC flows; other country configs do not expose or auto-inject `corr_addr`
- `corr_addr` is the only current HK party-managed service. Every selected HK party contributes one `USD 65` correspondence unit regardless of role or party type. The old HK `dcp_headcount` and `extra_kyc` pricing paths are no longer part of the active MCAP pricing model.
- The shared correspondence helper now hard-guards non-HK countries to zero price / zero count so the charge cannot leak into other country fee flows by reuse.
- `exchangeRate.ts` remains pair-based only:
  - official Frankfurter / ECB rates are preferred for pricing
  - Gemini is fallback only
  - pricing source currency is decided in the MCAP pricing layer, not inside the FX helper

## Review Step Behavior
### Review summary
`UnifiedFormEngine` now renders a dedicated review summary block before review-step fields.

Behavior:
1. if `config.reviewSummary` exists, summary rows are rendered from that config
2. otherwise engine falls back to shared alias-based field detection
3. `field` rows use `fieldNames` to find the first non-empty stored value
4. option-based fields render translated labels from field config, not raw stored values
5. `services` rows resolve labels from `computedFees.items` or service-step `serviceItems`
6. `parties` rows reflect the runtime `parties` array size

### Review summary layout
The summary card is now rendered as:
- full-width within the review-step field grid
- 1 column on mobile
- 2 columns on small/medium screens
- 4 columns on wide screens

Each value is rendered in an individual tile with word wrapping so long labels and service lists do not collapse the layout.

### Signature standard
Review-step electronic signature fields should use:
- `type: "signature"`

Do not use plain `text` for `eSign` in new or updated MCAP configs.

Registry fallback behavior:
- the default generated review step in `registry.ts` also uses the shared signature field type so normalized flows stay consistent

Runtime persistence flow:
1. `InlineSignatureCreator` produces a normalized image payload
2. `UnifiedFormEngine` ensures a draft exists and converts that payload to a file
3. backend stores the uploaded asset and returns a remote URL
4. `UnifiedSignatureField` saves that URL into form state
5. remove first asks for confirmation, then deletes the backend asset and clears the field

Backend compatibility note:
- current backend allowlist supports `eSign`
- if you add another signature field, update the backend signature allowlist before rolling out the config

## Validation and Navigation
### Field validation
- checks required fields, conditionally visible fields, nested repeatable fields

### PartiesManager validation
- `minParties`
- `requireDcp`
- `requirePartyInvite`
- `partyCoverageRules`
- DCP KYC readiness check when `kycStatus` exists

Party-role runtime behavior:
- `PartyWidget` uses `currentStep.partyRoleOptions` when provided; otherwise it falls back to the legacy default role list
- new parties use `currentStep.defaultPartyRoles` when provided; otherwise they fall back to the legacy default selection
- `partyCoverageRules` can validate scalar fields or array-valued fields such as root `roles`

### RepeatableSection DCP enforcement
For sections using `invite.includeDcpFromKey`, engine enforces:
- at least one DCP-designated entry
- DCP invite completion before step progression

### Step-level navigation guard
`nextGuard` is used for progression rules that are stricter than required-field validation.

Current runtime order:
1. if `currentStep.saveDraftOnBlockedNext` is enabled and required-field validation fails, save draft first
2. required-field validation
3. `currentStep.nextGuard`
4. if the guard blocks and `saveDraftBeforeBlock !== false`, save draft first
5. show toast message
6. stop progression
7. otherwise save draft and advance

This is the mechanism used for consultation-required compliance steps.

### Navigation guard
- `Next` is blocked when `missingFields` is not empty
- draft autosave runs on every successful next-step transition
- blocked `nextGuard` flows may also save draft before showing the block message

### Compliance consultation reference
Shared sanctions-risk fields used by multiple countries:
- `legalAndEthicalConcern`
- `q_country`
- `sanctionsExposureDeclaration`
- `crimeaSevastapolPresence`
- `russianEnergyPresence`

Country-specific additions are also part of progression gating when they represent consultation or manual-review decisions, for example:
- `annualRenewalConsent`
- `sgAccountingDeclarationIssues`
- `criminalHistory`
- `corporateTaxAcknowledgement`
- renamed equivalents such as `sanctionedCountryOperations`, `legalEthicalIssues`, `ethicalLegalConfirmation`, `legalOrEthicalIssuesConcern`

Implementation notes:
- prefer allowed-value rules per field rather than checking only `"yes"`/`"no"`
- use the actual persisted option values from the config
- keep country-wide mappings in `complianceGuards.ts`
- enable `saveDraftOnBlockedNext` when admin review needs the partial or blocked compliance answers even though the step does not advance
- if a country needs a one-off behavior, define `nextGuard` directly on the step; registry will not overwrite an existing guard

## Currency Behavior
- Supported currencies are controlled per step via `supportedCurrencies`
- runtime normalizes unsupported stale values to first allowed option
- pricing source currency is country-driven:
  - default source currency: `USD`
  - `EE`: source currency `EUR`
  - `HU`: source currency `EUR`
- current surcharge policy:
  - USD card: 6%
  - EUR card: 6%
  - HKD card: 4%
- EE currently exposes `USD`, `HKD`, and `EUR` in service selection and payment
- HU currently exposes `USD`, `HKD`, and `EUR` in service selection and payment
- EE and HU prices are authored and first displayed in `EUR`
- FX metadata (`exchangeRateUsed`, `originalCurrency`, `originalAmount`) is expected for any converted fee state
- additional-executive policy rates are USD-authored and converted into the pricing base currency for non-USD base countries using:
  - `additionalExecutiveUsdToBaseRate`
  - `additionalExecutiveUsdToBaseCurrency`

## Add a New Country (Checklist)
1. create `src/mcap/configs/<country>-full.ts`
2. use canonical step IDs (`applicant`, `compliance`, `company`, `services`, `invoice`, `payment`, `review`)
3. centralize prices in constants
4. define one shared `computeFees`
5. wire `supportedCurrencies`
6. decide whether the `compliance` step needs consultation gating
7. if yes, add the country mapping in `src/mcap/configs/complianceGuards.ts` or define `nextGuard` directly on the step
8. enable `saveDraftOnBlockedNext` when blocked or incomplete compliance answers must still be visible to admin
9. if the parties step needs non-default roles, set `partyRoleOptions` and `defaultPartyRoles`
10. register config in `registry.ts`
11. add party KYC mapping
12. if pricing base currency is not USD, update `getPricingBaseCurrency(countryCode)` inputs
13. test draft save, resume, invoice, payment, review progression, and blocked compliance progression
14. enforce i18n key strategy:
- no new hardcoded user-facing text in config
- reuse `mcap.common.*` before adding `mcap.<country>.*`
- avoid redeclaring identical phrases under new keys
- sync new `mcap` key paths to `ko.json` and `zh-TW.json`

## i18n and Locale DRY Rules
Use these rules for all new MCAP country forms:
1. `en.json` is the MCAP key-path source-of-truth.
2. `ko.json` and `zh-TW.json` must include the same MCAP key paths.
3. Shared wording must live in `mcap.common.*`.
4. Country wording must live in `mcap.<country>.*`.
5. If wording is reused by more than one country, move it to `mcap.common.*`.
6. Do not duplicate equivalent phrases under multiple keys unless wording meaning differs.
7. Run a missing-key audit (`en` -> `ko`/`zh-TW`) before merge.
8. Run a duplicate-phrase review to reduce translation tree bloat and improve debugging traceability.

## Troubleshooting
### Step order is wrong
- inspect normalized output from `registry.ts`
- confirm `countryCode` standard-flow membership

### Onboarding still shows pricing steps
- verify the engine is using `resolveMcapConfigForJourney(config, journeyType)`
- verify the record or launcher is passing `journeyType: "existing_company_onboarding"`
- verify the pricing stage uses one of the shared filtered widget names or canonical step ids from `src/mcap/journey.ts`

### Invoice and payment totals mismatch
- inspect `computedFees` in form state
- verify `computeFees` returns surcharge and FX metadata
- verify payment currency normalization
- if additional executive KYC is enabled, verify managed rows and cached USD-to-base conversion fields

### Cannot proceed from company/parties stage
- verify DCP role presence
- verify invites
- verify party coverage
- verify DCP KYC status when present

### RepeatableSection invite issues
- verify `invite` metadata keys (`emailKey`, `statusKey`, `includeDcpFromKey`)
- verify item objects actually store invite status fields

### Additional executive KYC is missing or wrong
- verify `useAdditionalExecutiveKycService`
- verify party types are actually `person` / `entity`
- inspect `computedFees.items` for:
  - `additional_executive_individuals`
  - `additional_executive_corporates`
- verify `UnifiedFormEngine` and `ServiceSelectionWidget` are both applying `applyAdditionalExecutiveFeesToFees(...)`
- for `EE`, verify:
  - `additionalExecutiveUsdToBaseRate`
  - `additionalExecutiveUsdToBaseCurrency === "EUR"`

### Review summary shows missing values or wrong rows
- verify `config.reviewSummary` exists for that country when the country does not match shared aliases
- verify `fieldNames` map to actual stored keys in `formData`
- verify `useFieldLabel` is only used with real configured fields
- verify service labels exist in either `computedFees.items` or service-step `serviceItems`

### Review step shows plain text signature instead of widget
- verify the country config uses `type: "signature"` for `eSign`
- verify the normalized review step from `registry.ts` also uses the signature type
- verify `UnifiedFormEngine` still routes `field.type === "signature"` to `UnifiedSignatureField`

### Signature upload or delete does not match stored state
- verify `ensureDraft()` can create a `companyId` before upload
- verify `POST /mcap/companies/:id/signature` returns a URL and `data.eSign` becomes a remote `http(s)` value
- verify `DELETE /mcap/companies/:id/signature/:field` succeeds before the field is cleared
- remember that older inline `data:image/...` values can be cleared but do not trigger S3 deletion

## Maintenance Rules
- keep UI text translatable (`t()`), avoid new hardcoded user-facing strings
- avoid duplicating fee logic between widgets
- update this doc and `agenticPlan.md` on core behavior changes
- keep shared onboarding/incorporation copy under `mcap.journey.*` in all locales
- when adding a new MCAP country, ensure pricing-related stages still use shared step ids/widgets so onboarding mode inherits automatically
- when adding a new pricing-stage widget or step id, update `src/mcap/journey.ts` so onboarding stripping remains global
- when adding or updating a country review step:
  - define `reviewSummary` explicitly when field names differ from shared aliases
  - use the shared `signature` field type for `eSign`
  - if you add a new signature field beyond `eSign`, update the backend signature allowlist too
