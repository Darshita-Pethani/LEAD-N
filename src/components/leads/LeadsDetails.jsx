import React, { useState } from "react";
import Modal from "../otherComponents/Model";

export default function LeadsDetails({
    isOpen,
    onClose,
    leadDetail,
    leadDetailLoading,
    handleStatusUpdate,
    status
}) {
    const [selectedStatusName, setSelectedStatusName] = useState("");
    const [comment, setComment] = useState("");

    const handleSubmit = () => {
        if (!selectedStatusName) return;

        const selectedStatus = status.find((s) => s.lead_status_Name === selectedStatusName);

        handleStatusUpdate(
            leadDetail.lead_Id,
            selectedStatus?.lead_status_Name,
            selectedStatus.lead_status_Id, 
            comment
        );
        setComment("");
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Lead Details">
            {leadDetailLoading ? (
                <div className="text-center py-8 text-blue-600 font-medium">Loading...</div>
            ) : leadDetail && !leadDetail.error ? (
                <div className="max-h-[70vh] overflow-y-auto pr-2">
                    {/* Status Update */}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-5">
                        <label className="block text-sm font-semibold text-blue-800 mb-2">
                            Lead Status
                        </label>
                        <select
                            className="border border-blue-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                            value={selectedStatusName || leadDetail.lead_Status}
                            onChange={(e) => setSelectedStatusName(e.target.value)}
                        >
                            <option value="">Select Status</option>
                            {status.map((s) => (
                                <option key={s.lead_status_Id} value={s.lead_status_Name}>
                                    {s.lead_status_Name}
                                </option>
                            ))}
                        </select>

                        {/* Comment */}
                        <label className="block text-sm font-semibold text-blue-800 mt-4 mb-2">
                            Comment
                        </label>
                        <textarea
                            className="border border-blue-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                            rows="3"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Enter comment about this status change..."
                        />

                        {/* Submit Button */}
                        <button
                            onClick={handleSubmit}
                            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                        >
                            Update Status
                        </button>
                    </div>

                    {/* Details Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        {Object.entries(leadDetail)
                            .filter(([key]) => key !== "lead_Status")
                            .map(([key, value]) => (
                                <div key={key} className="flex flex-col border-b pb-2">
                                    <span className="text-sm text-gray-500 font-medium">
                                        {key.replace(/_/g, " ")}
                                    </span>
                                    <span className="text-gray-900 font-semibold break-words">
                                        {String(value)}
                                    </span>
                                </div>
                            ))}
                    </div>
                </div>
            ) : (
                <div className="text-red-600 py-8 text-center font-medium">
                    {leadDetail?.error || "No details found."}
                </div>
            )}
        </Modal>
    );
}
