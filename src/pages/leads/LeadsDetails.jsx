import React, { useEffect, useState } from "react";
import Modal from "../../components/Model";

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
    const [commentError, setCommentError] = useState("");

    const handleSubmit = () => {
        const selectedStatus = status.find((s) => s.lead_status_Name === selectedStatusName) || status.find((s) => s.lead_status_Name === leadDetail.lead_Status);

        handleStatusUpdate(
            leadDetail.lead_Id,
            selectedStatus?.lead_status_Name,
            selectedStatus?.lead_status_Id,
            comment
        );
        setComment("");
    };


    const handleCommentChange = (e) => {
        const value = e.target.value;
        if (value.length > 500) {
            setCommentError("You have reached the 500 character limit");
            return;
        } else {
            setCommentError("");
        }
        setComment(value);
    };


    useEffect(() => {
        if (!isOpen) {
            setComment("");
            setSelectedStatusName("");
            setCommentError("");
        }
    }, [isOpen]);

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
                            onChange={handleCommentChange}
                            placeholder="Enter comment about this status change..."
                        // maxLength={500}
                        />

                        <div className="flex justify-between items-center mt-1">
                            <div className="text-xs text-gray-500">
                                {comment.length}/500 characters
                            </div>
                            {commentError && (
                                <div className="text-xs text-red-600">{commentError}</div>
                            )}
                        </div>
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
                            .map(([key, value]) => {
                                const scrollableKeys = ["lead_Title", "lead_Description", "lead_Source"];
                                const isScrollable = scrollableKeys.includes(key);

                                return (
                                    <div key={key} className="flex flex-col border-b pb-2">
                                        <span className="text-sm text-gray-500 font-medium">
                                            {key.replace(/_/g, " ")}
                                        </span>
                                        <span
                                            className={`text-gray-900 font-semibold break-words ${isScrollable ? "max-h-24 overflow-y-auto pr-1" : ""
                                                }`}
                                        >
                                            {value && value.toString().trim() !== "" ? value : "N/A"}
                                        </span>
                                    </div>
                                );
                            })}
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
