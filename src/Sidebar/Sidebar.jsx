import SidebarStyle from './Sidebar.module.scss';
import Logo from '../Img/logo.png';
import { useSelector } from 'react-redux';
// import DashboardIcon from '../Img/dashboard-icon.png';
import PatientPrbIcon from '../Img/patient-problem-icon.png';
import PatientFormIcon from '../Img/appointment-icon.png';
import Zoom from '@mui/material/Zoom';
import { useLocation, useNavigate } from 'react-router';
import BootstrapTooltip from '../Screens/components/form/BootstrapTooltip';
import DashPatientIcon from '../Img/dashPatient-icon.png';
import DashAppointmentIcon from '../Img/dashAppt-icon.png';
import DocSpeciality from '../Img/docSpeciality.png';
import ExpenseIcon from '../Img/expense-icon.png';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import PeopleIcon from '@mui/icons-material/People';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import PaidIcon from '@mui/icons-material/Paid';
import ElderlyIcon from '@mui/icons-material/Elderly';
import React from 'react';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;
  const { loggedIn } = useSelector((state) => state.authData);
  const MenuItems = [
    {
      id: 1,
      title: 'Dashboard',
      icon: <DashboardIcon />,
      href: '/dashboard',
      role: ['A', 'D'],
    },
    {
      id: 7,
      title: 'Calendar',
      icon: <CalendarMonthIcon />,
      href: '/calenderPage',
      role: ['A', 'D'],
    },
    {
      id: 9,
      title: 'Doctor Availability',
      icon: <AccessTimeIcon />,
      href: '/docAvailability',
      role: ['D'],
    },
    {
      id: 2,
      title: 'Doctor Specialities',
      icon: <LocalHospitalIcon />,
      href: '/docSpecialities',
      role: ['A'],
    },
    {
      id: 3,
      title: 'Doctor',
      icon: <PeopleAltIcon />,
      href: '/doctors',
      role: ['A'],
    },
    {
      id: 4,
      title: 'Patients',
      icon: <ElderlyIcon />,
      href: '/patients',
      role: ['A', 'D'],
      size: 40,
    },

    {
      id: 6,
      title: 'Appointment',
      icon: <EventAvailableIcon />,
      href: '/appointment',
      role: ['A', 'D'],
    },
    {
      id: 8,
      title: 'Expense',
      icon: <PaidIcon />,
      href: '/expensePage',
      role: ['A', 'D'],
    },
  ].filter((item) => {
    if (item.role.some((r) => loggedIn?.role.includes(r))) {
      return true;
    }
    return false;
  });

  return (
    <div className={SidebarStyle.sideMainBox}>
      <div className={SidebarStyle.logoBox}>
        <img src={Logo} alt="Logo" height="100%" />
      </div>
      <div className={SidebarStyle.list}>
        {MenuItems.map((item, index) => {
          return (
            <BootstrapTooltip title={item.title} arrow TransitionComponent={Zoom} key={index}>
              {/* <div
                className={
                  item.href.includes(pathname) ? SidebarStyle.currentlink : SidebarStyle.newlink
                }
                onClick={() => navigate(`${item.href}`)}
              >
                <img src={item?.icon} alt="item.icon" height={'100%'} width={'100%'} />
              </div> */}
              <div
                className={
                  item.href.includes(pathname) ? SidebarStyle.currentlink : SidebarStyle.newlink
                }
                onClick={() => navigate(item.href)}
              >
                {React.cloneElement(item.icon, {
                  style: {
                    color: item.href.includes(pathname) ? '#ffffffff' : '#ffffffff',
                    fontSize: item.size || 30,
                  },
                })}
              </div>
            </BootstrapTooltip>
          );
        })}
      </div>
    </div>
  );
}
