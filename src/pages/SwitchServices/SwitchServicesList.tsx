import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getSwitchServicesList } from "@/lib/api/FetchData"
import jwtDecode from "jwt-decode"
import { TokenData } from "@/middleware/ProtectedRoutes"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

type UserData = {
  _id: string
  userId: string
  name: string
  email: string
  phoneNum: string
  identityVerificationMethod: string
  snsAccountId: {
    id: string
    value: string
  }
  selectedRelation: string[]
}

const formatArrayValue = (arr: string[]): string => {
  if (!arr || arr.length === 0) return ""
  const filtered = arr.filter((val) => val.trim() !== "")
  return filtered.join(", ")
}

export default function SwitchServicesList() {
  const [usersData, setUsersData] = useState<UserData[]>([])
  const [searchTerm, ] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("token") as string
    const decodedToken = jwtDecode<TokenData>(token)

    const getData = async () => {
      try {
        const userId = decodedToken.role === "admin" || decodedToken.role === "master" ? "" : decodedToken.userId
        const data = await getSwitchServicesList(userId)
        // console.log("data",data)
        setUsersData(data.service)
      } catch (error) {
        console.error("Failed to fetch switch services list:", error)
      }
    }

    getData()
  }, [])

  const filteredUsers = usersData.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user._id.includes(searchTerm)
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Switch Services Submissions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>ID</TableHead>
                  {/* <TableHead>User ID</TableHead> */}
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Verification</TableHead>
                  <TableHead>SNS Platform</TableHead>
                  <TableHead>SNS ID</TableHead>
                  <TableHead>Relations</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user._id} className="hover:bg-muted/50 cursor-pointer">
                    <TableCell className="font-mono text-xs">{user._id.slice(0, 6)}...</TableCell>
                    {/* <TableCell className="font-mono text-xs">{user.userId?.slice(0, 6)}...</TableCell> */}
                    <TableCell>{user.name || "-"}</TableCell>
                    <TableCell>{user.email || "-"}</TableCell>
                    <TableCell>{user.phoneNum || "-"}</TableCell>
                    <TableCell>{user.identityVerificationMethod || "-"}</TableCell>
                    <TableCell>{user.snsAccountId?.id || "-"}</TableCell>
                    <TableCell>{user.snsAccountId?.value || "-"}</TableCell>
                    <TableCell>{formatArrayValue(user.selectedRelation)}</TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                      No results found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          Showing {filteredUsers.length} of {usersData.length} list
        </div>
      </CardContent>
    </Card>
  )
}
