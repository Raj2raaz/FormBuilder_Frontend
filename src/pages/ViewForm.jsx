import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import API from "../api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ViewForm = () => {
    const { id } = useParams();
    const [form, setForm] = useState(null);
    const [formData, setFormData] = useState({});
    const [responses, setResponses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        API.get(`/${id}`)
            .then((res) => {
                if (!res.data || !res.data.inputs) {
                    throw new Error("Invalid form data received from the server");
                }

                setForm(res.data);
                setResponses(res.data.responses || []);
                setFormData(
                    res.data.inputs.reduce((acc, _, index) => {
                        acc[index] = "";
                        return acc;
                    }, {})
                );
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching form:", err);
                setError("Failed to load form. Please try again.");
                setLoading(false);
            });
    }, [id]);

    const handleChange = (index, value) => {
        setFormData({ ...formData, [index]: value });
    };

    const handleSubmit = async () => {
        for (let i = 0; i < (form?.inputs || []).length; i++) {
            const input = form.inputs[i];

            if (!formData[i]?.trim()) {
                toast.warning(`Please fill in the "${input.title}" field.`);
                return;
            }

            if (input.type === "email" && !/\S+@\S+\.\S+/.test(formData[i])) {
                toast.warning(`"${input.title}" must be a valid email.`);
                return;
            }

            if (input.type === "number" && isNaN(formData[i])) {
                toast.warning(`"${input.title}" must be a valid number.`);
                return;
            }
        }

        try {
            await API.post(`/form/${id}/submit`, { responses: formData });
            toast.success("Form submitted successfully!");
            setTimeout(() => window.location.reload(), 1500);
        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error("Failed to submit form.");
        }
    };

    const formatCustomDateTime = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.toLocaleString("default", { month: "long" });
        const year = date.getFullYear().toString().slice(-2);

        const getOrdinal = (n) => {
            if (n > 3 && n < 21) return 'th';
            switch (n % 10) {
                case 1: return 'st';
                case 2: return 'nd';
                case 3: return 'rd';
                default: return 'th';
            }
        };

        const hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, "0");
        const ampm = hours >= 12 ? "PM" : "AM";
        const hour12 = hours % 12 || 12;

        return `${day}${getOrdinal(day)} ${month}, ${year} at ${hour12}:${minutes} ${ampm}`;
    };

    if (loading) {
        return <p className="text-center text-gray-500">Loading form...</p>;
    }

    if (error) {
        return <p className="text-center text-red-500">{error}</p>;
    }

    return form ? (
        <div className="max-w-3xl mx-auto my-10">
            <h2 className="text-2xl font-bold mb-4">{form.title}</h2>

            {form.inputs && form.inputs.length > 0 ? (
                form.inputs.map((input, index) => (
                    <div key={index} className="my-4">
                        <label className="block font-semibold mb-1">{input.title}</label>
                        <input
                            type={input.type}
                            placeholder={input.placeholder || ""}
                            className="border p-2 w-full"
                            value={formData[index] || ""}
                            onChange={(e) => handleChange(index, e.target.value)}
                        />
                    </div>
                ))
            ) : (
                <p className="text-gray-500">No input fields available.</p>
            )}

            {form.inputs.length > 0 && (
                <button className="bg-green-500 text-white p-2 rounded mt-4" onClick={handleSubmit}>
                    Submit
                </button>
            )}

            {responses.length > 0 && (
                <div className="mt-8">
                    <h3 className="text-xl font-semibold mb-4">Previous Responses:</h3>
                    {responses.map((response, idx) => (
                        <div key={idx} className="border p-4 rounded-md shadow-md mb-4">
                            <p className="text-gray-600">
                                Submitted At: {formatCustomDateTime(response.submittedAt)}
                            </p>

                            <ul>
                                {Object.entries(response.data).map(([key, value]) => (
                                    <li key={key} className="text-gray-700">
                                        <strong>{key}:</strong> {value}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}
        </div>
    ) : (
        <p className="text-center text-gray-500">Form data is not available.</p>
    );
};

export default ViewForm;
