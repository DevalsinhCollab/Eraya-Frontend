import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Layout from './Layout';
import Login from './Screens/auth/Login';
import SignUp from './Screens/auth/SignUp';
import Dashboard from './Screens/dashboard/Dashboard';
import ProblemTable from './Screens/problem/ProblemTable';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserByToken } from './apis/authSlice';
import { getAuthToken, isTokenExpired, removeAuthToken } from './common/common';
import DocProblemTable from './Screens/problem/DocProblemTable';
import CalenderScreen from './Screens/calender/CalenderScreen';
import DoctorAppointmentTable from './Screens/appointment/DoctorAppointmentTable';
import PatientAppointmentTable from './Screens/appointment/PatientAppointmentTable';
import ChatScreen from './Screens/chat/ChatScreen';
import { useSocket } from './SocketContext';
import { toast } from 'react-toastify';
import { addPatitentAppt, updatePatitentAppt } from './apis/appointmentSlice';
import { addNotification, getUnreadMsgsCount, updateUnreadMsgCount } from './apis/notificationSlice';
import { addPatitentPrb } from './apis/problemSlice';
import Patients from './Screens/patients/Patients';
import Doctors from './Screens/doctors/Doctors';
import PatientForm from './Screens/patientForm/PatientForm';
import AssesstmentForm from './Screens/assesstmentform/AssesstmentForm';

function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const socket = useSocket();

  const [greeting, setGreeting] = useState('');

  const { loggedIn } = useSelector((state) => state.authData);

  useEffect(() => {
    if (!location.pathname.startsWith('/login') && !location.pathname.startsWith('/signup')) {
      const handleClick = () => {
        const checkToken = isTokenExpired(getAuthToken());
        // console.log(checkToken);
        if (checkToken) {
          navigate('/login');
          toast.error('Time Out');
        }
        // checkTokenAndNavigate();
      };
      document.addEventListener('click', handleClick);
      return () => {
        document.removeEventListener('click', handleClick);
      };
    }
  }, [navigate]);

  useEffect(() => {
    async function callAPI() {
      const response = await dispatch(getUserByToken());
      // console.log(response);
      if (response.type.includes('rejected') && response.payload.response.data.error) {
        removeAuthToken();
        navigate('/login');
      }
    }
    callAPI();
  }, []);

  // console.log('loggedIn-----', loggedIn);

  useEffect(() => {
    if (!socket) return; // Ensure socket is defined before proceeding

    if (loggedIn) {
      dispatch(getUnreadMsgsCount(loggedIn?._id));

      socket.on('notifyUser', (notification) => {
        // console.log(notification);
        if (notification.receiverId === loggedIn?._id) {
          // setNotification((oldNotification) => [...oldNotification, notification.message]);
          toast.info(notification.title);
          dispatch(addNotification(notification));
          dispatch(updateUnreadMsgCount());
        }
      });

      if (loggedIn.role === 'D') {
        const docId = loggedIn._id;
        socket.emit('joinRoom', docId);

        socket.on('newProblem', (data) => {
          toast.info(`${data?.data?.patientName}'s new problem ${data?.data?.issue}`);
          dispatch(addPatitentPrb(data?.data));
        });

        return () => {
          socket.off('newProblem');
        };
      } else if (loggedIn.role === 'U') {
        const patientId = loggedIn._id;
        socket.emit('joinRoom', patientId);

        socket.on('newAppointment', (data) => {
          toast.info(`${data?.message}`, {
            position: 'top-center',
            style: { width: '600px' },
          });
          if (data?.type === 'add') {
            dispatch(addPatitentAppt(data?.data));
          } else if (data?.type === 'update') {
            dispatch(updatePatitentAppt(data?.data));
          }
        });

        return () => {
          socket.off('newAppointment');
        };
      }
    }
  }, [socket, loggedIn]);

  useEffect(() => {
    const updateGreeting = () => {
      const currentHour = new Date().getHours();
      if (currentHour < 12) {
        setGreeting('Good Morning');
      } else if (currentHour < 18) {
        setGreeting('Good Afternoon');
      } else {
        setGreeting('Good Evening');
      }
    };

    updateGreeting();
    
    // Optional: Update the greeting every minute
    const interval = setInterval(updateGreeting, 60000);

    // Cleanup the interval on component unmount
    return () => clearInterval(interval);
  }, []);

  return (
    // <div className="App">
    //   {/* <BrowserRouter> */}
    //   <Routes>
    //     <Route path="/login" element={<Login />} />
    //     <Route path="/signup" element={<SignUp />} />
    //   </Routes>
    //   <Routes>
    //     <Route path="/" element={<Navigate to={'/dashboard'} />} />
    //     <Route path="/dashboard" element={<Layout component={<Dashboard />} />} />
    //     <Route path="/problem" element={<Layout component={<ProblemTable />} />} />
    //     <Route path="/patientproblem" element={<Layout component={<DocProblemTable />} />} />
    //     <Route path="/calender" element={<Layout component={<CalenderScreen />} />} />
    //     <Route
    //       path="/doctorappointment"
    //       element={<Layout component={<DoctorAppointmentTable />} />}
    //     />
    //     <Route
    //       path="/patientappointment"
    //       element={<Layout component={<PatientAppointmentTable />} />}
    //     />
    //     <Route
    //       path="/chat/:prbId/:senderId/:receiverId"
    //       element={<Layout component={<ChatScreen />} />}
    //     />
    //   </Routes>
    //   {/* </BrowserRouter> */}
    // </div>
    <div className="App">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/" element={<Navigate to={'/dashboard'} />} />
        <Route path="/dashboard" element={<Layout component={<Dashboard greeting={greeting}/>} />} />
        <Route path="/patients" element={<Layout component={<Patients />} />} />
        <Route path="/doctors" element={<Layout component={<Doctors />} />} />
        <Route path="/form" element={<Layout component={<PatientForm />} />} />
        <Route path="/assessmentform/:id" element={<Layout component={<AssesstmentForm />} />} />
        {/* <Route path="/problem" element={<Layout component={<ProblemTable />} />} /> */}
        {/* <Route path="/patientproblem" element={<Layout component={<DocProblemTable />} />} />
        <Route path="/calender" element={<Layout component={<CalenderScreen />} />} />
        <Route
          path="/doctorappointment"
          element={<Layout component={<DoctorAppointmentTable />} />}
        />
        <Route
          path="/patientappointment"
          element={<Layout component={<PatientAppointmentTable />} />}
        />
        <Route
          path="/chat/:prbId/:senderId/:receiverId"
          element={<Layout component={<ChatScreen />} />}
        /> */}
        <Route path="*" element={<Navigate to="/dashboard" />} /> {/* Default route */}
      </Routes>
    </div>
  );
}

export default App;
