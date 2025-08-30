import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import { LoadingButton } from '@mui/lab';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PatientStyle from './doctor.module.scss';
import CustomTextField from '../components/form/CustomTextField';
import { toast } from 'react-toastify';
import { addDoctor, updateDoctor } from '../../apis/doctorSlice';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});

export default function DoctorDialog(props) {
  const { open, setOpen, editData, operationMode, setOperationMode, callApi } = props;
  const dispatch = useDispatch();

  const { loading } = useSelector((state) => state.problemData);

  const [doctorData, setDoctorData] = useState({
    name: "",
    email: "",
    phone: "",
    joiningDate: null
  });

  const [uploadedFiles, setUploadedFiles] = useState([]);

  React.useEffect(() => {
    if (editData && Object.keys(editData) && Object.keys(editData).length > 0 && operationMode === "Edit") {
      setDoctorData(editData)
      setUploadedFiles(editData.files || [])
    } else {
      setDoctorData({
        name: "",
        email: "",
        phone: ""
      })
      setOperationMode("Add")
    }
  }, [editData, operationMode])

  const handleClose = () => {
    setOpen(false);
    setDoctorData({
      name: "",
      email: "",
      phone: ""
    });
    setUploadedFiles([]);
    setOperationMode("Add")
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files); // convert FileList → Array
    setUploadedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setDoctorData({ ...doctorData, [name]: value });
  };

  const handleSubmit = async () => {
    if (!doctorData.name) {
      return toast.error('Please enter name');
    }
    if (!doctorData.email) {
      return toast.error('Please enter email');
    }
    if (!doctorData.phone) {
      return toast.error('Please enter phone');
    }

    const formData = new FormData();
    formData.append("name", doctorData.name);
    formData.append("email", doctorData.email);
    formData.append("phone", doctorData.phone);
    formData.append("joiningDate", doctorData.joiningDate);

    uploadedFiles.forEach((file) => {
      formData.append("files", file);
    });

    const response = await dispatch(operationMode === "Add"
      ? addDoctor(formData)
      : updateDoctor({ ...formData, id: doctorData._id })
    );

    if (!response.payload?.success) {
      return toast.success(response.payload?.message);
    } else {
      handleClose();
      toast.success(response.payload?.message);
    }

    callApi();
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
        <DialogTitle className="modalHeader">{operationMode} Doctor</DialogTitle>
        <DialogContent className="modalContent">
          <div>
            <CustomTextField
              label="Name"
              type="text"
              size="small"
              fullWidth
              className={PatientStyle.input}
              name="name"
              value={doctorData?.name}
              onChange={handleOnChange}
              required
            />
          </div>
          <div>
            <CustomTextField
              label="Email"
              type="email"
              size="small"
              fullWidth
              className={PatientStyle.input}
              name="email"
              value={doctorData?.email}
              onChange={handleOnChange}
              required
            />
          </div>
          <div>
            <CustomTextField
              label="Phone"
              type="number"
              size="small"
              fullWidth
              className={PatientStyle.input}
              name="phone"
              value={doctorData?.phone}
              onChange={handleOnChange}
              required
            />
          </div>
          <div>
            <CustomTextField
              label="Joining Date"
              type="date"
              size="small"
              fullWidth
              className={PatientStyle.input}
              name="joiningDate"
              value={doctorData?.joiningDate}
              onChange={handleOnChange}
              required
              InputLabelProps={{ shrink: true }}
            />
          </div>

          {/* Upload Button */}
          <Button
            component="label"
            role={undefined}
            variant="contained"
            tabIndex={-1}
            fullWidth
            startIcon={<CloudUploadIcon />}
            sx={{ mt: 2 }}
          >
            Upload files
            <VisuallyHiddenInput
              type="file"
              multiple
              onChange={(event) => handleFileChange(event)}
            />
          </Button>

          {/* Show Uploaded Files */}
          {uploadedFiles.length > 0 && (
            <div style={{ marginTop: "10px" }}>
              <h4>Uploaded Files:</h4>
              <ol>
                {uploadedFiles.map((file, index) => {
                  // If file is a File object from input
                  const isFileObject = file instanceof File;

                  return (
                    <li key={index} style={{ marginTop: "10px" }}>
                      <a
                        href={isFileObject ? URL.createObjectURL(file) : file}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {isFileObject ? file.name : file}
                      </a>
                    </li>
                  );
                })}
              </ol>
            </div>
          )}

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