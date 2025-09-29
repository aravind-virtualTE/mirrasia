import { NdCount, PIFPricing } from "./PaState"

const ND_PRICES: Record<NdCount, number> = { 0: 0, 1: 1200, 2: 1700, 3: 2200 }
const PRICE_NS  = 1300
const PRICE_EMI = 400
const PRICE_BANK= 2000
const PRICE_CBI = 3880

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

export const money = (n: number, c: "USD" = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: c }).format(n)