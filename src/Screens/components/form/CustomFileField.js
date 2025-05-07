import React from 'react';
import { styled } from '@mui/material/styles';

const CustomFileField = styled('input')(({ theme }) => ({
  outline: `1px solid ${theme.palette.grey['border']}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1.5),
  '&::-webkit-input-placeholder': {
    color: theme.palette.text.secondary,
    opacity: '0.8',
  },
  '&:disabled::-webkit-input-placeholder': {
    color: theme.palette.text.secondary,
    opacity: '1',
  },
  '&:disabled': {
    borderColor: theme.palette.grey[200],
  },
  '&:focus': {
    outline: `2px solid ${theme.palette.primary.main}`,
  },
}));

export default CustomFileField;
