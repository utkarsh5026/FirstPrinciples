import { useReadingStore } from "@/stores";
import { useMemo } from "react";

const useTodoList = () => {
  const todoList = useReadingStore((state) => state.todoList);
  const status = useReadingStore((state) => state.status);

  const completed = useMemo(() => {
    return todoList.filter((item) => item.completed);
  }, [todoList]);

  const pending = useMemo(() => {
    return todoList.filter((item) => !item.completed);
  }, [todoList]);

  return {
    pending,
    completed,
    status,
  };
};

export default useTodoList;
