// import React, { useEffect, useState } from 'react';
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   Typography,
//   Accordion,
//   AccordionSummary,
//   AccordionDetails,
//   Box,
// } from '@mui/material';
// import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
// import { useDispatch, useSelector } from 'react-redux';
// import { getPatientsForm } from '../apis/patientFormSlice';
// import moment from 'moment';

// const HistoryDialog = ({ open, onClose, patientId }) => {
//   const dispatch = useDispatch();
//   const { patientsForm } = useSelector((state) => state.patientFormData);
//   const [grouped, setGrouped] = useState([]);

//   useEffect(() => {
//     if (open && patientId) {
//       dispatch(getPatientsForm({ patient: patientId, page: 0, pageSize: 200 }));
//     }
//   }, [open, patientId, dispatch]);

//   useEffect(() => {
//     if (patientsForm && patientsForm.length) {
//       const map = patientsForm.reduce((acc, item) => {
//         const d = item && item.date ? moment(item.date).format('DD-MM-YYYY') : 'Unknown Date';
//         acc[d] = acc[d] || [];
//         acc[d].push(item);
//         return acc;
//       }, {});

//       const arr = Object.keys(map)
//         .sort((a, b) => moment(b, 'DD-MM-YYYY').unix() - moment(a, 'DD-MM-YYYY').unix())
//         .map((date) => ({ date, items: map[date] }));

//       setGrouped(arr);
//     } else {
//       setGrouped([]);
//     }
//   }, [patientsForm]);

//   return (
//     <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
//       <DialogTitle>Patient History</DialogTitle>
//       <DialogContent dividers>
//         {patientId ? (
//           grouped.length ? (
//             grouped.map((g) => (
//               <Accordion key={g.date} sx={{ mb: 1 }}>
//                 <AccordionSummary expandIcon={<ExpandMoreIcon />}> 
//                   <Typography sx={{ fontWeight: 600 }}>
//                     {g.date} — {g.items.length} record{g.items.length > 1 ? 's' : ''}
//                   </Typography>
//                 </AccordionSummary>
//                 <AccordionDetails>
//                   {g.items.map((it) => (
//                     <Box key={it._id} sx={{ mb: 2, borderBottom: '1px dashed #eee', pb: 1 }}>
//                       <Typography variant="subtitle2">{it.treatment || '—'}</Typography>
//                       <Typography variant="body2" color="text.secondary">
//                         C/C: {it.cc || '—'} • Doctor: {it.doctor?.name || '—'}
//                       </Typography>
//                       {it.prescriptions && it.prescriptions.length > 0 && (
//                         <Box sx={{ mt: 1 }}>
//                           {it.prescriptions.map((p, idx) => (
//                             <Typography key={idx} variant="body2">
//                               {p.name || p.medname || p.med || 'Medicine'}{p.dosage ? ` — ${p.dosage}` : ''}
//                             </Typography>
//                           ))}
//                         </Box>
//                       )}
//                     </Box>
//                   ))}
//                 </AccordionDetails>
//               </Accordion>
//             ))
//           ) : (
//             <Typography>No history found for this patient.</Typography>
//           )
//         ) : (
//           <Typography>Select a saved patient to view history.</Typography>
//         )}
//       </DialogContent>
//       <DialogActions>
//         <Button onClick={onClose}>Close</Button>
//       </DialogActions>
//     </Dialog>
//   );
// };

// export default HistoryDialog;
import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Divider,
  Grid,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import { getPatientsForm, getPatientsFormById } from '../apis/patientFormSlice';

/* ===============================
   HELPERS
================================ */
const formatLabel = (key) =>
  key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());

const renderValue = (value) => {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return value.toString();
};

/* ===============================
   COMPONENT
================================ */
const HistoryDialog = ({ open, onClose, patientId }) => {
  const dispatch = useDispatch();

  const { patientsForm = [], loading } = useSelector(
    (state) => state.patientFormData || {}
  );

  const [groupedHistory, setGroupedHistory] = useState([]);

  /* ===============================
     FETCH DATA
  ================================ */
  useEffect(() => {
    if (open && patientId) {
      // Primary fetch: try treating `patientId` as patient._id
      dispatch(
        getPatientsForm({ patient: patientId, page: 0, pageSize: 200 })
      ).then((res) => {
        // If no records returned, maybe the provided id is a patientForm id.
        if (!res || !res.payload || !res.payload.data || res.payload.data.length === 0) {
          // attempt to fetch the single form by id and extract nested patient id
          dispatch(getPatientsFormById(patientId)).then((formRes) => {
            const form = formRes && formRes.payload && formRes.payload.data;
            const nestedPatientId = form && form.patient && form.patient._id;
            if (nestedPatientId) {
              dispatch(
                getPatientsForm({ patient: nestedPatientId, page: 0, pageSize: 200 })
              );
            }
          });
        }
      });
    }
  }, [open, patientId, dispatch]);

  /* ===============================
     GROUP BY DATE
  ================================ */
  useEffect(() => {
    if (!patientsForm.length) {
      setGroupedHistory([]);
      return;
    }

    const grouped = patientsForm.reduce((acc, item) => {
      const dateKey = item.date
        ? moment(item.date).format('DD-MM-YYYY')
        : 'Unknown Date';

      acc[dateKey] = acc[dateKey] || [];
      acc[dateKey].push(item);
      return acc;
    }, {});

    const result = Object.keys(grouped)
      .sort(
        (a, b) =>
          moment(b, 'DD-MM-YYYY').valueOf() -
          moment(a, 'DD-MM-YYYY').valueOf()
      )
      .map((date) => ({
        date,
        records: grouped[date],
      }));

    setGroupedHistory(result);
  }, [patientsForm]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>Patient History</DialogTitle>

      <DialogContent dividers>
        {loading && <Typography>Loading history...</Typography>}

        {!loading && !groupedHistory.length && (
          <Typography>No history found.</Typography>
        )}

        {groupedHistory.map((group) => (
          <Accordion key={group.date} defaultExpanded sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight={600}>
                {group.date}
              </Typography>
            </AccordionSummary>

            <AccordionDetails>
              {group.records.map((item) => (
                <Box key={item._id} mb={3}>
                  {/* ================= Doctor & Patient ================= */}
                  <Typography variant="subtitle1" fontWeight={600}>
                    Doctor & Patient
                  </Typography>
                  <Divider sx={{ mb: 1 }} />

                  <Grid container spacing={2} mb={2}>
                    <Grid item xs={6}>
                      <Typography>
                        <b>Doctor:</b> {item.doctor?.name || '—'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography>
                        <b>Patient:</b> {item.patient?.name || '—'}
                      </Typography>
                    </Grid>
                  </Grid>

                  {/* ================= All Fields ================= */}
                  <Typography variant="subtitle1" fontWeight={600}>
                    Examination Details
                  </Typography>
                  <Divider sx={{ mb: 1 }} />

                  <Grid container spacing={2}>
                    {Object.entries(item).map(([key, value]) => {
                      if (
                        [
                          '_id',
                          '__v',
                          'doctor',
                          'patient',
                          'prescriptions',
                          'isDeleted',
                          'createdAt',
                          'updatedAt',
                          'date',
                        ].includes(key)
                      )
                        return null;

                      return (
                        <Grid item xs={12} sm={6} md={4} key={key}>
                          <Typography variant="body2">
                            <b>{formatLabel(key)}:</b>{' '}
                            {renderValue(value)}
                          </Typography>
                        </Grid>
                      );
                    })}
                  </Grid>

                  {/* ================= Prescriptions ================= */}
                  {Array.isArray(item.prescriptions) &&
                    item.prescriptions.length > 0 && (
                      <>
                        <Typography
                          variant="subtitle1"
                          fontWeight={600}
                          mt={3}
                        >
                          Prescriptions
                        </Typography>
                        <Divider sx={{ mb: 1 }} />

                        {item.prescriptions.map((med, idx) => (
                          <Box
                            key={idx}
                            p={1}
                            mb={1}
                            sx={{
                              border: '1px solid #ddd',
                              borderRadius: 1,
                            }}
                          >
                            <Typography>
                              <b>Medicine:</b>{' '}
                              {med.medicineName || '—'}
                            </Typography>
                            <Typography>
                              <b>Dosage:</b> {med.dosage || '—'}
                            </Typography>
                            <Typography>
                              <b>Duration:</b> {med.duration || '—'}
                            </Typography>
                            <Typography>
                              <b>Notes:</b> {med.notes || '—'}
                            </Typography>
                          </Box>
                        ))}
                      </>
                    )}

                  <Divider sx={{ mt: 3 }} />
                </Box>
              ))}
            </AccordionDetails>
          </Accordion>
        ))}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default HistoryDialog;
