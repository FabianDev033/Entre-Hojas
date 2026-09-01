import { useDroppable } from "@dnd-kit/react";
import type { ReactNode } from "react";

type ColumnProps = {
  id: string;
  children: ReactNode;
};

export default function Column({ id, children }: ColumnProps) {
  const { isDropTarget, ref } = useDroppable({ id });

  return (
    <div
      ref={ref}
      className={`w-full min-h-24 p-2 transition-all duration-200 ease-in-out ${isDropTarget ? "bg-bg-light" : ""}`}>
      {children}
    </div>
  );
}
