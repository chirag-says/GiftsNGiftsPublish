import React, { useState, useContext, useEffect } from "react";
import api from "../../utils/api";
import { Admincontext } from "../../Components/context/admincontext";
import {
  Button, TextField, Card, CardContent, Switch, FormControlLabel, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, LinearProgress, Alert, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel, Box, Typography
} from "@mui/material";
import { MdDelete } from "react-icons/md";
import { BiReceipt } from "react-icons/bi";
import { FiRefreshCw, FiSave, FiPlus } from "react-icons/fi";

function TaxConfiguration() {
  const { } = useContext(Admincontext);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [newTaxRate, setNewTaxRate] = useState({ name: "", rate: 0, category: "", isDefault: false });

  const [taxConfig, setTaxConfig] = useState({
    taxName: "GST", isEnabled: true, includedInPrice: true, displayOnCheckout: true,
    taxRates: [], exemptCategories: [], taxNumber: "", taxFilingFrequency: "monthly"
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/admin/settings/tax-config');
      if (data.success && data.config) {
        setTaxConfig(prev => ({ ...prev, ...data.config }));
      }
    } catch (e) {
      console.error("Error fetching tax config:", e);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      const { data } = await api.put('/api/admin/settings/tax-config', taxConfig);
      if (data.success) {
        setSuccess("Tax configuration saved successfully!");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (e) {
      alert("Failed to save tax configuration");
    } finally {
      setSaving(false);
    }
  };

  const addTaxRate = () => {
    if (!newTaxRate.name || !newTaxRate.rate) return;
    setTaxConfig({
      ...taxConfig,
      taxRates: [...taxConfig.taxRates, { ...newTaxRate }]
    });
    setNewTaxRate({ name: "", rate: 0, category: "", isDefault: false });
    setOpenDialog(false);
  };

  const removeTaxRate = (index) => {
    const updated = taxConfig.taxRates.filter((_, i) => i !== index);
    setTaxConfig({ ...taxConfig, taxRates: updated });
  };

  const setDefaultRate = (index) => {
    const updated = taxConfig.taxRates.map((rate, i) => ({
      ...rate,
      isDefault: i === index
    }));
    setTaxConfig({ ...taxConfig, taxRates: updated });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-white rounded-xl shadow-lg border border-gray-100 m-2 sm:m-6 min-h-[85vh]">
      {/* Header - Adaptive Stack */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-lg shrink-0">
            <BiReceipt size={28} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 leading-tight">Tax Configuration</h2>
            <p className="text-sm text-gray-500">Configure GST and other tax settings.</p>
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

      <div className="max-w-4xl mx-auto lg:mx-0">
        {/* General Settings */}
        <Card className="mb-6 border border-gray-100" elevation={0}>
          <CardContent className="space-y-4">
            <Typography variant="h6" className="font-bold text-gray-800 pb-2 border-b">
              General Settings
            </Typography>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <TextField fullWidth label="Tax Name" value={taxConfig.taxName} onChange={(e) => setTaxConfig({ ...taxConfig, taxName: e.target.value })} />
              <TextField fullWidth label="Tax Registration Number (GST)" value={taxConfig.taxNumber} onChange={(e) => setTaxConfig({ ...taxConfig, taxNumber: e.target.value })} />
            </div>
            <div className="flex flex-col space-y-1">
              <FormControlLabel control={<Switch checked={taxConfig.isEnabled} onChange={(e) => setTaxConfig({ ...taxConfig, isEnabled: e.target.checked })} />} label={<span className="text-sm font-medium">Enable Tax Calculation</span>} />
              <FormControlLabel control={<Switch checked={taxConfig.includedInPrice} onChange={(e) => setTaxConfig({ ...taxConfig, includedInPrice: e.target.checked })} />} label={<span className="text-sm font-medium">Tax Included in Product Price</span>} />
              <FormControlLabel control={<Switch checked={taxConfig.displayOnCheckout} onChange={(e) => setTaxConfig({ ...taxConfig, displayOnCheckout: e.target.checked })} />} label={<span className="text-sm font-medium">Display Tax Breakdown on Checkout</span>} />
            </div>
          </CardContent>
        </Card>

        {/* Tax Rates Table - Responsive Wrapper */}
        <Card className="mb-6 border border-gray-100" elevation={0}>
          <CardContent>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-3">
              <Typography variant="h6" className="font-bold text-gray-800">
                Tax Rates
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<FiPlus />} 
                onClick={() => setOpenDialog(true)}
                fullWidth={window.innerWidth < 640}
                size="small"
              >
                Add Tax Rate
              </Button>
            </div>
            
            <TableContainer component={Paper} variant="outlined" className="overflow-x-auto">
              <Table size="small">
                <TableHead className="bg-gray-50">
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Rate (%)</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} className="hidden sm:table-cell">Category</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Default</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(taxConfig.taxRates || []).map((rate, idx) => (
                    <TableRow key={idx} hover>
                      <TableCell>{rate.name}</TableCell>
                      <TableCell>{rate.rate}%</TableCell>
                      <TableCell className="capitalize hidden sm:table-cell">{rate.category || "-"}</TableCell>
                      <TableCell>
                        <Switch checked={rate.isDefault} onChange={() => setDefaultRate(idx)} size="small" />
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" color="error" onClick={() => removeTaxRate(idx)}>
                          <MdDelete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(taxConfig.taxRates || []).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-gray-500 py-8 italic">No tax rates configured</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Filing Frequency */}
        <Card className="mb-6 border border-gray-100" elevation={0}>
          <CardContent>
            <Typography variant="h6" className="font-bold text-gray-800 mb-4">
              Tax Filing
            </Typography>
            <FormControl fullWidth sx={{ maxWidth: { xs: '100%', sm: 300 } }}>
              <InputLabel>Filing Frequency</InputLabel>
              <Select 
                label="Filing Frequency"
                value={taxConfig.taxFilingFrequency || "monthly"} 
                onChange={(e) => setTaxConfig({ ...taxConfig, taxFilingFrequency: e.target.value })}
              >
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="quarterly">Quarterly</MenuItem>
                <MenuItem value="annually">Annually</MenuItem>
              </Select>
            </FormControl>
          </CardContent>
        </Card>

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

      {/* Add Tax Rate Dialog - MUI automatically handles responsiveness */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle className="font-bold">Add New Tax Rate</DialogTitle>
        <DialogContent>
          <div className="space-y-5 pt-4">
            <TextField fullWidth label="Tax Name" placeholder="e.g. GST 18%" value={newTaxRate.name} onChange={(e) => setNewTaxRate({ ...newTaxRate, name: e.target.value })} />
            <TextField fullWidth label="Rate (%)" type="number" value={newTaxRate.rate} onChange={(e) => setNewTaxRate({ ...newTaxRate, rate: parseFloat(e.target.value) })} />
            <TextField fullWidth label="Category" placeholder="e.g. Electronics" value={newTaxRate.category} onChange={(e) => setNewTaxRate({ ...newTaxRate, category: e.target.value })} />
            <FormControlLabel 
              control={<Switch checked={newTaxRate.isDefault} onChange={(e) => setNewTaxRate({ ...newTaxRate, isDefault: e.target.checked })} />} 
              label={<span className="font-medium">Set as Default Rate</span>} 
            />
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDialog(false)} color="inherit">Cancel</Button>
          <Button variant="contained" onClick={addTaxRate}>Add Tax Rate</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default TaxConfiguration;