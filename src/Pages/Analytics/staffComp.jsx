import React, { useEffect, useState } from 'react';
import api from '../../API';
import { ISOString, UTCTime } from '../../Components/functions';
import CardComp from './numCardComp';

const ContCard = ({ Value, Label }) => <CardComp Value={Value} Label={Label} />

const StaffInfo = ({ reqDate, reqLocation }) => {
    const [activityData, setActivityData] = useState([]);
    const [filter, setFilter] = useState({
        reqDate: ISOString(),
        reqLocation: 'MILL',
    })

    useEffect(() => {
        setFilter({ reqDate, reqLocation })
    }, [reqDate, reqLocation])

    useEffect(() => {
        fetch(`${api}staffActivities/staffBased?reqDate=${filter.reqDate}&reqLocation=${filter.reqLocation}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setActivityData(data.data)
                }
            })
            .catch(e => console.error(e))
    }, [filter.reqDate, filter.reqLocation])

    const categoryTotal = () => {
        let category = [];

        activityData?.forEach(obj => {
            obj?.Categories?.forEach(cat => {
                const catIndex = category.findIndex(o => o?.Category === cat?.Category);
                if (catIndex !== -1) {
                    category[catIndex] = {
                        ...category[catIndex],
                        Total: category[catIndex]?.Total + (cat?.StaffDetails?.Tonnage || 0)
                    }
                } else {
                    category.push({
                        Category: cat?.Category,
                        Total: (cat?.StaffDetails?.Tonnage || 0)
                    })
                }
            })
        })

        return category;
    }

    const overAllTotal = categoryTotal()?.reduce((sum, obj) => {
        let total = 0;
        total += obj?.Total
        return sum + total
    }, 0)

    return (
        <>
            <div className="my-2">
                <div className='cus-grid text-dark'>
                    <ContCard Value={activityData?.length || 0} Label={'Staffs'} />
                    {categoryTotal()?.map((o, i) => (
                        <ContCard Value={o?.Total} Label={o?.Category} key={i} />
                    ))}
                    <ContCard Value={overAllTotal} Label={'Total'} />
                </div>
            </div>
        </>
    )
}

export default StaffInfo;