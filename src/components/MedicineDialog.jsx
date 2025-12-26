import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Autocomplete,
  IconButton,
  Box,
  Paper,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { useDispatch, useSelector } from 'react-redux';
import { getMedicines } from '../apis/medicineSlice';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

export default function MedicineDialog({
  open,
  onClose,
  prescriptions = [],
  setPrescriptions,
  inline = false,
}) {
  const dispatch = useDispatch();
  const { medicines } = useSelector((s) => s.medicineData || { medicines: [] });

  const [rows, setRows] = useState([]);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [instruction, setInstruction] = useState('');
  const [editIndex, setEditIndex] = useState(-1);

  useEffect(() => {
    dispatch(getMedicines());
  }, [dispatch]);

  useEffect(() => {
    setRows(
      (prescriptions || []).map((p, idx) => ({ id: idx + 1, order: p.order ?? idx + 1, ...p })),
    );
  }, [prescriptions]);

  const resetInputs = () => {
    setSelectedMedicine(null);
    setDosage('');
    setFrequency('');
    setInstruction('');
    setEditIndex(-1);
  };

  const handleAdd = () => {
    if (!selectedMedicine && !(selectedMedicine && selectedMedicine._id)) return;
    const item = {
      medicine:
        selectedMedicine && selectedMedicine._id
          ? { _id: selectedMedicine._id, name: selectedMedicine.name }
          : null,
      medicineId: selectedMedicine && selectedMedicine._id ? selectedMedicine._id : null,
      name: selectedMedicine ? selectedMedicine.name : '',
      dosage,
      frequency,
      instruction,
      order: rows.length + 1,
    };

    let newRows = [];
    if (editIndex > -1) {
      newRows = rows.map((r, idx) => (idx === editIndex ? { ...r, ...item } : r));
    } else {
      newRows = [...rows, { id: rows.length + 1, ...item }];
    }

    newRows = newRows.map((r, idx) => ({ ...r, id: idx + 1, order: idx + 1 }));

    setRows(newRows);
    setPrescriptions(
      newRows.map((r) => ({
        medicine: r.medicine,
        medicineId: r.medicineId,
        name: r.name,
        dosage: r.dosage,
        frequency: r.frequency,
        instruction: r.instruction,
        order: r.order,
      })),
    );
    resetInputs();
  };

  const handleEdit = (row) => {
    const idx = rows.findIndex((r) => r.id === row.id);
    if (idx === -1) return;
    setEditIndex(idx);
    setSelectedMedicine({ _id: row.medicineId, name: row.name });
    setDosage(row.dosage || '');
    setFrequency(row.frequency || '');
    setInstruction(row.instruction || '');
  };

  const handleDelete = (row) => {
    const newRows = rows
      .filter((r) => r.id !== row.id)
      .map((r, idx) => ({ ...r, id: idx + 1, order: idx + 1 }));
    setRows(newRows);
    setPrescriptions(
      newRows.map((r) => ({
        medicine: r.medicine,
        medicineId: r.medicineId,
        name: r.name,
        dosage: r.dosage,
        frequency: r.frequency,
        instruction: r.instruction,
        order: r.order,
      })),
    );
  };

  const move = (index, direction) => {
    const newRows = [...rows];
    const target = index + direction;
    if (target < 0 || target >= newRows.length) return;
    const temp = newRows[index];
    newRows[index] = newRows[target];
    newRows[target] = temp;
    const normalized = newRows.map((r, idx) => ({ ...r, id: idx + 1, order: idx + 1 }));
    setRows(normalized);
    setPrescriptions(
      normalized.map((r) => ({
        medicine: r.medicine,
        medicineId: r.medicineId,
        name: r.name,
        dosage: r.dosage,
        frequency: r.frequency,
        instruction: r.instruction,
        order: r.order,
      })),
    );
  };

  const columns = [
    { field: 'order', headerName: '#', width: 60 },
    { field: 'name', headerName: 'Medicine', width: 250 },
    { field: 'dosage', headerName: 'Dosage', width: 130 },
    { field: 'frequency', headerName: 'Frequency', width: 130 },
    { field: 'instruction', headerName: 'Instruction', width: 250 },
  ];

  const handleClose = () => {
    setPrescriptions(
      rows.map((r) => ({
        medicine: r.medicine,
        medicineId: r.medicineId,
        name: r.name,
        dosage: r.dosage,
        frequency: r.frequency,
        instruction: r.instruction,
        order: r.order,
      })),
    );
    if (onClose) onClose();
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const src = result.source.index;
    const dest = result.destination.index;
    const newRows = Array.from(rows);
    const [removed] = newRows.splice(src, 1);
    newRows.splice(dest, 0, removed);
    const normalized = newRows.map((r, idx) => ({ ...r, id: idx + 1, order: idx + 1 }));
    setRows(normalized);
    setPrescriptions(
      normalized.map((r) => ({
        medicine: r.medicine,
        medicineId: r.medicineId,
        name: r.name,
        dosage: r.dosage,
        frequency: r.frequency,
        instruction: r.instruction,
        order: r.order,
      })),
    );
  };

  const panelContent = (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
        <Autocomplete
          options={medicines || []}
          getOptionLabel={(opt) => opt.name || ''}
          sx={{ width: 300 }}
          value={selectedMedicine}
          onChange={(e, newVal) => setSelectedMedicine(newVal)}
          renderInput={(params) => <TextField {...params} label="Medicine" />}
        />
        <TextField label="Dosage" value={dosage} onChange={(e) => setDosage(e.target.value)} />
        <TextField
          label="Frequency"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
        />
        <TextField
          label="Instruction"
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
        />
        <Button variant="contained" onClick={handleAdd}>
          {editIndex > -1 ? 'Update' : 'Add'}
        </Button>
      </Box>

      <Paper
        elevation={1}
        sx={{
          display: 'flex',
          alignItems: 'center',
          p: 1,
          mb: 1,
          backgroundColor: '#f5f5f5',
          fontWeight: 600,
        }}
      >
        <Typography sx={{ width: 40 }}>#</Typography>
        <Typography sx={{ width: 240 }}>Medicine</Typography>
        <Typography sx={{ width: 120 }}>Dosage</Typography>
        <Typography sx={{ width: 120 }}>Frequency</Typography>
        <Typography sx={{ flex: 1 }}>Instruction</Typography>
        <Typography sx={{ width: 120, textAlign: 'center' }}>Actions</Typography>
      </Paper>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="prescriptions">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {rows.map((row, index) => (
                <Draggable key={row.id} draggableId={`r-${row.id}`} index={index}>
                  {(prov) => (
                    <Paper
                      ref={prov.innerRef}
                      {...prov.draggableProps}
                      {...prov.dragHandleProps}
                      sx={{ display: 'flex', alignItems: 'center', p: 1, mb: 1 }}
                    >
                      <Typography sx={{ width: 40 }}>{row.order}</Typography>
                      <Typography sx={{ width: 240 }}>{row.name}</Typography>
                      <Typography sx={{ width: 120 }}>{row.dosage}</Typography>
                      <Typography sx={{ width: 120 }}>{row.frequency}</Typography>
                      <Typography
                        sx={{
                          flex: 1,
                          whiteSpace: 'normal', // allows wrapping
                          wordBreak: 'break-word', // breaks long words
                          overflowWrap: 'anywhere',
                        }}
                      >
                        {row.instruction}
                      </Typography>{' '}
                      <Box>
                        <IconButton onClick={() => handleEdit(row)} size="small">
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(row)} size="small" color="error">
                          <DeleteIcon />
                        </IconButton>
                        <IconButton onClick={() => move(index, -1)} size="small">
                          <ArrowUpwardIcon />
                        </IconButton>
                        <IconButton onClick={() => move(index, 1)} size="small">
                          <ArrowDownwardIcon />
                        </IconButton>
                      </Box>
                    </Paper>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </Box>
  );

  if (inline) {
    return panelContent;
  }

  return (
    <Dialog open={open} fullWidth maxWidth="md" onClose={handleClose}>
      <DialogTitle>Prescribe Medicine</DialogTitle>
      <DialogContent>{panelContent}</DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="inherit">
          Save & Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
