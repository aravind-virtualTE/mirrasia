# MCAP Widgets and Backend Refactoring Plan

The objective is to refactor the MCAP UI widgets (`ServiceSelectionWidget`, `InvoiceWidget`, `PaymentWidget`) and their corresponding backend logic to adhere strictly to SOLID principles, primarily focusing on Single Responsibility and Open/Closed principles. Extracting business logic, API calls, and layout rendering into specialized hooks, utilities, and services will improve maintainability and testability.

## Proposed Changes

### Frontend (`frontend/`)

#### 1. Common Utilities & Services
- **[NEW] `src/mcap/utils/priceUtils.ts`**: Extract formatting logic (e.g., `formatPrice`, `convertAmount`).
- **[NEW] `src/mcap/services/paymentService.ts`**: Move all direct API fetch calls from `PaymentWidget.tsx` (`createPaymentIntent`, `updateBackendWithPayment`, `uploadBankProof`, etc.) into this typed service.

#### 2. Service Selection Widget Refactoring
- **[NEW] `src/mcap/hooks/useServiceFees.ts`**: Extract the complex fee computation logic (the ~200 line `handleChange` function) from `ServiceSelectionWidget`.
- **[NEW] `src/mcap/fields/components/ServiceRow.tsx`**: Extract the `Row` function for rendering individual widget rows.
- **[NEW] `src/mcap/fields/components/QuantityControl.tsx`**: Reusable component for handling +/- quantity buttons.
- **[MODIFY] `src/mcap/fields/ServiceSelectionWidget.tsx`**: Simplify into a pure rendering component orchestrating the hooks and sub-components.

#### 3. Invoice Widget Refactoring
- **[NEW] `src/mcap/fields/components/InvoiceSection.tsx`**: Extract the `renderSection` function into a separate file.
- **[MODIFY] `src/mcap/fields/InvoiceWidget.tsx`**: Refactor to leverage `priceUtils.ts` and the `InvoiceSection` component. Improve accessibility (e.g., use `<th>`).

#### 4. Payment Widget Refactoring
- **[NEW] `src/mcap/hooks/useStripeIntent.ts`**: Manages Stripe drawer state, initializing the intent via `paymentService`.
- **[NEW] `src/mcap/hooks/useBankProof.ts`**: Manages uploading/deleting bank proofs and success status via `paymentService`.
- **[NEW] `src/mcap/fields/components/MethodSelector.tsx`**: Sub-component to select between Card and Bank transfer.
- **[NEW] `src/mcap/fields/components/PaymentStatusView.tsx`**: Render the layout for successful payment and waiting for admin approval.
- **[MODIFY] `src/mcap/fields/PaymentWidget.tsx`**: Condense from ~1000 lines down to a clean composition of these hooks and components.

---

### Backend (`maBackend/`)

The backend `mcap.controller.js` is quite massive (~7500 lines) and mixes routing, validation, business logic, and third-party integrations (Stripe, AWS).

#### 1. Extract Payment & Billing Service
- **[NEW] `src/mcap/services/payment.service.js`**: Extract the core business logic from Stripe intent creation, signature validations, and bank-proof file uploads.
- **[MODIFY] `src/mcap/controllers/mcap.controller.js`**: Refactor `createPaymentIntent`, `createMcapInvoiceIntent`, `confirmMcapPayment`, `uploadMcapBankProof`, and `deleteMcapBankProof` to parse the request and immediately delegate to `payment.service.js`.

## Verification Plan

### Automated Tests
- Run `npm run build` on both frontend and backend to verify there are no TypeScript/compilation errors.

### Manual Verification
- Render the MCAP Dashboard via `npm run dev` and test a test company flow to verify that:
  - Form validations and step transitions behave exactly as before.
  - Price additions automatically recalculate totals correctly in the `ServiceSelectionWidget`.
  - The `InvoiceWidget` displays line items correctly with matching numbers.
  - `PaymentWidget` successfully opens the `StripeCardDrawer` and uploads bank proof mocks successfully.
