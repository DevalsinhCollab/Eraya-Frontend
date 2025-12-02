import SidebarStyle from './Sidebar.module.scss';
import Logo from '../Img/logo.png';
import { useSelector } from 'react-redux';
import DashboardIcon from '../Img/dashboard-icon.png';
import PatientPrbIcon from '../Img/patient-problem-icon.png';
import PatientFormIcon from '../Img/appointment-icon.png';
import Zoom from '@mui/material/Zoom';
import { useLocation, useNavigate } from 'react-router';
import BootstrapTooltip from '../Screens/components/form/BootstrapTooltip';
import DashPatientIcon from '../Img/dashPatient-icon.png';
import DashAppointmentIcon from "../Img/dashAppt-icon.png"
import DocSpeciality from "../Img/docSpeciality.png"




export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;
  const { loggedIn } = useSelector((state) => state.authData);
  const MenuItems = [
    {
      id: 1,
      title: 'Dashboard',
      icon: DashboardIcon,
      href: '/dashboard',
      role: ['A', 'D'],
    },
    {
      id: 2,
      title: 'Doctor Specialities',
      icon: DocSpeciality,
      href: '/docSpecialities',
      role: ['A'],
    },
    {
      id: 3,
      title: 'Doctor',
      icon: PatientPrbIcon,
      href: '/doctors',
      role: ['A'],
    },
    {
      id: 4,
      title: 'Patients',
      icon: DashPatientIcon,
      href: '/patients',
      role: ['A', 'D'],
    },
    // {
    //   id: 5,
    //   title: 'Patient Form',
    //   icon: PatientFormIcon,
    //   href: '/form',
    //   role: ['A', 'D'],
    // },
    {
      id: 7,
      title: 'Calender',
      icon: PatientFormIcon,
      href: '/calenderPage',
      role: ['A', 'D'],
    },

    {
      id: 6,
      title: 'Appointment',
      icon: DashAppointmentIcon,
      href: '/appointment',
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
              <div
                className={
                  item.href.includes(pathname) ? SidebarStyle.currentlink : SidebarStyle.newlink
                }
                onClick={() => navigate(`${item.href}`)}
              >
                <img src={item?.icon} alt="item.icon" height={'100%'} width={'100%'} />
              </div>
            </BootstrapTooltip>
          );
        })}
      </div>
    </div>
  );
}
