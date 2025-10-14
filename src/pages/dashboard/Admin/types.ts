export interface Stats {
  pending: number
  kycVerification: number
  waitingForPayment: number
  waitingForDocuments: number
  waitingForIncorporation: number
  incorporationCompleted: number
  // goodStanding: number
  renewalProcessing: number
  renewalCompleted: number
  rejected: number
}


export interface StatsCardProps {
    stats: Stats
  }

  export type companyTableData = {
    country: { name: string; code: string }
    companyName: string | string[];
    applicantName: string
    assignedTo: string
    status: string
    incorporationDate: string | null
    lastLogin: string | null
    _id: string
  }