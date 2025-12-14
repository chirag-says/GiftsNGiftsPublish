import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { MdReceipt, MdTrendingUp, MdTrendingDown, MdPending, MdCheckCircle, MdWarning } from "react-icons/md";
import { FiAlertCircle, FiInfo } from "react-icons/fi";
import { toast } from "react-toastify";

function GstBreakdown() {
    const navigate = useNavigate();
    const [data, setData] = useState({
        gstPenalty: 0,
        gstPayout: 0,
        gstPendingPayout: 0,
        gstTotalWithdrawCredited: 0,
        gstBreakpointDebit: 0,
        netGstPosition: 0,
        totalCredits: 0,
        totalDebits: 0,
        hasGstNumber: false
    });
    const [loading, setLoading] = useState(true);
    const stoken = localStorage.getItem("stoken");

    const formatINR = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/seller-panel/finance/gst-breakdown`, {
                    headers: { stoken }
                });
                if (res.data.success) {
                    setData(res.data.data);
                }
            } catch (err) {
                console.error("Error fetching GST breakdown:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    // GST Breakdown Card Component
    const GstCard = ({ title, value, icon: Icon, color, subtext, isCredit }) => (
        <div className={`bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-lg transition-all duration-300`}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-gray-500 mb-1">{title}</p>
                    <p className={`text-2xl font-bold ${isCredit === true ? 'text-green-600' : isCredit === false ? 'text-red-600' : 'text-gray-800'}`}>
                        {formatINR(value)}
                    </p>
                    {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
                </div>
                <div className={`p-3 rounded-xl ${color}`}>
                    <Icon className="text-xl text-white" />
                </div>
            </div>
        </div>
    );

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">GST Breakdown</h1>
                    <p className="text-sm text-gray-500">Complete overview of your GST transactions</p>
                </div>
                {!data.hasGstNumber && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-xl">
                        <FiAlertCircle className="text-yellow-600" />
                        <span className="text-sm text-yellow-700">GST number not registered</span>
                    </div>
                )}
            </div>

            {/* Net Position Card */}
            <div className={`rounded-2xl p-6 ${data.netGstPosition >= 0 ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-rose-600'} text-white`}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-white/80 text-sm mb-1">Net GST Position</p>
                        <p className="text-4xl font-bold">{formatINR(data.netGstPosition)}</p>
                        <p className="text-white/60 text-sm mt-2">
                            {data.netGstPosition >= 0 ? 'You have a positive GST balance' : 'You have pending GST obligations'}
                        </p>
                    </div>
                    <div className="p-4 bg-white/20 rounded-2xl">
                        {data.netGstPosition >= 0 ? (
                            <MdTrendingUp className="text-4xl" />
                        ) : (
                            <MdTrendingDown className="text-4xl" />
                        )}
                    </div>
                </div>
            </div>

            {/* Summary Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-green-500 rounded-lg">
                            <MdTrendingUp className="text-xl text-white" />
                        </div>
                        <span className="font-semibold text-green-800">Total Credits</span>
                    </div>
                    <p className="text-3xl font-bold text-green-600">{formatINR(data.totalCredits)}</p>
                    <p className="text-sm text-green-600/70 mt-1">GST Payout + Total Withdrawn</p>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-red-500 rounded-lg">
                            <MdTrendingDown className="text-xl text-white" />
                        </div>
                        <span className="font-semibold text-red-800">Total Debits</span>
                    </div>
                    <p className="text-3xl font-bold text-red-600">{formatINR(data.totalDebits)}</p>
                    <p className="text-sm text-red-600/70 mt-1">GST Penalty + Breakpoint Debit</p>
                </div>
            </div>

            {/* 5 GST Breakdown Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <GstCard
                    title="GST Penalty"
                    value={data.gstPenalty}
                    icon={MdWarning}
                    color="bg-red-500"
                    subtext="Penalty amount charged"
                    isCredit={false}
                />
                <GstCard
                    title="GST Payout"
                    value={data.gstPayout}
                    icon={MdCheckCircle}
                    color="bg-green-500"
                    subtext="GST paid out to you"
                    isCredit={true}
                />
                <GstCard
                    title="GST Pending Payout"
                    value={data.gstPendingPayout}
                    icon={MdPending}
                    color="bg-yellow-500"
                    subtext="Awaiting processing"
                    isCredit={null}
                />
                <GstCard
                    title="GST Total Withdraw Credited"
                    value={data.gstTotalWithdrawCredited}
                    icon={MdTrendingUp}
                    color="bg-blue-500"
                    subtext="Total GST withdrawals credited"
                    isCredit={true}
                />
                <GstCard
                    title="GST Breakpoint (Debit)"
                    value={data.gstBreakpointDebit}
                    icon={MdTrendingDown}
                    color="bg-orange-500"
                    subtext="Amount debited as GST"
                    isCredit={false}
                />
            </div>

            {/* Info Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
                <div className="flex gap-3">
                    <FiInfo className="text-blue-500 text-xl flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-blue-800 mb-2">Understanding GST Breakdown</h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                            <li>• <strong>GST Penalty:</strong> Any penalties charged for GST non-compliance</li>
                            <li>• <strong>GST Payout:</strong> GST amounts paid out to your account</li>
                            <li>• <strong>GST Pending Payout:</strong> GST amounts pending processing</li>
                            <li>• <strong>GST Total Withdraw Credited:</strong> Total GST credited from withdrawals</li>
                            <li>• <strong>GST Breakpoint (Debit):</strong> Total GST deducted from your account</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* GST Registration Prompt (if not registered) */}
            {!data.hasGstNumber && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5">
                    <div className="flex items-start gap-3">
                        <MdWarning className="text-2xl text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-yellow-800 mb-1">GST Registration Recommended</h4>
                            <p className="text-sm text-yellow-700 mb-3">
                                Registering your GST number helps in seamless tax compliance and enables GST input credit claims.
                            </p>
                            <button
                                onClick={() => navigate('/store/settings', { state: { activeTab: 'business' } })}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700 transition-colors"
                            >
                                <MdReceipt /> Add GST Number
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default GstBreakdown;
