export interface CompanyDetails {
    name: string | undefined;
    jurisdiction: string;
  }
  
  export interface DirectorInfo {
    name: string;
  }
  
  export interface SecretaryInfo {
    name: string;
  }
  
  export interface AddressInfo {
    full: string;
  }
  
  export interface ResolutionData {
    company: CompanyDetails;
    // director: DirectorInfo;
    secretary: SecretaryInfo;
    address: AddressInfo;
  }