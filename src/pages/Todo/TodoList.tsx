import React, { useEffect } from "react";
import TodoItem from "./TodoItem";
import { Card, CardContent } from "@/components/ui/card";
import TodoForm from "./TodoForm";
import { useAtom } from "jotai";
import { todosAtom, loadTodosAtom } from "./todoAtom";

const TodoList: React.FC<{ companyId: string }> = ({ companyId }) => {
  const [todos] = useAtom(todosAtom);
  const [, loadTodos] = useAtom(loadTodosAtom);

  useEffect(() => {
    loadTodos(companyId);
  }, [companyId, loadTodos]);
  // console.log("todos",todos)
  return (
    <Card className="w-full shadow-sm border-orange-100">
      <CardContent className="pt-4">
        <TodoForm companyId={companyId} />

        <div className="space-y-0">
          {todos.length === 0 ? (
            <p className="text-center text-gray-500 py-4">
              No tasks yet. Add a new task above.
            </p>
          ) : (
            todos.map((todo) => <TodoItem key={todo._id} todo={todo} companyId={companyId} />)
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TodoList;
