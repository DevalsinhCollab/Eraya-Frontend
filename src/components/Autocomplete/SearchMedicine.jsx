import React, { useEffect, useMemo, useState } from "react";
import { Autocomplete, CircularProgress, TextField } from "@mui/material";
import _ from "lodash";
import { useDispatch } from "react-redux";
import { getMedicines } from "../../apis/medicineSlice";

const SearchMedicine = ({
  open,
  value,
  onChange,
  variant,
  label,
  name,
  size,
}) => {
  const dispatch = useDispatch();

  const [options, setOptions] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔁 Debounced fetch using Redux thunk
  const fetchOptions = useMemo(
    () =>
      _.debounce(async (q) => {
        setLoading(true);
        try {
          const res = await dispatch(
            getMedicines({ search: q })
          ).unwrap();

          const data = res?.data || [];
          setOptions(
            data.map((d) => ({
              label: d.name,
              value: d._id,
              ...d,
            }))
          );
        } catch (err) {
          console.error("Medicine fetch error:", err);
        } finally {
          setLoading(false);
        }
      }, 500),
    [dispatch]
  );

  useEffect(() => {
    if (open || inputValue) {
      fetchOptions(inputValue);
    }

    return () => fetchOptions.cancel(); // 🧹 cleanup debounce
  }, [open, inputValue, fetchOptions]);

  const selected = options.find((o) => o.value === value) || null;

  return (
    <Autocomplete
      options={options}
      fullWidth
      getOptionLabel={(option) => option.label || ""}
      value={selected}
      loading={loading}
      size={size || "small"}
      onChange={(e, newValue) => {
        onChange?.(newValue || null);
      }}
      onInputChange={(e, newInput) => setInputValue(newInput)}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label || "Select Medicine"}
          variant={variant || "outlined"}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading && (
                  <CircularProgress color="inherit" size={20} />
                )}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
};

export default SearchMedicine;
