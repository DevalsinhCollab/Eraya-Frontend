import React from 'react';
import { styled } from '@mui/material/styles';
import { Select, MenuItem } from '@mui/material';

const CustomSelect = styled((props) => <Select {...props} />)(({ theme }) => ({
  '& .MuiSelect-select.MuiSelect-select': {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  '& .MuiOutlinedInput-input': {
    padding: theme.spacing(1),
  },
  '& .Mui-disabled .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.grey[200],
  },
}));

export default function CustomSelectField({
  value,
  name,
  onChange,
  menuArr,
  id,
  disabled,
  defultOpt,
}) {
  return (
    <>
      <CustomSelect
        displayEmpty
        id={id}
        value={value}
        name={name}
        onChange={onChange}
        disabled={disabled}
        fullWidth
        variant="outlined"
      >
        {defultOpt}
        {menuArr.map((item, index) => (
          <MenuItem key={index} value={item.value || item}>
            {item.label || item}
          </MenuItem>
        ))}
      </CustomSelect>
    </>
  );
}
