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
import SearchDoctor from "../../components/Autocomplete/SearchDoctor"
import SearchPatient from '../../components/Autocomplete/SearchPatient';
import { TextareaAutosize, TextField } from '@mui/material';
import { addPatientForm, updatePatientForm } from '../../apis/patientFormSlice';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});

export default function PatientFormDialog(props) {
  const { open, setOpen, operationMode, setOperationMode, callApi, editData } = props;
  const dispatch = useDispatch();

  const { prbLoading } = useSelector((state) => state.problemData);

  const [data, setData] = useState({
    doctor: null,
    patient: null,
    description: "",
    date: new Date(),
    payment: ""
  });

  React.useEffect(() => {
    if (editData && operationMode == "Edit") {

      let operationData = {
        ...editData,
        doctor: { label: editData && editData.doctor && editData.doctor.name, value: editData && editData.doctor && editData.doctor._id, ...editData.doctor },
        patient: { label: editData && editData.patient && editData.patient.name, value: editData && editData.patient && editData.patient._id, ...editData.patient }
      }

      setData(operationData)
    }
  }, [editData, operationMode])

  const handleClose = () => {
    setOpen(false);
    setData({
      doctor: null,
      patient: null,
      description: "",
      date: new Date(),
      payment: ""
    });
    setOperationMode("Add")
  };

  const handleSubmit = async () => {

    if (data && data.doctor == null) {
      return toast.error("Please select a doctor")
    }

    if (data && data.patient == null) {
      return toast.error("Please select a patient")
    }

    if (!data.description) {
      return toast.error('Please enter description');
    }

    let { label, value, ...doctorObject } = data && data.doctor
    let { label: patientLabel, value: patientValue, ...patientObject } = data && data.patient

    let finalData = { ...data, doctor: doctorObject, patient: patientObject }

    const response = await dispatch(operationMode == "Add" ? addPatientForm(finalData) : updatePatientForm({ ...data, id: data._id }));
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
      [name]: name === "date" ? new Date(value) : value
    }));
  }

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
          <div style={{ marginBottom: "20px" }}>
            <SearchDoctor open={open} setData={setData} data={data} />
          </div>
          <div style={{ marginBottom: "20px" }}>
            <SearchPatient open={open} setData={setData} data={data} />
          </div>
          <div style={{ marginBottom: "20px" }}>
            <TextareaAutosize minRows={5} label="Description" placeholder="Write Description" name='description' onChange={handleChange}
              value={data.description || ""}
              style={{
                width: 550,
                fontSize: 16,
                padding: 10,
                borderColor: '#ccc',
              }}
            />
          </div>
          <div style={{ marginBottom: "20px" }}>
            <TextField
              label="Payment Amount"
              type="text"
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              name="payment"
              value={data.payment}
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
              value={data.date ? new Date(data.date).toISOString().split("T")[0] : ""}
              onChange={handleChange}
            />
          </div>
        </DialogContent>
        <DialogActions className="modalFooter">
          <Button variant="contained" onClick={handleClose} color="error">
            Cancel
          </Button>
          <LoadingButton
            loading={prbLoading}
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
