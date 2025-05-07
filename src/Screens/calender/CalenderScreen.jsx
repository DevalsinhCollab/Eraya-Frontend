import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/en-gb';
import { useEffect, useState } from 'react';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useDispatch, useSelector } from 'react-redux';
import { getAllProblemsByDoc } from '../../apis/problemSlice';
import { Autocomplete, ButtonGroup, IconButton, TextField } from '@mui/material';
import CalenderStyle from './calender.module.scss';
import { TimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LoadingButton } from '@mui/lab';
import { toast } from 'react-toastify';
import {
  addAppointment,
  deleteAppointment,
  getAllAppointmentsByDoc,
  updateAppointment,
} from '../../apis/appointmentSlice';
// import { ArrowBackIosNewIcon, ArrowForwardIosIcon } from '@mui/icons-material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';

const localizer = momentLocalizer(moment);

export default function CalenderScreen() {
  const dispatch = useDispatch();
  const { allProblems } = useSelector((state) => state.problemData);
  const { loggedIn } = useSelector((state) => state.authData);
  const { appointments, apptLoading } = useSelector((state) => state.appointmentData);
  // console.log(appointments);
  const [appointMent, setAppointMent] = useState({
    start: null,
    end: null,
    prbData: null,
    id: null,
  });
  const [openSlot, setOpenSlot] = useState(false);
  const [openEvent, setOpenEvent] = useState(false);
  const [clickedEvent, setClickedEvent] = useState({});
  const [selectView, setSelectView] = useState('month');

  const handleClose = () => {
    setOpenEvent(false);
    setOpenSlot(false);
    setAppointMent({
      start: null,
      end: null,
      prbData: null,
      id: null,
    });
  };

  const handleSlotSelected = (slotInfo) => {
    // console.log(moment(slotInfo.start));
    setAppointMent((oldData) => ({
      ...oldData,
      start: moment(slotInfo.start),
      end: moment(slotInfo.start),
    }));
    setOpenSlot(true);
  };

  const handleEventSelected = (event) => {
    // console.log('event', event);
    setOpenEvent(true);
    setClickedEvent(event);
    setAppointMent({
      ...event,
      start: moment(event.start), // Ensure start is a moment object
      end: moment(event.end), // Ensure end is a moment object
    });
  };

  // console.log('appointMent', appointMent);
  useEffect(() => {
    dispatch(getAllAppointmentsByDoc({ id: loggedIn?._id }));
  }, [loggedIn]);

  useEffect(() => {
    if (openEvent || openSlot) {
      dispatch(getAllProblemsByDoc({ id: loggedIn?._id }));
    }
  }, [openSlot, openEvent]);

  const handelOnChange = (name, value) => {
    // console.log(name, value);
    setAppointMent((oldData) => ({
      ...oldData,
      [name]: value,
    }));
  };
  // console.log(allProblems);
  // console.log(appointMent);
  const handelSubmit = async () => {
    const finalData = {
      prbData: appointMent.prbData,
      start: appointMent.start,
      end: appointMent.end,
      patientId: appointMent.prbData.patientId,
      issue: appointMent.prbData.issue,
      docId: loggedIn?._id,
      docName: loggedIn?.name,
      docSpeciality: loggedIn?.docSpeciality,
    };
    // delete appointMent?.prbData?.patientId;
    // delete appointMent?.prbData?.issue;
    const response = await dispatch(addAppointment(finalData));
    // console.log(response);
    if (!response.payload.error) {
      handleClose();
      toast.success('Appointment Added Successfully');
    } else {
      toast.error(response.payload.message);
    }
  };

  // console.log(appointMent);

  const handelEditSubmit = async () => {
    // console.log('appointMent', appointMent);

    const finalData = {
      prbData: appointMent.prbData,
      start: appointMent.start,
      end: appointMent.end,
      patientId: appointMent.prbData.patientId || appointMent.patientId,
      issue: appointMent.prbData.issue || appointMent.issue,
      docId: loggedIn?._id,
      docName: loggedIn?.name,
      docSpeciality: loggedIn?.docSpeciality,
      _id: appointMent._id,
    };
    // delete appointMent?.prbData?.patientId;
    // delete appointMent?.prbData?.issue;
    // console.log('finalData', finalData);
    const response = await dispatch(updateAppointment(finalData));
    // console.log(response);
    if (!response.payload.error) {
      handleClose();
      toast.success('Appointment Updated Successfully');
    } else {
      toast.error(response.payload.message);
    }
  };
  const handelDelete = async () => {
    // console.log(clickedEvent);
    const response = await dispatch(deleteAppointment(clickedEvent?._id));
    if (!response.payload.error) {
      handleClose();
      toast.success('Appointment Deleted Successfully');
    }
  };

  const CustomEvent = ({ event }) => (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <span>{event?.prbData?.label}</span>
    </div>
  );

  const CustomToolbar = (toolbar) => {
    const goToBack = () => {
      toolbar.onNavigate('PREV');
    };

    const goToNext = () => {
      toolbar.onNavigate('NEXT');
    };

    const goToCurrent = () => {
      toolbar.onNavigate('TODAY');
    };

    const changeView = (view) => {
      toolbar.onView(view);
      setSelectView(view);
    };

    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}
      >
        <div>
          <Button onClick={goToCurrent} className={CalenderStyle.viewBtn}>
            Today
          </Button>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '2rem',
          }}
        >
          <IconButton onClick={goToBack} className={CalenderStyle.nextPrevBtns}>
            <ArrowBackIosNewIcon />
          </IconButton>
          <div
            style={{
              fontSize: '1.5rem',
              fontWeight: '800',
              marginLeft: '1rem',
              marginRight: '1rem',
              color: '#24266C',
            }}
          >
            {toolbar.label}
          </div>
          <IconButton onClick={goToNext} className={CalenderStyle.nextPrevBtns}>
            <ArrowForwardIosIcon />
          </IconButton>
        </div>
        <div className={CalenderStyle.viewBtnsGrp}>
          <Button
            onClick={() => changeView('month')}
            className={
              selectView === 'month' ? CalenderStyle.selectedViewBtn : CalenderStyle.viewBtn
            }
          >
            Month
          </Button>
          <Button
            onClick={() => changeView('week')}
            className={
              selectView === 'week' ? CalenderStyle.selectedViewBtn : CalenderStyle.viewBtn
            }
          >
            Week
          </Button>
          <Button
            onClick={() => changeView('day')}
            className={selectView === 'day' ? CalenderStyle.selectedViewBtn : CalenderStyle.viewBtn}
          >
            Day
          </Button>
          <Button
            onClick={() => changeView('agenda')}
            className={
              selectView === 'agenda' ? CalenderStyle.selectedViewBtn : CalenderStyle.viewBtn
            }
          >
            Agenda
          </Button>
        </div>
      </div>
    );
  };

  // export default CustomToolbar;
  return (
    <div className={CalenderStyle.main}>
      {/* CalenderScreen */}
      <Calendar
        localizer={localizer}
        // events={appointments}
        events={appointments?.map((appt) => ({
          ...appt,
          start: new Date(appt.start),
          end: new Date(appt.end),
        }))}
        views={['month', 'week', 'day', 'agenda']}
        timeslots={2}
        defaultView="month"
        defaultDate={new Date()}
        selectable={true}
        style={{ height: 600, backgroundColor: '#fff', padding: '1rem', borderRadius: '.4rem' }}
        onSelectSlot={handleSlotSelected}
        onSelectEvent={handleEventSelected}
        components={{
          event: CustomEvent,
          toolbar: CustomToolbar,
        }}
      />

      {/* -----------------------------------------------------Add Dailog--------------------------------------------------- */}

      <Dialog
        open={openSlot}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        fullWidth
      >
        <DialogTitle id="alert-dialog-title" className="modalHeader">
          Schedule Appointment At {moment(appointMent.start).format('MMMM Do YYYY')}
        </DialogTitle>
        <DialogContent className="modalContent">
          {/* <DialogContentText id="alert-dialog-description"> */}
          <div>
            <Autocomplete
              disablePortal
              id="combo-box-demo"
              options={
                allProblems && allProblems.length > 0
                  ? allProblems.map((item) => {
                      return {
                        label: `${item.patientName}-${item.issue}`,
                        prbId: item._id,
                        patientId: item.patientId,
                        issue: item.issue,
                      };
                    })
                  : []
              }
              value={appointMent?.prbData}
              onChange={(e, newValue) => handelOnChange('prbData', newValue)}
              renderInput={(params) => <TextField {...params} label="Select Patient" />}
              fullWidth
              className={CalenderStyle.input}
            />
          </div>
          <LocalizationProvider dateAdapter={AdapterMoment}>
            <TimePicker
              label="Start Time"
              value={appointMent?.start}
              onChange={(newValue) => handelOnChange('start', newValue)}
              renderInput={(params) => <TextField {...params} />}
              className={CalenderStyle.input}
              fullWidth
            />
            <TimePicker
              label="End Time"
              value={appointMent?.end}
              onChange={(newValue) => handelOnChange('end', newValue)}
              renderInput={(params) => <TextField {...params} />}
              className={CalenderStyle.input}
              fullWidth
            />
          </LocalizationProvider>
          {/* </DialogContentText> */}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="error" variant="contained">
            Cancel
          </Button>
          <LoadingButton
            loading={apptLoading}
            onClick={handelSubmit}
            variant="contained"
            className="dialogSubmitBtn"
          >
            Submit
          </LoadingButton>
        </DialogActions>
      </Dialog>

      {/* -----------------------------------------------------Edit Dailog--------------------------------------------------- */}

      <Dialog
        open={openEvent}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        fullWidth
      >
        <DialogTitle id="alert-dialog-title" className="modalHeader">
          View/Edit Appointment Of {moment(appointMent.start).format('MMMM Do YYYY')}
        </DialogTitle>
        <DialogContent className="modalContent">
          {/* <DialogContentText id="alert-dialog-description"> */}
          <div>
            <Autocomplete
              disablePortal
              id="combo-box-demo"
              options={
                allProblems && allProblems.length > 0
                  ? allProblems.map((item) => {
                      return {
                        label: `${item.patientName}-${item.issue}`,
                        prbId: item._id,
                        patientId: item.patientId,
                        issue: item.issue,
                      };
                    })
                  : []
              }
              value={appointMent?.prbData}
              onChange={(e, newValue) => handelOnChange('prbData', newValue)}
              renderInput={(params) => <TextField {...params} label="Select Patient" />}
              fullWidth
              className={CalenderStyle.input}
            />
          </div>

          <LocalizationProvider dateAdapter={AdapterMoment}>
            <TimePicker
              label="Start Time"
              value={appointMent?.start}
              onChange={(newValue) => handelOnChange('start', newValue)}
              renderInput={(params) => <TextField {...params} />}
              className={CalenderStyle.input}
              fullWidth
            />
            <TimePicker
              label="End Time"
              value={appointMent?.end}
              onChange={(newValue) => handelOnChange('end', newValue)}
              renderInput={(params) => <TextField {...params} />}
              className={CalenderStyle.input}
              fullWidth
            />
          </LocalizationProvider>
          {/* </DialogContentText> */}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="contained" className="dialogSubmitBtn">
            Cancel
          </Button>
          <LoadingButton
            onClick={handelDelete}
            loading={apptLoading}
            color="error"
            variant="contained"
          >
            Delete
          </LoadingButton>
          <LoadingButton
            loading={apptLoading}
            onClick={handelEditSubmit}
            variant="contained"
            className="dialogSubmitBtn"
          >
            Edit
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </div>
  );
}
