import React, { useContext, useEffect, useState } from 'react';
import api from '../../API';
import { Button, Card, CardContent, Collapse, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, ListItemIcon, ListItemText, MenuItem, MenuList, Popover } from '@mui/material';
import { ArrowBackIosNewOutlined, Edit, ExpandLess, ExpandMore, Visibility, List, Delete, FilterAlt, Launch } from '@mui/icons-material';
import { isEqualNumber, UTCDateWithTime } from '../../Components/functions';
import { MyContext } from '../../Components/context/contextProvider';
import { useNavigate } from 'react-router-dom'
import DynamicMuiTable from '../../Components/dynamicMuiTable';
import { CurretntCompany } from '../../Components/context/currentCompnayProvider';
import { toast } from 'react-toastify';


const ReportTemplates = () => {
    const [templates, setTemplates] = useState([]);
    const { currentCompany, setCurrentCompany } = useContext(CurretntCompany);
    const variableState = {
        search: '',
        openFilterDialog: false,
        filterTablesAndColumns: {},
        deleteConfirmationDialog: false,
        preFilterDialog: false,
    }
    const [localVariable, setLocalVariable] = useState(variableState);
    const { contextObj } = useContext(MyContext);
    const [filters, setFilters] = useState({})
    const nav = useNavigate();
    const [reload, setReload] = useState(false)

    useEffect(() => {
        fetch(`${api}reportTemplate`)
            .then(res => res.json())
            .then(data => {
                if (data?.success) {
                    setTemplates(data?.data);
                }
            }).catch(e => console.log(e))
            .finally(() => setCurrentCompany({ ...currentCompany, CompanySettings: true }))
    }, [reload])

    const handleFilterChange = (column, value) => {
        setFilters(prevFilters => ({
            ...prevFilters,
            [column]: value,
        }));
    };

    const renderFilter = (column) => {
        const { Column_Name, Column_Data_Type } = column;
        if (Column_Data_Type === 'number') {
            return (
                <div className='d-flex justify-content-between'>
                    <input
                        placeholder="Min"
                        type="number"
                        className="cus-inpt"
                        value={filters[Column_Name]?.min ?? ''}
                        onChange={(e) => handleFilterChange(Column_Name, {
                            type: 'range',
                            ...filters[Column_Name],
                            min: e.target.value ? parseFloat(e.target.value) : undefined
                        })}
                    />
                    <input
                        placeholder="Max"
                        type="number"
                        className="cus-inpt"
                        value={filters[Column_Name]?.max ?? ''}
                        onChange={(e) => handleFilterChange(Column_Name, {
                            type: 'range',
                            ...filters[Column_Name],
                            max: e.target.value ? parseFloat(e.target.value) : undefined
                        })}
                    />
                </div>
            );
        } else if (Column_Data_Type === 'date') {
            return (
                <div className='d-flex justify-content-between'>
                    <input
                        placeholder="Start Date"
                        type="date"
                        className="cus-inpt"
                        value={filters[Column_Name]?.value?.start ?? ''}
                        onChange={(e) => handleFilterChange(Column_Name, {
                            type: 'date',
                            value: { ...filters[Column_Name]?.value, start: e.target.value || undefined }
                        })}
                    />
                    <input
                        placeholder="End Date"
                        type="date"
                        className="cus-inpt"
                        value={filters[Column_Name]?.value?.end ?? ''}
                        onChange={(e) => handleFilterChange(Column_Name, {
                            type: 'date',
                            value: { ...filters[Column_Name]?.value, end: e.target.value || undefined }
                        })}
                    />
                </div>
            );
        } else if (Column_Data_Type === 'string') {
            return (
                <input
                    type="text"
                    placeholder='Search...'
                    className='cus-inpt'
                    value={filters[Column_Name]?.value ?? ''}
                    onChange={e => handleFilterChange(Column_Name, {
                        type: 'textCompare',
                        value: String(e.target.value).toLowerCase() || ''
                    })}
                />
            )
        }
    };

    const ExpandableRow = ({ o, i }) => {
        const [open, setOpen] = useState(false);
        const [anchorEl, setAnchorEl] = useState(null);

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

        const popOverOpen = Boolean(anchorEl);
        const id = popOverOpen ? o?.Report_Name : undefined;

        const handleClick = (event) => {
            setAnchorEl(event.currentTarget);
        };

        const handleClose = () => {
            setAnchorEl(null);
        };

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

                        <IconButton size='small' onClick={() => setOpen(pre => !pre)}>
                            {open ? <ExpandLess className='text-primary' /> : <ExpandMore />}
                        </IconButton>

                        <IconButton aria-describedby={id} onClick={handleClick}>
                            <List />
                        </IconButton>

                        <Popover
                            id={id}
                            open={popOverOpen}
                            anchorEl={anchorEl}
                            onClose={handleClose}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left',
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                            }}
                        >
                            <MenuList>

                                <MenuItem
                                    onClick={() => {
                                        setLocalVariable(pre => ({
                                            ...pre,
                                            filterTablesAndColumns: dataToForward,
                                            openFilterDialog: true,
                                        }));
                                    }}
                                    disabled={!currentCompany?.id}
                                >
                                    <ListItemIcon><Visibility fontSize="small" /></ListItemIcon>
                                    <ListItemText>OPEN</ListItemText>
                                </MenuItem>

                                <MenuItem
                                    onClick={
                                        () => {
                                            setLocalVariable(pre => ({
                                                ...pre,
                                                filterTablesAndColumns: dataToForward,
                                                preFilterDialog: true,
                                            }));
                                            setFilters({})
                                        }
                                    }
                                >
                                    <ListItemIcon><FilterAlt fontSize="small" /></ListItemIcon>
                                    <ListItemText>FILTERS</ListItemText>
                                </MenuItem>

                                <MenuItem
                                    onClick={() => nav('create', { state: { ReportState: dataToForward } })}
                                >
                                    <ListItemIcon><Edit fontSize="small" /></ListItemIcon>
                                    <ListItemText>EDIT</ListItemText>
                                </MenuItem>

                                <MenuItem
                                    onClick={() => setLocalVariable(pre => ({ ...pre, deleteConfirmationDialog: true, filterTablesAndColumns: dataToForward }))}
                                >
                                    <ListItemIcon><Delete fontSize="small" color='error' /></ListItemIcon>
                                    <ListItemText>DELETE</ListItemText>
                                </MenuItem>

                            </MenuList>
                        </Popover>

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
                                                                border fa-13 vctr
                                                                ${Boolean(Number(column?.IS_Default)) ? ' blue-text ' : ''}
                                                                ${Boolean(Number(column?.IS_Join_Key)) ? ' fw-bold ' : ''}
                                                                `}
                                                        >
                                                            {column?.Column_Name}
                                                        </td>
                                                        <td className="border fa-13 vctr">{column?.Column_Data_Type}</td>
                                                        <td className="border fa-13 vctr">{column?.Order_By}</td>
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

    const closeDeleteConfirmationDialog = () => {
        setLocalVariable(pre => ({ ...pre, deleteConfirmationDialog: false, filterTablesAndColumns: {} }))
    }

    const closeFilterDialog = () => {
        setLocalVariable(pre => ({ ...pre, preFilterDialog: false }));
        setFilters({})
    }

    const deleteTemplate = () => {
        setLocalVariable(pre => ({ ...pre, deleteConfirmationDialog: false }))
        fetch(`${api}reportTemplate`, {
            method: 'DELETE',
            headers: {
                'Content-Type': "application/json",
            },
            body: JSON.stringify({
                Report_Type_Id: localVariable?.filterTablesAndColumns?.Report_Type_Id
            })
        })
            .then(res => res.json())
            .then(data => {
                if (data?.success) {
                    toast.success(data.message)
                    setReload(pre => !pre)
                } else {
                    toast.error(data.message)
                }
            }).catch(e => console.log(e))
            .finally(() => setLocalVariable(pre => ({ ...pre, filterTablesAndColumns: {} })))
    }

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
                                            <td className="border fa-14 text-center" key={i} style={{ backgroundColor: '#EDF0F7' }}>{o}</td>
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
                <DialogTitle>Report <span className="blue-text">{localVariable?.filterTablesAndColumns?.reportName}</span></DialogTitle>
                <DialogContent>
                    {(localVariable?.filterTablesAndColumns?.Report_Type_Id && currentCompany?.id) && (
                        <DynamicMuiTable reportId={localVariable?.filterTablesAndColumns?.Report_Type_Id} company={currentCompany?.id} queryFilters={filters} />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={closeDialog}
                        startIcon={<ArrowBackIosNewOutlined />}
                    >
                        Back
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={localVariable?.deleteConfirmationDialog}
                onClose={closeDeleteConfirmationDialog}
                fullWidth maxWidth='sm'
            >
                <DialogTitle>Confirmation</DialogTitle>
                <DialogContent>
                    Do you want to delete the Template <span className='blue-text'>{localVariable?.filterTablesAndColumns?.reportName}</span> permanently
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={closeDeleteConfirmationDialog}
                    >
                        cancel
                    </Button>
                    <Button
                        onClick={deleteTemplate}
                        startIcon={<Delete />}
                        variant='outlined'
                        color='error'
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={localVariable?.preFilterDialog}
                onClose={closeFilterDialog}
                fullWidth maxWidth='lg'
            >
                <DialogTitle>Filters For <span className="blue-text">{localVariable?.filterTablesAndColumns?.reportName}</span> - Report</DialogTitle>
                <DialogContent>
                    {localVariable?.filterTablesAndColumns?.tables?.map((table, i) => (
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
                    ))}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={closeFilterDialog}
                    >
                        cancel
                    </Button>
                    <Button
                        onClick={() => setLocalVariable(pre => ({ ...pre, openFilterDialog: true, preFilterDialog: false }))}
                        startIcon={<Launch />}
                        variant='outlined'
                    >
                        Open report
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default ReportTemplates