### UAE Unified Pricing Refactor (4 Jurisdictions, Dynamic Fees, Debt Cleanup)

#### Summary
- Rework UAE into one clean unified flow with 4 jurisdictions only: `IFZA`, `Abu Dhabi Mainland`, `Meydan/JAFZA`, `Ras Al Khaimah`.
- Keep common questionnaire steps shared, but make pricing/services/invoice dynamic by jurisdiction.
- Make fee presentation HK-style by correctly splitting `Government Fees` vs `Mirr Asia Service Fees` in both service/invoice outputs.
- Treat this as a fresh UAE implementation (no legacy UAE record compatibility required).

#### Key Implementation Changes
- **UAE runtime model and jurisdiction resolution**
  - Update UAE jurisdiction enum/options to the 4 approved jurisdictions.
  - Add required sub-selection field for combined jurisdiction: `uaeMeydanJafzaZone` (`meydan` | `jafza`) in applicant step (near jurisdiction selector).
  - Remove legacy UAE freezone routing from runtime registration and make unified UAE the only active UAE runtime source.
  - Keep jurisdiction-change reset behavior for pricing state (`optionalFeeIds`, `serviceItemsSelected`, `serviceQuantities`, `computedFees`, coupon/payment intent metadata).

- **Pricing architecture (USD base + dynamic conversion in widget)**
  - Build one typed UAE pricing catalog in unified config:
    - IFZA mandatory fees:
      - Government (AED-origin lines converted to USD base, AED shown in line label/info).
      - Service fees in USD.
      - Minimum total locked to USD `8,950` before add-ons.
    - Abu Dhabi mandatory fees and VAT structure with proper `kind` tagging.
    - Meydan/JAFZA base pricing from sub-selection:
      - Meydan: incorporation + management.
      - JAFZA: registration as `government`, incorporation/management as `service`.
    - RAK: pricing unavailable mode (no service/invoice/payment capture).
  - Add optional add-ons for **all priced UAE jurisdictions** (IFZA, Abu Dhabi, Meydan/JAFZA) with manual `+/-` quantity support.
  - Compute functions must always return:
    - `items[]` with explicit `kind` (`government` or `service`)
    - `government`, `service`, `total`, `currency`, card fee fields.

- **Widget behavior cleanup**
  - Extend service quantity controls for manual per-line quantities independent of party count (for person/activity/year style add-ons).
  - Ensure service table and invoice both consume the same computed fee shape and stay total-consistent under currency switch/coupon/card surcharge.
  - For RAK jurisdiction, skip pricing capture steps (services/invoice/payment) and route to quote-style submission path with an informational note.

- **Translations and docs**
  - English-only translation updates for new UAE selector labels, Meydan/JAFZA sub-selection, fee labels/info, and RAK pricing-unavailable messaging.
  - Update both engine docs to reflect UAE unified pricing contract and RAK quote-only behavior.

- **Primary files to change**
  - [uae-unified-full.ts](c:/Users/cheralaaravind/Desktop/client/MirAsia/frontend/src/mcap/configs/uae-unified-full.ts)
  - [ServiceSelectionWidget.tsx](c:/Users/cheralaaravind/Desktop/client/MirAsia/frontend/src/mcap/fields/ServiceSelectionWidget.tsx)
  - [registry.ts](c:/Users/cheralaaravind/Desktop/client/MirAsia/frontend/src/mcap/configs/registry.ts)

#### Test Plan
- **IFZA base pricing**
  - Select IFZA, no add-ons, verify split totals:
    - Government + Service = USD `8,950` minimum.
  - Verify AED-origin government lines are visibly labeled as AED-derived while billed in USD/HKD display currency.

- **Add-on quantity behavior**
  - Add multiple optional items and adjust quantities with `+/-`.
  - Verify totals update instantly and correctly in services and invoice.

- **Abu Dhabi and Meydan/JAFZA**
  - Abu Dhabi: verify VAT and category split are correct.
  - Meydan/JAFZA: switch sub-selection and verify base lines/totals change accordingly; JAFZA registration appears under government.

- **RAK flow**
  - Select RAK and confirm services/invoice/payment are hidden/skipped.
  - Confirm request can still be submitted through non-pricing path.

- **Cross-cutting**
  - Currency switch USD/HKD still works with conversion metadata.
  - Coupon + card fee calculations remain consistent after jurisdiction and quantity changes.
  - Jurisdiction change resets pricing state and preserves non-pricing form data.
  - `npx tsc -b --pretty false` in `frontend` passes.

#### Assumptions Locked
- Fresh UAE rollout; no old UAE data migration/compat layer required.
- English locale only for this scope.
- Pricing compute base currency is USD.
- Add-ons are enabled for all priced UAE jurisdictions.
- Meydan/JAFZA remains one jurisdiction with required sub-choice in applicant step.
- RAK intentionally has no pricing capture until admin provides approved pricing.
