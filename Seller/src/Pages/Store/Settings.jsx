import React, { useState } from "react";
import { LuStore, LuSettings } from "react-icons/lu";
import { MdBusiness, MdBeachAccess } from "react-icons/md";
import { FiBell } from "react-icons/fi";
import { toast } from "react-toastify";
import BasicInfoStep from "../Seller Profile/BasicInfoStep";
import BusinessInfoStep from "../Seller Profile/BusinessInfoStep";
import BankDetailsStep from "../Seller Profile/BankDetailsStep";

function Settings() {
  const [activeTab, setActiveTab] = useState("general");
  const [saving, setSaving] = useState(false);

  /* ================= PREFERENCES STATE ================= */

  const [preferences, setPreferences] = useState({
    holidayMode: false,
    holidayStartDate: "",
    holidayEndDate: "",
    holidayMessage: "We're currently on a break and will be back soon!",
    autoReplyEnabled: true,
    emailNotifications: true,
    smsNotifications: false,
    orderAlerts: true,
    stockAlerts: true,
    reviewAlerts: true,
  });

  const handleSavePreferences = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Preferences saved (static)");
    }, 800);
  };

  const tabs = [
    { id: "general", label: "Seller Basic Information", icon: LuStore },
    { id: "business", label: "Business", icon: MdBusiness },
    { id: "bankdetail", label: "BankDetails", icon: LuSettings },
    { id: "preferences", label: "Preferences", icon: LuSettings }
        
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Store Settings</h1>
        <p className="text-sm text-gray-500">
          Manage your store preferences
        </p>
      </div>

      {/* Tabs Wrapper */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-indigo-500 text-indigo-600 bg-indigo-50/50"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <tab.icon className="text-lg" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* ================= EMPTY GENERAL TAB ================= */}
          {activeTab === "general" && (
            <div className="text-center  text-gray-400">
              <BasicInfoStep/>
            </div>
          )}

          {/* ================= EMPTY BUSINESS TAB ================= */}
          {activeTab === "business" && (
            <div className="text-center  text-gray-400">
              <BusinessInfoStep/>
            </div>
          )}
{activeTab === "bankdetail" && (
            <div className="text-center text-gray-400">
              <BankDetailsStep/>
            </div>
          )}

          {/* ================= PREFERENCES TAB ================= */}
          {activeTab === "preferences" && (
            <div className="space-y-6">
              {/* Holiday Mode */}
              <div
                className={`rounded-xl p-5 border-2 transition-all ${
                  preferences.holidayMode
                    ? "bg-orange-50 border-orange-200"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-xl ${
                        preferences.holidayMode
                          ? "bg-orange-100"
                          : "bg-gray-200"
                      }`}
                    >
                      <MdBeachAccess
                        className={`text-2xl ${
                          preferences.holidayMode
                            ? "text-orange-600"
                            : "text-gray-400"
                        }`}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        Holiday Mode
                      </h3>
                      <p className="text-sm text-gray-500">
                        {preferences.holidayMode
                          ? "Your store is paused"
                          : "Your store is open"}
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.holidayMode}
                      onChange={(e) =>
                        setPreferences((prev) => ({
                          ...prev,
                          holidayMode: e.target.checked,
                        }))
                      }
                      className="sr-only peer"
                    />
                    <div className="w-12 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-orange-500 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                  </label>
                </div>

                {preferences.holidayMode && (
                  <div className="mt-4 pt-4 border-t border-orange-200 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={preferences.holidayStartDate}
                          onChange={(e) =>
                            setPreferences((prev) => ({
                              ...prev,
                              holidayStartDate: e.target.value,
                            }))
                          }
                          className="w-full px-4 py-2 border rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          End Date
                        </label>
                        <input
                          type="date"
                          value={preferences.holidayEndDate}
                          onChange={(e) =>
                            setPreferences((prev) => ({
                              ...prev,
                              holidayEndDate: e.target.value,
                            }))
                          }
                          className="w-full px-4 py-2 border rounded-lg"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Holiday Message
                      </label>
                      <textarea
                        rows="2"
                        value={preferences.holidayMessage}
                        onChange={(e) =>
                          setPreferences((prev) => ({
                            ...prev,
                            holidayMessage: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-2 border rounded-lg resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Notification Preferences */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-800 flex items-center gap-2">
                  <FiBell className="text-blue-500" />
                  Notification Preferences
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { key: "emailNotifications", label: "Email Notifications" },
                    { key: "smsNotifications", label: "SMS Notifications" },
                    { key: "orderAlerts", label: "Order Alerts" },
                    { key: "stockAlerts", label: "Stock Alerts" },
                    { key: "reviewAlerts", label: "Review Alerts" },
                    { key: "autoReplyEnabled", label: "Auto Reply" },
                  ].map((item) => (
                    <label
                      key={item.key}
                      className="flex items-center justify-between p-4 border rounded-xl cursor-pointer hover:bg-gray-50"
                    >
                      <span className="text-sm font-medium">
                        {item.label}
                      </span>
                      <input
                        type="checkbox"
                        checked={preferences[item.key]}
                        onChange={(e) =>
                          setPreferences((prev) => ({
                            ...prev,
                            [item.key]: e.target.checked,
                          }))
                        }
                        className="w-5 h-5"
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-4 border-t">
                <button
                  onClick={handleSavePreferences}
                  disabled={saving}
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Settings;
