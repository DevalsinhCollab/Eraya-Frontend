import { Autocomplete, CircularProgress, TextField } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import _ from "lodash";
import { getClinics } from "../../apis/clinicSlice";
import { useDispatch } from "react-redux";

const SearchClinic = ({ open, setData, data, variant, label, name, size }) => {
  const dispatch = useDispatch();

  const [options, setOptions] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchOptions = useMemo(
    () =>
      _.debounce(async (query) => {
        setLoading(true);
        try {
          const response = await dispatch(getClinics({ search: query }));
          setOptions(
            response?.payload?.data?.map((item) => ({
              label: item.name,
              value: item._id,
              ...item,
            })) || [],
          );
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      }, 600),
    [dispatch],
  );

  useEffect(() => {
    if (open) {
      fetchOptions(inputValue);
    }
  }, [open, inputValue]);

  const handleChange = (e, newValue) => {
    // set the raw id/object into parent form
    setData((prev) => ({ ...prev, [name]: newValue ? newValue.value || newValue._id || newValue : null }));
  };

  return (
    <Autocomplete
      options={options}
      getOptionLabel={(option) => option.label || ""}
      value={
        (data && (typeof data[name] === 'string' ? options.find((o) => o.value === data[name]) : data[name])) || null
      }
      loading={loading}
      size={size || "medium"}
      onChange={handleChange}
      onInputChange={(event, newInputValue) => setInputValue(newInputValue)}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label || "Select Clinic"}
          variant={variant}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading && <CircularProgress color="inherit" size={20} />}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
};

export default SearchClinic;
