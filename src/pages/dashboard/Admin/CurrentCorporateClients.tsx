import { Card } from "@/components/ui/card"
import { Users } from "lucide-react"
import { companyTableData } from "./types";
import { useNavigate } from "react-router-dom"

const CurrentCorporateClient: React.FC<{ data: companyTableData[] }> = ({ data }) => {
    const navigate = useNavigate()
    return (
        <Card onClick={() => navigate("/current-corporate-client")} className="cursor-pointer hover:shadow-lg transition-shadow p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Current Corporate Client</span>
                </div>
                <span className="text-sm text-muted-foreground">Active: <span className="font-bold">{data.length}</span></span>
            </div>
        </Card>
    )
}

export default CurrentCorporateClient