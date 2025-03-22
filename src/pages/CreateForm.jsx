import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  KeyboardSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  arrayMove,
} from "@dnd-kit/sortable";
import SortableInput from "../components/SortableInput";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CreateForm = () => {
  const [title, setTitle] = useState("Untitled Form");
  const [inputs, setInputs] = useState([]);
  const [selectedInput, setSelectedInput] = useState(null);
  const [showInputOptions, setShowInputOptions] = useState(false);
  const navigate = useNavigate();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = inputs.findIndex((i) => i.id === active.id);
      const newIndex = inputs.findIndex((i) => i.id === over.id);
      const reordered = arrayMove(inputs, oldIndex, newIndex);
      setInputs(reordered);
    }
  };

  const addInput = (type) => {
    if (inputs.length >= 20) {
      toast.warning("Maximum 20 inputs allowed");
      return;
    }
    const newInput = {
      id: Date.now(),
      type,
      title: type.charAt(0).toUpperCase() + type.slice(1),
      placeholder: `Enter ${type}`,
    };
    setInputs([...inputs, newInput]);
    setSelectedInput(newInput);
    setShowInputOptions(false);
  };

  const updateInput = (field, value) => {
    if (!selectedInput) return;
    const updated = inputs.map((inp) =>
      inp.id === selectedInput.id ? { ...inp, [field]: value } : inp
    );
    setInputs(updated);
    setSelectedInput({ ...selectedInput, [field]: value });
  };

  const removeInput = (id) => {
    setInputs(inputs.filter((inp) => inp.id !== id));
    setSelectedInput(null);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.warning("Form title is required!");
      return;
    }

    const processedInputs = inputs.map((input) => {
      return {
        ...input,
        title: input.title?.trim() || input.type.charAt(0).toUpperCase() + input.type.slice(1),
        placeholder: input.placeholder?.trim() || `Enter ${input.type}`,
      };
    });

    try {
      await API.post("/create", { title, inputs: processedInputs });
      toast.success("Form created successfully!");
      setTimeout(() => navigate("/"), 1500);
    } catch (error) {
      console.error("Error creating form:", error);
      toast.error("Failed to create form.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto my-10">
      <h3 className="text-xl text-center font-semibold mb-4">Create New Form</h3>
      <div className="grid grid-cols-3 gap-6 border rounded-lg shadow-md p-6 bg-white">
        <div className="col-span-2 border-r pr-6">
          <h2 className="text-2xl font-semibold mb-4">{title}</h2>
          <button
            className="border px-3 py-1 text-sm rounded bg-gray-500 text-white hover:bg-gray-600"
            onClick={() => setShowInputOptions(!showInputOptions)}
          >
            {showInputOptions ? "Hide Input Options" : "Add Field"}
          </button>

          {showInputOptions && (
            <div className="flex space-x-2 mt-4">
              {["text", "number", "email", "password", "date"].map((type) => (
                <button
                  key={type}
                  className="bg-blue-500 text-white px-3 py-1 text-sm rounded"
                  onClick={() => addInput(type)}
                >
                  {type.toUpperCase()}
                </button>
              ))}
            </div>
          )}

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={inputs.map((input) => input.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="mt-4 space-y-4">
                {inputs.map((input) => (
                  <SortableInput
                    key={input.id}
                    input={input}
                    isSelected={selectedInput?.id === input.id}
                    onClick={setSelectedInput}
                    onDelete={removeInput}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <button
            onClick={handleSubmit}
            className="bg-green-500 text-white px-4 py-2 mt-4 rounded"
          >
            SUBMIT
          </button>
        </div>

        <div className="pl-6">
          <h3 className="text-xl font-bold mb-2">Form Editor</h3>
          <div className="mb-4">
            <label className="text-gray-600 text-sm">Form Title</label>
            <input
              type="text"
              className="border p-2 w-full"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {selectedInput ? (
            <div>
              <label className="text-gray-600 text-sm">Title</label>
              <input
                type="text"
                className="border p-2 w-full mb-2"
                value={selectedInput.title}
                onChange={(e) => updateInput("title", e.target.value)}
              />
              <label className="text-gray-600 text-sm">Placeholder</label>
              <input
                type="text"
                className="border p-2 w-full"
                value={selectedInput.placeholder}
                onChange={(e) => updateInput("placeholder", e.target.value)}
              />
            </div>
          ) : (
            <p className="text-gray-400">Select an input field to edit</p>
          )}
        </div>
      </div>

      <div className="text-center mt-6">
        <button
          onClick={handleSubmit}
          className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700"
        >
          CREATE FORM
        </button>
      </div>
    </div>
  );
};

export default CreateForm;
