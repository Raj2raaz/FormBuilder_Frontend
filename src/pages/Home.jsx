import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import { toast } from "react-toastify";

const Home = () => {
    const [forms, setForms] = useState([]);

    useEffect(() => {
        API.get("/")
            .then((response) => setForms(response.data))
            .catch((error) => console.error("Error fetching forms", error));
    }, []);

    return (
        <div className="max-w-4xl mx-auto my-10">
            <Link to="/form/create">
                <button className="bg-green-500 text-white px-4 py-2 rounded">Create New Form</button>
            </Link>
            <h2 className="text-2xl font-bold mt-6">Forms</h2>
            {forms.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 mt-4">
                    {forms.map((form) => (
                        <div key={form._id} className="p-4 border rounded-lg bg-white shadow-md flex justify-between items-center">
                            <h3 className="text-xl">{form.title}</h3>
                            <div>
                                <Link to={`/form/${form._id}`} className="text-blue-500 mx-2">View</Link>
                                <Link to={`/form/${form._id}/edit`} className="text-green-500 mx-2">Edit</Link>
                                <button
                                    className="text-red-500"
                                    onClick={async () => {
                                        try {
                                        await API.delete(`/${form._id}`);
                                        toast.success("Form deleted successfully!");
                                        setForms(forms.filter(f => f._id !== form._id));
                                        } catch (err) {
                                        toast.error("Failed to delete form");
                                        }
                                    }}
                                >
                                    Delete
                                </button>

                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No forms available</p>
            )}
        </div>
    );
};

export default Home;
