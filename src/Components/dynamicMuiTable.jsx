import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { isEqualNumber, LocalDate, NumberFormat } from './functions';
import { useEffect, useState } from 'react';
import api from '../API';
import { Autocomplete, IconButton, Tooltip, TextField, Checkbox } from '@mui/material';
import { CheckBox, CheckBoxOutlineBlank, FilterAltOff } from '@mui/icons-material';

const formatString = (val, dataType) => {
    switch (dataType) {
        case 'number':
            return NumberFormat(val)
        case 'date':
            return LocalDate(val);
        case 'string':
            return val;
        default:
            return ''
    }
}

const getFun = (dataType) => {
    switch (dataType) {
        case 'number':
            return {
                filterVariant: 'range',
                filterFn: 'between',
            }
        case 'date':
            return {
                filterVariant: 'text',
            };
        case 'string':
            // const distinctValues = [];
            // dataArray?.forEach(item => (item[key] && (distinctValues.findIndex(o => o?.value === item[key]?.toLocaleLowerCase()) === -1))
            //     ? distinctValues.push({ label: String(item[key]), value: String(item[key]).toLocaleLowerCase() })
            //     : null
            // )
            return {
                filterVariant: 'text',
            }

        default:
            return {}
    }
}

const aggregations = (Fied_Data, Field_Name) => {
    if (Fied_Data === 'number') {
        return {
            aggregationFn: Field_Name?.includes('mount') ? 'sum' : 'mean',
            AggregatedCell: ({ cell }) => (
                <div className='blue-text text-center float-end w-100'>
                    {NumberFormat(cell.getValue())}
                </div>
            )
        }
    }
}

const icon = <CheckBoxOutlineBlank fontSize="small" />;
const checkedIcon = <CheckBox fontSize="small" />;

const DynamicMuiTable = ({ reportId, company }) => {
    const [dispColmn, setDispColmn] = useState([]);
    const [dataArray, setDataArray] = useState([]);
    const [columns, setColumns] = useState([]);
    const [filters, setFilters] = useState({});
    const [filteredData, setFilteredData] = useState(dataArray);
    const filterCount = Object.keys(filters).length;
    const showData = (filterCount > 0) ? filteredData : dataArray;


    useEffect(() => {
        fetch(`${api}reportTemplate?ReportId=${reportId}`)
            .then(res => res.json())
            .then(data => {
                if (data?.success) {
                    if (data.data[0]) {
                        const o = data.data[0];
                        const strucre = {
                            Report_Type_Id: o?.Report_Type_Id,
                            reportName: o?.Report_Name,
                            tables: o?.tablesList?.map(table => ({
                                Table_Id: table?.Table_Id,
                                Table_Name: table?.Table_Name,
                                AliasName: table?.AliasName,
                                Table_Accronym: table?.Table_Accronym,
                                isChecked: true,
                                columns: table?.columnsList?.map(column => ({
                                    Column_Data_Type: column?.Column_Data_Type,
                                    Column_Name: column?.Column_Name,
                                    IS_Default: column?.IS_Default,
                                    IS_Join_Key: column?.IS_Join_Key,
                                    Order_By: column?.Order_By,
                                    Table_Id: column?.Table_Id,
                                    isVisible: true,
                                    accessColumnName: `${table?.Table_Accronym}.${column?.Column_Name}`
                                }))
                            }))
                        }
                        const allColumns = strucre.tables?.reduce((colArr, table) => {
                            return colArr.concat(table.columns);
                        }, []);
                        console.log(allColumns)
                        setColumns(allColumns);
                    }
                }
            }).catch(e => console.log(e))
    }, [reportId])

    useEffect(() => {
        if (reportId) {
            fetch(`${api}reportTemplate/executeQuery?ReportID=${reportId}`, {
                method: 'GET',
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                    'Db': company
                }
            })
                .then(res => res.json())
                .then(data => {
                    if (data?.success) {
                        console.log(data?.data[0])
                        setDataArray(data?.data);
                    }
                }).catch(e => console.log(e))
        }
    }, [company, reportId])

    useEffect(() => {
        const displayColumns = [...columns]

        const muiColumns = displayColumns.filter(column =>
            !Boolean(Number(column?.IS_Default)) && !Boolean(Number(column?.IS_Join_Key))
        ).map(column => ({
            header: column?.Column_Name?.replace(/_/g, ' '),
            accessorKey: column?.Column_Name,
            sortable: true,
            size: 150,
            ...aggregations(column?.Column_Data_Type, column?.Column_Name),
            Cell: ({ cell }) => (
                <p className={`m-0 text-center fa-14 w-100`}>
                    {formatString(cell.getValue(), column?.Column_Data_Type)}
                </p>
            ),
            ...getFun(column?.Column_Data_Type),
        }))

        setDispColmn(muiColumns)
    }, [columns])

    useEffect(() => {
        applyFilters();
    }, [filters]);

    const table = useMaterialReactTable({
        columns: dispColmn,
        data: showData || [],
        enableColumnResizing: true,
        enableGrouping: true,
        enableStickyHeader: true,
        enableStickyFooter: true,
        enableColumnOrdering: true,
        enableRowNumbers: false,
        initialState: {
            density: 'compact',
            pagination: { pageIndex: 0, pageSize: 100 },
        },
        muiToolbarAlertBannerChipProps: { color: 'primary' },
        muiTableContainerProps: { sx: { maxHeight: '72vh', minHeight: '46vh' } },
    })

    const handleFilterChange = (column, value) => {
        setFilters(prevFilters => ({
            ...prevFilters,
            [column]: value,
        }));
    };

    const applyFilters = () => {
        let filtered = [...dataArray];
        for (const column of columns) {
            if (filters[column.Column_Name]) {
                if (filters[column.Column_Name].type === 'range') {
                    const { min, max } = filters[column.Column_Name];
                    filtered = filtered.filter(item => {
                        const value = item[column.Column_Name];
                        return (min === undefined || value >= min) && (max === undefined || value <= max);
                    });
                } else if (filters[column.Column_Name].type === 'date') {
                    const { start, end } = filters[column.Column_Name].value;
                    filtered = filtered.filter(item => {
                        const dateValue = new Date(item[column.Column_Name]);
                        return (start === undefined || dateValue >= new Date(start)) && (end === undefined || dateValue <= new Date(end));
                    });
                } else if (Array.isArray(filters[column.Column_Name])) {
                    filtered = filters[column.Column_Name]?.length > 0 ? filtered.filter(item => filters[column.Column_Name].includes(item[column.Column_Name].toLowerCase().trim())) : filtered
                }
            }
        }
        setFilteredData(filtered);
    };

    const renderFilter = (column) => {
        const { Column_Name, Column_Data_Type } = column;
        if (Column_Data_Type === 'number') {
            return (
                <div className='d-flex justify-content-between px-2'>
                    <input
                        placeholder="Min"
                        type="number"
                        className="bg-light border-0 m-1 p-1 w-50"
                        value={filters[Column_Name]?.min ?? ''}
                        onChange={(e) => handleFilterChange(Column_Name, { type: 'range', ...filters[Column_Name], min: e.target.value ? parseFloat(e.target.value) : undefined })}
                    />
                    <input
                        placeholder="Max"
                        type="number"
                        className="bg-light border-0 m-1 p-1 w-50"
                        value={filters[Column_Name]?.max ?? ''}
                        onChange={(e) => handleFilterChange(Column_Name, { type: 'range', ...filters[Column_Name], max: e.target.value ? parseFloat(e.target.value) : undefined })}
                    />
                </div>
            );
        } else if (Column_Data_Type === 'date') {
            return (
                <div className='d-flex justify-content-between px-2'>
                    <input
                        placeholder="Start Date"
                        type="date"
                        className="bg-light border-0 m-1 p-1 w-50"
                        value={filters[Column_Name]?.value?.start ?? ''}
                        onChange={(e) => handleFilterChange(Column_Name, { type: 'date', value: { ...filters[Column_Name]?.value, start: e.target.value || undefined } })}
                    />
                    <input
                        placeholder="End Date"
                        type="date"
                        className="bg-light border-0 m-1 p-1 w-50"
                        value={filters[Column_Name]?.value?.end ?? ''}
                        onChange={(e) => handleFilterChange(Column_Name, { type: 'date', value: { ...filters[Column_Name]?.value, end: e.target.value || undefined } })}
                    />
                </div>
            );
        } else if (Column_Data_Type === 'string') {
            const distinctValues = [...new Set(dataArray.map(item => item[Column_Name]?.toLowerCase()?.trim()))].sort();
            return (
                <Autocomplete
                    multiple
                    id={`${Column_Name}-filter`}
                    options={distinctValues}
                    disableCloseOnSelect
                    getOptionLabel={option => option}
                    value={filters[Column_Name] || []}
                    onChange={(event, newValue) => handleFilterChange(Column_Name, newValue)}
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
                        <TextField
                            {...params}
                            label={Column_Name}
                            placeholder={`Select ${Column_Name?.replace(/_/g, ' ')}`}
                        />
                    )}
                />
            );
        }
    };

    return (
        <>

            <div className="row ">

                <div className="col-xxl-10 col-lg-9 col-md-8">
                    <div className="p-2">
                        <MaterialReactTable table={table} />
                    </div>
                </div>

                <div className="col-xxl-2 col-lg-3 col-md-4 d-none d-md-block">
                    <h5 className="d-flex justify-content-between px-2">
                        Filters
                        <Tooltip title='Clear Filters'>
                            <IconButton
                                size="small"
                                onClick={() => setFilters({})}
                            >
                                <FilterAltOff />
                            </IconButton>
                        </Tooltip>
                    </h5>
                    <div className="border rounded-3 " style={{ maxHeight: '70vh', overflow: 'auto' }}>
                        {columns.map((column, ke) => (isEqualNumber(column?.IS_Default, 0) && isEqualNumber(column?.IS_Join_Key, 0)) && (
                            <div key={ke} className="py-3 px-3 hov-bg border-bottom">
                                <label className='mt-2 mb-1'>{column?.Column_Name?.replace(/_/g, ' ')}</label>
                                {renderFilter(column)}
                            </div>
                        ))}
                        <br />
                    </div>
                </div>

            </div>
        </>
    )
}


export default DynamicMuiTable;