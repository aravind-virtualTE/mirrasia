# Additional Executive Pricing

## Purpose

This file holds the technical design and code-change notes for the additional executive pricing change.
The in-app admin page is intentionally pricing-only and educational.

## Requested pricing rule

- Party source: `frontend/src/mcap/fields/PartyWidget.tsx`
- Type mapping:
  - `person` -> individual
  - `entity` -> corporate
- Calculation:
  - `individualFee = ceil(personCount / 2) * individualRate`
  - `corporateFee = ceil(entityCount / 2) * corporateRate`

## Country rates

- Default countries:
  - individual rate: `100`
  - corporate rate: `150`
- Hong Kong:
  - individual rate: `65`
  - corporate rate: `130`

## Expected examples

### Individuals

- 1 person -> 100, HK 65
- 2 persons -> 100, HK 65
- 3 persons -> 200, HK 130
- 4 persons -> 200, HK 130
- 5 persons -> 300, HK 195

### Corporates

- 1 corporate -> 150, HK 130
- 2 corporates -> 150, HK 130
- 3 corporates -> 300, HK 260
- 4 corporates -> 300, HK 260
- 5 corporates -> 450, HK 390

## Current repo behavior

### UK

- File: `frontend/src/mcap/configs/uk-full.ts`
- Current behavior:
  - `services` step has field `ukAdditionalExecutivePairs`
  - options are manually selected by the user
  - fee row is added as `uk_additional_kyc_compliance_option`
- Change needed:
  - remove dependency on manual selection
  - derive pricing from `parties`

### Hong Kong

- File: `frontend/src/mcap/configs/hk-full.ts`
- Current behavior:
  - `computeKycExtras` derives extra KYC from `parties`
  - logic does not match the requested pair-based pricing
- Change needed:
  - replace current formula with requested pair-based pricing

## Recommended architecture

Follow the same shared-helper pattern already used by correspondence pricing:

- existing helper:
  - `frontend/src/mcap/correspondenceService.ts`
- existing engine integration:
  - `frontend/src/mcap/UnifiedFormEngine.tsx`

Recommended new shared helper, either:

- extend `correspondenceService.ts`, or
- create a dedicated helper such as `additionalExecutivePricing.ts`

Suggested helper surface:

```ts
getAdditionalExecutiveCounts(parties)
getAdditionalExecutiveRates(countryCode)
buildAdditionalExecutiveFeeItem(countryCode, parties)
applyAdditionalExecutiveFeesToFees(fees, { countryCode, parties, payMethod })
```

## Proposed logic details

### Count extraction

- use `Array.isArray(parties) ? parties : []`
- individual count:
  - `party.type !== "entity"`
- corporate count:
  - `party.type === "entity"`
- keep backward compatibility where useful:
  - if old data uses `isCorp === true`, treat it as corporate

### Fee composition

- compute counts separately for individuals and corporates
- compute pack counts with `Math.ceil(count / 2)`
- create one or two service fee rows:
  - individual additional executive row
  - corporate additional executive row
- label should stay human-readable and country-neutral

### Total recomputation

- after adding or replacing the fee rows:
  - recompute `government`
  - recompute `service`
  - recompute `total`
  - recompute `cardFeeSurcharge`
  - recompute `grandTotal`

## Suggested fee row ids

- `additional_executive_individuals`
- `additional_executive_corporates`

These ids are easier to override, test, and display than reusing a UK-specific id.

## Files likely to change

- `frontend/src/mcap/fields/PartyWidget.tsx`
- `frontend/src/mcap/fields/ServiceSelectionWidget.tsx`
- `frontend/src/mcap/UnifiedFormEngine.tsx`
- `frontend/src/mcap/configs/uk-full.ts`
- `frontend/src/mcap/configs/hk-full.ts`
- `frontend/src/mcap/correspondenceService.ts`

## Step-order constraint

These countries place `ServiceSelectionWidget` before `PartiesManager`:

- `frontend/src/mcap/configs/us-full.ts`
- `frontend/src/mcap/configs/sg-full.ts`

Implication:

- party-derived pricing is not final on the service step unless:
  - steps are reordered, or
  - the extra fee is finalized only after parties are entered

Countries where party-driven service pricing is structurally safer:

- UK
- HK
- IE
- LT
- EE
- AU
- UAE IFZA
- CH variants
- CR
- PA

## Migration notes

### UK stored data

- old drafts may already contain `ukAdditionalExecutivePairs`
- implementation should ignore or stop rendering it
- optional cleanup:
  - preserve old stored value without using it in price calculation

### HK pricing transition

- current HK extra-KYC pricing will change behavior
- confirm with admin before release because existing totals may differ from the current formula

## Testing checklist

### Unit scenarios

- 0 person, 0 entity
- 1 person
- 2 persons
- 3 persons
- 1 entity
- 2 entities
- 3 entities
- mixed counts: 1 person + 1 entity
- mixed counts: 3 persons + 3 entities
- HK rates
- default-country rates

### Integration scenarios

- service step displays the new fee rows
- invoice step reflects the same computed fee rows
- payment step grand total matches invoice
- party type changes from `person` to `entity` and recalculates correctly
- removing parties recalculates correctly

## Translation notes

If labels are translated, add new translation keys for:

- additional executive individuals
- additional executive corporates
- optional help text if the service row needs explanation

## Recommendation

Implement the pricing logic only after admin confirms:

- UK manual selector can be retired
- HK formula can be replaced
- US and SG step-order handling is agreed
