import React, { useState, useContext, useEffect } from "react";
import api from "../../utils/api";
import { Admincontext } from "../../Components/context/admincontext";
import {
  Button,
  Card,
  CardContent,
  Switch,
  TextField,
  Chip,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Box,
  Typography
} from "@mui/material";
import { MdPayment, MdEdit } from "react-icons/md";
import { FiRefreshCw } from "react-icons/fi";

function PaymentGateway() {
  const { } = useContext(Admincontext);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [paymentGateways, setPaymentGateways] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState(null);
  const [gatewayForm, setGatewayForm] = useState({
    isActive: false,
    testMode: true,
    credentials: { keyId: "", keySecret: "", webhookSecret: "", merchantId: "" },
    displayName: "",
    description: ""
  });

  const gateways = [
    { gateway: 'razorpay', name: 'Razorpay', icon: '💳', color: 'bg-blue-500' },
    { gateway: 'stripe', name: 'Stripe', icon: '💎', color: 'bg-purple-500' },
    { gateway: 'paypal', name: 'PayPal', icon: '🅿️', color: 'bg-blue-600' },
    { gateway: 'paytm', name: 'Paytm', icon: '📱', color: 'bg-cyan-500' },
    { gateway: 'cod', name: 'Cash on Delivery', icon: '💵', color: 'bg-green-500' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/admin/settings/payment-gateways');
      if (data.success) setPaymentGateways(data.gateways || []);
    } catch (e) {
      console.error("Error fetching payment gateways:", e);
    } finally {
      setLoading(false);
    }
  };

  const toggleGateway = async (gateway, isActive) => {
    try {
      await api.put(`/api/admin/settings/payment-gateway/${gateway}/toggle`, { isActive });
      fetchData();
      setSuccess(`${gateway} ${isActive ? 'enabled' : 'disabled'} successfully!`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      alert("Failed to update gateway");
    }
  };

  const openConfigDialog = (gateway) => {
    const existing = paymentGateways.find(p => p.gateway === gateway.gateway);
    setSelectedGateway(gateway);
    setGatewayForm({
      isActive: existing?.isActive || false,
      testMode: existing?.testMode ?? true,
      credentials: existing?.credentials || { keyId: "", keySecret: "", webhookSecret: "", merchantId: "" },
      displayName: existing?.displayName || gateway.name,
      description: existing?.description || ""
    });
    setOpenDialog(true);
  };

  const saveGatewayConfig = async () => {
    try {
      await api.put(`/api/admin/settings/payment-gateway/${selectedGateway.gateway}`, gatewayForm);
      fetchData();
      setOpenDialog(false);
      setSuccess("Gateway configuration saved!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      alert("Failed to save gateway configuration");
    }
  };

  const getGatewayStatus = (gateway) => {
    return paymentGateways.find(p => p.gateway === gateway) || { isActive: false, testMode: true };
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-white rounded-xl shadow-lg border border-gray-100 m-2 sm:m-6 min-h-[85vh]">
      {/* Header - Stacked on mobile, row on desktop */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg shrink-0">
            <MdPayment size={28} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 leading-tight">Payment Gateway</h2>
            <p className="text-sm text-gray-500">Configure payment methods for your store.</p>
          </div>
        </div>
        <Button 
          variant="outlined"
          startIcon={<FiRefreshCw />} 
          onClick={fetchData} 
          disabled={loading}
          fullWidth={window.innerWidth < 640}
        >
          Refresh
        </Button>
      </div>

      {loading && <LinearProgress sx={{ mb: 2 }} />}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {/* Responsive Grid System */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {gateways.map(gw => {
          const status = getGatewayStatus(gw.gateway);
          return (
            <Card 
              key={gw.gateway} 
              elevation={0}
              className={`${status.isActive ? 'border-green-500 border-2 shadow-md' : 'border-gray-200 border shadow-sm'} hover:shadow-lg transition-all duration-300 rounded-2xl`}
            >
              <CardContent className="p-5 sm:p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 ${gw.color} rounded-xl flex items-center justify-center text-xl sm:text-2xl text-white shadow-inner`}>
                      {gw.icon}
                    </div>
                    <div>
                      <Typography variant="subtitle1" className="font-bold leading-tight">
                        {gw.name}
                      </Typography>
                      <Typography variant="caption" className="text-gray-400 block uppercase tracking-wider">
                        {gw.gateway}
                      </Typography>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 mb-6">
                  <Chip 
                    size="small" 
                    label={status.isActive ? "Active" : "Inactive"} 
                    color={status.isActive ? "success" : "default"} 
                    variant={status.isActive ? "filled" : "outlined"}
                  />
                  {status.isActive && (
                    <Chip 
                      size="small" 
                      label={status.testMode ? "Test Mode" : "Live"} 
                      color={status.testMode ? "warning" : "success"} 
                      variant="outlined" 
                    />
                  )}
                </div>

                <Box className="flex items-center justify-between pt-2 border-t border-gray-50">
                  <Switch
                    checked={status.isActive}
                    onChange={(e) => toggleGateway(gw.gateway, e.target.checked)}
                    color="success"
                  />
                  <Button 
                    size="small" 
                    variant="text"
                    startIcon={<MdEdit />} 
                    onClick={() => openConfigDialog(gw)}
                    sx={{ borderRadius: '8px', fontWeight: 'bold' }}
                  >
                    Configure
                  </Button>
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Configuration Dialog - MUI Dialog handles mobile responsiveness automatically with maxWidth */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px' } }}
      >
        <DialogTitle className="font-bold border-b">
          Configure {selectedGateway?.name}
        </DialogTitle>
        <DialogContent className="pt-6">
          <div className="space-y-5 pt-2">
            <div className="flex flex-col sm:flex-row sm:gap-4">
              <FormControlLabel
                control={<Switch checked={gatewayForm.isActive} onChange={(e) => setGatewayForm({ ...gatewayForm, isActive: e.target.checked })} />}
                label={<Typography variant="body2" className="font-medium">Enable Gateway</Typography>}
              />
              <FormControlLabel
                control={<Switch checked={gatewayForm.testMode} onChange={(e) => setGatewayForm({ ...gatewayForm, testMode: e.target.checked })} color="warning" />}
                label={<Typography variant="body2" className="font-medium">Test Mode</Typography>}
              />
            </div>

            <TextField 
              fullWidth 
              label="Display Name" 
              variant="outlined"
              value={gatewayForm.displayName} 
              onChange={(e) => setGatewayForm({ ...gatewayForm, displayName: e.target.value })} 
            />
            
            <TextField 
              fullWidth 
              label="Description" 
              multiline 
              rows={2} 
              variant="outlined"
              value={gatewayForm.description} 
              onChange={(e) => setGatewayForm({ ...gatewayForm, description: e.target.value })} 
            />

            {selectedGateway?.gateway !== 'cod' && (
              <Box className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <Typography variant="subtitle2" className="font-bold mb-3 text-gray-700">
                  API Credentials
                </Typography>
                <div className="space-y-4">
                  <TextField fullWidth label="Key ID / API Key" value={gatewayForm.credentials.keyId} onChange={(e) => setGatewayForm({ ...gatewayForm, credentials: { ...gatewayForm.credentials, keyId: e.target.value } })} />
                  <TextField fullWidth label="Key Secret" type="password" value={gatewayForm.credentials.keySecret} onChange={(e) => setGatewayForm({ ...gatewayForm, credentials: { ...gatewayForm.credentials, keySecret: e.target.value } })} />
                  <TextField fullWidth label="Webhook Secret (optional)" value={gatewayForm.credentials.webhookSecret} onChange={(e) => setGatewayForm({ ...gatewayForm, credentials: { ...gatewayForm.credentials, webhookSecret: e.target.value } })} />
                </div>
              </Box>
            )}
          </div>
        </DialogContent>
        <DialogActions className="p-4 border-t">
          <Button onClick={() => setOpenDialog(false)} color="inherit">Cancel</Button>
          <Button 
            variant="contained" 
            disableElevation
            onClick={saveGatewayConfig}
            sx={{ borderRadius: '8px', px: 3 }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default PaymentGateway;