import React, { useEffect, useState } from 'react';
import api from '../../API';
import { ISOString, UTCTime } from '../../Components/functions';
import CardComp from './numCardComp';

const ContCard = ({ Value, Label }) => <CardComp Value={Value} Label={Label} />

const DeliveryInfo = ({reqDate, reqLocation}) => {
    const [activityData, setActivityData] = useState([]);
    const [filter, setFilter] = useState({
        reqDate: ISOString(),
        reqLocation: 'MILL',
    })

    useEffect(() => {
        setFilter({reqDate, reqLocation})
    }, [reqDate, reqLocation])

    useEffect(() => {
        fetch(`${api}deliveryActivities/abstract?reqDate=${filter.reqDate}&reqLocation=${filter.reqLocation}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setActivityData(data.data)
                }
            })
            .catch(e => console.error(e))
    }, [filter.reqDate, filter.reqLocation])

    return (
        <>
            <div className="my-2">
                <div className='cus-grid text-dark'>
                    <ContCard Value={activityData[0]?.NotDelivery || 0} Label={'Not Delivery'} />
                    <ContCard Value={activityData[0]?.NotTaken || 0} Label={'NotTaken'} />
                    <ContCard Value={activityData[0]?.NotVerified || 0} Label={'NotVerified'} />
                    <ContCard Value={activityData[0]?.OverAllSales || 0} Label={'Sales'} />
                    <ContCard Value={activityData[0]?.EntryTime ? UTCTime(activityData[0]?.EntryTime) : '-'} Label={'Time'} />
                </div>
            </div>
        </>
    )
}

export default DeliveryInfo;