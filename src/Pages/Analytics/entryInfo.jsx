import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, IconButton } from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { ISOString } from '../../Components/functions';
import DriverInfoComp from './driverComp';
import GodownInfo from './godownComp';
import DeliveryInfo from './deliveryComp';
import StaffInfo from './staffComp';

const DataEntryAbstract = () => {
    const [filter, setFilter] = useState({
        reqDate: ISOString(),
        reqLocation: 'MILL',
    });
    
    const [displayContent, setDisplayContent] = useState([
        {
            name: 'Driver Activities',
            isOpen: false,
        },
        {
            name: 'Godown Activities',
            isOpen: false,
        },
        {
            name: 'Delivery Activities',
            isOpen: false,
        },
        {
            name: 'Staff Activities',
            isOpen: false,
        },
    ]);

    const memoizedComponents = useMemo(() => [
        <DriverInfoComp reqDate={filter.reqDate} reqLocation={filter.reqLocation} />,
        <GodownInfo reqDate={filter.reqDate} reqLocation={filter.reqLocation} />,
        <DeliveryInfo reqDate={filter.reqDate} reqLocation={filter.reqLocation} />,
        <StaffInfo reqDate={filter.reqDate} reqLocation={filter.reqLocation} />,
    ], [filter.reqDate, filter.reqLocation]);

    useEffect(() => {
        setDisplayContent(pre => pre.map((item, index) => ({
            ...item,
            comp: memoizedComponents[index],
        })));
    }, [memoizedComponents]);

    const handleToggle = index => {
        setDisplayContent(prevDisplayContent =>
            prevDisplayContent.map((item, i) =>
                i === index ? { ...item, isOpen: !item.isOpen } : item
            )
        );
    };

    return (
        <>
            <div className="d-flex flex-wrap">
                <div className='d-flex flex-column p-1'>
                    <label className='mb-1'>DATE</label>
                    <input
                        type="date"
                        className='cus-inpt w-auto'
                        value={filter.reqDate}
                        onChange={e => setFilter(pre => ({ ...pre, reqDate: e.target.value }))}
                    />
                </div>
                <div className='d-flex flex-column p-1'>
                    <label className='mb-1'>LOCATION</label>
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

            {displayContent.map((item, index) => (
                <Card key={index} className='mt-2'>
                    <div
                        className="px-3 py-2 fa-17 fw-bold border-bottom d-flex justify-content-between align-items-center"
                        onClick={() => handleToggle(index)}
                        style={{ cursor: 'pointer' }}
                    >
                        <span>{item.name}</span>
                        <IconButton>
                            {item.isOpen ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                        </IconButton>
                    </div>
                    {item.isOpen && <CardContent>{item.comp}</CardContent>}
                </Card>
            ))}
        </>
    );
};

export default DataEntryAbstract;
