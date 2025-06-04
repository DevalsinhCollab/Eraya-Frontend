import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Badge from '@mui/material/Badge';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import AccountCircle from '@mui/icons-material/AccountCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MoreIcon from '@mui/icons-material/MoreVert';
import SearchIconImg from '../Img/search icon.png';
import { Avatar, ListItemText } from '@mui/material';
import userImg from '../Img/user.png';
import bellIconImg from '../Img/bell-icon.png';
import logoutIconImg from '../Img/logout-icon.png';
import { useDispatch, useSelector } from 'react-redux';
import { docSpecialityData, removeAuthToken } from '../common/common';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { getUnreadMsgs, getUnreadMsgsCount, markAsReadMsg } from '../apis/notificationSlice';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: '1rem',
  backgroundColor: '#fff',
  '&:hover': {
    backgroundColor: '#fff',
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    // marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // background: '#fff',
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '40ch',
    },
  },
}));

export default function Header({ setSearch }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);

  const [isChecked, setIsChecked] = useState(null);
  const [notiAnchorEl, setNotiAnchorEl] = useState(null);
  const open = Boolean(notiAnchorEl);
  const handleClick = (event) => {
    setNotiAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setNotiAnchorEl(null);
  };

  const { loggedIn } = useSelector((state) => state.authData);
  const { notifications, notifLoading, unreadMsgCount } = useSelector(
    (state) => state.notificationData,
  );

  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };

  const handleLogout = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
    removeAuthToken();
    navigate('/login');
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const menuId = 'primary-search-account-menu';
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      id={menuId}
      open={isMenuOpen}
      onClose={handleMenuClose}
      sx={{ marginTop: 2 }}
      MenuListProps={{
        sx: {
          borderRadius: '.2rem',
          border: '2px solid #2D307E',
        },
      }}
    >
      <MenuItem
        sx={{
          padding: '0rem 2rem',
          color: '#2D307E',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '.6rem',
          borderRadius: '2rem',
        }}
        onClick={handleLogout}
      >
        <img src={logoutIconImg} alt="logoutIconImg" />
        <div>Log Out</div>
      </MenuItem>
    </Menu>
  );

  const mobileMenuId = 'primary-search-account-menu-mobile';
  const renderMobileMenu = (
    <Menu
      sx={{ padding: '0px' }}
      anchorEl={mobileMoreAnchorEl}
      id={mobileMenuId}
      keepMounted
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      <MenuItem>
        <IconButton size="large" aria-label="show 17 new notifications" color="inherit">
          <Badge badgeContent={unreadMsgCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <p>Notifications</p>
      </MenuItem>
      <MenuItem onClick={handleProfileMenuOpen}>
        <IconButton
          size="large"
          aria-label="account of current user"
          aria-controls="primary-search-account-menu"
          aria-haspopup="true"
          color="inherit"
        >
          <AccountCircle />
        </IconButton>
        <p>Profile</p>
      </MenuItem>
    </Menu>
  );

  const handelMarkAsRead = async (id) => {
    setIsChecked(id);
    setTimeout(() => {
      dispatch(markAsReadMsg(id));
    }, 500);
  };

  useEffect(() => {
    if (loggedIn && notiAnchorEl) {
      dispatch(getUnreadMsgs(loggedIn?._id));
    }
  }, [notiAnchorEl]);

  return (
    <Box sx={{ flexGrow: 1, paddingBottom: '1rem' }}>
      <Box sx={{ backgroundColor: 'transparent' }}>
        <Toolbar sx={{ padding: '0px !important' }}>
          <Search>
            <SearchIconWrapper>
              <img src={SearchIconImg} alt="SearchIconImg" height={'20px'} />
            </SearchIconWrapper>
            <StyledInputBase placeholder="Search…" inputProps={{ 'aria-label': 'search' }} onChange={(e) => setSearch(e.target.value)} />
          </Search>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: '.5rem' }}>
            <Badge badgeContent={unreadMsgCount} color="error">
              <IconButton
                sx={{
                  backgroundColor: '#fff',
                  padding: '.7rem .9rem',
                  boxShadow: '0px 0px 4.46px 0px #2D307E40',
                }}
                size="large"
                aria-label="show 17 new notifications"
                color="inherit"
                id="basic-button"
                aria-controls={open ? 'basic-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
              >
                {/* <NotificationsIcon /> */}
                <img src={bellIconImg} alt="bellIconImg" height={'25px'} />
              </IconButton>
            </Badge>
            <Menu
              id="basic-menu"
              anchorEl={notiAnchorEl}
              open={open}
              onClose={handleClose}
              MenuListProps={{
                'aria-labelledby': 'basic-button',
              }}
              sx={{ marginTop: '1.4rem' }}
            >
              {notifLoading ? (
                <div style={{ padding: '15px' }}>Please Wait......</div>
              ) : notifications && notifications?.length > 0 ? (
                notifications.map((item) => (
                  <MenuItem key={item._id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <div>
                      <input
                        type="checkbox"
                        name="notif"
                        id="msg-notif"
                        style={{ transform: 'scale(1.2)' }}
                        onClick={() => {
                          handelMarkAsRead(item._id);
                        }}
                        checked={isChecked === item._id}
                        onChange={(e) => {
                          // setIsChecked(e.target.checked ? item._id : null);
                        }}
                      />
                    </div>
                    <ListItemText
                      primary={item.senderName}
                      secondary={
                        <span
                          style={{
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#2d307e',
                          }}
                        >
                          {item.message}
                        </span>
                      }
                    />
                  </MenuItem>
                ))
              ) : (
                <div style={{ padding: '15px' }}>No Notifications</div>
              )}
            </Menu>
            <div
              style={{
                backgroundColor: '#fff',
                display: 'flex',
                // flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '5rem',
                position: 'relative',
                left: '40px',
                boxShadow: '0px 0px 4.46px 0px #2D307E40',
              }}
            >
              <div
                style={{
                  // backgroundColor: '#fff',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'start',
                  justifyContent: 'center',
                  padding: '.5rem 2.2rem .5rem 1rem',
                  // width: '200px',
                }}
              >
                <h3>{loggedIn?.name}</h3>
                <span style={{ fontSize: '14px' }}>
                  {loggedIn?.role === 'D' ? docSpecialityData[loggedIn?.docSpeciality] : 'User'}
                </span>
              </div>
            </div>
            <IconButton
              sx={{ padding: 0, outline: '1px solid #2D307E' }}
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls={menuId}
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <Avatar alt="Remy Sharp" src={userImg} sx={{ height: '60px', width: '60px' }} />
            </IconButton>
          </Box>
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="show more"
              aria-controls={mobileMenuId}
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              color="inherit"
            >
              <MoreIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </Box>
      {renderMobileMenu}
      {renderMenu}
    </Box>
  );
}
