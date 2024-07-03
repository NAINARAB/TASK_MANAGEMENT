import React, { useEffect, useState } from 'react';
import api from '../../API';
import CardComp from './numCardComp';

const ContCard = ({ Value, Label }) => <CardComp Value={Value} Label={Label} />

const DriverInfoComp = ({reqDate, reqLocation}) => {
    const [activityData, setActivityData] = useState([]);
    const [driverBased, setDriverBased] = useState([]);

    useEffect(() => {
        fetch(`${api}driverActivities?reqDate=${reqDate}&reqLocation=${reqLocation}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setActivityData(data.data)
                }
            })
            .catch(e => console.error(e))
        fetch(`${api}driverActivities/tripBased?reqDate=${reqDate}&reqLocation=${reqLocation}`)
            .then(res => res.json())
            .then(data => setDriverBased(data.data))
            .catch(e => console.error(e))
    }, [reqDate, reqLocation])

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
            <div className="my-2">
                <div className='cus-grid text-dark'>
                    <ContCard Value={activityData?.length} Label={'DRIVERS'} />
                    <ContCard
                        Value={driverBased?.reduce((sum, obj) => {
                            let total = 0;
                            total += obj?.Trips?.length || 0
                            return total + sum;
                        }, 0)}
                        Label={'TRIPS'}
                    />
                    <ContCard Value={totalTonnageValue} Label={'TOTAL'} />
                    {Object.entries(categoryTotals).map(([objKey, objValue]) => <ContCard key={objKey} Value={objValue} Label={objKey} />)}
                </div>
            </div>
        </>
    )
}

export default DriverInfoComp;