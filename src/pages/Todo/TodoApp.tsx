import React from "react";
import TodoList from "./TodoList";
import { Provider } from "jotai";

const TodoApp: React.FC = () => {
  return (
    <Provider>
        <TodoList />
    </Provider>
  );
};

export default TodoApp;