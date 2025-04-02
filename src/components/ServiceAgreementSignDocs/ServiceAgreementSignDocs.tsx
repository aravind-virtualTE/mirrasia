import React, { useEffect, useState, useCallback } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import jwtDecode from 'jwt-decode';
import { TokenData } from '@/middleware/ProtectedRoutes';
import { getCompDocs, getIncorporationListByCompId } from '@/services/dataFetch';
import SAgrementPdf from '@/pages/Company/HongKong/ServiceAgreement/SAgrementPdf';
import { useSetAtom } from 'jotai';
import { updateCompanyIncorporationAtom } from '@/lib/atom';

export interface Company {
  id: string;
  companyName: string;
  companyDocs: Document[];
}

const ServiceAgreementSignDocs: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const updateCompanyData = useSetAtom(updateCompanyIncorporationAtom);

  // Fetch company list on mount
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const token = localStorage.getItem('token') as string;
        const decodedToken = jwtDecode<TokenData>(token);
        const data = await getCompDocs(`${decodedToken.userId}`);
        setCompanies(data);
        if (data.length > 0) {
          setSelectedCompanyId(data[0].id);
        }
      } catch (error) {
        console.error('Error fetching companies:', error);
      }
    };

    fetchCompanies();
  }, []);

  // Fetch company details when selectedCompanyId changes
  const fetchCompInfo = useCallback(async (companyId: string) => {
    setLoading(true);
    try {
      const companyData = await getIncorporationListByCompId(companyId);
      if (companyData.length > 0) {
        updateCompanyData(companyData[0]);
      }
    } catch (error) {
      console.error('Error fetching company data:', error);
    }
    setLoading(false);
  }, [updateCompanyData]);

  useEffect(() => {
    if (selectedCompanyId) {
      fetchCompInfo(selectedCompanyId);
    }
  }, [selectedCompanyId, fetchCompInfo]);

  const handleCompanySelect = (companyId: string): void => {
    setSelectedCompanyId(companyId);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold mb-4">Sign Incorporation Documents</h1>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <Select onValueChange={handleCompanySelect} value={selectedCompanyId || ''}>
            <SelectTrigger className="w-full md:w-80">
              <SelectValue placeholder="Select a company" />
            </SelectTrigger>
            <SelectContent>
              {companies.map(company => (
                <SelectItem key={company.id} value={company.id.toString()}>
                  {company.companyName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {loading ? (
        <p>Loading company details...</p>
      ) : (
        selectedCompanyId && <SAgrementPdf id={selectedCompanyId} />
      )}
    </div>
  );
};

export default ServiceAgreementSignDocs;