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
import { addDoctor, updateDoctor } from '../../apis/doctorSlice';
import SearchDoctor from "../../components/Autocomplete/SearchDoctor"
import SearchPatient from '../../components/Autocomplete/SearchPatient';
import { TextareaAutosize, TextField } from '@mui/material';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});

export default function PatientFormDialog(props) {
  const { open, setOpen, operationMode, setOperationMode, callApi } = props;
  const dispatch = useDispatch();

  const { prbLoading } = useSelector((state) => state.problemData);

  const [data, setData] = useState({
    doctor: null,
    patient: null,
    description: "",
    date: null
  });

  console.log(data, "data----------")

  const handleClose = () => {
    setOpen(false);
    setData({
      description: "",
      date: null
    });
    setOperationMode("Add")
  };

  const handleSubmit = async () => {
    if (!data.description) {
      return toast.error('Please enter description');
    }

    const response = await dispatch(operationMode == "Add" ? addDoctor(data) : updateDoctor({ ...data, id: data._id }));
    if (!response.payload?.error) {
      handleClose();
      toast.success(response.payload?.message);
    }

    callApi();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  }

  console.log("data", data);

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
            <SearchDoctor open={open} setData={setData} />
          </div>
          <div style={{ marginBottom: "20px" }}>
            <SearchPatient open={open} setData={setData} />
          </div>
          <div style={{ marginBottom: "20px" }}>
            <TextareaAutosize minRows={5} label="Description" placeholder="Write Description" name='description' onChange={handleChange}
              style={{
                width: 550,
                fontSize: 16,
                padding: 10,
                borderColor: '#ccc',
              }}
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
              name='date'
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
