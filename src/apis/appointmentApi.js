import axios from 'axios';
import { ApiHeaderWithToken } from '../common/apisHeaders';

const BASE = process.env.REACT_APP_BACKEND_API + '/appointment';

export const getOneAppointment = async (id) => {
  return axios.get(`${BASE}/getAppointmentById/${id}`, ApiHeaderWithToken());
};

// body: { paidByCustomer, paymentMode, status }
export const paymentDoneApi = async (id, body) => {
  // fetch current appointment to compute new total paid
  const res = await getOneAppointment(id);
  const appointment = res.data && res.data.data;
  const total = Number(appointment?.payment || 0);
  const paid = Number(appointment?.paidAmount || 0);
  const paidByCustomer = Number(body.paidByCustomer || 0);

  const newPaidTotal = paid + paidByCustomer;
  const remaining = Math.max(0, total - newPaidTotal);

  // prepare payload expected by backend (paidAmount is absolute new total)
  const payload = {
    _id: id,
    paidAmount: newPaidTotal,
    paymentMode: body.paymentMode || appointment?.paymentMode || 'cash',
  };

  return axios.put(`${BASE}/updateAppointment/${id}`, payload, ApiHeaderWithToken());
};

export default {
  getOneAppointment,
  paymentDoneApi,
};
