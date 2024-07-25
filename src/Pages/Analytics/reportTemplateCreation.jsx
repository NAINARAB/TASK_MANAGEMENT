import React, { useEffect, useState } from 'react';
import api from '../../API';
import { Card, CardContent, Tab, Switch, Button, Tooltip } from '@mui/material';
import { RemoveRedEyeOutlined } from '@mui/icons-material'
import { TabPanel, TabList, TabContext } from '@mui/lab';
import { Box } from '@mui/system';
import { isEqualNumber } from '../../Components/functions';
import { toast } from 'react-toastify'

const ReportTemplateCreation = () => {
    const initialValue = {
        reportName: '',
        tables: [],
        currentTab: 'tbl_Q_Pay_Summarry'
    };
    const [inputValues, setInputValues] = useState(initialValue);
    const [reportTables, setReportTables] = useState([])
    const tablesSelected = inputValues?.tables?.reduce((sum, obj) => sum += obj?.isChecked ? 1 : 0, 0)
    const columnsSelected = inputValues?.tables?.reduce((sum, item) => (
        sum += item?.columns?.reduce((colSum, colItem) => (
            colSum += isEqualNumber(colItem?.isVisible, 1) ? 1 : 0
        ), 0)
    ), 0)


    useEffect(() => {
        fetch(`${api}reportTemplate`)
            .then(res => res.json())
            .then(data => {
                if (data?.success) {
                    setReportTables(data?.data);
                }
            }).catch(e => console.log(e))
    }, []);

    console.log(inputValues)

    const handleTableCheck = (tableName, checked) => {
        setInputValues(prev => {
            const updatedTables = [...prev.tables];
            const tableIndex = updatedTables.findIndex(table => table.Table_Name === tableName);

            const arraywithDefaultColumn = [];
            const repTableIndex = reportTables?.findIndex(table => table.Table_Name === tableName);
            const defaultColumnIndex = reportTables[repTableIndex]?.Columns?.findIndex(column => isEqualNumber(column?.IS_Default, 1));
            const defaultColumn = defaultColumnIndex !== -1 ? reportTables[repTableIndex]?.Columns[defaultColumnIndex] : {};

            if (defaultColumnIndex !== -1) {
                defaultColumn.Order_By = '';
                defaultColumn.isVisible = true;
            }

            arraywithDefaultColumn.push(defaultColumn)


            if (tableIndex !== -1) {
                updatedTables[tableIndex].isChecked = checked;
                if (!checked) {
                    updatedTables[tableIndex].columns = [];
                } else {
                    updatedTables[tableIndex].columns = arraywithDefaultColumn;
                }
            } else {
                updatedTables.push({ Table_Name: tableName, isChecked: checked, columns: arraywithDefaultColumn });
            }
            return { ...prev, tables: updatedTables };

        });
    };

    const handleColumnCheck = (tableName, columnDetails, checked) => {
        setInputValues(prev => {
            const updatedTables = [...prev.tables];
            const tableIndex = updatedTables.findIndex(table => table.Table_Name === tableName);

            if (tableIndex !== -1) {
                const columns = updatedTables[tableIndex].columns || [];
                const columnNameIndex = columns?.findIndex(obj => obj?.Column_Name === columnDetails?.Column_Name);

                if (columnNameIndex !== -1) {
                    columns[columnNameIndex].isVisible = checked ? 1 : 0;
                } else {
                    columns.push({
                        ...columnDetails,
                        Order_By: '',
                        isVisible: checked ? 1 : 0
                    });
                }
                updatedTables[tableIndex].columns = columns;
            }

            return { ...prev, tables: updatedTables };
        });
    };

    const handleOrderByChange = (tableName, columnDetails, value) => {
        setInputValues(prev => {
            const updatedTables = [...prev.tables];
            const tableIndex = updatedTables.findIndex(table => table.Table_Name === tableName);

            if (tableIndex !== -1) {
                const columns = updatedTables[tableIndex].columns || [];
                const columnNameIndex = columns?.findIndex(col => col?.Column_Name === columnDetails?.Column_Name);

                if (columnNameIndex !== -1) {
                    columns[columnNameIndex].Order_By = value;
                } else {
                    columns.push({
                        ...columnDetails,
                        Order_By: value,
                        isVisible: true
                    });
                }
                updatedTables[tableIndex].columns = columns;
            }

            return { ...prev, tables: updatedTables };
        });
    };


    return (
        <>
            <Card>
                <div className="fa-16 fw-bold border-bottom d-flex justify-content-between align-items-center">
                    <span className='p-3'>Staff Attendance</span>
                </div>

                <CardContent>

                    <div>
                        <label className='w-100'>Report Name</label>
                        <input
                            type="text"
                            className='cus-inpt w-auto'
                            value={inputValues.reportName}
                            onChange={e => setInputValues({ ...inputValues, reportName: e.target.value })}
                        />
                    </div>

                    <div className="p-3">
                        <table>
                            <tbody>
                                <tr>
                                    <td>Tables Selected:</td>
                                    <td>{tablesSelected}</td>
                                </tr>
                                <tr>
                                    <td>Columns Selected:&emsp;&emsp;</td>
                                    <td>{columnsSelected}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <Box className='d-flex flex-wrap mt-3' >

                        <TabContext value={inputValues.currentTab}>
                            <TabList
                                indicatorColor='transparent'
                                onChange={(e, newTab) => setInputValues({ ...inputValues, currentTab: newTab })}
                                variant="scrollable"
                                scrollButtons="auto"
                                orientation="vertical"
                                allowScrollButtonsMobile
                                sx={{ maxHeight: '400px' }}
                            >
                                {reportTables.map((table, index) => (
                                    <Tab
                                        key={index}
                                        sx={inputValues.currentTab === table?.Table_Name ? { backgroundColor: '#c6d7eb' } : {}}
                                        className={Boolean(inputValues.tables.find(t => t.Table_Name === table?.Table_Name)?.isChecked) ? 'text-success fw-bold' : 'text-primary'}
                                        label={table?.AliasName}
                                        value={table?.Table_Name}
                                    />
                                ))}
                            </TabList>

                            {reportTables.map((table, index) => (
                                <TabPanel value={table?.Table_Name} className='flex-grow-1 p-3 border rounded-2' key={index}>

                                    <div className='d-flex align-items-center mb-4 border-bottom'>
                                        <Switch
                                            checked={Boolean(inputValues.tables.find(t => t.Table_Name === table?.Table_Name)?.isChecked)}
                                            onChange={e => handleTableCheck(table?.Table_Name, e.target.checked)}
                                        />
                                        <h6 className='fa-13 mb-0 fw-bold '>{table?.AliasName} TABLE</h6>
                                    </div>

                                    <div className='cus-grid'>
                                        {table?.Columns?.map((colObj, colIndex) => (
                                            <div key={colIndex}>
                                                <Card className={`p-2 d-flex justify-content-between align-items-center flex-wrap ${colIndex % 2 === 0 ? 'bg-light' : ''}`}>

                                                    <div className='d-flex justify-content-between align-items-center flex-wrap'>
                                                        <Switch
                                                            checked={
                                                                Boolean(colObj?.IS_Default) ||
                                                                Boolean(
                                                                    (inputValues.tables.find(t =>
                                                                        t.Table_Name === table?.Table_Name
                                                                    ))?.columns?.find(c => c.Column_Name === colObj?.Column_Name)?.isVisible
                                                                )
                                                            }
                                                            disabled={Boolean(colObj?.IS_Default)}
                                                            onChange={e => handleColumnCheck(table?.Table_Name, colObj, e.target.checked)}
                                                        />
                                                        <h6 className='fa-12 m-0 fw-bold'>{colObj?.Column_Name}</h6>
                                                    </div>

                                                    <input
                                                        type='number'
                                                        className={`p-1 border cus-inpt ${colIndex % 2 !== 0 ? 'bg-light' : ''}`}
                                                        style={{ width: '80px' }}
                                                        placeholder='Order'
                                                        value={inputValues.tables.find(t =>
                                                            t.Table_Name === table?.Table_Name
                                                        )?.columns?.find(c => c.Column_Name === colObj?.Column_Name)?.Order_By || ''}
                                                        onChange={e => handleOrderByChange(table?.Table_Name, colObj, e.target.value)}
                                                    />
                                                </Card>
                                            </div>
                                        ))}
                                    </div>

                                </TabPanel>
                            ))}
                        </TabContext>
                    </Box>
                </CardContent>
                <hr className='mt-2 mb-0' />
                <div className="p-3 d-flex justify-content-end">
                    <Tooltip title={columnsSelected <= 4 && 'Select Minimum 5 Columns'}>
                        <span>
                            <Button
                                variant='outlined'
                                startIcon={<RemoveRedEyeOutlined />}
                                disabled={tablesSelected === 0 || columnsSelected <= 4}
                                onClick={
                                    columnsSelected > 25
                                        ? () => toast.warn('Maximum 25 Column limit exceeded')
                                        : () => { }
                                }
                            >
                                Preview
                            </Button>
                        </span>
                    </Tooltip>
                </div>
            </Card>
        </>
    );
};

export default ReportTemplateCreation;
