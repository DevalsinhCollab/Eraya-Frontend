import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import { LoadingButton } from '@mui/lab';
import { useState } from 'react';
import _ from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import SearchDoctor from '../../components/Autocomplete/SearchDoctor';
import SearchPatient from '../../components/Autocomplete/SearchPatient';
import { TextareaAutosize, TextField } from '@mui/material';
import { addPatientForm, updatePatientForm } from '../../apis/patientFormSlice';
import { addAppointment, updateAppointment } from '../../apis/appointmentSlice';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});

export default function PatientFormDialog(props) {
  const {
    open,
    setOpen,
    operationMode,
    setOperationMode,
    callApi,
    editData,
    selectedPatient,
    setSelectedPatient,
    setSelectedPatientFormId,
    selectedPatientFormId,
  } = props;
  const dispatch = useDispatch();

  const { loading } = useSelector((state) => state.problemData);

  const [data, setData] = useState({
    doctor: null,
    patient: null,
    treatment: '',
    description: '',
    date: new Date(),
    payment: '',
    patientFormId: null,
  });

  React.useEffect(() => {
    if (selectedPatient) {
      setData((prev) => ({
        ...prev,
        patient: {
          label: selectedPatient.name,
          value: selectedPatient._id,
          ...selectedPatient,
        },
      }));
    }
  }, [selectedPatient]);

  React.useEffect(() => {
    if (selectedPatientFormId) {
      setData((prev) => ({
        ...prev,
        patientFormId: selectedPatientFormId,
      }));
    }
  }, [selectedPatientFormId]);

  console.log(editData, 'editData in patient form dialog');

  React.useEffect(() => {
    if (editData && operationMode == 'Edit') {
      let operationData = {
        ...editData,
        doctor: {
          label: editData && editData.doctorId && editData.doctorId.name,
          value: editData && editData.doctorId && editData.doctorId._id,
          ...editData.doctor,
        },
        patient: {
          label: editData && editData.patientId && editData.patientId.name,
          value: editData && editData.patientId && editData.patientId._id,
          ...editData.patient,
        },
      };

      setData(operationData);
    }
  }, [editData, operationMode]);

  const handleClose = () => {
    setOpen(false);
    setData({
      doctor: null,
      patient: null,
      treatment: '',
      description: '',
      date: new Date(),
      payment: '',
      patientFormId: null,
    });
    setOperationMode('Add');
    if (setSelectedPatient || setSelectedPatientFormId) {
      setSelectedPatient(null);
      setSelectedPatientFormId(null);
    }
  };


  const handleSubmit = async () => {
    if (data && data.doctor == null) {
      return toast.error('Please select a doctor');
    }

    if (data && data.patient == null) {
      return toast.error('Please select a patient');
    }

    if (!data.description) {
      return toast.error('Please enter description');
    }

    let { label, value, ...doctorObject } = data && data.doctor;
    let { label: patientLabel, value: patientValue, ...patientObject } = data && data.patient;

    let finalData = { ...data, doctor: doctorObject, patient: patientObject };

    // const response = await dispatch(operationMode == "Add" ? addPatientForm(finalData) : updatePatientForm({ ...data, id: data._id }));
    const response = await dispatch(
      operationMode == 'Add'
        ? addAppointment(finalData)
        : updateAppointment({ ...data, id: data._id }),
    );
    if (!response.payload?.error) {
      handleClose();
      toast.success(response.payload?.message);
    }

    callApi();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // setData((prev) => ({ ...prev, [name]: value }));
    setData((prev) => ({
      ...prev,
      [name]: name === 'date' ? new Date(value) : value,
    }));
  };

  return (
    <React.Fragment>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
        fullWidth
      >
        <DialogTitle className="modalHeader">{operationMode} Data</DialogTitle>
        <DialogContent className="modalContent">
          <div style={{ marginBottom: '20px' , marginTop: '10px' }}>
            <SearchDoctor
              open={open}
              setData={setData}
              data={data}
              variant="outlined"
              name="doctor"
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <SearchPatient open={open} setData={setData} data={data} />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <TextField
              label="Treatment"
              type="text"
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              name="treatment"
              value={(data && data.treatment) || ''}
              onChange={handleChange}
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <TextareaAutosize
              minRows={5}
              label="Description"
              placeholder="Write Description"
              name="description"
              onChange={handleChange}
              value={(data && data.description) || ''}
              style={{
                width: 550,
                fontSize: 16,
                padding: 10,
                borderColor: '#ccc',
              }}
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <TextField
              label="Payment Amount"
              type="number"
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              name="payment"
              value={(data && data.payment) || ''}
              onChange={handleChange}
            />
          </div>
          <div>
            <TextField
              label="Select Date"
              type="date"
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              name="date"
              value={data && data.date && new Date(data.date).toISOString().split('T')[0]}
              onChange={handleChange}
            />
          </div>
        </DialogContent>
        <DialogActions className="modalFooter">
          <Button variant="contained" onClick={handleClose} color="error">
            Cancel
          </Button>
          <LoadingButton
            loading={loading}
            variant="contained"
            onClick={handleSubmit}
            className="dialogSubmitBtn"
          >
            Submit
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
