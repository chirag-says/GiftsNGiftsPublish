import React, { useState, useContext, useEffect } from "react";
import api from "../../utils/api";
import { Admincontext } from "../../Components/context/admincontext";
import {
  Button,
  TextField,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  LinearProgress,
  Alert,
  Box,
  Typography
} from "@mui/material";
import { MdWebAsset } from "react-icons/md";
import { FiRefreshCw, FiSave } from "react-icons/fi";

function SiteConfiguration() {
  const { } = useContext(Admincontext);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  const [siteConfig, setSiteConfig] = useState({
    siteName: "", siteUrl: "", logo: "", favicon: "", tagline: "", description: "",
    contactEmail: "", contactPhone: "", address: "",
    socialLinks: { facebook: "", instagram: "", twitter: "", youtube: "", linkedin: "" },
    currency: "INR", currencySymbol: "₹", timezone: "Asia/Kolkata", language: "en",
    maintenanceMode: false, maintenanceMessage: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/admin/settings/site-config');
      if (data.success && data.config) {
        setSiteConfig(prev => ({ ...prev, ...data.config }));
      }
    } catch (e) {
      console.error("Error fetching site config:", e);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      const { data } = await api.put('/api/admin/settings/site-config', siteConfig);
      if (data.success) {
        setSuccess("Site configuration saved successfully!");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (e) {
      alert("Failed to save site configuration");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-white rounded-xl shadow-lg border border-gray-100 m-2 sm:m-6 min-h-[85vh]">
      {/* Header Section - Stacked on mobile, Row on desktop */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg shrink-0">
            <MdWebAsset size={28} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 leading-tight">Site Configuration</h2>
            <p className="text-sm text-gray-500">Configure your site's basic settings and branding.</p>
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
        {/* Basic Info */}
        <Card className="mb-6 border border-gray-100" elevation={0}>
          <CardContent className="space-y-4">
            <Typography variant="h6" className="font-bold text-gray-800 pb-2 border-b">
              Basic Information
            </Typography>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <TextField fullWidth label="Site Name" value={siteConfig.siteName} onChange={(e) => setSiteConfig({ ...siteConfig, siteName: e.target.value })} />
              <TextField fullWidth label="Site URL" value={siteConfig.siteUrl} onChange={(e) => setSiteConfig({ ...siteConfig, siteUrl: e.target.value })} />
              <TextField fullWidth label="Tagline" value={siteConfig.tagline} onChange={(e) => setSiteConfig({ ...siteConfig, tagline: e.target.value })} />
              <TextField fullWidth label="Logo URL" value={siteConfig.logo} onChange={(e) => setSiteConfig({ ...siteConfig, logo: e.target.value })} />
            </div>
            <TextField fullWidth label="Description" multiline rows={3} value={siteConfig.description} onChange={(e) => setSiteConfig({ ...siteConfig, description: e.target.value })} />
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card className="mb-6 border border-gray-100" elevation={0}>
          <CardContent className="space-y-4">
            <Typography variant="h6" className="font-bold text-gray-800 pb-2 border-b">
              Contact Information
            </Typography>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <TextField fullWidth label="Contact Email" value={siteConfig.contactEmail} onChange={(e) => setSiteConfig({ ...siteConfig, contactEmail: e.target.value })} />
              <TextField fullWidth label="Contact Phone" value={siteConfig.contactPhone} onChange={(e) => setSiteConfig({ ...siteConfig, contactPhone: e.target.value })} />
            </div>
            <TextField fullWidth label="Address" multiline rows={2} value={siteConfig.address} onChange={(e) => setSiteConfig({ ...siteConfig, address: e.target.value })} />
          </CardContent>
        </Card>

        {/* Regional Settings */}
        <Card className="mb-6 border border-gray-100" elevation={0}>
          <CardContent className="space-y-4">
            <Typography variant="h6" className="font-bold text-gray-800 pb-2 border-b">
              Regional Settings
            </Typography>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              <FormControl fullWidth>
                <InputLabel>Currency</InputLabel>
                <Select label="Currency" value={siteConfig.currency} onChange={(e) => setSiteConfig({ ...siteConfig, currency: e.target.value })}>
                  <MenuItem value="INR">INR (₹)</MenuItem>
                  <MenuItem value="USD">USD ($)</MenuItem>
                  <MenuItem value="EUR">EUR (€)</MenuItem>
                  <MenuItem value="GBP">GBP (£)</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Timezone</InputLabel>
                <Select label="Timezone" value={siteConfig.timezone} onChange={(e) => setSiteConfig({ ...siteConfig, timezone: e.target.value })}>
                  <MenuItem value="Asia/Kolkata">Asia/Kolkata (IST)</MenuItem>
                  <MenuItem value="America/New_York">America/New_York (EST)</MenuItem>
                  <MenuItem value="Europe/London">Europe/London (GMT)</MenuItem>
                  <MenuItem value="Asia/Dubai">Asia/Dubai (GST)</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Language</InputLabel>
                <Select label="Language" value={siteConfig.language} onChange={(e) => setSiteConfig({ ...siteConfig, language: e.target.value })}>
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="hi">Hindi</MenuItem>
                </Select>
              </FormControl>
            </div>
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card className="mb-6 border border-gray-100" elevation={0}>
          <CardContent className="space-y-4">
            <Typography variant="h6" className="font-bold text-gray-800 pb-2 border-b">
              Social Links
            </Typography>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <TextField label="Facebook" value={siteConfig.socialLinks?.facebook || ""} onChange={(e) => setSiteConfig({ ...siteConfig, socialLinks: { ...siteConfig.socialLinks, facebook: e.target.value } })} />
              <TextField label="Instagram" value={siteConfig.socialLinks?.instagram || ""} onChange={(e) => setSiteConfig({ ...siteConfig, socialLinks: { ...siteConfig.socialLinks, instagram: e.target.value } })} />
              <TextField label="Twitter" value={siteConfig.socialLinks?.twitter || ""} onChange={(e) => setSiteConfig({ ...siteConfig, socialLinks: { ...siteConfig.socialLinks, twitter: e.target.value } })} />
              <TextField label="YouTube" value={siteConfig.socialLinks?.youtube || ""} onChange={(e) => setSiteConfig({ ...siteConfig, socialLinks: { ...siteConfig.socialLinks, youtube: e.target.value } })} />
              <TextField label="LinkedIn" className="md:col-span-2" value={siteConfig.socialLinks?.linkedin || ""} onChange={(e) => setSiteConfig({ ...siteConfig, socialLinks: { ...siteConfig.socialLinks, linkedin: e.target.value } })} />
            </div>
          </CardContent>
        </Card>

        {/* Maintenance Mode */}
        <Card className="mb-6 border border-gray-100" elevation={0}>
          <CardContent className="space-y-4">
            <Typography variant="h6" className="font-bold text-gray-800 pb-2 border-b">
              Maintenance Mode
            </Typography>
            <FormControlLabel
              control={<Switch checked={siteConfig.maintenanceMode} onChange={(e) => setSiteConfig({ ...siteConfig, maintenanceMode: e.target.checked })} color="warning" />}
              label={<span className="font-medium text-gray-700">Enable Maintenance Mode</span>}
            />
            {siteConfig.maintenanceMode && (
              <TextField 
                fullWidth 
                label="Maintenance Message" 
                multiline rows={2} 
                value={siteConfig.maintenanceMessage} 
                onChange={(e) => setSiteConfig({ ...siteConfig, maintenanceMessage: e.target.value })} 
                placeholder="We'll be back shortly..."
              />
            )}
          </CardContent>
        </Card>

        {/* Action Button - Sticky or Bottom on mobile */}
        <Box sx={{ mt: 4, mb: 2 }}>
          <Button 
            variant="contained" 
            size="large" 
            startIcon={<FiSave />} 
            onClick={saveConfig} 
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

export default SiteConfiguration;