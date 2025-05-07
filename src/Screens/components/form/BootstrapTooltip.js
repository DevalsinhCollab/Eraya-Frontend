// BootstrapTooltip.js
import React from 'react';
import { Tooltip, tooltipClasses } from '@mui/material';
import { styled } from '@mui/system';

const BootstrapTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} arrow classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.arrow}`]: {
    color: '#000',
  },
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#000',
  },
}));

export default BootstrapTooltip;
