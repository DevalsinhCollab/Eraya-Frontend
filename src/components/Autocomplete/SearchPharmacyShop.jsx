import { Autocomplete, CircularProgress, TextField } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import _ from "lodash";
import { getPharmacyShops } from "../../apis/pharmacyShopSlice";
import { useDispatch } from "react-redux";

const SearchPharmacyShop = ({ open, setData, data, variant, label, name, size, disabled }) => {
  const dispatch = useDispatch();

  const [options, setOptions] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchOptions = useMemo(
    () =>
      _.debounce(async (query) => {
        setLoading(true);
        try {
          const response = await dispatch(getPharmacyShops({ search: query }));
          setOptions(
            response?.payload?.data?.map((item) => ({
              label: item.name || item.shopName || "",
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
    if (open) fetchOptions(inputValue);
  }, [open, inputValue]);

  const handleChange = (e, newValue) => {
    // Support parent setState signature used in other dialogs
    if (typeof setData === "function") {
      setData((prev) => ({ ...(prev || {}), [name]: newValue ? newValue.value || newValue._id || newValue : null }));
    }
  };

  return (
    <Autocomplete
      options={options}
      getOptionLabel={(option) => option.label || ""}
      value={
        (data && (typeof data[name] === "string" ? options.find((o) => o.value === data[name]) : data[name])) || null
      }
      loading={loading}
      size={size || "medium"}
      onChange={handleChange}
      disabled={disabled}
      onInputChange={(event, newInputValue) => setInputValue(newInputValue)}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label || "Select Pharmacy"}
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

export default SearchPharmacyShop;
