import api from "@/services/fetch";

export interface Document {
  _id?: string;
  id: string;
  docName: string;
  docUrl: string;
  file?: File;
  createdAt?: string;
  uploadedBy?: string;
  type?: "kyc" | "letters" | "company";
}

export interface DocumentComment {
  _id: string;
  docId: string;
  text: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  companyName: string;
  companyDocs: Document[];
  kycDocs?: Document[];
  letterDocs?: Document[];
  country: { code: string; name: string };
}
export type DocumentType = "kyc" | "letters" | "company";



export const upsertDocumentComment = async (payload: {
  _id?: string; // if present => edit, else create
  docId: string;
  companyId?: string;
  docType: "companyDocs" | "kycDocs" | "letterDocs";
  text: string;
  userId: string;
}) => {
  const res = await api.post("company/document-comments/upsert", payload);
  return res.data;
};

export const deleteDocumentComment = async (commentId: string, userId: string) => {
  const res = await api.delete(`company/document-comments/${commentId}`, {
    data: { userId }, // axios delete body
  });
  return res.data;
};
