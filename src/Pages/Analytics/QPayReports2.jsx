import { useState, useEffect } from "react";
import api from "../../API";
import { Card, FormControlLabel, Switch, Tab, Box, Checkbox, TextField, Autocomplete } from "@mui/material";
import { CheckBoxOutlineBlank, CheckBox } from '@mui/icons-material'
import QPayListComp from "./QPayComps/qpayList";
import { TabPanel, TabList, TabContext } from '@mui/lab';
import QPaySalesBasedComp from "./QPayComps/salesBased";
import QPayBasedComp from "./QPayComps/qPayBased";
import FilterableTable from "../../Components/filterableTable";
import QPayColumnVisiblitySettings from "./QPayComps/settings";

const icon = <CheckBoxOutlineBlank fontSize="small" />;
const checkedIcon = <CheckBox fontSize="small" />;


const QPayReports = () => {
    const [repData, setRepData] = useState([]);
    const [showData, setShowData] = useState([]);
    const tabList = ['LIST', 'Q-PAY BASED', 'SALES VALUE BASED'];
    const filterInitialValue = {
        zeros: false,
        company: 2,
        consolidate: 1,
        view: 'LIST',
    }
    const [cusFilter, setCusFilter] = useState(filterInitialValue);
    const [column, setColumns] = useState([]);

    const columns = Object.keys(showData[0] || {});
    const [filters, setFilters] = useState({});
    const [filteredData, setFilteredData] = useState(showData);

    useEffect(() => {
        setRepData([])
        fetch(`${api}TallyReports/qPay?Company_Id=${cusFilter?.company}&Consolidate=${cusFilter?.consolidate}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setRepData(data.data)
                }
            })
            .catch(e => console.error(e))
    }, [cusFilter?.company, cusFilter?.consolidate])

    useEffect(() => {
        const temp = [...repData];
        const zerosIncluded = !cusFilter.zeros ? temp.filter(o => o?.Q_Pay_Days) : repData;

        setShowData(zerosIncluded);
    }, [repData, cusFilter.zeros, cusFilter.consolidate, cusFilter.company]);

    useEffect(() => {
        applyFilters();
    }, [filters, showData]);

    useEffect(() => {
        fetch(`${api}TallyReports/qpay/columnVisiblity?CompanyId=${cusFilter.company}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    data?.data?.sort((a, b) => a?.Field_Name?.localeCompare(b?.Field_Name) );
                    setColumns(data.data)
                }
            })
            .catch(e => console.error(e))
    }, [cusFilter.company])

    const dispTab = (val) => {
        switch (val) {
            case 'LIST': return <QPayListComp dataArray={filteredData} />
            case 'Q-PAY BASED': return <QPayBasedComp dataArray={filteredData} />
            case 'SALES VALUE BASED': return <QPaySalesBasedComp dataArray={filteredData} />
            // case 'test': return <FilterableTable dataArray={filteredData} />
            default: <></>
        }
    }

    const handleFilterChange = (column, value) => {
        setFilters(prevFilters => ({
            ...prevFilters,
            [column]: value,
        }));
    };

    const applyFilters = () => {
        let filtered = [...showData];
        for (const column of columns) {
            if (filters[column]) {
                if (filters[column].type === 'range') {
                    const { min, max } = filters[column];
                    filtered = filtered.filter(item => {
                        const value = item[column];
                        return (min === undefined || value >= min) && (max === undefined || value <= max);
                    });
                } else if (filters[column].type === 'date') {
                    const { start, end } = filters[column].value;
                    filtered = filtered.filter(item => {
                        const dateValue = new Date(item[column]);
                        return (start === undefined || dateValue >= new Date(start)) && (end === undefined || dateValue <= new Date(end));
                    });
                } else if (Array.isArray(filters[column])) {
                    filtered = filters[column]?.length > 0 ? filtered.filter(item => filters[column].includes(item[column].toLowerCase().trim())) : filtered
                }
            }
        }
        setFilteredData(filtered);
    };

    const renderFilter = (column) => {
        const sampleValue = showData[0][column];
        if (typeof sampleValue === 'number') {
            return (
                <div className='d-flex justify-content-between px-2'>
                    <input
                        placeholder="Min"
                        type="number"
                        className="bg-light border-0 m-1 p-1 w-50"
                        value={filters[column]?.min ? filters[column]?.min : ''}
                        onChange={(e) => handleFilterChange(column, { type: 'range', ...filters[column], min: e.target.value ? parseFloat(e.target.value) : undefined })}
                    />
                    <input
                        placeholder="Max"
                        type="number"
                        className="bg-light border-0 m-1 p-1 w-50"
                        value={filters[column]?.max ? filters[column]?.max : ''}
                        onChange={(e) => handleFilterChange(column, { type: 'range', ...filters[column], max: e.target.value ? parseFloat(e.target.value) : undefined })}
                    />
                </div>
            );
        } else if (typeof sampleValue === 'string' && !isNaN(Date.parse(sampleValue))) {
            return (
                <div className='d-flex justify-content-between px-2'>
                    <input
                        placeholder="Start Date"
                        type="date"
                        className="bg-light border-0 m-1 p-1 w-50"
                        onChange={(e) => handleFilterChange(column, { type: 'date', value: { ...filters[column]?.value, start: e.target.value || undefined } })}
                        value={filters[column]?.value?.start ? filters[column]?.value?.start : ''}
                    />
                    <input
                        placeholder="End Date"
                        type="date"
                        className="bg-light border-0 m-1 p-1 w-50"
                        onChange={(e) => handleFilterChange(column, { type: 'date', value: { ...filters[column]?.value, end: e.target.value || undefined } })}
                        value={filters[column]?.value?.end ? filters[column]?.value?.end : ''}
                    />
                </div>
            );
        } else if (typeof sampleValue === 'string') {
            const distinctValues = [...new Set(showData.map(item => item[column].toLowerCase().trim()))];
            return (
                <Autocomplete
                    multiple
                    id={`${column}-filter`}
                    options={distinctValues}
                    disableCloseOnSelect
                    getOptionLabel={option => option}
                    value={filters[column] || []}
                    onChange={(event, newValue) => handleFilterChange(column, newValue)}
                    renderOption={(props, option, { selected }) => (
                        <li {...props}>
                            <Checkbox
                                icon={icon}
                                checkedIcon={checkedIcon}
                                style={{ marginRight: 8 }}
                                checked={selected}
                            />
                            {option}
                        </li>
                    )}
                    isOptionEqualToValue={(opt, val) => opt === val}
                    renderInput={(params) => (
                        <TextField {...params} label={column} placeholder={`Select ${column}`} />
                    )}
                />
            );
        }
    };

    return (
        <>
            <Card>

                <div className="d-flex flex-wrap justify-content-between p-2">
                    <span>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={!cusFilter.zeros}
                                    onChange={e => setCusFilter(pre => ({ ...pre, zeros: !(e.target.checked) }))}
                                />
                            }
                            label="Remove Zeros"
                            labelPlacement="start"
                            className=" fw-bold text-primary"
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={cusFilter.consolidate === 1 ? true : false}
                                    onChange={e => setCusFilter(pre => ({ ...pre, consolidate: e.target.checked ? 1 : 0 }))}
                                />
                            }
                            label="Consolidate"
                            labelPlacement="start"
                            className=" fw-bold text-primary"
                        />
                    </span>

                    <span>
                        <QPayColumnVisiblitySettings CompanyId={2} />
                    </span>
                </div>

                <div className="row flex-md-row-reverse">

                    <div className="col-lg-3 col-md-4 ">
                        <h5>Filters</h5>
                        <div className="border rounded-3 " style={{ maxHeight: '70vh', overflow: 'auto' }}>
                            {columns.map(column => (
                                <div key={column} className="py-3 px-3 hov-bg border-bottom">
                                    <label className='mt-2 mb-1'>{column.replace('_', ' ')}</label>
                                    {renderFilter(column)}
                                </div>
                            ))}
                            <br />
                        </div>
                    </div>

                    <div className="col-lg-9 col-md-8">
                        <div className="p-2">
                            <TabContext value={cusFilter.view}>
                                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                    <TabList
                                        indicatorColor='transparant'
                                        onChange={(e, n) => setCusFilter(pre => ({ ...pre, view: n }))}
                                        variant="scrollable"
                                        scrollButtons="auto"
                                        allowScrollButtonsMobile
                                    >
                                        {tabList.map(o => (
                                            <Tab sx={cusFilter.view === o ? { backgroundColor: '#c6d7eb' } : {}} label={o} value={o} key={o} />
                                        ))}
                                    </TabList>
                                </Box>
                                {tabList.map(o => (
                                    <TabPanel value={o} sx={{ px: 0, py: 2 }} key={o}>
                                        {dispTab(cusFilter.view)}
                                    </TabPanel>
                                ))}
                            </TabContext>
                        </div>
                    </div>


                </div>

            </Card>
        </>
    )
}

export default QPayReports