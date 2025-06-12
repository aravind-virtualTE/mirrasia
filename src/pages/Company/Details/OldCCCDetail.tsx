import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import React from 'react'
import MemoApp from './MemosHK';
import AdminProject from '@/pages/dashboard/Admin/Projects/AdminProject';

const OldCCCDetail: React.FC<{ id: string }> = ({ id }) => {

    const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") as string) : null;
    return (
        <Tabs defaultValue="details" className="flex flex-col w-full mx-auto">
            <TabsList className="flex w-full p-1 bg-background/80 rounded-t-lg border-b">
                <TabsTrigger
                    value="details"
                    className="flex-1 py-3 text-md font-medium transition-all rounded-md data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
                >
                    Company Details
                </TabsTrigger>
                <TabsTrigger
                    value="service-agreement"
                    className="flex-1 py-3 text-md font-medium transition-all rounded-md data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
                >
                    Record of Documents
                </TabsTrigger>
                {user.role !== 'user' && (
                    <TabsTrigger
                        value="Memos"
                        className="flex-1 py-3 text-md font-medium transition-all rounded-md data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
                    >
                        Memo
                    </TabsTrigger>
                )}
                {user.role !== 'user' && (
                    <TabsTrigger
                        value="Projects"
                        className="flex-1 py-3 text-md font-medium transition-all rounded-md data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
                    >
                        Project
                    </TabsTrigger>
                )}
                <TabsTrigger
                    value="Checklist"
                    className="flex-1 py-3 text-md font-medium transition-all rounded-md data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
                >
                    Checklist
                </TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="p-6">
                <h2 className="text-2xl font-semibold mb-4">Company Details</h2>
                {/* Add your company details component here */}
            </TabsContent>
            <TabsContent value="service-agreement" className="p-6">
                <div className="space-y-6">
                    <h1 className="text-2xl font-bold">Service Agreement Details</h1>
                </div>
            </TabsContent>
            <TabsContent value="Memos" className="p-6">
                <div className="space-y-6">
                    <MemoApp id={id} />
                </div>
            </TabsContent>
            <TabsContent value="Projects" className="p-6">
                <div className="space-y-6">
                    <AdminProject id={id} />
                </div>
            </TabsContent>
            <TabsContent value="Checklist" className="p-6">
                <div>checklist updating soon...</div>
                {/* <ChecklistHistory id={id} items={[usIncorporationItems, usRenewalList]} /> */}
            </TabsContent>
        </Tabs>
    )
}

export default OldCCCDetail