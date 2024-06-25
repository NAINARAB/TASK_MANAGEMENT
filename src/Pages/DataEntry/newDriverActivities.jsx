import React, { useEffect, useState, useContext } from 'react';
import { convertToTimeObject, createAbbreviation, isEqualNumber, ISOString, NumberFormat, onlynum } from '../../Components/functions';
import api from '../../API';
import { toast } from 'react-toastify'
import { Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { MyContext } from '../../Components/context/contextProvider';


const DriverActivities = () => {
    const storage = JSON.parse(localStorage.getItem('user'));
    const { contextObj } = useContext(MyContext);

    const initialValue = {
        Id: '',
        ActivityDate: ISOString(),
        LocationDetails: 'MILL',
        DriverName: '',
        TripCategory: 'LRY SHED & LOCAL',
        TonnageValue: '',
        TripNumber: 1,
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

        const newRowTotal = obj?.LocationGroup?.reduce((total, group) => {
            const groupTonnage = group?.TripDetails?.reduce((grpSum, trip) => {
                const tripTotal = trip?.Trips?.reduce((sum, trip) => sum + (trip?.TonnageValue || 0), 0);
                return tripTotal + grpSum;
            }, 0);
            return total + groupTonnage;
        }, 0);

        return (
            <tr>
                <td
                    style={{ verticalAlign: 'middle' }}
                    className='fa-13 fw-bold text-primary border rounded-4 text-center'
                >
                    {obj.DriverName}
                </td>
                {obj?.LocationGroup?.map(o => o?.TripDetails?.map((oo, ii) => (
                    <td key={ii} className='border rounded-4 p-0' >

                        {oo?.Trips.map((ooo, iii) => (
                            <div
                                className='d-flex justify-content-between p-1 cellHover'
                                key={iii}
                                onClick={
                                    isEqualNumber(contextObj?.Edit_Rights, 1)
                                        ? () => {
                                            setInputValues(ooo);
                                            setFilter(pre => ({ ...pre, dialog: true }))
                                        }
                                        : () => { }
                                }
                            >
                                <span className='p-1 fa-14 fw-bold text-primary'>{NumberFormat(ooo?.TonnageValue)}</span>
                                <span className='p-1 fa-13'>{ooo?.EventTime ? convertToTimeObject(ooo?.EventTime) : '-'}</span>
                            </div>
                        ))}

                    </td>
                )))}
                <td className='border' style={{ verticalAlign: 'middle' }}>
                    <h6 className=' my-auto text-center'>{NumberFormat(newRowTotal)}</h6>
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
                    categoryTotals[group.TripCategory] += detail?.Trips?.reduce((sum, obj) => sum + (obj?.TonnageValue || 0), 0);
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
                    {isEqualNumber(contextObj?.Add_Rights, 1) && (
                        <Button variant='outlined' onClick={() => setFilter(pre => ({ ...pre, dialog: true }))}>Add Activity</Button>
                    )}
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
                                        <th className='fa-14 border text-center' key={i} colSpan={o?.TripDetails?.length}>{o?.TripCategory}</th>
                                    ))}
                                    <th className='border'></th>
                                </tr>
                                <tr>
                                    <th className='border'></th>
                                    {activityData[0] && activityData[0]?.LocationGroup?.map(o => o?.TripDetails?.map((oo, ii) => (
                                        <th className='fa-14 border text-center' key={ii}>
                                            {createAbbreviation(o?.TripCategory)}-{oo.TripNumber}
                                        </th>
                                    )))}
                                    <th className='fa-14 border text-center'>Total</th>
                                </tr>
                            </thead>

                            <tbody>

                                {activityData?.map((o, i) => <DriverDispComp key={i} obj={o} />)}

                                <tr>
                                    <td className='border'></td>
                                    {activityData[0] && activityData[0]?.LocationGroup?.map((o, i) => (
                                        <td
                                            className='fa-13 border text-center fw-bold'
                                            key={i}
                                            colSpan={o?.TripDetails?.length}
                                        >
                                            {categoryTotals[o.TripCategory] ? NumberFormat(categoryTotals[o.TripCategory]) : '-'}
                                        </td>
                                    ))}
                                    <td className='fa-14 fw-bold border text-primary text-center'>{NumberFormat(totalTonnageValue)}</td>
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
                <form onSubmit={e => {
                    e.preventDefault();
                    saveActivity();
                }}>
                    <DialogContent>
                        <div className="table-responsive">
                            <table className="table">
                                <tbody>
                                    <tr>
                                        <td className='border-0' style={{ verticalAlign: 'middle' }}>Date</td>
                                        <td className='border-0' >
                                            <input
                                                type="date"
                                                value={inputValues?.ActivityDate}
                                                className='cus-inpt'
                                                onChange={e => setInputValues(pre => ({ ...pre, ActivityDate: e.target.value }))}
                                                required
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='border-0' style={{ verticalAlign: 'middle' }}>Location</td>
                                        <td className='border-0' >
                                            <select
                                                value={inputValues?.LocationDetails}
                                                onChange={e => setInputValues(pre => ({ ...pre, LocationDetails: e.target.value }))}
                                                className='cus-inpt'
                                                required
                                            >
                                                <option value={'MILL'}>MILL</option>
                                                <option value={'GODOWN'}>GODOWN</option>
                                            </select>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='border-0' style={{ verticalAlign: 'middle' }}>Driver Name</td>
                                        <td className='border-0' >
                                            <input
                                                value={inputValues?.DriverName}
                                                type='search'
                                                list='driverList'
                                                required
                                                className='cus-inpt'
                                                placeholder='Type or Search Driver name'
                                                onChange={e => setInputValues(pre => ({ ...pre, DriverName: e.target.value }))}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='border-0' style={{ verticalAlign: 'middle' }}>Trip Number</td>
                                        <td className='border-0' >
                                            <input
                                                value={inputValues?.TripNumber}
                                                className='cus-inpt'
                                                type='number'
                                                required
                                                min={1}
                                                placeholder='Trip Count Number'
                                                onChange={e => setInputValues(pre => ({ ...pre, TripNumber: e.target.value }))}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='border-0' style={{ verticalAlign: 'middle' }}>Tonnage Value</td>
                                        <td className='border-0' >
                                            <input
                                                value={inputValues?.TonnageValue}
                                                className='cus-inpt'
                                                onInput={onlynum}
                                                required
                                                onChange={e => setInputValues(pre => ({ ...pre, TonnageValue: e.target.value }))}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='border-0' style={{ verticalAlign: 'middle' }}>Time</td>
                                        <td className='border-0' >
                                            <input
                                                type='time'
                                                value={inputValues?.EventTime}
                                                required
                                                className='cus-inpt'
                                                onChange={e => setInputValues(pre => ({ ...pre, EventTime: e.target.value }))}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='border-0' style={{ verticalAlign: 'middle' }}>TYPE</td>
                                        <td className='border-0' >
                                            <select
                                                value={inputValues?.TripCategory}
                                                onChange={e => setInputValues(pre => ({ ...pre, TripCategory: e.target.value }))}
                                                className='cus-inpt'
                                                required
                                            >
                                                <option value={'LRY SHED & LOCAL'}>LRY SHED & LOCAL</option>
                                                <option value={'OTHER GODOWNS'}>OTHER GODOWNS</option>
                                                <option value={'TRANSFER'}>TRANSFER</option>
                                            </select>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={closeDialog} type='button'>Cancel</Button>
                        <Button type='submit'>SUBMIT</Button>
                    </DialogActions>
                </form>
            </Dialog>

            <datalist id='driverList'>
                {drivers.map((o, i) => <option key={i} value={o.DriverName} />)}
            </datalist>
        </>
    )
}


export default DriverActivities;