import React, { useEffect, useState } from "react";
import TodoList from "./TodoList";
import { Provider } from "jotai";
import { fetchUsers } from "@/services/dataFetch";
import { User } from "@/components/userList/UsersList";
const AdminTodoList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") as string) : null;
  const id = user ? user.id : ""

  useEffect(() => {

    const fetchUser = async () => {
      await fetchUsers().then((response) => {
        // console.log("response", response)
        const data = response.filter((e: { role: string; }) => e.role == 'admin' || e.role == 'master')
        setUsers(data);
      })
    }
    if (user.role === 'master') {
      fetchUser()
    }
  }, [])
  return (
    <Provider>
      {/* <TodoList userId={id} /> */}
      <TodoList userId={id} currentUser={user} users={users} />
    </Provider>
  );
};
export default AdminTodoList;