import React, { useState } from "react";
import { Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import config from "../config";

export default function ChangePassword() {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

    // Password rules
    const rules = {
        minLength: newPassword.length >= 12,
        upper: /[A-Z]/.test(newPassword),
        lower: /[a-z]/.test(newPassword),
        number: /[0-9]/.test(newPassword),
        special: /[^A-Za-z0-9]/.test(newPassword),
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error("New Password and Confirm Password do not match");
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(
                `${config.API_BASE_URL}/auth/app/change-password`,
                {
                    inputData: {
                        oldPassword,
                        newPassword,
                        confirmNewPassword: confirmPassword,
                    },
                },
                {
                    headers: {
                        Authorization: localStorage.getItem("token") || "",
                    },
                }
            );


            if (response.data.status === "success") {
                localStorage.removeItem('forceChangePwd');
                toast.success(response.data.msg);
                setOldPassword("");
                setNewPassword("");
                setConfirmPassword("");
            }

            if (response.data.status === "error") {
                toast.error(response.data.msg);
            }
        } catch (error) {
            if (error.response && error.response.data) {
                toast.error(error.response.data.message || "Failed to change password");
            } else {
                toast.error("Something went wrong. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const renderRule = (valid, text) => (
        <div className="flex items-center gap-2 text-sm">
            {valid ? (
                <CheckCircle2 className="text-green-500" size={16} />
            ) : (
                <XCircle className="text-red-500" size={16} />
            )}
            <span className={valid ? "text-gray-600" : "text-red-600"}>{text}</span>
        </div>
    );

    return (
        <>
            <h1 className="text-xl font-bold mb-4 text-blue-700">
                Change Password
            </h1>

            <form onSubmit={handleSubmit} className="bg-white shadow rounded-2xl p-6 w-full max-w-[600px]"
            >
                {/* Old Password */}
                <div className="mb-5">
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                        Old Password
                    </label>
                    <div className="relative">
                        <input
                            type={showOld ? "text" : "password"}
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            placeholder="Enter old password"
                            className="w-full border rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowOld(!showOld)}
                            className="absolute right-3 top-2.5 text-gray-500"
                        >
                            {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                {/* New Password */}
                <div className="mb-5">
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                        New Password
                    </label>
                    <div className="relative">
                        <input
                            type={showNew ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                            className={`w-full border rounded-lg px-4 py-2 pr-10 focus:ring-2 outline-none ${newPassword && !Object.values(rules).every(Boolean)
                                ? "border-red-400 focus:ring-red-500"
                                : "focus:ring-blue-500"
                                }`}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowNew(!showNew)}
                            className="absolute right-3 top-2.5 text-gray-500"
                        >
                            {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    <div className="mt-2 space-y-1">
                        {renderRule(rules.minLength, "Minimum 12 characters")}
                        {renderRule(rules.upper, "One uppercase character")}
                        {renderRule(rules.lower, "One lowercase character")}
                        {renderRule(rules.number, "One number")}
                        {renderRule(rules.special, "One special character")}
                    </div>
                </div>

                {/* Confirm Password */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                        Confirm New Password
                    </label>
                    <div className="relative">
                        <input
                            type={showConfirm ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            className="w-full border rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute right-3 top-2.5 text-gray-500"
                        >
                            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-40 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
                    >
                        {loading ? "Changing..." : "Change Password"}
                    </button>
                </div>
            </form>
        </>
    );
}
