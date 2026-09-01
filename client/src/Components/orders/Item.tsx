import { useDraggable } from "@dnd-kit/react";
import type { ReactNode } from "react";
import { useSortable } from "@dnd-kit/react/sortable";
type ItemProps = {
  id: string;
  children: ReactNode;
};

export default function Item({ id, children }: ItemProps) {
  const { ref, isDragging } = useSortable({
    id,
    type: "item",
    accept: "item",
  });

  return (
    <div
      ref={ref}
      className={`mb-2 cursor-grab border p-3 active:cursor-grabbing ${
        isDragging ? "opacity-50" : ""
      }`}>
      {children}
    </div>
  );
}
