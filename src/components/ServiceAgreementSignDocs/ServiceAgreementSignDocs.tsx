import React, { useEffect, useState, useCallback, lazy, Suspense } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import jwtDecode from 'jwt-decode';
import { TokenData } from '@/middleware/ProtectedRoutes';
import { getCompDocs, getIncorporationListByCompId } from '@/services/dataFetch';
const SAgrementPdf = lazy(() => import('@/pages/Company/HongKong/ServiceAgreement/SAgrementPdf'));
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
  const [dataFetched, setDataFetched] = useState<boolean>(false);

  const updateCompanyData = useSetAtom(updateCompanyIncorporationAtom);

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

  const fetchCompInfo = useCallback(
    async (companyId: string) => {
      setLoading(true);
      setDataFetched(false);
      try {
        const companyData = await getIncorporationListByCompId(companyId);
        if (companyData.length > 0) {
          updateCompanyData(companyData[0]);
          setDataFetched(true);
        }
      } catch (error) {
        console.error('Error fetching company data:', error);
      } finally {
        setLoading(false);
      }
    },
    [updateCompanyData]
  );

  useEffect(() => {
    if (selectedCompanyId) {
      fetchCompInfo(selectedCompanyId);
    }
  }, [selectedCompanyId, fetchCompInfo]);

  const handleCompanySelect = (companyId: string): void => {
    setDataFetched(false);
    setSelectedCompanyId(companyId);
  };

  return (
    <div className="w-full max-width mx-auto p-6">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold mb-4">
          Sign Incorporation Documents
        </h1>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          {companies.length == 0 && (
            <div className="rounded-md bg-muted text-muted-foreground p-2 text-sm">
              No companies found
            </div>
          )}
          <Select onValueChange={handleCompanySelect} value={selectedCompanyId || ''}>
            <SelectTrigger className="w-full md:w-80">
              <SelectValue placeholder="Select a company" />
            </SelectTrigger>
            <SelectContent>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
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
        // Render SAgrementPdf only if the data has been successfully fetched
        dataFetched && (
          <Suspense fallback={<p>Loading SAgrementPdf component...</p>}>
            <SAgrementPdf id={selectedCompanyId || ''} />
          </Suspense>
        )
      )}
    </div>
  );
};

export default ServiceAgreementSignDocs;