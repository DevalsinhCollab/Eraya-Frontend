import { Autocomplete, CircularProgress, TextField } from "@mui/material"
import React, { useEffect, useMemo, useState } from "react";
import _ from "lodash";
import { searchDoctors } from "../../apis/doctorSlice";
import { useDispatch } from "react-redux";

const SearchDoctor = ({ open, setData, data }) => {
    const dispatch = useDispatch();

    const [docOptions, setDocOptions] = useState([]);
    const [docInputValue, setDocInputValue] = useState("");
    const [loading, setLoading] = useState(false);

    const doctorFetchOptions = useMemo(
        () =>
            _.debounce(async (query) => {
                setLoading(true);
                try {
                    const response = await dispatch(
                        searchDoctors({ search: query })
                    );

                    setDocOptions(
                        response &&
                        response.payload &&
                        response.payload.data.map((item) => ({
                            label: item.name,
                            value: item._id,
                            name: item.name,
                            _id: item._id,
                        }))
                    );
                } catch (error) {
                    console.error("Error fetching data:", error);
                } finally {
                    setLoading(false);
                }
            }, 1000),
        []
    );

    useEffect(() => {
        if (open) {
            doctorFetchOptions(docInputValue);
        }
    }, [open, docInputValue]);

    const handleChange = (e, newValue) => {
        setData((prev) => ({ ...prev, doctor: newValue }));
    }

    return (
        <Autocomplete
            options={docOptions}
            getOptionLabel={(option) => option.label}
            value={data && data.doctor}
            loading={loading}
            name="doctor"
            onChange={(e, newValue) => {
                handleChange(e, newValue);
            }}
            onInputChange={(event, newInputValue) => {
                setDocInputValue(newInputValue);
            }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Select Doctors"
                    variant="outlined"
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <>
                                {loading ? (
                                    <CircularProgress color="inherit" size={20} />
                                ) : null}
                                {params.InputProps.endAdornment}
                            </>
                        ),
                    }}
                />
            )}
        />
    )
}

export default SearchDoctor