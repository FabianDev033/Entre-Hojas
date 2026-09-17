import { useDroppable } from "@dnd-kit/react";
import type { ReactNode } from "react";

type ColumnProps = {
  id: string;
  children: ReactNode;
};

export default function Column({ id, children }: ColumnProps) {
  const { isDropTarget, ref } = useDroppable({
    id,
    type: "column",
    accept: "item",
  });

  return (
    <div
      ref={ref}
      className={`w-full min-h-50 overflow-y-auto p-2 transition-all duration-200 ease-in-out ${isDropTarget ? "bg-bg-light shadow-md rounded-md" : ""}`}>
      {children}
    </div>
  );
}
