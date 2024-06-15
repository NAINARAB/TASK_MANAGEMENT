import React, { useEffect, useState } from 'react';
import { convertToTimeObject, createAbbreviation, ISOString, onlynum } from '../../Components/functions';
import api from '../../API';
import { toast } from 'react-toastify'
import { Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from '@mui/material';
import { AccessTime, Edit } from '@mui/icons-material';


const DriverActivities = () => {
    const storage = JSON.parse(localStorage.getItem('user'));
    const splitCell = { display: 'flex', justifyContent: 'space-between' }
    const initialValue = {
        Id: '',
        ActivityDate: ISOString(),
        LocationDetails: 'MILL',
        DriverName: '',
        TripCategory: 'LRY SHED & LOCAL',
        TonnageValue: '',
        EventTime: '12:00',
        CreatedBy: storage.UserId,
    }
    const [activityData, setActivityData] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [inputValues, setInputValues] = useState(initialValue);
    const [reload, setReload] = useState(false);
    const [filter, setFilter] = useState({
        reqDate: ISOString(),
        reqLocation: 'MILL',
        dialog: false
    })

    useEffect(() => {
        fetch(`${api}driverActivities/drivers`)
            .then(res => res.json())
            .then(data => setDrivers(data.data))
            .catch(e => console.error(e))
    }, [reload])

    useEffect(() => {
        fetch(`${api}driverActivities?reqDate=${filter.reqDate}&reqLocation=${filter.reqLocation}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setActivityData(data.data)
                }
            })
            .catch(e => console.error(e))
    }, [reload, filter.reqDate, filter.reqLocation])

    const closeDialog = () => {
        setFilter(pre => ({ ...pre, dialog: false }));
        setInputValues(initialValue)
    }

    const saveActivity = () => {
        fetch(`${api}driverActivities`, {
            method: inputValues.Id ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(inputValues)
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    toast.success(data.message);
                    closeDialog()
                    setReload(!reload)
                } else {
                    toast.error(data.message)
                }
            }).catch(e => console.error(e))
    }

    const DriverDispComp = ({ obj }) => {

        const totalTonnage = obj?.LocationGroup.reduce((total, group) => {
            const groupTonnage = group.TripDetails.reduce((sum, trip) => sum + (trip.TonnageValue || 0), 0);
            return total + groupTonnage;
        }, 0);

        return (
            <tr>
                <td
                    style={{ verticalAlign: 'middle' }}
                    className='fa-14 fw-bold text-primary border rounded-4 text-center'
                >
                    {obj.DriverName}
                </td>
                {obj?.LocationGroup?.map((o, i) => (
                    <td key={i} className='border rounded-4 p-0' >

                        {/* <p className='border-bottom fw-bold fa-13 mb-0 text-center p-2'>{o?.TripCategory}</p> */}

                        <div className="table-responsive">
                            <table className="table mb-0">
                                <thead>
                                    <tr>
                                        {o?.TripDetails?.map((to, ti) => (
                                            <th className='fa-14 border-bottom border-end p-0' key={ti}>
                                                <div className='d-flex justify-content-between align-items-center p-1'>
                                                    <span>{createAbbreviation(o?.TripCategory)} - {ti + 1}</span>
                                                    <IconButton
                                                        size='small'
                                                        onClick={() => {
                                                            setInputValues(to);
                                                            setFilter(pre => ({ ...pre, dialog: true }))
                                                        }}
                                                    >
                                                        <Edit className='fa-16' />
                                                    </IconButton>
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {o?.TripDetails?.map((to, ti) => (
                                        <td className='border p-0' key={ti}>
                                            <div style={splitCell}>
                                                <p className='p-1 py-0 mb-0 fw-bold border-end text-primary w-100'>{to?.TonnageValue}</p>
                                                <p className='p-1 py-0 mb-0 w-100'><AccessTime className='fa-14' />{convertToTimeObject(to?.EventTime)}</p>
                                            </div>
                                        </td>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                    </td>
                ))}
                <td className='border' style={{ verticalAlign: 'middle' }}>
                    <h6 className=' my-auto text-center'>{totalTonnage}</h6>
                </td>
            </tr>
        )
    }

    const calculateCategoryTotals = (data) => {
        const categoryTotals = {};

        data.forEach(driver => {
            driver.LocationGroup.forEach(group => {
                if (!categoryTotals[group.TripCategory]) {
                    categoryTotals[group.TripCategory] = 0;
                }
                group.TripDetails.forEach(detail => {
                    categoryTotals[group.TripCategory] += detail.TonnageValue;
                });
            });
        });

        return categoryTotals;
    };

    const categoryTotals = calculateCategoryTotals(activityData);

    const totalTonnageValue = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);

    return (
        <>


            <Card>
                <div className="p-3 fa-16 fw-bold border-bottom d-flex justify-content-between">
                    <span>Driver Activities</span>
                    <Button variant='outlined' onClick={() => setFilter(pre => ({ ...pre, dialog: true }))}>Add Activity</Button>
                </div>

                <div className="d-flex p-2 px-3">
                    <div>
                        <label className='mb-1 w-100'>DATE</label>
                        <input
                            type="date"
                            className='cus-inpt w-auto'
                            value={filter.reqDate}
                            onChange={e => setFilter(pre => ({ ...pre, reqDate: e.target.value }))}
                        />
                    </div>
                    <div>
                        <label className='mb-1 w-100'>LOCATION</label>
                        <select
                            className='cus-inpt w-auto'
                            value={filter.reqLocation}
                            onChange={e => setFilter(pre => ({ ...pre, reqLocation: e.target.value }))}
                        >
                            <option value="MILL">MILL</option>
                            <option value="GODOWN">GODOWN</option>
                        </select>
                    </div>
                </div>

                <CardContent >
                    <div className="table-responsive">
                        <table className='table'>
                            <thead>
                                <tr>
                                    <th className='fa-14 border'>Driver Name</th>
                                    {activityData[0] && activityData[0]?.LocationGroup?.map((o, i) => (
                                        <th className='fa-14 border' key={i}>{o?.TripCategory}</th>
                                    ))}
                                    <th className='fa-14 border'>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activityData?.map((o, i) => <DriverDispComp key={i} obj={o} />)}
                                <tr>
                                    <td className='border'></td>
                                    {activityData[0] && activityData[0]?.LocationGroup?.map((o, i) => (
                                        <td className='fa-13 border text-center fw-bold' key={i}>{categoryTotals[o.TripCategory]}</td>
                                    ))}
                                    <td className='fa-14 fw-bold border text-primary text-center'>{totalTonnageValue}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <Dialog
                open={filter.dialog}
                onClose={closeDialog}
                fullWidth maxWidth='sm'
            >
                <DialogTitle>
                    {inputValues?.Id ? 'Modify Activity' : 'Add Driver Activity'}
                </DialogTitle>
                <DialogContent>
                    <div className="table-responsive">
                        <table className="table">
                            <tbody>
                                <tr>
                                    <td className='border-0' style={{ verticalAlign: 'middle' }}>Date</td>
                                    <td className='border-0' >
                                        <input
                                            type="date"
                                            value={inputValues.ActivityDate}
                                            className='cus-inpt'
                                            onChange={e => setInputValues(pre => ({ ...pre, ActivityDate: e.target.value }))}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td className='border-0' style={{ verticalAlign: 'middle' }}>Location</td>
                                    <td className='border-0' >
                                        <select
                                            value={inputValues.LocationDetails}
                                            onChange={e => setInputValues(pre => ({ ...pre, LocationDetails: e.target.value }))}
                                            className='cus-inpt'
                                        >
                                            <option value={'MILL'}>MILL</option>
                                            <option value={'GODOWN'}>GODOWN</option>
                                        </select>
                                    </td>
                                </tr>
                                <tr>
                                    <td className='border-0' style={{ verticalAlign: 'middle' }}>TYPE</td>
                                    <td className='border-0' >
                                        <select
                                            value={inputValues.TripCategory}
                                            onChange={e => setInputValues(pre => ({ ...pre, TripCategory: e.target.value }))}
                                            className='cus-inpt'
                                        >
                                            <option value={'LRY SHED & LOCAL'}>LRY SHED & LOCAL</option>
                                            <option value={'OTHER GODOWNS'}>OTHER GODOWNS</option>
                                            <option value={'TRANSFER'}>TRANSFER</option>
                                        </select>
                                    </td>
                                </tr>
                                <tr>
                                    <td className='border-0' style={{ verticalAlign: 'middle' }}>Driver Name</td>
                                    <td className='border-0' >
                                        <input
                                            value={inputValues.DriverName}
                                            type='search'
                                            list='driverList'
                                            className='cus-inpt'
                                            onChange={e => setInputValues(pre => ({ ...pre, DriverName: e.target.value }))}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td className='border-0' style={{ verticalAlign: 'middle' }}>Tonnage Value</td>
                                    <td className='border-0' >
                                        <input
                                            onInput={onlynum}
                                            value={inputValues.TonnageValue}
                                            className='cus-inpt'
                                            onChange={e => setInputValues(pre => ({ ...pre, TonnageValue: e.target.value }))}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td className='border-0' style={{ verticalAlign: 'middle' }}>Time</td>
                                    <td className='border-0' >
                                        <input
                                            type='time'
                                            value={inputValues.EventTime}
                                            className='cus-inpt'
                                            onChange={e => setInputValues(pre => ({ ...pre, EventTime: e.target.value }))}
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog}>Cancel</Button>
                    <Button onClick={saveActivity}>SUBMIT</Button>
                </DialogActions>
            </Dialog>

            <datalist id='driverList'>
                {drivers.map((o, i) => <option key={i} value={o.DriverName} />)}
            </datalist>
        </>
    )
}


export default DriverActivities;