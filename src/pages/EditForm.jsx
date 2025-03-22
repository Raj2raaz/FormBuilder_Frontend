import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

const EditForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [selectedInput, setSelectedInput] = useState(null);
  const [showInputOptions, setShowInputOptions] = useState(false);
  const [loading, setLoading] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = form.inputs.findIndex((i) => i.id === active.id);
      const newIndex = form.inputs.findIndex((i) => i.id === over.id);
      const reordered = arrayMove(form.inputs, oldIndex, newIndex);
      setForm({ ...form, inputs: reordered });
    }
  };

  useEffect(() => {
    API.get(`/${id}`)
      .then((res) => {
        const formData = res.data;
        formData.inputs = formData.inputs.map((input) => ({
          ...input,
          id: input._id,
        }));
        setForm(formData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching form:", err);
        setLoading(false);
      });
  }, [id]);

  const handleTitleChange = (e) => {
    setForm({ ...form, title: e.target.value });
  };

  const addInput = (type) => {
    if (form.inputs.length >= 20) {
      toast.warning("Maximum 20 inputs allowed");
      return;
    }
    const newInput = {
      id: Date.now(),
      type,
      title: type.charAt(0).toUpperCase() + type.slice(1),
      placeholder: `Enter ${type}`,
    };
    setForm({ ...form, inputs: [...form.inputs, newInput] });
    setSelectedInput(newInput);
    setShowInputOptions(false);
  };

  const updateInput = (field, value) => {
    if (!selectedInput) return;
    const updatedInputs = form.inputs.map((input) =>
      input.id === selectedInput.id ? { ...input, [field]: value } : input
    );
    setForm({ ...form, inputs: updatedInputs });
    setSelectedInput({ ...selectedInput, [field]: value });
  };

  const removeInput = (id) => {
    setForm({ ...form, inputs: form.inputs.filter((input) => input.id !== id) });
    if (selectedInput?.id === id) {
      setSelectedInput(null);
    }
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast.warning("Form title is required!");
      return;
    }

    const updatedInputs = form.inputs.map((input) => {
      const title = input.title?.trim() || input.type.charAt(0).toUpperCase() + input.type.slice(1);
      const placeholder = input.placeholder?.trim() || `Enter ${input.type}`;
      return { ...input, title, placeholder };
    });

    const updatedForm = { ...form, inputs: updatedInputs };

    try {
      await API.put(`/${id}/edit`, updatedForm);
      toast.success("Form updated successfully!");
      setTimeout(() => navigate("/"), 1500);
    } catch (error) {
      console.error("Error updating form:", error);
      toast.error("Failed to update form.");
    }
  };

  return loading ? (
    <p className="text-center text-gray-500">Loading form...</p>
  ) : form ? (
    <div className="max-w-6xl mx-auto my-10">
      <h2 className="text-2xl font-bold text-center mb-6">Edit Form</h2>
      <div className="grid grid-cols-3 gap-6 border rounded-lg shadow-md p-6 bg-white">
        <div className="col-span-2 border-r pr-6">
          <h2 className="text-2xl font-semibold mb-4">{form.title}</h2>
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
              items={form.inputs.map((input) => input.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="mt-4 space-y-4">
                {form.inputs.map((input) => (
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
            Update Form
          </button>
        </div>

        <div className="pl-6">
          <h3 className="text-xl font-bold mb-2">Form Editor</h3>
          <div className="mb-4">
            <label className="text-gray-600 text-sm">Form Title</label>
            <input
              type="text"
              className="border p-2 w-full"
              value={form.title}
              onChange={handleTitleChange}
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
          Save Changes
        </button>
      </div>
    </div>
  ) : (
    <p className="text-center text-red-500">Form not found.</p>
  );
};

export default EditForm;
