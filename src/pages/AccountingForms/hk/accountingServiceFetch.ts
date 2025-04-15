import api from '@/services/fetch';
import { hkAccountFormState } from './hkAccountState';


export const saveAccountingService = async (data: hkAccountFormState) => {
    try {
        const formData = new FormData();

        // Append primitive fields
        for (const key in data) {
            if (key !== "accountInfoData") {
                const value = data[key as keyof hkAccountFormState];
                formData.append(key, typeof value === "object" ? JSON.stringify(value) : value);
            }
        }

        // Handle files and nested accountInfoData
        if (data.accountInfoData) {
            const accountInfo = data.accountInfoData;

            for (const key in accountInfo) {
                const value = accountInfo[key as keyof typeof accountInfo];

                if (Array.isArray(value) && value.length > 0 && value[0] instanceof File) {
                    value.forEach((file: File,) => {
                        formData.append(`accountInfoData.${key}`, file);
                    });
                } else {
                    formData.append(`accountInfoData.${key}`, typeof value === "object" ? JSON.stringify(value) : value);
                }
            }
        }

        const response = await api.post("/acountingServices/saveOrUpdate/", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return response.data;
    } catch (error) {
        console.error("Error saving accounting service:", error);
        throw error;
    }
};



export const fetchAccountingServices = async (userId?: string) => {
    try {
        const response = await api.get("/acountingServices/getAllUserData", {
            params: userId ? { userId } : {},
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching accounting services:", error);
        throw error;
    }
};



export const fetchAccountingServicesById = async (id?: string) => {
    try {
        const response = await api.get("/acountingServices/getDataById", {
            params: id ? { id } : {},
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching accounting services:", error);
        throw error;
    }
};


export const deleteAccountingService = async (id: string) => {
    try {
        const response = await api.delete(`/acountingServices/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting accounting service:", error);
        throw error;
    }
};