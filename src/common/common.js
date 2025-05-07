import moment from 'moment';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { jwtDecode } from 'jwt-decode';

export const removeAuthToken = () => {
  localStorage.removeItem('token');
};

export const getAuthToken = () => {
  if (localStorage.getItem('token')) {
    return localStorage.getItem('token');
  } else {
    return null;
  }
};

export const getToken = () => {
  const token = getAuthToken();

  if (!token || token === '') {
    return {
      error: true,
    };
  } else {
    return {
      error: false,
      token,
    };
  }
};

// export const ConvertCsvToJson = (e, callback) => {
//   const file = e.target.files[0];
//   Papa.parse(file, {
//     header: true,
//     complete: (results) => {
//       let data = results.data;
//       data.pop();
//       callback(null, data);
//     },
//     error: (error) => {
//       callback(error, null);
//     },
//   });
// };

export const SweetAlert = ({ title, text, icon }) => {
  return Swal.fire({
    title: title,
    text: text,
    icon: icon,
  });
};

export const SweetAlertModal = ({
  title,
  icon1,
  text,
  icon2,
  callApi,
  dispatch,
  reducer,
  reducer2,
  reducer3,
}) => {
  return Swal.fire({
    title: title,
    icon: icon1,
    showCancelButton: true,
    confirmButtonColor: '#5D87FF',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes',
  }).then(async (result) => {
    if (result.isConfirmed) {
      const response = await callApi();
      Swal.fire({
        title: response?.payload?.message,
        text: text,
        icon: icon2,
      });
      dispatch(reducer(response?.payload?.data?.jobClosedData));
      dispatch(reducer2(response?.payload?.data?.updateJobPaymentData));
      dispatch(reducer3(response?.payload?.data?.updateJobData));
    }
  });
};

export const RejectJobQSweetAlert = ({
  title,
  icon1,
  title2,
  text,
  icon2,
  callApi,
  navigatefun,
}) => {
  return Swal.fire({
    title: title,
    icon: icon1,
    showCancelButton: true,
    confirmButtonColor: '#5D87FF',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes',
  }).then(async (result) => {
    if (result.isConfirmed) {
      const response = await callApi();
      if (response.type.includes('fulfilled')) {
        Swal.fire({
          title: title2,
          text: text,
          icon: icon2,
        });
        setTimeout(() => {
          window.close();
        }, 2000);
      } else {
        Swal.fire({
          title: response?.payload?.data?.title,
          text: response?.payload?.data?.message,
          icon: 'error',
        });
        setTimeout(() => {
          window.close();
        }, 3000);
      }
    } else {
      navigatefun(-1);
      setTimeout(() => {
        window.close();
      }, 2000);
    }
  });
};

export const SweetAlertModalForNavigate = ({ title, icon1, setState, data }) => {
  return Swal.fire({
    title: title,
    icon: icon1,
    showCancelButton: true,
    confirmButtonColor: '#5D87FF',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes',
  }).then((result) => {
    if (result.isConfirmed) {
      setState(data);
    }
  });
};

export const chartStatusData = {
  Measurement: 'M',
  // 'Completed Measurement': 'CM',
  Quotation: 'Q',
  // 'Quotation Approved': 'QA',
  'Quotation Rejected': 'QR',
  'Add Invoice': 'P',
  Drawing: 'D',
  // 'Drawing Approved': 'DA',
  Fabrication: 'F',
  'Check Measure': 'CM',
  // 'Fabrication Approved': 'FA',
  'Powder Coating': 'PC',
  // 'Powder Coating Approved': 'PCA',
  // Transportation: 'T',
  Installation: 'I',
  // 'Installation Done': 'ID',
  'Due Payment': 'DP',
  Close: 'C',
  'On Going': 'On Going',
  Closed: 'Closed',
};

export const docSpecialityData = {
  PH: 'Physiotherapist',
  NE: 'Neurologist',
};

export const statusNavigateData = {
  M: '/measurement',
  // CM: '/completedmeasurement',
  Q: '/quotation',
  // QA: '/quotapproved',
  QR: '/rejectbycustquot',
  P: '/paymentdone',
  D: '/drawing',
  // DA: '/drawingapproved',
  F: '/fabrication',
  CM: '/checkmeasure',
  // FA: '/fabapproved',
  PC: '/powdercoating',
  // PCA: '/powdercoatingapproved',
  // T: '/transportation',
  I: '/installation',
  // ID: '/installationdone',
  DP: '/duepayment',
  C: '/closed',
};

// export const manageReducer = (dispatch, type, rejectedJobData) => {
//   const actions = {
//     M: addjobInMeasurement,
//     // CM: addjobInCompletedJob,
//     Q: addjobInQuotation,
//     // QA: addjobInQA,
//     P: addjobInPayment,
//     D: addjobInDrawing,
//     // DA: addjobInDrawApproved,
//     F: addjobInFabrication,
//     CM: addjobInCheckMeasure,
//     // FA: addjobInFabApproved,
//     PC: addjobInPowderCoating,
//     // PCA: addjobInPowderCoatApproved,
//     // T: addjobInTransportation,
//     I: addjobInInstallation,
//     // ID: addjobInInstallationDone,
//     DP: addjobInDuePayment,
//   };

//   const action = actions[type];
//   if (action) {
//     return dispatch(action(rejectedJobData));
//   } else {
//     // Handle default case if needed
//     toast.warning('from manageReducer --- Add reducer in further slice');
//   }
// };

// export const filterStatusData = (from, to) => {
//   const statusData = {
//     M: 'Measurement',
//     // CM: 'Completed Measurement',
//     Q: 'Quotation',
//     // QA: 'Quot. Approved',
//     P: 'Add Invoice',
//     D: 'Drawing',
//     // DA: 'Drawing Approved',
//     F: 'Fabrication',
//     CM: 'Check Measure',
//     // FA: 'Fab. Approved',
//     PC: 'Powder Coating',
//     // PCA: 'Powder Coating Approved',
//     // T: 'Transportation',
//     I: 'Installation',
//     // ID: 'Installation Done',
//     DP: 'Due Payment',
//     C: 'Closed',
//   };

//   const dataArray = [];
//   let addEntry = false;

//   for (const key in statusData) {
//     if (addEntry) {
//       dataArray.push({ value: key, label: statusData[key] });
//     }
//     if (key === to) {
//       // dataArray.push({ [key]: statusData[key] });
//       addEntry = true;
//     }
//     if (key === from) {
//       break;
//     }
//   }
//   return dataArray;
// };

// export const formatDate = (inputDate) => {
//   // Step 1: Split the input date string into date and time and period (AM/PM) parts

//   const [datePart, timePart, period] = inputDate.split(' ');

//   // Step 2: Extract the day, month, and year from the date part
//   const [day, month, year] = datePart.split('-').map(Number);

//   // Step 3: Extract the hour, minute, and from the time part
//   let [hour, minute] = timePart.split(':');

//   // Convert hour and minute to numbers
//   hour = Number(hour);
//   minute = Number(minute);

//   // Step 4: Convert 12-hour format to 24-hour format
//   if (period === 'PM' && hour < 12) {
//     hour += 12;
//   } else if (period === 'AM' && hour === 12) {
//     hour = 0;
//   }

//   return { year: year, month: month - 1, day, hour, minute };
// };

export const DateDifferenceChecker = (givenDate) => {
  if (givenDate) {
    const currentDate = moment();
    // Calculate the difference in days
    const differenceInDays = currentDate.diff(moment(givenDate, 'YYYY-MM-DD'), 'days');
    // console.log(differenceInDays);
    // Check if the difference is more than 30 days
    const isMoreThan30Days = differenceInDays >= 30;
    return isMoreThan30Days;
  } else {
    return false;
  }
  // Current date
};

export const getFileInfoFromBase64 = (base64) => {
  const mimeTypeMatch = base64.match(/^data:(.*?);base64,/);
  if (!mimeTypeMatch) return { mimeType: null, fileName: null };

  const mimeType = mimeTypeMatch[1];

  const fileName = `${mimeType.replace('/', '.')}`;

  return { mimeType, fileName };
};

export const capitalizeFirstLetterOfEachWord = (str) => {
  return str
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// export const backendPath = 'https://simplycare-backend.onrender.com';
export const backendPath = 'http://localhost:5000';

export const dateFormate = (date) => {
  const formatedDate = moment(date).format('DD MMM,YYYY');
  return formatedDate;
};

export const startendDateFormate = (date) => {
  const formatedDate = moment(date).format('MMMM Do YYYY, h:mm a');
  return formatedDate;
};



export const msgDateFormate = (date) => {
  const formatedDate = moment(date).format('MMMM Do YYYY');
  return formatedDate;
};

export const msgDateTimeFormate = (date) => {
  const formatedDate = moment(date).format('h:mm A');
  return formatedDate;
};

export const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    // console.log(token)
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000; // current time in seconds
    return decodedToken.exp < currentTime;
  } catch (error) {
    console.error('Invalid token:', error);
    return true;
  }
};

export const showMsgTime = (date) => {
  const currentTime = new Date();
  const messageTime = new Date(date);
  // console.log(currentTime)
  // console.log(messageTime)
  const timeDifference = currentTime - messageTime;

  // Convert milliseconds to hours
  const hoursDifference = timeDifference / (1000 * 60 * 60);
  // console.log(hoursDifference)
  return hoursDifference;
};
