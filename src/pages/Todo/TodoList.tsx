import React from "react";
import TodoItem from "./TodoItem";
import { Card, CardContent, } from "@/components/ui/card";
import TodoForm from "./TodoForm";
import { useAtom } from "jotai";
import { todosAtom } from "./todoAtom";

const TodoList: React.FC = () => {
  const [todos] = useAtom(todosAtom);

  return (
    <Card className="w-full shadow-sm border-orange-100">    
      <CardContent className="pt-4">
        <TodoForm />

        <div className="space-y-0">
          {todos.length === 0 ? (
            <p className="text-center text-gray-500 py-4">
              No tasks yet. Add a new task above.
            </p>
          ) : (
            todos.map((todo) => <TodoItem key={todo.id} todo={todo} />)
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TodoList;
