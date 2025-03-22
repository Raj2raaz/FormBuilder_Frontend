import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import React from "react";

const SortableInput = ({ input, isSelected, onClick, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: input.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-2 border rounded flex flex-col bg-gray-100 ${
        isSelected ? "border-blue-500" : ""
      }`}
      onClick={() => onClick(input)}
    >
      <label className="text-gray-700 font-medium">{input.title}</label>
      <input
        type={input.type}
        className="border p-2 mt-1 rounded w-full"
        placeholder={input.placeholder}
        readOnly
      />
      <div className="flex justify-between mt-2 items-center">
        <span
          {...attributes}
          {...listeners}
          className="cursor-grab text-gray-600"
        >
          ☰ Drag
        </span>
        <button
          className="text-red-500"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(input.id);
          }}
        >
          🗑 Delete
        </button>
      </div>
    </div>
  );
};

export default SortableInput;
