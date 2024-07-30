import React, { useContext, useEffect, useState } from 'react';
import api from '../../API';
import { Button, Card, CardContent, Collapse, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from '@mui/material';
import { ArrowBackIosNewOutlined, Edit, ExpandLess, ExpandMore, Save, Visibility } from '@mui/icons-material';
import { isEqualNumber, UTCDateWithTime } from '../../Components/functions';
import { MyContext } from '../../Components/context/contextProvider';
import { useNavigate } from 'react-router-dom'
import DynamicMuiTable from '../../Components/dynamicMuiTable';
import { CurretntCompany } from '../../Components/context/currentCompnayProvider';


const ReportTemplates = () => {
    const [templates, setTemplates] = useState([]);
    const { currentCompany, setCurrentCompany } = useContext(CurretntCompany);
    const variableState = {
        search: '',
        openFilterDialog: false,
        filterTablesAndColumns: {},
    }
    const [localVariable, setLocalVariable] = useState(variableState);
    const { contextObj } = useContext(MyContext);
    // const [filters, setFilters] = useState({})
    const nav = useNavigate();

    useEffect(() => {
        fetch(`${api}reportTemplate`)
            .then(res => res.json())
            .then(data => {
                if (data?.success) {
                    setTemplates(data?.data);
                }
            }).catch(e => console.log(e))
            .finally(() => setCurrentCompany({ ...currentCompany, CompanySettings: true }))
    }, [])

    const ExpandableRow = ({ o, i }) => {
        const [open, setOpen] = useState(false);
        const dataToForward = {
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
                    isVisible: true
                }))
            }))
        }

        return (
            <>
                <tr>
                    <td className="border fa-13 text-center vctr">{i}</td>
                    <td className="border fa-13 text-center vctr">{o?.Report_Name}</td>
                    <td className="border fa-13 text-center vctr">{o?.tablesList?.length}</td>
                    <td className="border fa-13 text-center vctr">
                        {o?.tablesList?.reduce((sum, item) => sum += Number(item?.columnsList?.length), 0)}
                    </td>
                    <td className="border fa-13 text-center vctr">{o?.CreatedByGet}</td>
                    <td className="border fa-13 text-center vctr">{o?.CreatedAt ? UTCDateWithTime(o?.CreatedAt) : ' - '}</td>
                    <td className="border fa-13 text-center vctr">
                        <IconButton
                            size='small'
                            onClick={() => {
                                setLocalVariable(pre => ({
                                    ...pre,
                                    filterTablesAndColumns: dataToForward,
                                    openFilterDialog: true,
                                })); console.log(dataToForward)
                            }}
                            disabled={!currentCompany?.id}
                        >
                            <Visibility  />
                        </IconButton>
                        {/* <IconButton
                            size='small'
                            onClick={() => nav('create', { state: { ReportState: dataToForward } })}
                        >
                            <Edit />
                        </IconButton> */}
                        <IconButton size='small' onClick={() => setOpen(pre => !pre)}>
                            {open ? <ExpandLess className='text-primary' /> : <ExpandMore />}
                        </IconButton>

                    </td>
                </tr>

                <tr>
                    <td colSpan={7} className="p-0 border-0">
                        <Collapse in={open} timeout="auto" className='py-3' unmountOnExit>
                            <div className="table-responsive">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            {['SNo', 'Table', 'Column', 'Data-Type', 'Order'].map(o => (
                                                <th className="border fa-14 text-center" key={o} style={{ backgroundColor: '#EDF0F7' }}>{o}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {o?.tablesList?.map((table, tableInd) => (
                                            <React.Fragment key={tableInd}>
                                                {table?.columnsList?.map((column, columnInd) => (
                                                    <tr key={columnInd}>
                                                        {columnInd === 0 && (
                                                            <>
                                                                <td className="border fa-13 text-center vctr" rowSpan={table?.columnsList?.length}>{tableInd + 1}</td>
                                                                <td className="border fa-13 text-center blue-text vctr" rowSpan={table?.columnsList?.length}>
                                                                    {table?.AliasName}
                                                                </td>
                                                            </>
                                                        )}
                                                        <td
                                                            className={`
                                                                border fa-13 
                                                                ${Boolean(Number(column?.IS_Default)) ? ' blue-text ' : ''}
                                                                ${Boolean(Number(column?.IS_Join_Key)) ? ' fw-bold ' : ''}
                                                                `}
                                                        >
                                                            {column?.Column_Name}
                                                        </td>
                                                        <td className="border fa-13">{column?.Column_Data_Type}</td>
                                                        <td className="border fa-13">{column?.Order_By}</td>
                                                    </tr>
                                                ))}
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Collapse>
                    </td>
                </tr>
            </>
        );
    }

    const closeDialog = () => {
        setLocalVariable(pre => ({ ...pre, openFilterDialog: false, filterTablesAndColumns: {} }))
    }

    // const handleFilterChange = (column, value) => {
    //     setFilters(prevFilters => ({
    //         ...prevFilters,
    //         [column]: value,
    //     }));
    // };

    // const renderFilter = (column) => {
    //     const { Column_Name, Column_Data_Type } = column;
    //     if (Column_Data_Type === 'number') {
    //         return (
    //             <div className='d-flex justify-content-between px-2'>
    //                 <input
    //                     placeholder="Min"
    //                     type="number"
    //                     className="cus-inpt"
    //                     value={filters[Column_Name]?.min ?? ''}
    //                     onChange={(e) => handleFilterChange(Column_Name, {
    //                         type: 'range',
    //                         ...filters[Column_Name],
    //                         min: e.target.value ? parseFloat(e.target.value) : undefined
    //                     })}
    //                 />
    //                 <input
    //                     placeholder="Max"
    //                     type="number"
    //                     className="cus-inpt"
    //                     value={filters[Column_Name]?.max ?? ''}
    //                     onChange={(e) => handleFilterChange(Column_Name, {
    //                         type: 'range',
    //                         ...filters[Column_Name],
    //                         max: e.target.value ? parseFloat(e.target.value) : undefined
    //                     })}
    //                 />
    //             </div>
    //         );
    //     } else if (Column_Data_Type === 'date') {
    //         return (
    //             <div className='d-flex justify-content-between px-2'>
    //                 <input
    //                     placeholder="Start Date"
    //                     type="date"
    //                     className="cus-inpt"
    //                     value={filters[Column_Name]?.value?.start ?? ''}
    //                     onChange={(e) => handleFilterChange(Column_Name, {
    //                         type: 'date',
    //                         value: { ...filters[Column_Name]?.value, start: e.target.value || undefined }
    //                     })}
    //                 />
    //                 <input
    //                     placeholder="End Date"
    //                     type="date"
    //                     className="cus-inpt"
    //                     value={filters[Column_Name]?.value?.end ?? ''}
    //                     onChange={(e) => handleFilterChange(Column_Name, {
    //                         type: 'date',
    //                         value: { ...filters[Column_Name]?.value, end: e.target.value || undefined }
    //                     })}
    //                 />
    //             </div>
    //         );
    //     } else if (Column_Data_Type === 'string') {
    //         return (
    //             <input
    //                 type="text"
    //                 placeholder='Search Like...'
    //                 className='cus-inpt'
    //                 value={filters[Column_Name]?.value ?? ''}
    //                 onChange={e => handleFilterChange(Column_Name, {
    //                     type: 'textCompare',
    //                     value: { ...filters[Column_Name]?.value, searchText: e.target.value || '' }
    //                 })}
    //             />
    //         )
    //     }
    // };

    return (
        <>

            <Card>

                <div className="p-3 border-bottom fa-16 fw-bold d-flex justify-content-between align-items-center">
                    <span className="text-primary text-uppercase ps-3">Report Templates</span>
                    {isEqualNumber(contextObj?.Add_Rights, 1) && (
                        <Button variant='outlined' onClick={() => nav('create')}>Add Report</Button>
                    )}
                </div>

                <CardContent>
                    {templates?.length > 0 && (
                        <div className="table-responsive" style={{ maxHeight: '72dvh', overflow: 'auto' }}>

                            <div className="d-flex justify-content-end mb-3">
                                <input
                                    type="search"
                                    className='cus-inpt w-auto'
                                    placeholder='Search Report Name'
                                    value={localVariable?.search ?? ''}
                                    onChange={e => setLocalVariable(pre => ({ ...pre, search: String(e.target.value).toLowerCase() }))}
                                />
                            </div>

                            <table className="table m-0">

                                <thead>
                                    <tr>
                                        {['SNo', 'Report Name', 'Tables', 'Columns', 'Created-By', 'Created-At', 'Action'].map((o, i) => (
                                            <td className="border fa-14 text-center" key={i}>{o}</td>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody>
                                    {!localVariable?.search ? (
                                        templates?.map((o, i) => (
                                            <ExpandableRow o={o} i={i + 1} key={i} />
                                        ))
                                    ) : (
                                        [...templates].filter(fil =>
                                            String(fil?.Report_Name).toLowerCase().includes(localVariable.search)
                                        ).map((o, i) => <ExpandableRow o={o} i={i + 1} key={i} />)
                                    )}
                                </tbody>

                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog
                open={localVariable?.openFilterDialog}
                onClose={closeDialog}
                fullScreen
            >
                {/* <DialogTitle>Filters For <span className="blue-text">{localVariable?.filterTablesAndColumns?.reportName}</span> - Report</DialogTitle> */}
                <DialogTitle>Filters For <span className="blue-text">{localVariable?.filterTablesAndColumns?.reportName}</span> - Report</DialogTitle>
                <DialogContent>
                    {/* {localVariable?.filterTablesAndColumns?.tables?.map((table, i) => (
                        <div className="p-2 mb-3" key={i}>
                            <h6 className='blue-text mb-2 border-bottom'>{table?.AliasName}</h6>

                            <div className="row">
                                {table?.columns?.map((column, ii) => (
                                    // (column?.Column_Data_Type === 'date' || column?.Column_Data_Type === 'number') &&
                                    !Boolean(Number(column?.IS_Default)) &&
                                    !Boolean(Number(column?.IS_Join_Key))
                                ) && (
                                        <div className="p-2 col-xxl-3 col-lg-4 col-md-6 " key={ii}>
                                            <label className='mb-2 fw-bold text-muted'>{column?.Column_Name}</label>
                                            {renderFilter(column)}
                                        </div>
                                    ))}
                            </div>
                        </div>
                    ))} */}
                    {(localVariable?.filterTablesAndColumns?.Report_Type_Id && currentCompany?.id) && (
                        <DynamicMuiTable reportId={localVariable?.filterTablesAndColumns?.Report_Type_Id} company={currentCompany?.id} />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={closeDialog}
                        startIcon={<ArrowBackIosNewOutlined />}
                    >
                        Back
                    </Button>
                    <Button
                        // onClick={() => setInputValues(pre => ({ ...pre, previewDialog: false }))}
                        startIcon={<Save />}
                    >
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>

        </>
    )
}

export default ReportTemplates