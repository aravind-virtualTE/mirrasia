export interface AccountingServiceItem {
  _id: string
  userId: string
  companyName: string
  email: string
  countryName: string
  dateOfIncorporation: string
  selectedIndustry: string[]
  transactionDescription: string
  costOfGoodsSold: string[]
  costSaleRatio: string
  accountingForm: Record<string, string | number | boolean>
  accountInfoData: {
    [key: string]: string[] | string | number
    salesExpenseFiles: string[]
    subsidiaryFiles: string[]
    branchFiles: string[]
    transactionFiles: string[]
  }
}

export interface DetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: AccountingServiceItem | null
}

export interface FileDisplayProps {
    url: string
  }