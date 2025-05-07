import { Autocomplete, CircularProgress, TextField } from "@mui/material"
import React, { useEffect, useMemo, useState } from "react";
import _, { add } from "lodash";
import { useDispatch } from "react-redux";
import { searchPatients } from "../../apis/patientSlice";

const SearchPatient = ({ open, setData, data }) => {
    const dispatch = useDispatch();

    const [patientOptions, setPatientOptions] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [loading, setLoading] = useState(false);

    const patientFetchOptions = useMemo(
        () =>
            _.debounce(async (query) => {
                setLoading(true);
                try {
                    const response = await dispatch(
                        searchPatients({ search: query })
                    );

                    setPatientOptions(
                        response &&
                        response.payload &&
                        response.payload.data.map((item) => ({
                            label: item.name,
                            value: item._id,
                            _id: item._id,
                            name: item.name,
                            email: item.email,
                            phone: item.phone,
                            address: item.address,
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
            patientFetchOptions(inputValue);
        }
    }, [open, inputValue]);

    const handleChange = (e, newValue) => {
        setData((prev) => ({ ...prev, patient: newValue }));
    }

    return (
        <Autocomplete
            options={patientOptions}
            getOptionLabel={(option) => option.label}
            value={data && data.patient}
            loading={loading}
            name="patient"
            onChange={(e, newValue) => {
                handleChange(e, newValue);
            }}
            onInputChange={(event, newInputValue) => {
                setInputValue(newInputValue);
            }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Select Patients"
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

export default SearchPatient