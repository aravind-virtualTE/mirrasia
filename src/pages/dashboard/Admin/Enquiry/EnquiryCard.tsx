/* eslint-disable @typescript-eslint/no-explicit-any */
import {useAtom } from "jotai";
import { useEffect, } from "react";
import { Card } from "@/components/ui/card";
import { ListTodo } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getEnquiryData } from "@/services/dataFetch";
import { enquiryAtom } from "./enquiry";


const EnquiryCard: React.FC = () => {
  const navigate = useNavigate();
  const [enquiries, setListState] = useAtom(enquiryAtom);
  useEffect(() => {
    // const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") as string) : null;
    // const id = user ? user.id : ""
    // let filters = {}
    // if (user.role === 'admin') filters = { userId: id, }
    const fetchUser = async () => {
      await getEnquiryData().then((response) => {
        console.log("response   enquiries", response);
        setListState(response.data || []);
      })
    }
    fetchUser()
  }, [])

  const handleCardClick = () => {
    navigate("/enquiries");
  };
  return ( 
    <Card onClick={handleCardClick} className="cursor-pointer hover:shadow-lg transition-shadow p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListTodo className="h-4 w-4 text-green-500" />
          <span className="text-sm font-medium">Enquiry List</span>
        </div>
        <span className="text-sm text-muted-foreground">
          Total: <span className="font-bold">{enquiries.length}</span>
        </span>
      </div>
    </Card>
  )
}

export default EnquiryCard