import { ArrowRight, CircleDot, MessageCircle } from "lucide-react";
import React from "react";

export default function LeadTracker({ trackerData }) {
    return (

        <div className="max-w-3xl mx-auto p-6 overflow-auto " style={{ maxHeight: '80vh', overflowY: 'auto' }}>
            <h2 className="text-2xl font-bold mb-6">Lead - Status Tracker</h2>
            <ol className="relative border-l border-gray-300">
                {trackerData.map((log) => (
                    <li key={log.id} className="mb-10 ml-6">
                        <span className="absolute -left-3 flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 ring-8 ring-white text-white text-xs font-bold"><CircleDot size={17}/></span>

                        {/* Card */}
                        <div>
                            <p className="text-sm text-gray-500 mb-1">{log.remarks}</p>
                            <p className="font-semibold text-gray-900 flex gap-2">
                                {log.oldStatus}    <ArrowRight />
{log.newStatus}
                            </p>
                            <p className="text-sm text-gray-700 mt-2">
                                <span className="font-medium">By:</span> {log.changedBy}
                            </p>
                            {log.comment && (
                                <p className="text-sm text-gray-600 mt-1 italic flex items-center gap-1">
                                    <MessageCircle size={14} className="text-gray-500" />
                                    {log.comment}
                                </p>
                            )}


                        </div>
                    </li>
                ))}
            </ol>
        </div>
    );
}
