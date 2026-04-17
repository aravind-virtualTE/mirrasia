# Unified Form Engine Documentation

Version: 1.9
Last updated: 2026-04-16

## Overview
`UnifiedFormEngine.tsx` is a config-driven workflow engine for multi-country incorporation and onboarding.

Core characteristics:
- config-first rendering
- registry normalization
- runtime subtype resolution
- journey-aware restore and UI behavior
- shared fee contract across services, invoice, and payment
- draft-first persistence and review support

## Primary Files
- `src/mcap/UnifiedFormEngine.tsx`
- `src/mcap/McapDashboard.tsx`
- `src/mcap/McapCompanyDetail.tsx`
- `src/mcap/McapUserDashboard.tsx`
- `src/mcap/journey.ts`
- `src/mcap/configs/registry.ts`
- `src/mcap/configs/types.ts`
- `src/mcap/configs/complianceGuards.ts`
- `src/mcap/additionalExecutivePricing.ts`
- `src/mcap/fields/ServiceSelectionWidget.tsx`
- `src/mcap/fields/PanamaServiceSetupWidget.tsx`
- `src/mcap/fields/InvoiceWidget.tsx`
- `src/mcap/fields/PaymentWidget.tsx`
- `src/mcap/fields/RepeatableSectionWidget.tsx`
- `src/mcap/fields/SignatureField.tsx`
- `src/mcap/correspondenceService.ts`
- `src/services/exchangeRate.ts`

## Type Model Essentials
### `McapConfig`
Important fields:
- `id`, `countryCode`, `countryName`, `currency`
- `steps: McapStep[]`
- `reviewSummary?: McapReviewSummaryRow[]`
- `launcherEnabled?`
- `skipNormalization?`
- `seedData?`
- `runtimeResolutionKeys?`
- `getPreludeSteps?`
- `resolveRuntimeConfig?`
- `resolveCountryContext?`
- `onFieldChange?`
- `entityMeta?`

### `McapRuntimeContext`
Used by runtime config hooks.
Contains:
- `data`
- `parties`
- `journeyType`

### `McapCountryContext`
Used for runtime persistence.
Contains:
- `countryCode`
- `countryName`

### `McapFieldChangeAction`
Config-driven field behavior.
Current patterns:
- `block`
- `reset`

### `McapJourneyType`
- `"new_incorporation" | "existing_company_onboarding"`
- stored top-level on the company record

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
- `widgetConfig`
- `nextGuard`
- `saveDraftOnBlockedNext`

### `McapField`
Review-step relevant addition:
- `type: "signature"`

## Registry Normalization
`registry.ts` normalization pipeline:
1. remove duplicate legal terms outside service agreement
2. ensure common service agreement
3. merge `parties` into `company` for standard-flow countries
4. ensure `review` step exists
5. reorder into canonical flow order
6. attach compliance `nextGuard`

Registry also owns company-aware runtime resolution through:
- `resolveMcapConfigForCompany(...)`
- `resolveMcapRuntimeConfig(...)`

## Runtime Config Resolution
Some configs multiplex multiple subtypes under one launcher config.
The engine resolves the active subtype from `formData`.

How it works:
- config declares `runtimeResolutionKeys`
- engine builds a runtime resolution key memo from current field values
- engine asks `resolveRuntimeConfig(...)` for the active config
- engine asks `resolveCountryContext(...)` for the persistence country context

### Swiss implementation
Swiss now uses `src/mcap/configs/ch-unified-full.ts` as the single source-of-truth file.

Behavior:
- `chIncorporationType` decides the subtype
- page title remains `Swiss Company Incorporation`
- runtime subtype changes steps, services, pricing, and split persistence codes
- changing `chIncorporationType` clears service and pricing state only; it does not clear applicant or core company data

### UAE implementation
UAE now resolves through one runtime config in `src/mcap/configs/uae-unified-full.ts`.

Behavior:
- active jurisdictions are limited to:
  - `dubai-ifza`
  - `abu-dhabi-mainland`
  - `meydan-jafza`
  - `ras-al-khaimah`
- `meydan-jafza` requires `uaeMeydanJafzaZone` (`meydan` or `jafza`)
- IFZA applicant step includes a hint that proposed company names should end with `FZCO`
- jurisdiction or Meydan/JAFZA sub-selection changes reset pricing state only
- RAK is quote-only and runtime removes:
  - `services`
  - `invoice`
  - `payment`

### Critical invariant
Changing a runtime resolution field recomputes `defaultData`.
That re-fires the hydration merge.
The merge must preserve user-changed resolution keys instead of restoring stale loaded values.

## Journey Resolution
After normalization, MCAP applies a shared journey policy layer:
- `new_incorporation`
- `existing_company_onboarding`

Onboarding behavior:
- removes pricing stages by shared widget or canonical step id
- keeps country questionnaire, service agreement, and review
- augments the `company` step with `BRN No.` and `Incorporation Date`
- changes titles, banners, submit copy, and confirmation behavior

## Launcher And Restore Flow
Runtime behavior:
- `McapDashboard.tsx` launches new flows and chooses journey type
- resume by `companyId` restores the saved journey and company config
- `McapCompanyDetail.tsx` resolves the same company-aware config and active runtime subtype
- create and first draft payloads can include `userId`
- update payloads must not transfer ownership

## Widget Responsibilities
### ServiceSelectionWidget
Responsibilities:
- render service lines
- enforce `supportedCurrencies`
- compute and persist `computedFees`
- prefer step `computeFees`
- support legacy fallback computation
- support external `fees` from the engine as the row-level source of truth
- split government vs service rows from shared `kind` metadata when provided, with section headers and subtotals:
  - "Government Fees" section (with mandatory badge) when government-kind items exist
  - "Our Service Fees" section for mandatory service items
  - "Optional Add-On Services" section for non-mandatory service items
  - per-section subtotal rows before the grand total
- support live FX conversion when needed
- if conversion fails, fall back to the base allowed currency and persist:
  - `conversionFallback`
  - `requestedCurrency`
- render the global additional executive toggle and preview
- keep managed row totals aligned with invoice and payment
- support explicit manual quantity caps (`quantityControl.max`) for add-ons that are not party-count bound

### PanamaServiceSetupWidget
Responsibilities:
- render PA and PPIF setup service UI
- expose the same additional executive toggle and preview
- keep totals aligned with engine fee wrapping

### InvoiceWidget
Responsibilities:
- render grouped fee items
- render subtotal, card fee, and total due
- render FX metadata when present
- apply coupon deductions after base fee computation

### PaymentWidget
Responsibilities:
- enforce `supportedCurrencies`
- create payment intent or bank transfer flow
- apply card surcharge only for card payment
- apply coupon deductions after base fee computation
- trigger pre-payment summary email behavior where configured

### UnifiedSignatureField
Responsibilities:
- render typed, drawn, and uploaded signatures
- ensure draft existence before upload
- upload remote signature assets
- persist returned remote URL in form data
- clear only after confirmed delete succeeds

### RepeatableSectionWidget
Responsibilities:
- render repeatable blocks
- support invite metadata mapping
- enforce DCP invite rules when configured

## Fee Lifecycle
Recommended flow:
1. user changes service or currency state
2. service step computes fees
3. engine and widget apply additional executive wrapping
4. invoice and payment recompute from the same fee helper
5. coupon logic runs after core fee computation
6. payment method applies card surcharge policy

## Additional Executive KYC Contract
Implementation:
- `src/mcap/additionalExecutivePricing.ts`

Managed rows:
- `additional_executive_individuals`
- `additional_executive_corporates`

Counting rules:
- `party.type === "person"` -> individual
- `party.type === "entity"` or `party.isCorp === true` -> corporate
- pricing uses packs of two
- `HK` excludes the first two parties from billing

Policy rates:
- `HK`: `65` individual, `130` corporate
- all others: `100` individual, `150` corporate

Currency rules:
- policy rates are authored in USD
- non-USD pricing-base countries use cached USD-to-base conversion metadata
- current live non-USD example is `EE`

## Review Behavior
### Review summary
Preferred behavior:
- explicit `reviewSummary` rows when country fields differ from shared aliases
- translated option labels instead of raw stored values
- service labels from computed fees or service metadata

### Signature field
Use `type: "signature"` for `eSign`.
Review and detail rendering should treat the value as an image-capable field.

## Validation And Navigation
### Field validation
Engine validates required and conditionally visible fields.

### Parties validation
Engine validates:
- `minParties`
- `requireDcp`
- `requirePartyInvite`
- `partyCoverageRules`
- DCP KYC status when available

### RepeatableSection DCP enforcement
When `invite.includeDcpFromKey` is set:
- at least one DCP-marked item is required
- DCP invite completion is required before progression

### Step-level navigation guard
`nextGuard` is used for business-rule blocks after required-field validation.
Use it for compliance consultation behavior and similar manual-review cases.

## Currency Behavior
Rules:
- `supportedCurrencies` is enforced in service and payment widgets
- unsupported stale values normalize to the first allowed option
- pricing source currency is country-driven:
  - default `USD`
  - `EE`: `EUR`
  - `HU`: `EUR`
- `EE` and `HU` first load in EUR unless the user had already touched the selector
- FX metadata is expected for converted fee states
- if service conversion falls back to the base currency, `computedFees` stores `conversionFallback` and `requestedCurrency`

FX provider behavior in `exchangeRate.ts`:
- Frankfurter v2 primary
- Frankfurter v1 fallback
- stale cache fallback after failed live lookup

Card surcharge policy:
- USD: 6%
- EUR: 6%
- HKD: 4%

## Troubleshooting
### Runtime subtype selection reverts
Check:
- the resolution field is declared in `runtimeResolutionKeys`
- the hydration merge still preserves user-changed resolution keys
- Swiss type change still only clears pricing and service state

### Onboarding still shows pricing steps
Check:
- journey-resolved runtime config is being used
- record or launcher passes `journeyType: "existing_company_onboarding"`
- pricing stage still uses shared widget names or canonical step ids

### Invoice and payment totals mismatch
Check:
- `computedFees`
- step `computeFees` output
- FX metadata
- additional executive wrapping
- coupon application order

### Additional executive pricing looks wrong
Check:
- toggle state
- party types
- for `HK`, confirm the first two parties are intentionally excluded
- managed row ids in computed fees
- USD-to-base conversion metadata for non-USD pricing-base countries

### Currency behavior looks wrong
Check:
- `supportedCurrencies`
- normalized runtime currency
- `paymentCurrencyTouched`
- `computedFees.conversionFallback`
- `computedFees.requestedCurrency`
- Frankfurter v2, v1, and cache behavior

### Review or signature behavior is wrong
Check:
- `reviewSummary` mappings
- service labels from computed fees
- `eSign` uses `type: "signature"`
- signature upload and delete endpoints succeed

## Maintenance Rules
- keep user-facing text translatable
- do not duplicate fee logic across widgets unless required
- update this doc and `agenticPlan.md` on core behavior changes
- when adding runtime-resolved configs, declare every resolution field and test user selection persistence
- when adding new pricing widgets or step ids, update journey filtering so onboarding remains global
- when adding new review signature fields beyond `eSign`, update backend allowlists before rollout

## Changelog
- 2026-04-16
  - `ServiceSelectionWidget` now renders section headers (Government Fees, Service Fees, Optional Add-Ons) and per-section subtotals for all configs that tag items with `kind`
  - removed legacy UAE dead code: `uae-freezones.ts` deleted, `uae-ifza.ts` trimmed to base step structure only
  - documented unified UAE runtime model with 4 jurisdictions and Meydan/JAFZA sub-selection
  - documented RAK quote-only behavior (`services`, `invoice`, `payment` removed at runtime)
  - documented UAE fee contract requirement for item `kind` split and shared widget consumption
  - documented explicit quantity cap support in `ServiceSelectionWidget`
- 2026-04-09
  - consolidated Swiss config logic into `src/mcap/configs/ch-unified-full.ts`
  - documented fixed Swiss title with subtype-driven runtime behavior
  - documented pricing-only reset on Swiss type change
  - documented company-aware restore via `resolveMcapConfigForCompany(...)` and `resolveMcapRuntimeConfig(...)`
  - documented create-only `userId` persistence
  - documented HK first-two-party exclusion for additional executive billing
  - documented external `fees` support in `ServiceSelectionWidget`
  - documented conversion fallback persistence via `conversionFallback` and `requestedCurrency`
  - documented Frankfurter-only FX chain with stale-cache fallback
  - documented the `runtimeResolutionKeys` hydration invariant
- 2026-03-23
  - documented global onboarding journey behavior
- 2026-03-10
  - documented shared additional executive pricing model
- 2026-03-03
  - documented review summary, signatures, and compliance guards
