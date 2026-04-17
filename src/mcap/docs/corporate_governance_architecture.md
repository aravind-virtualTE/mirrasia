# MCAP Corporate Governance & Transaction Architecture

## 1. Executive Summary
Currently, the MCAP engine operates as a static snapshot. `UnifiedCompany` and `UnifiedParty` record the *current* state of a company's hierarchy and shares. To scale into a full Corporate Secretary platform, we must transition to an **Event-Sourced Ledger** model. This document outlines the technical changes required to maintain transaction history, track hierarchy changes, and build an admin-facing audit UI.

---

## 2. Current State Analysis (What Exists)

### Database Level
- **`UnifiedCompany` Model:** Tracks global company status, step progress, incorporation dates, and holds a flat array reference to `parties`.
- **`UnifiedParty` Model:** Stores people and entities associated with a company (`roles`, `name`, `type`). 
  - **The Problem:** It stores equity statically (`shares: Number`, `shareType: String`). If a party transfers 100 shares to another party, the numbers are overwritten, obliterating historical context.
- **`MigrationAudit` Model:** Used *only* for tracking legacy data rollovers, not for ongoing customer activity.

### Frontend Level
- `McapParties.tsx` and `McapCompanyDetail.tsx` render the current list of Directors/Shareholders.
- No UI exists to view the chronological evolution of a company's structure.

---

## 3. The Implementation Roadmap (What is Missing & How to Build it)

To fix this, we need to implement three core structural expansions:

### A. The Corporate Action Audit Engine (Backend)
We need a new model that acts as a generalized blockchain-like ledger for corporate events.

**New Model: `CorporateAction.model.js`**
```javascript
const CorporateActionSchema = new Schema({
    companyId: { type: Schema.Types.ObjectId, ref: "UnifiedCompany", required: true },
    initiatedBy: { type: Schema.Types.ObjectId, ref: "User" }, // The admin/user who made the change
    actionType: { 
        type: String, 
        enum: [
            "SHARE_TRANSFER", 
            "SHARE_ALLOTMENT", 
            "DIRECTOR_APPOINTED", 
            "DIRECTOR_RESIGNED", 
            "DCP_CHANGED"
        ] 
    },
    status: { type: String, enum: ["PENDING_SIGNATURE", "COMPLETED", "REJECTED"], default: "COMPLETED" },
    effectiveDate: { type: Date, required: true },
    
    // Stores the JSON diff of the change
    payload: {
        fromPartyId: { type: Schema.Types.ObjectId, ref: "UnifiedParty" },
        toPartyId: { type: Schema.Types.ObjectId, ref: "UnifiedParty" },
        sharesTransferred: Number,
        previousRoles: [String],
        newRoles: [String]
    },
    
    // Automatically linked generated documents (e.g., Board Resolutions)
    relatedDocuments: [{ type: String }], // S3 URLs
}, { timestamps: true });
```

### B. The Cap Table Ledger (Backend)
Instead of modifying `shares` directly on `UnifiedParty`, all share modifications must flow through a transaction ledger. 

**New Model: `CapTableTransaction.model.js`**
```javascript
const CapTableTransactionSchema = new Schema({
    companyId: { type: Schema.Types.ObjectId, ref: "UnifiedCompany" },
    actionId: { type: Schema.Types.ObjectId, ref: "CorporateAction" },
    sellerId: { type: Schema.Types.ObjectId, ref: "UnifiedParty", required: false }, // Null for Allotment
    buyerId: { type: Schema.Types.ObjectId, ref: "UnifiedParty" },
    shares: { type: Number, required: true },
    shareClass: { type: String, default: "ordinary" },
    transactionDate: { type: Date, default: Date.now },
});
// The current Cap Table is dynamically calculated by aggregating all transactions.
```

### C. Admin API Layer
We need to expose these ledgers to the frontend specifically for Admin review.
**File:** `mcap.routes.js`
- `[GET] /api/mcap/companies/:id/audit-history`: Returns a chronological timeline of `CorporateAction` documents.
- `[GET] /api/mcap/companies/:id/cap-table-ledger`: Returns all share transactions to construct a true mathematical Cap Table.

### D. The Back-Office Command Center ("Lymph Node Visualizer")
We must build an immersive, highly visual Admin dashboard page (`McapCompanyHierarchyHistory.tsx`). This acts as the automated "lymph node system" of the app—where admins can sit back and visually monitor how the system cleans blockages and handles company evolution seamlessly.

**Key Visual Components:**
1. **The Genesis Block (Starting Point):** The top of the dashboard clearly displays the **Incorporation Date** and the exact "Starting Member Details" (who the original Directors & Shareholders were on Day 1).
2. **The "Lymph Node" Flowchart:** Instead of a boring table, we render an interactive vertical timeline flowchart. Each node represents a major company event:
   - *Genesis Event* (Company Born)
   - *Member Added/Removed*
   - *Shares Re-distributed*
   - *Annual Returns / Renewal Triggers*
3. **Automated Renewal Process Tracking:** The timeline integrates directly with the `renewalStatus`. When a company is due for renewal, a visually distinct warning node appears. Once the background process clears the renewal block, the node turns green, showing the new `lastRenewalDate`.
4. **Interactive Member Details Inspector:** Admins can click any node in history, and a side-panel will pop out showing the exact diffs in **Member Details**, capturing exactly what KYC documents were uploaded or what roles changed at that specific point in time.
5. **Approve & Resolve Action Engine:** If a blockage requires manual intervention (like reviewing a rejected bank proof or finalizing a Share Transfer), the node highlights an actionable "Resolve Blockage / Generate Legal Docs" button.

---

## 4. Execution Plan (Phased Rollout)

**Phase 1: Database & Seed Scripts (Days 1-2)**
- Create `CorporateAction` and `CapTableTransaction` models in `backend/src/mcap/models/`.
- Write a migration script that reads the *current* `shares` from all `UnifiedParty` documents and writes an "INITIAL_ALLOTMENT" `CapTableTransaction` for them.

**Phase 2: API Interception (Days 3-5)**
- Modify `syncCompanyParties` in `mcap.controller.js` to detect diffs. If the incoming payload reduces a party's shares while increasing another's, trigger a `SHARE_TRANSFER` action automatically.
- Modify party role changes to trigger `DIRECTOR_RESIGNED` or `DIRECTOR_APPOINTED` audit logs.

**Phase 3: Admin UI (Days 6-8)**
- Build `McapCompanyHierarchyHistory.tsx`.
- Connect the timeline to the new `/audit-history` GET route.
- Allow admins to explicitly trigger a "New Corporate Action" from a dropdown.

---

*This document serves as the master blueprint. Once reviewed and approved by stakeholders, we can begin creating the backend models as outlined in Phase 1.*
