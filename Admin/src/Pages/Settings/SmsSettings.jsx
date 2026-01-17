import React, { useState, useContext, useEffect } from "react";
import api from "../../utils/api";
import { Admincontext } from "../../Components/context/admincontext";
import { 
    Button, TextField, Card, CardContent, Switch, FormControlLabel, 
    Select, MenuItem, FormControl, InputLabel, LinearProgress, Alert, Box, Typography 
} from "@mui/material";
import { MdSms } from "react-icons/md";
import { FiRefreshCw, FiSave } from "react-icons/fi";

function SmsSettings() {
    const { } = useContext(Admincontext);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState("");

    const [smsSettings, setSmsSettings] = useState({
        provider: "twilio", isActive: false,
        credentials: { accountSid: "", authToken: "", senderId: "", apiKey: "" },
        templates: { otp: "", orderConfirmation: "", orderShipped: "", orderDelivered: "" },
        dailyLimit: 1000
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/api/admin/settings/sms-settings');
            if (data.success && data.settings) {
                setSmsSettings(prev => ({ ...prev, ...data.settings }));
            }
        } catch (e) {
            console.error("Error fetching SMS settings:", e);
        } finally {
            setLoading(false);
        }
    };

    const saveSettings = async () => {
        setSaving(true);
        try {
            const { data } = await api.put('/api/admin/settings/sms-settings', smsSettings);
            if (data.success) {
                setSuccess("SMS settings saved successfully!");
                setTimeout(() => setSuccess(""), 3000);
            }
        } catch (e) {
            alert("Failed to save SMS settings");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 bg-white rounded-xl shadow-lg border border-gray-100 m-2 sm:m-6 min-h-[85vh]">
            {/* Header - Stacks flex items on small screens */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-50 text-green-600 rounded-lg shrink-0">
                        <MdSms size={28} />
                    </div>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 leading-tight">SMS Settings</h2>
                        <p className="text-sm text-gray-500">Gateway configuration for notifications and OTP.</p>
                    </div>
                </div>
                <Button 
                    variant="outlined" 
                    startIcon={<FiRefreshCw />} 
                    onClick={fetchData} 
                    disabled={loading}
                    className="w-full sm:w-auto"
                >
                    Refresh
                </Button>
            </div>

            {loading && <LinearProgress sx={{ mb: 2 }} />}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <div className="max-w-4xl mx-auto lg:mx-0">
                {/* Enable/Provider Card */}
                <Card className="mb-6 border border-gray-100" elevation={0}>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                            <Typography variant="h6" className="font-bold text-gray-800">SMS Configuration</Typography>
                            <FormControlLabel
                                control={<Switch checked={smsSettings.isActive} onChange={(e) => setSmsSettings({ ...smsSettings, isActive: e.target.checked })} color="success" />}
                                label={smsSettings.isActive ? "Active" : "Inactive"}
                            />
                        </div>
                        <FormControl fullWidth>
                            <InputLabel>SMS Provider</InputLabel>
                            <Select 
                                label="SMS Provider"
                                value={smsSettings.provider} 
                                onChange={(e) => setSmsSettings({ ...smsSettings, provider: e.target.value })}
                            >
                                <MenuItem value="twilio">Twilio</MenuItem>
                                <MenuItem value="msg91">MSG91</MenuItem>
                                <MenuItem value="textlocal">TextLocal</MenuItem>
                                <MenuItem value="aws_sns">Amazon SNS</MenuItem>
                            </Select>
                        </FormControl>
                    </CardContent>
                </Card>

                {/* API Credentials Card - Responsive Grid */}
                <Card className="mb-6 border border-gray-100" elevation={0}>
                    <CardContent className="space-y-4">
                        <Typography variant="h6" className="font-bold text-gray-800">API Credentials</Typography>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <TextField fullWidth label="Account SID / API Key" value={smsSettings.credentials?.accountSid || ""} onChange={(e) => setSmsSettings({ ...smsSettings, credentials: { ...smsSettings.credentials, accountSid: e.target.value } })} />
                            <TextField fullWidth label="Auth Token / API Secret" type="password" value={smsSettings.credentials?.authToken || ""} onChange={(e) => setSmsSettings({ ...smsSettings, credentials: { ...smsSettings.credentials, authToken: e.target.value } })} />
                            <TextField fullWidth label="Sender ID" placeholder="GNGIFT" value={smsSettings.credentials?.senderId || ""} onChange={(e) => setSmsSettings({ ...smsSettings, credentials: { ...smsSettings.credentials, senderId: e.target.value } })} />
                            <TextField fullWidth label="Daily Limit" type="number" value={smsSettings.dailyLimit} onChange={(e) => setSmsSettings({ ...smsSettings, dailyLimit: parseInt(e.target.value) })} />
                        </div>
                    </CardContent>
                </Card>

                {/* SMS Templates Card */}
                <Card className="mb-6 border border-gray-100" elevation={0}>
                    <CardContent className="space-y-4">
                        <Typography variant="h6" className="font-bold text-gray-800">SMS Templates</Typography>
                        <Box className="bg-slate-50 p-3 rounded-lg mb-2">
                            <Typography variant="caption" className="text-gray-600 font-medium">
                                Variables: <b>{'{otp}'}</b>, <b>{'{orderId}'}</b>, <b>{'{trackingUrl}'}</b>
                            </Typography>
                        </Box>
                        <div className="space-y-4 pt-2">
                            <TextField fullWidth label="OTP Message" placeholder="Your OTP is {{otp}}." value={smsSettings.templates?.otp || ""} onChange={(e) => setSmsSettings({ ...smsSettings, templates: { ...smsSettings.templates, otp: e.target.value } })} />
                            <TextField fullWidth label="Order Confirmation" placeholder="Your order #{{orderId}} is confirmed!" value={smsSettings.templates?.orderConfirmation || ""} onChange={(e) => setSmsSettings({ ...smsSettings, templates: { ...smsSettings.templates, orderConfirmation: e.target.value } })} />
                            <TextField fullWidth label="Order Shipped" placeholder="Your order #{{orderId}} shipped. Track: {{trackingUrl}}" value={smsSettings.templates?.orderShipped || ""} onChange={(e) => setSmsSettings({ ...smsSettings, templates: { ...smsSettings.templates, orderShipped: e.target.value } })} />
                            <TextField fullWidth label="Order Delivered" placeholder="Your order #{{orderId}} has been delivered!" value={smsSettings.templates?.orderDelivered || ""} onChange={(e) => setSmsSettings({ ...smsSettings, templates: { ...smsSettings.templates, orderDelivered: e.target.value } })} />
                        </div>
                    </CardContent>
                </Card>

                {/* Footer Button Container */}
                <Box sx={{ mt: 4, mb: 2 }}>
                    <Button 
                        variant="contained" 
                        size="large" 
                        startIcon={<FiSave />} 
                        onClick={saveSettings} 
                        disabled={saving}
                        fullWidth
                        sx={{ py: 1.5, borderRadius: 2 }}
                    >
                        {saving ? "Saving Changes..." : "Save Configuration"}
                    </Button>
                </Box>
            </div>
        </div>
    );
}

export default SmsSettings;