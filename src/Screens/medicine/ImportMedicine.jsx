import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Card,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Slide,
  Tooltip,
  Box,
  Typography,
  Grid,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Divider,
  Chip,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { DataGrid } from '@mui/x-data-grid';
import moment from 'moment';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { jsPDF } from 'jspdf';

import { getMedicines } from '../../apis/medicineSlice';
import { getPharmacyShops } from '../../apis/pharmacyShopSlice';
import { getPurchaseOrders, createPurchaseOrder, importPurchaseOrder, cancelPurchaseOrder } from '../../apis/purchaseOrderSlice';

import SearchClinic from '../../components/Autocomplete/SearchClinic';
import SearchPharmacyShop from '../../components/Autocomplete/SearchPharmacyShop';
import SearchMedicine from '../../components/Autocomplete/SearchMedicine';
import { toast } from 'react-toastify';
import autoTable from 'jspdf-autotable';
            import TaskAltIcon  from '@mui/icons-material/TaskAlt';
            import HighlightOffIcon from '@mui/icons-material/HighlightOff';


export default function ImportMedicine() {
  const dispatch = useDispatch();

  const [medicines, setMedicines] = useState([]);
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  // PO dialog state
  const [poOpen, setPoOpen] = useState(false);
  const [poClinic, setPoClinic] = useState('');
  const [poShop, setPoShop] = useState('');
  const [items, setItems] = useState([{ medicineId: '', qty: 1 }]);
  const [loading, setLoading] = useState(false);
  // report dialog state
  const [reportOpen, setReportOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

  const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="down" ref={ref} {...props} />;
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const medsResp = await dispatch(getMedicines({}));
    setMedicines(medsResp?.payload?.data || []);

    const poResp = await dispatch(getPurchaseOrders({}));
    setOrders(poResp?.payload?.data || []);
  };

  /* ---------------------- setters for autocomplete ---------------------- */

  const setPoClinicData = (valueOrUpdater) => {
    const v =
      typeof valueOrUpdater === 'function'
        ? valueOrUpdater({})?.clinicId
        : valueOrUpdater?.clinicId ?? valueOrUpdater?.value ?? valueOrUpdater?._id;
    setPoClinic(v || '');
  };

  const setPoShopData = (valueOrUpdater) => {
    const v =
      typeof valueOrUpdater === 'function'
        ? valueOrUpdater({})?.shopId
        : valueOrUpdater?.shopId ?? valueOrUpdater?.value ?? valueOrUpdater?._id;
    setPoShop(v || '');
  };

  /* ---------------------- PO items helpers ---------------------- */

  const addItem = () => setItems((prev) => [...prev, { medicineId: '', qty: 1 }]);

  const removeItem = (idx) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const updateItem = (idx, key, value) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [key]: value };
      return copy;
    });
  };

  /* ---------------------- Create PO ---------------------- */

  const handleCreateQuickPo = async () => {
    if (!poClinic) return alert('Select clinic');
    if (!poShop) return alert('Select pharmacy shop');

    const cleaned = items.filter((i) => i.medicineId && Number(i.qty) > 0);
    if (!cleaned.length) return alert('Add at least one medicine with qty');

    const payload = {
      clinicId: poClinic,
      pharmacyShopId: poShop,
      medicines: cleaned.map((it) => {
        const m = medicines.find((x) => x._id === it.medicineId) || {};
        return {
          medicineId: it.medicineId,
          name: m.name || '',
          qty: Number(it.qty),
        };
      }),
    };

    setLoading(true);
    try {
      const resp = await dispatch(createPurchaseOrder(payload));
      if (resp?.payload?.data) {
        setPoOpen(false);
        setPoClinic('');
        setPoShop('');
        setItems([{ medicineId: '', qty: 1 }]);
        toast.success('Purchase Order created');
        fetchData();
      } else {
        alert(resp?.payload?.message || 'Failed');
      }
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------- DataGrid columns ---------------------- */

  const openPoReport = (order) => {
    setSelectedOrder(order);
    setReportOpen(true);
  };

 const handleDownloadPdf = () => {
  if (!selectedOrder) return;

  const doc = new jsPDF("p", "mm", "a4");
  let y = 15;

  /* ================= HEADER ================= */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("PURCHASE ORDER INVOICE", 105, y, { align: "center" });

  y += 8;
  doc.setLineWidth(0.5);
  doc.line(10, y, 200, y);
  y += 10;

  /* ================= META ================= */
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  doc.text("Invoice No:", 10, y);
  doc.text(`${selectedOrder.poNumber || selectedOrder._id}`, 40, y);

  doc.text("Date:", 140, y);
  doc.text(
    new Date(selectedOrder.createdAt).toLocaleDateString(),
    155,
    y
  );

  y += 7;
  doc.text("Status:", 10, y);
  doc.text(`${selectedOrder.status || "-"}`, 40, y);

  y += 12;

  /* ================= DETAILS ================= */
  doc.setFont("helvetica", "bold");
  doc.text("Clinic Details", 10, y);
  doc.text("Pharmacy Shop Details", 110, y);

  y += 6;
  doc.setFont("helvetica", "normal");

  // Clinic
  doc.text(selectedOrder?.clinicId?.name || "-", 10, y);
  doc.text(selectedOrder?.clinicId?.address || "-", 10, y + 5);

  // Pharmacy
  doc.text(selectedOrder?.pharmacyShopId?.shopName || "-", 110, y);
  doc.text(selectedOrder?.pharmacyShopId?.address || "-", 110, y + 5);
  doc.text(
    `Phone: ${selectedOrder?.pharmacyShopId?.phone || "-"}`,
    110,
    y + 10
  );

  y += 22;

  /* ================= MEDICINE TABLE ================= */
  const tableBody = (selectedOrder?.medicines || []).map((item, index) => [
    index + 1,
    item.name,
    item.qty,
  ]);

  autoTable(doc, {
    startY: y,
    head: [["#", "Medicine Name", "Quantity"]],
    body: tableBody,
    theme: "grid",
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: 0,
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: 15 },
      1: { cellWidth: 120 },
      2: { cellWidth: 35, halign: "right" },
    },
  });

  /* ================= FOOTER ================= */
  const finalY = doc.lastAutoTable.finalY + 15;
  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  doc.text(
    "This is a system generated purchase order invoice.",
    105,
    finalY,
    { align: "center" }
  );

  /* ================= SAVE ================= */
  const filename = `${selectedOrder.poNumber || selectedOrder._id}.pdf`;
  doc.save(filename);
};

  const handleImportRow = async (row) => {
    if (!row) return;
    setReportLoading(true);
    try {
      const resp = await dispatch(importPurchaseOrder(row._id));
      if (resp?.payload?.data) {
        toast.success('Purchase Order imported; stock updated');
        fetchData();
      } else {
        toast.error(resp?.payload?.message || 'Import failed');
      }
    } finally {
      setReportLoading(false);
    }
  };

  const handleCancelRow = async (row) => {
    if (!row) return;
    setReportLoading(true);
    try {
      const resp = await dispatch(cancelPurchaseOrder(row._id));
      if (resp?.payload?.data) {
        toast.success('Purchase Order cancelled');
        fetchData();
      } else {
        toast.error(resp?.payload?.message || 'Cancel failed');
      }
    } finally {
      setReportLoading(false);
    }
  };

  const handleImport = async () => {
    if (!selectedOrder) return;
    await handleImportRow(selectedOrder);
    setReportOpen(false);
  };

  const handleCancel = async () => {
    if (!selectedOrder) return;
    await handleCancelRow(selectedOrder);
    setReportOpen(false);
  };

  const columns = [
    {
      field: 'actions',
      headerName: 'Action',
      width: 200,
      sortable: false,
      renderCell: (params) => (
        <>
        <Tooltip title="View P/O">
          <IconButton color="success" onClick={() => openPoReport(params.row)}>
            <ReceiptIcon />
          </IconButton>
        </Tooltip>
        {params.row.status == 'CREATED' &&
        <>

        <Tooltip title="Import">
          <IconButton color="primary" onClick={() => handleImportRow(params.row)} disabled={params.row?.status === 'IMPORTED' || params.row?.status === 'CANCELLED' || reportLoading}>
            <TaskAltIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Cancel">
          <IconButton color="error" onClick={() => handleCancelRow(params.row)} disabled={params.row?.status === 'CANCELLED' || reportLoading}>
            <HighlightOffIcon />
          </IconButton>
        </Tooltip>
        </>
        }
        </>
      ),
    },
    { field: 'poNumber', headerName: 'P/O Number', width: 180 },
   {
  field: 'status',
  headerName: 'Status',
  width: 140,
  renderCell: (params) => {
    const status = params?.value || 'N/A';

    const getColor = (status) => {
      switch (status.toLowerCase()) {
        case 'active':
        case 'imported':
          return 'success';
        case 'created':
          return 'primary';
        case 'cancelled':
        case 'error':
          return 'error';
        default:
          return 'default';
      }
    };

    return (
      <Chip
        label={status}
        color={getColor(status)}
        size="small"
        variant="outlined"
      />
    );
  },
},
    {
      field: 'pharmacyShop',
      headerName: 'Pharmacy Shop',
      width: 220,
      renderCell: (params) => params.row?.pharmacyShopId?.shopName || '-',
    },
    {
      field: 'clinic',
      headerName: 'Clinic',
      width: 200,
      renderCell: (params) => params.row?.clinicId?.name || '-',
    },
    {
  field: 'items',
  headerName: 'Items',
  width: 300,
  renderCell: (params) => {
    const medicines = params.row?.medicines || [];

    if (!medicines.length) return 'N/A';

    return medicines
      .map(it => `${it.name} (${it.qty})`)
      .join(', ');
  },
},
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 160,
      valueGetter: (params) => moment(params.row?.createdAt).format('DD-MM-YYYY HH:mm') || '-',
    },
  ];

  return (
    <div style={{ padding: 16 }}>
      {/* Header */}
      <Card sx={{ p: 2, mb: 2 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <h2>Import Medicines</h2>
          <Button
            variant="contained"
            startIcon={<AddShoppingCartIcon />}
            onClick={() => {
              setPoClinic('');
              setPoShop('');
              setItems([{ medicineId: '', qty: 1 }]);
              setPoOpen(true);
            }}
          >
            Create P/O
          </Button>
        </div>
      </Card>

      {/* Medicines Grid */}
      <Card sx={{ p: 1 }}>
        <DataGrid
          autoHeight
          rows={orders}
          columns={columns}
          getRowId={(r) => r._id}
          page={page}
          pageSize={pageSize}
          onPageChange={(p) => setPage(p)}
          onPageSizeChange={(s) => setPageSize(s)}
          pagination
        />
      </Card>

      {/* PO Dialog */}
      <Dialog open={poOpen} onClose={() => setPoOpen(false)} fullWidth>
        <DialogTitle>Create Purchase Order</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <SearchClinic
            open={poOpen}
            setData={setPoClinicData}
            data={{ clinicId: poClinic }}
            name="clinicId"
            label="Clinic"
            size="small"
          />

          <SearchPharmacyShop
            open={poOpen}
            setData={setPoShopData}
            data={{ shopId: poShop }}
            name="shopId"
            label="Pharmacy Shop"
            size="small"
          />

          {items.map((row, idx) => (
            <div key={idx} style={{ display: 'flex', gap: 10 }}>
              <SearchMedicine
                open={poOpen}
                value={row.medicineId}
                onChange={(opt) => updateItem(idx, 'medicineId', opt?.value || opt?._id || '')}
                label="Medicine"
                size="small"
              />

              <TextField
                label="Qty"
                type="number"
                size="small"
                value={row.qty}
                onChange={(e) => updateItem(idx, 'qty', e.target.value)}
                sx={{ width: 120 }}
              />

              <Button color="error" onClick={() => removeItem(idx)} disabled={items.length === 1}>
                Remove
              </Button>
            </div>
          ))}

          <Button onClick={addItem} variant="outlined" disabled={!poShop}>
            Add Medicine
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPoOpen(false)}>Cancel</Button>
          <LoadingButton loading={loading} variant="contained" onClick={handleCreateQuickPo}>
            Create
          </LoadingButton>
        </DialogActions>
      </Dialog>

      {/* P/O Report Dialog */}
      <Dialog
  open={reportOpen}
  onClose={() => setReportOpen(false)}
  fullWidth
  maxWidth="md"
>
  <DialogTitle sx={{ textAlign: 'center', fontWeight: 700 }}>
    Purchase Order
  </DialogTitle>

  <DialogContent dividers>
    {!selectedOrder ? (
      <Typography>No data</Typography>
    ) : (
      <Box sx={{ px: 1 }}>

        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Box>
            <Typography fontWeight={600}>P/O No:</Typography>
            <Typography>{selectedOrder.poNumber || selectedOrder._id}</Typography>

           
          </Box>

          <Box textAlign="right">
            <Typography fontWeight={600} mt={1}>Date:</Typography>
            <Typography>
              {moment(selectedOrder.createdAt).format("DD-MM-YYYY")}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Clinic & Pharmacy */}
        <Grid container spacing={2} mb={3}>
          <Grid item xs={6}>
            <Typography fontWeight={700} gutterBottom>
              Clinic Details
            </Typography>
            <Typography>{selectedOrder?.clinicId?.name}</Typography>
            <Typography fontSize={13} color="text.secondary">
             Address : {selectedOrder?.clinicId?.address || '-'}
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography fontWeight={700} gutterBottom>
              Pharmacy Shop Details
            </Typography>
            <Typography>{selectedOrder?.pharmacyShopId?.shopName}</Typography>
            <Typography fontSize={13} color="text.secondary">
             Address : {selectedOrder?.pharmacyShopId?.address || '-'}
            </Typography>
            <Typography fontSize={13}>
              Phone: {selectedOrder?.pharmacyShopId?.phone || '-'}
            </Typography>
          </Grid>
        </Grid>

        {/* Medicines Table */}
        <Typography fontWeight={700} mb={1}>
          Medicine Details
        </Typography>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Medicine Name</TableCell>
              <TableCell align="right">Quantity</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {(selectedOrder?.medicines || []).map((item, index) => (
              <TableRow key={index}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell align="right">{item.qty}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Footer */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography fontSize={12} color="text.secondary">
            This is a system generated purchase order invoice.
          </Typography>
        </Box>

      </Box>
    )}
  </DialogContent>

  <DialogActions>
    <Button onClick={() => setReportOpen(false)}>Close</Button>
    {/* <Button color="error" onClick={handleCancel} disabled={!selectedOrder || selectedOrder?.status === 'CANCELLED' || reportLoading}>
      Cancel
    </Button>
    <Button variant="contained" onClick={handleImport}>
      {reportLoading ? 'Working...' : 'Import'}
    </Button> */}
    <Button
      variant="contained"
      startIcon={<ReceiptIcon />}
      disabled={!selectedOrder}
      onClick={handleDownloadPdf}
    >
      Download PDF
    </Button>
  </DialogActions>
</Dialog>
    </div>
  );
}
