import { NdCount, PanamaPIFForm, PIFPricing } from "./PaState"

export const ND_PRICES: Record<NdCount, number> = { 0: 0, 1: 1200, 2: 1700, 3: 2200 }
export const PRICE_NS  = 1300
export const PRICE_EMI = 400
export const PRICE_BANK= 2000
export const PRICE_CBI = 3880

export const money = (n: number, c: "USD" = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: c }).format(n)

export function computePIFSetupTotal(p: PIFPricing) {
  return (
    p.setupBase +
    ND_PRICES[p.ndSetup] +
    (p.nsSetup ? PRICE_NS : 0) +
    (p.optEmi ? PRICE_EMI : 0) +
    (p.optBank ? PRICE_BANK : 0) +
    (p.optCbi ? PRICE_CBI : 0)
  )
}

export function computePIFBaseTotal(form: PanamaPIFForm) {
  // For setup-only invoice, the "base total" is the setup total we computed.
  return computePIFSetupTotal(form.pricing)
}

export function computePIFGrandTotal(form: PanamaPIFForm) {
  const base = computePIFBaseTotal(form)
  const pay = form.payMethod || "card"
  const surcharge = pay === "card" ? base * 0.035 : 0
  return Number((base + surcharge).toFixed(2))
}