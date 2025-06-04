import { Autocomplete, CircularProgress, TextField } from "@mui/material"
import React, { useEffect, useMemo, useState } from "react";
import _ from "lodash";
import { searchDoctors } from "../../apis/doctorSlice";
import { useDispatch } from "react-redux";

const SearchDoctor = ({ open, setData, data, variant, label, name }) => {
    const dispatch = useDispatch();

    const [docOptions, setDocOptions] = useState([]);
    const [docInputValue, setDocInputValue] = useState("");
    const [loading, setLoading] = useState(false);

    const doctorFetchOptions = useMemo(
        () =>
            _.debounce(async (query) => {
                setLoading(true);
                try {
                    const response = await dispatch(searchDoctors({ search: query }));

                    setDocOptions(
                        response?.payload?.data?.map((item) => ({
                            label: item.name,
                            value: item._id,
                            name: item.name,
                            _id: item._id,
                        })) || []
                    );
                } catch (error) {
                    console.error("Error fetching data:", error);
                } finally {
                    setLoading(false);
                }
            }, 1000),
        [dispatch]
    );

    useEffect(() => {
        if (open) {
            doctorFetchOptions(docInputValue);
        }
    }, [open, docInputValue]);

    const handleChange = (e, newValue) => {
        setData((prev) => ({
            ...prev,
            [name]: newValue || null, // set to null if cleared
        }));
    };

    return (
        <Autocomplete
            options={docOptions}
            getOptionLabel={(option) => option.label || ""}
            value={data?.[name] || data?.doctor || null}
            loading={loading}
            onChange={handleChange}
            onInputChange={(event, newInputValue) => {
                setDocInputValue(newInputValue);
            }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={label || "Select Doctors"}
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


export default SearchDoctor