import React from "react";
import TodoList from "./TodoList";
import { Provider } from "jotai";
const TodoApp: React.FC<{ id: string;}> = ({id}) => {
  return (
    <Provider>
        <TodoList companyId={id} />
    </Provider>
  );
};
export default TodoApp;