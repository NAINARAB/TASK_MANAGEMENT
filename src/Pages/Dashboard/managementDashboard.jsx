import { useEffect, useState } from "react"
import { groupData, ISOString, NumberFormat } from "../../Components/functions";
import { ShoppingCart } from "@mui/icons-material";
import { LuArrowUpWideNarrow } from "react-icons/lu";
import { HiOutlineCurrencyRupee } from "react-icons/hi";
import { IoReceiptOutline } from "react-icons/io5";
import { BsCartPlus } from "react-icons/bs";
import { PiHandCoinsFill } from "react-icons/pi";
import { FaCubesStacked } from "react-icons/fa6";
import { fetchLink } from "../../Components/fetchComponent";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import FilterableTable from '../../Components/filterableTable2';


const getIcons = (str) => {
    const iconArr = [
        {
            str: 'SALES',
            icon: <LuArrowUpWideNarrow style={{ fontSize: '80px' }} />,
        },
        {
            str: 'PURCHASE',
            icon: <ShoppingCart style={{ fontSize: '80px' }} />,
        },
        {
            str: 'RECEIPT',
            icon: <IoReceiptOutline style={{ fontSize: '80px' }} />,
        },
        {
            str: 'PAYMENT',
            icon: <HiOutlineCurrencyRupee style={{ fontSize: '80px' }} />,
        },
        {
            str: 'EXPENCES',
            icon: <PiHandCoinsFill style={{ fontSize: '80px' }} />
        },
        {
            str: 'PURCHASE ORDER',
            icon: <BsCartPlus style={{ fontSize: '80px' }} />,
        },
        {
            str: 'STOCK VALUE',
            icon: <FaCubesStacked style={{ fontSize: '70px' }} />,
        },
    ]

    return iconArr.find(o => str === o.str)?.icon || <></>
}


const CardComp = ({ title, icon, firstVal, secondVal, classCount, onClick }) => {
    return (
        <>
            <div className={`col-xxl-3 col-lg-4 col-md-6 col-sm-12 p-2`}>
                <div onClick={onClick} className={"coloredDiv d-flex align-items-center text-light cus-shadow coloredDiv" + classCount}>
                    <div className="flex-grow-1 p-3">
                        <h5 >{title}</h5>
                        <h3 className="fa-16 text-end pe-3">
                            <span style={{ fontSize: '30px' }}>{firstVal ? firstVal : 0} </span>
                            {secondVal && '(' + secondVal + ')'}
                        </h3>
                    </div>
                    {icon}
                </div>
            </div>
        </>
    )
}


const ManagementDashboard = () => {
    const storage = JSON.parse(localStorage.getItem('user'));
    const UserAccess = Number(storage?.UserTypeId) === 2 || Number(storage?.UserTypeId) === 0 || Number(storage?.UserTypeId) === 1;

    const [mangementReport, setMangementReport] = useState([]);
    const [secRow, setSecRow] = useState([]);
    const [theredRow, setTheredRow] = useState([]);

    const [popUpDetails, setPopUpDetails] = useState({
        salesDetails: [],
    });

    const [popUpDialogs, setPopUpDialogs] = useState({
        salesDetails: false,
    })

    const [filter, setFilter] = useState({
        date: ISOString(),
    });

    useEffect(() => {
        if (UserAccess && storage.Company_id) {
            fetchLink({
                address: `dashboard/erp/dashboardData?Fromdate=${filter?.date}&Company_Id=${storage.Company_id}`
            })
                .then(data => {
                    if (data.success) {
                        setMangementReport(data?.data[0])
                        setSecRow(data?.data[1])
                        setTheredRow(data?.data[2]);
                    }
                })
                .catch(e => console.error(e))
        }
    }, [UserAccess, filter.date]);

    useEffect(() => {
        if (UserAccess) {
            fetchLink({
                address: `dashboard/salesInfo?Fromdate=${filter?.date}&Todate=${filter?.date}`,
                headers: {
                    'Db': storage?.Company_id
                }
            }).then(data => {
                if (data.success) {
                    setPopUpDetails(pre => ({
                        ...pre,
                        salesDetails: data.data ?? []
                    }));
                } else {
                    setPopUpDetails(pre => ({ ...pre, salesDetails: []}));
                }
            }).catch(e => console.error(e))
        }
    }, [filter.date]);

    const salesDetailsGrouped = groupData(popUpDetails?.salesDetails, 'Party_Group');

    return (
        <>
            <input
                type="date"
                className="cus-inpt w-auto m-1"
                value={filter.date}
                onChange={e => setFilter(pre => ({ ...pre, date: e.target.value }))}
            />

            <div className="p-1 row">
                {theredRow?.map((o, i) => (
                    <CardComp
                        key={i}
                        icon={getIcons('STOCK VALUE')}
                        title={'STOCK VALUE'}
                        classCount={16}
                        firstVal={o?.Stock_Value ? NumberFormat(parseInt(o?.Stock_Value)) : 0}
                    />
                ))}
                {mangementReport?.map((o, i) => (
                    <CardComp
                        key={i}
                        title={o?.Trans_Type}
                        onClick={() => {
                            switch (o?.Trans_Type) {
                                case 'SALES':
                                    setPopUpDialogs(pre => ({ ...pre, salesDetails: true }));
                                    break;
                                default:
                                    break;
                            }
                        }}
                        icon={o?.Trans_Type ? getIcons(o?.Trans_Type) : undefined}
                        classCount={i + 7}
                        firstVal={o?.Trans_Amount ? NumberFormat(parseInt(o?.Trans_Amount)) : 0}
                        secondVal={o?.Trans_Count ? NumberFormat(o?.Trans_Count) : 0}
                    />
                ))}
                {secRow?.map((o, i) => (
                    <CardComp
                        key={i}
                        title={'EXPENCES'}
                        icon={getIcons('EXPENCES')}
                        classCount={19}
                        firstVal={o?.Total_Cost_Vlaue ? NumberFormat(o?.Total_Cost_Vlaue) : 0}
                    />
                ))}
            </div>

            <Dialog
                open={popUpDialogs.salesDetails}
                onClose={() => setPopUpDialogs(pre => ({ ...pre, salesDetails: false }))}
                fullWidth maxWidth='sm'
            >
                <DialogTitle>
                    <span>
                        <h4 className='d-flex justify-content-between flex-wrap'>
                            <span>Sales Details</span>
                            <span>
                                {NumberFormat(
                                    popUpDetails?.salesDetails?.reduce((sum, item) => sum += Number(item?.Amount), 0)
                                )}
                            </span>
                        </h4>
                    </span>
                </DialogTitle>
                <DialogContent>
                    {/* <DisplayArrayData 
                        dataArray={popUpDetails.salesDetails} 
                        columns={Object.keys(popUpDetails?.salesDetails[0] ?? {}).map(head => ({
                            Column_Name: head,
                            Data_Type: 'string'
                        }))} 
                    /> */}
                    <FilterableTable 
                        dataArray={salesDetailsGrouped}
                        columns={[
                            {
                                Field_Name: 'Party_Group',
                                Fied_Data: 'string',
                                isVisible: 1,
                            },
                            {
                                isCustomCell: true,
                                ColumnHeader: 'Total Amount',
                                Cell: ({ row }) => NumberFormat(row?.groupedData?.reduce((acc, item) => acc + Number(item?.Amount), 0)),
                                isVisible: 1,
                            },
                        ]}
                        disablePagination={true}
                        EnableSerialNumber
                        isExpendable={true}
                        expandableComp={({ row }) => (
                            <FilterableTable 
                                dataArray={row?.groupedData ?? []}
                                columns={[
                                    {
                                        Field_Name: 'Payment_Mode',
                                        Fied_Data: 'string',
                                        isVisible: 1,
                                    },
                                    {
                                        Field_Name: 'Amount',
                                        Fied_Data: 'number',
                                        isVisible: 1,
                                    },
                                ]}
                                disablePagination={true}
                            />
                        )}
                    />
                    {/* <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    {Object.keys(popUpDetails?.salesDetails[0] ?? {}).map(head => (
                                        <th className="fa-14 border ">{head}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    {Object.keys(popUpDetails.salesDetails).map(head => (
                                        <th className="fa-14 border ">{head}</th>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div> */}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPopUpDialogs(pre => ({ ...pre, salesDetails: false }))}></Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default ManagementDashboard;