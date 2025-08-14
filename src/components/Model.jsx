import React from "react";

export default function Modal({ isOpen, onClose, title, children }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-[90%] sm:w-[40%] p-6 relative">
                {/* Close Button */}
                <button
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                    onClick={onClose}
                >
                    ✕
                </button>

                {/* Title */}
                {title && <h3 className="text-xl font-semibold mb-4 text-blue-700">{title}</h3>}

                {/* Modal Content */}
                {children}
            </div>
        </div>
    );
}
