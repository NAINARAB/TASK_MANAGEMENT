import { Card, CardContent, IconButton, Tooltip } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { isEqualObject, isGraterOrEqual, isLesserOrEqual, ISOString, NumberFormat } from '../../../Components/functions'
import api from '../../../API';
import { Add, Cancel, Refresh, Save } from '@mui/icons-material'
import { toast } from 'react-toastify'


const DriverActivities = () => {
    const [filter, setFilter] = useState({
        reqDate: ISOString(),
        entryLocation: 'MILL',
    })
    const [data, setData] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [reload, setReload] = useState(false);
    const [newRow, setNewRow] = useState([]);

    useEffect(() => {
        fetch(`${api}driverActivities/drivers`)
            .then(res => res.json())
            .then(data => setDrivers(data.data))
            .catch(e => console.error(e))
    }, [reload])

    useEffect(() => {
        fetch(`${api}driverActivities?reqDate=${filter.reqDate}&reqLocation=${filter.entryLocation}`)
            .then(res => res.json())
            .then(data => setData(data.data))
            .catch(e => console.error(e))
    }, [reload, filter.reqDate, filter.entryLocation])

    function onlynum(e) {
        const value = e.target.value;
        const newValue = value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
        e.target.value = newValue;
    }

    const insertColumns = () => {
        const columns = {
            EntryDate: filter.reqDate,
            LocationDetails: filter.entryLocation,
            DriverName: '',
            TripOne: '',
            TripTwo: '',
            TripThree: '',
            TripFour: '',
            TripFive: '',
            OtherGodownsOne: '',
            OtherGodownsTwo: '',
            OtherGodownsThree: '',
            TransferOne: '',
            TransferTwo: '',
            TransferThree: '',
        }
        setNewRow(pre => [...pre, columns]);
    }

    const handleInputChange = (index, field, value) => {
        const updatedRows = newRow.map((row, i) =>
            i === index ? { ...row, [field]: value } : row
        );
        setNewRow(updatedRows);
    };

    const calculateRowSum = (row) => {
        const fields = [
            'TripOne', 'TripTwo', 'TripThree', 'TripFour', 'TripFive',
            'OtherGodownsOne', 'OtherGodownsTwo', 'OtherGodownsThree',
            'TransferOne', 'TransferTwo', 'TransferThree'
        ];
        return fields.reduce((sum, field) => sum + (parseFloat(row[field]) || 0), 0);
    };

    const calTotal = (start, end) => {
        let total = 0;
        data.forEach(row => {
            Object.values(row).forEach((cell, idx) => {
                if ((isGraterOrEqual(idx + 1, start) && isLesserOrEqual(idx + 1, end)) && (cell && !isNaN(cell))) {
                    total += Number(cell)
                }
            })
        })

        return NumberFormat(total)
    }

    const saveActivity = (row, method) => {
        if (row?.DriverName) {
            fetch(`${api}driverActivities`, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(row)
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        toast.success(data.message);
                        if (method === 'POST') {
                            setNewRow([]);
                            setReload(!reload)
                        }
                    } else {
                        toast.error(data.message)
                    }
                }).catch(e => console.error(e))
        } else {
            toast.error('Enter Driver Name')
        }
    }

    const TableRowComp = ({ obj, sno }) => {
        const {
            Id, DriverName,
            TripOne, TripTwo, TripThree, TripFour, TripFive,
            OtherGodownsOne, OtherGodownsTwo, OtherGodownsThree,
            TransferOne, TransferTwo, TransferThree
        } = obj;
        const [initialValue, setInitialValue] = useState({
            Id,
            DriverName,
            TripOne,
            TripTwo,
            TripThree,
            TripFour,
            TripFive,
            OtherGodownsOne,
            OtherGodownsTwo,
            OtherGodownsThree,
            TransferOne,
            TransferTwo,
            TransferThree
        });
        const [inputValue, setInputValue] = useState(initialValue);

        return (
            <>
                <tr>
                    <td className={'fa-13 border text-center p-0'}>
                        {sno}
                    </td>
                    <td className='border p-0'>
                        <input
                            type="search"
                            className='cus-inpt border-0'
                            style={{ minWidth: '200px' }}
                            list='driverList'
                            value={inputValue?.DriverName}
                            onChange={e => setInputValue(pre => ({ ...pre, DriverName: e.target.value }))}
                        />
                    </td>
                    {[
                        'TripOne', 'TripTwo', 'TripThree', 'TripFour', 'TripFive',
                        'OtherGodownsOne', 'OtherGodownsTwo', 'OtherGodownsThree',
                        'TransferOne', 'TransferTwo', 'TransferThree'
                    ].map((o, i) => (
                        <td key={i} className={i % 2 === 0 ? 'fa-13 border p-0 bg-light' : 'fa-13 border p-0'}>
                            <input
                                onInput={onlynum}
                                className={i % 2 === 0 ? 'cus-inpt border-0 bg-light' : 'cus-inpt border-0'}
                                value={inputValue[o] ? inputValue[o] : ''}
                                onChange={e => setInputValue(pre => ({ ...pre, [o]: e.target.value }))}
                            />
                        </td>
                    ))}
                    <td className='border fw-bold fa-13'>
                        {calculateRowSum(obj)}
                    </td>
                    <td className='border pb-0' style={{ minWidth: '80px'}}>

                        <Tooltip title='SAVE'>
                            <IconButton
                                color={'success'}
                                size='small'
                                disabled={isEqualObject(initialValue, inputValue)}
                                onClick={() => { saveActivity(inputValue, 'PUT'); setInitialValue(inputValue) }}
                            >
                                <Save className='fa-20' />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title='CANCEL EDITING'>
                            <IconButton 
                                size='small' 
                                onClick={() => setInputValue(initialValue)}
                                color='error'
                                disabled={isEqualObject(initialValue, inputValue)}
                            >
                                    <Cancel className='fa-20' />
                            </IconButton>
                        </Tooltip>

                    </td>
                </tr>
            </>
        )
    }

    return (
        <>
            <Card>
                <div className="p-3 fa-16 fw-bold border-bottom">
                    <span>Driver Activities</span>
                </div>
                <CardContent>

                    <div className="d-flex">
                        <div>
                            <label className='mb-2 w-100'>DATE</label>
                            <input
                                type="date"
                                className='cus-inpt w-auto'
                                value={filter.reqDate}
                                onChange={e => setFilter(pre => ({ ...pre, reqDate: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className='mb-2 w-100'>LOCATION</label>
                            <select
                                className='cus-inpt w-auto'
                                value={filter.entryLocation}
                                onChange={e => setFilter(pre => ({ ...pre, entryLocation: e.target.value }))}
                            >
                                <option value="MILL">MILL</option>
                                <option value="GODOWN">GODOWN</option>
                            </select>
                        </div>
                    </div>

                    <div className="table-responsive mt-3">
                        <table className='table'>

                            <thead>
                                <tr>
                                    <th className={'border'} colSpan={2}></th>
                                    <th colSpan={5} className={'fa-14 border text-center bg-light'}>LRY SHED & LOCAL</th>
                                    <th colSpan={3} className={'fa-14 border text-center'}>OTHER GODOWNS</th>
                                    <th colSpan={3} className={'fa-14 border text-center bg-light'}>TRANSFER</th>
                                    <th className='border text-end' colSpan={2}>
                                        <Tooltip title='ADD NEW DRIVER'>
                                            <IconButton
                                                onClick={insertColumns}
                                                disabled={newRow.length > 0}
                                                color='info'
                                                size='small'
                                            >
                                                <Add className='fa-20' />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title='REFRESH'>
                                            <IconButton
                                                onClick={() => setReload(!reload)}
                                                color='info'
                                            >
                                                <Refresh className='fa-20' />
                                            </IconButton>
                                        </Tooltip>
                                    </th>
                                </tr>
                                <tr>
                                    {[
                                        'SNo', 'DRIVER NAME',
                                        'TRIP - 1', 'TRIP - 2', 'TRIP - 3', 'TRIP - 4', 'TRIP - 5',
                                        'O.G - 1', 'O.G - 2', 'O.G - 3',
                                        'TRAN -1', 'TRAN -2', 'TRAN -3',
                                        'TOTAL', 'ACTION'
                                    ].map((o, i) => (
                                        <th key={i} className={'fa-14 border text-center'}>{o}</th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>

                                {data.map((row, index) => <TableRowComp obj={row} sno={index + 1} key={index} />)}

                                {(newRow.length > 0) && newRow.map((o, i) => (
                                    <tr key={i}>
                                        <td className='border text-end fa-13 '>{i + data.length + 1}</td>
                                        <td className='border p-0'>
                                            <input
                                                type="search"
                                                className='cus-inpt border-0'
                                                list='driverList'
                                                value={o?.DriverName}
                                                onChange={e => handleInputChange(i, 'DriverName', e.target.value)}
                                            />
                                        </td>
                                        {[
                                            'TripOne', 'TripTwo', 'TripThree', 'TripFour', 'TripFive',
                                            'OtherGodownsOne', 'OtherGodownsTwo', 'OtherGodownsThree',
                                            'TransferOne', 'TransferTwo', 'TransferThree'
                                        ].map((oo, ii) => (
                                            <td key={ii} className={'fa-14 border text-center p-0'}>
                                                <input
                                                    onInput={onlynum}
                                                    className='cus-inpt border-0'
                                                    value={o[oo]}
                                                    onChange={e => handleInputChange(i, oo, e.target.value)}
                                                />
                                            </td>
                                        ))}
                                        <td className='border'>{NumberFormat(calculateRowSum(o))}</td>
                                        <td className='border p-0'>
                                            <IconButton color='success' size='small' onClick={() => saveActivity(o, 'POST')}>
                                                <Save className='fa-20' />
                                            </IconButton>
                                        </td>
                                    </tr>
                                ))}

                                {data.length > 0 && (
                                    <tr>
                                        <td className={'border fw-bold text-end'} colSpan={2}></td>
                                        <th colSpan={5} className={'fa-14 border text-center'}>
                                            {calTotal(5, 9)}
                                        </th>
                                        <th colSpan={3} className={'fa-14 border text-center'}>
                                            {calTotal(10, 12)}
                                        </th>
                                        <th colSpan={3} className={'fa-14 border text-center'}>
                                            {calTotal(13, 15)}
                                        </th>
                                        <th className={'fa-16 border text-center '} colSpan={2}>
                                            {data.reduce((sum, row) => sum + parseFloat(calculateRowSum(row)), 0)}
                                        </th>
                                    </tr>
                                )}

                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <datalist id='driverList'>
                {drivers.map((o, i) => <option key={i} value={o.DriverName} />)}
            </datalist>
        </>
    );
};


export default DriverActivities;
