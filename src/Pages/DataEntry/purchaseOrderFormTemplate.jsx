import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Card, CardContent } from '@mui/material';
import { useEffect, useState } from 'react';
import Select from 'react-select';
import { customSelectStyles } from '../../Components/tablecolumn';
import RequiredStar from '../../Components/requiredStar';
import { fetchLink } from '../../Components/fetchComponent';
import { isEqualNumber, ISOString, isValidObject } from '../../Components/functions';
import { Delete, Add, Save, ClearAll } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify'
const storage = JSON.parse(localStorage.getItem('user'));

const initialOrderDetailsValue = {
    Id: '',
    LoadingDate: '',
    TradeConfirmDate: '',
    OwnerName: '',
    BrokerName: '',
    PartyName: '',
    PartyAddress: '',
    PaymentCondition: '',
    Remarks: '',
    OrderStatus: 'New Order',
    CreatedBy: storage?.UserId,
}

const initialItemDetailsValue = {
    Id: '',
    Sno: '',
    OrderId: '',
    ItemId: '',
    ItemName: '',
    Weight: '',
    Units: '',
    Rate: '',
    DeliveryLocation: '',
    Discount: '',
    QualityCondition: ''
}

const initialDeliveryDetailsValue = {
    Id: '',
    Sno: '',
    OrderId: '',
    Location: '',
    TransporterIndex: '',
    ArrivalDate: '',
    ItemId: '',
    ItemName: '',
    Concern: '',
    BillNo: '',
    BillDate: '',
    Quantity: '',
    Weight: '',
    Units: '',
    BatchLocation: '',
    PendingQuantity: '',
    CreatedBy: storage?.UserId
}

const initialTranspoterDetailsValue = {
    Id: '',
    OrderId: '',
    Loading_Load: '',
    Loading_Empty: '',
    Unloading_Load: '',
    Unloading_Empty: '',
    EX_SH: '',
    DriverName: '',
    VehicleNo: '',
    PhoneNumber: '',
    CreatedBy: storage?.UserId,
}

const PurchaseOrderFormTemplate = ({ loadingOn, loadingOff }) => {
    const storage = JSON.parse(localStorage.getItem('user'));
    const nav = useNavigate();
    const location = useLocation();
    const stateDetails = location.state;
    const tdStyle = 'border fa-14 vctr';
    const inputStyle = 'cus-inpt p-2';

    const [products, setProducts] = useState([]);
    const [OrderItemsArray, setOrderItemArray] = useState([])
    const [DeliveryArray, setDeliveryArray] = useState([]);
    const [TranspoterArray, setTranspoterArray] = useState([]);

    const [OrderDetails, setOrderDetails] = useState(initialOrderDetailsValue);
    const [orderItemsInput, setOrderItemsInput] = useState(initialItemDetailsValue);
    const [deliveryInput, setDeliveryInput] = useState(initialDeliveryDetailsValue);
    const [transpoterInput, setTransportInput] = useState(initialTranspoterDetailsValue);
    const isEdit = OrderDetails?.Id ? true : false;

    const [dialogs, setDialogs] = useState({
        itemsDialog: false,
        deliveryDialog: false,
        transporterDialog: false
    })

    const [options, setOptions] = useState({
        PurchaseOrderOnly: true,
        PurchaseOderWithDelivery: false,
        DeliveryEntry: false,
    })

    useEffect(() => {
        fetchLink({
            address: `masters/products?Company_Id=${storage?.Company_id}`
        }).then(data => {
            if (data.success) {
                setProducts(data.data);
            } else {
                setProducts([]);
            }
        }).catch(e => console.error(e))
    }, [])

    useEffect(() => {

        if (!isValidObject(stateDetails) || !isValidObject(stateDetails.OrderDetails)) return;

        const LoadingDate = stateDetails.OrderDetails?.LoadingDate ? ISOString(stateDetails.OrderDetails?.LoadingDate) : '';
        const TradeConfirmDate = stateDetails.OrderDetails?.TradeConfirmDate ? ISOString(stateDetails.OrderDetails?.TradeConfirmDate) : '';
        const editPage = stateDetails?.editPage;

        setOrderDetails({
            ...stateDetails.OrderDetails,
            OrderStatus: stateDetails.OrderDetails?.OrderStatus ?? 'New Order',
            LoadingDate,
            TradeConfirmDate,
            CreatedBy: storage?.UserId
        });

        setOrderItemArray(stateDetails?.OrderItemsArray ?? []);
        setDeliveryArray(stateDetails?.DeliveryArray ?? []);
        setTranspoterArray(stateDetails?.TranspoterArray ?? []);

        const isFound = Object.keys(options).findIndex(key => key === editPage);

        if (isFound !== -1) {
            setOptions(pre => {
                return Object.fromEntries(
                    Object.entries(pre).map(([key, value]) => [key, key === editPage ? true : false])
                );
            });
        } else {
            setOptions({
                PurchaseOrderOnly: false,
                PurchaseOderWithDelivery: true,
                DeliveryEntry: false,
            })
        }

    }, [stateDetails]);

    const handleRadioChange = (event) => {
        const { id } = event.target;

        setOptions({
            PurchaseOrderOnly: id === 'PurchaseOrderOnly',
            PurchaseOderWithDelivery: id === 'PurchaseOderWithDelivery',
            DeliveryEntry: id === 'DeliveryEntry',
        });
    };

    const changeItems = (itemDetail) => {
        const productIndex = OrderItemsArray.findIndex(item => isEqualNumber(item.Item_Id, itemDetail.Item_Id));
        if (productIndex !== -1) {
            const updatedValues = [...OrderItemsArray];
            Object.entries(itemDetail).forEach(([key, value]) => {
                updatedValues[productIndex][key] = value;
            });
            setOrderItemArray(updatedValues);
        } else {
            setOrderItemArray(prevValues => [...prevValues, { ...itemDetail }]);
        }
        setOrderItemsInput(initialItemDetailsValue);
        setDialogs(pre => ({ ...pre, itemsDialog: false }));
    }

    const changeDeliveryInfo = (details) => {
        setDeliveryArray(prevValues => [...prevValues, { ...details }]);
        setDeliveryInput(initialDeliveryDetailsValue);
        setDialogs(pre => ({ ...pre, deliveryDialog: false }));
    }

    const changeTransporterInfo = (details) => {
        setTranspoterArray(prevValues => [...prevValues, { ...details }]);
        setTransportInput(initialTranspoterDetailsValue);
        setDialogs(pre => ({ ...pre, transporterDialog: false }));
    }

    const postOrder = () => {
        if (loadingOn) {
            loadingOn();
        }
        fetchLink({
            address: `dataEntry/purchaseOrderEntry`,
            method: isEdit ? 'PUT' : 'POST',
            bodyData: {
                OrderDetails: OrderDetails,
                OrderItems: options.DeliveryEntry ? [] : OrderItemsArray,
                DelivdryDetails: options.PurchaseOrderOnly ? [] : DeliveryArray,
                TranspoterDetails: options.PurchaseOrderOnly ? [] : TranspoterArray
            }
        }).then(data => {
            if (data?.success) {
                setOrderDetails(initialOrderDetailsValue);
                setOrderItemArray([]);
                setDeliveryArray([]);
                setTranspoterArray([]);
                toast.success(data?.message)
            } else {
                toast.error(data?.message)
            }
        }).catch(e => console.error(e)).finally(() => {
            if (loadingOff) {
                loadingOff();
            }
        });
    }

    // const saveDeliveryDetails = () => {
    //     if (loadingOn) {
    //         loadingOn();
    //     }
    //     if (OrderDetails.Id) {
    //         fetchLink({
    //             address: `dataEntry/purchaseOrderEntry/ArrivalUpdate`,
    //             method: 'PUT',
    //             bodyData: {
    //                 OrderDetails: OrderDetails,
    //                 DelivdryDetails: DeliveryArray,
    //                 TranspoterDetails: TranspoterArray
    //             }
    //         }).then(data => {
    //             if (data?.success) {
    //                 setOrderDetails(initialOrderDetailsValue);
    //                 setOrderItemArray([]);
    //                 setDeliveryArray([]);
    //                 setTranspoterArray([]);
    //             }
    //         }).catch(e => console.error(e)).finally(() => {
    //             if (loadingOff) {
    //                 loadingOff();
    //             }
    //         });
    //     }
    // }

    return (
        <Card>
            <CardContent>

                <div className="d-flex flex-wrap">
                    <h5 className='flex-grow-1'>Purchase Order</h5>
                    <Button variant='outlined' onClick={() => nav('/dataEntry/purchaseOrder')}>back</Button>
                </div>

                {!OrderDetails.Id && (
                    <form onSubmit={(e) => e.preventDefault()}>
                        <div className="d-flex justify-content-center flex-wrap p-2 mb-2">
                            <div className="form-check">
                                <input
                                    className="form-check-input shadow-none"
                                    style={{ padding: '0.7em' }}
                                    type="radio"
                                    name="radioType"
                                    id="PurchaseOrderOnly"
                                    checked={options.PurchaseOrderOnly}
                                    disabled={OrderDetails.Id ? true : false}
                                    onChange={handleRadioChange}
                                />
                                <label
                                    className="form-check-label p-1 me-3"
                                    htmlFor="PurchaseOrderOnly"
                                >
                                    Purchase Order
                                </label>
                            </div>

                            {/* <div className="form-check">
                                <input
                                    className="form-check-input shadow-none"
                                    style={{ padding: '0.7em' }}
                                    type="radio"
                                    name="radioType"
                                    id="DeliveryEntry"
                                    checked={options.DeliveryEntry}
                                    disabled={OrderDetails.Id ? true : false}
                                    onChange={handleRadioChange}
                                />
                                <label
                                    className="form-check-label p-1 me-3"
                                    htmlFor="DeliveryEntry"
                                >
                                    Arrival Details
                                </label>
                            </div> */}

                            <div className="form-check">
                                <input
                                    className="form-check-input shadow-none"
                                    style={{ padding: '0.7em' }}
                                    type="radio"
                                    name="radioType"
                                    id="PurchaseOderWithDelivery"
                                    checked={options.PurchaseOderWithDelivery}
                                    disabled={OrderDetails.Id ? true : false}
                                    onChange={handleRadioChange}
                                />
                                <label
                                    className="form-check-label p-1 me-3"
                                    htmlFor="PurchaseOderWithDelivery"
                                >
                                    Order With Arrival
                                </label>
                            </div>
                        </div>
                    </form>
                )}

                <div className="table-responsive">

                    {(options.PurchaseOderWithDelivery && OrderDetails.Id) && (
                        <>
                            <label>Order ID</label>:
                            <input
                                value={OrderDetails.Id}
                                disabled
                                className={inputStyle + ' w-auto ms-2 mb-2'}
                                onChange={e => setOrderDetails(pre => ({ ...pre, Id: e.target.value }))}
                                placeholder='Ex: 233'
                            />
                        </>
                    )}

                    {/* General Info */}
                    <table className="table m-0">
                        <tbody>
                            <tr>
                                <td className={tdStyle + ' text-primary fw-bold bg-light'} >
                                    ORDER DETAILS
                                </td>
                                <td className={tdStyle + ' text-primary text-end fw-bold bg-light'} >
                                    PARTY DETAILS
                                </td>
                            </tr>
                            <tr>
                                <td className={tdStyle + ' p-0'}>
                                    <table className="table m-0 border-0">
                                        <tbody>
                                            <tr>
                                                <td className={tdStyle}>Loading Date</td>
                                                <td className={tdStyle + ' p-0'}>
                                                    <input
                                                        type="date"
                                                        className={inputStyle + ' border-0'}
                                                        value={OrderDetails.LoadingDate}
                                                        onChange={e => setOrderDetails(pre => ({ ...pre, LoadingDate: e.target.value }))}
                                                    />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className={tdStyle}>Trade Confirm Date</td>
                                                <td className={tdStyle + ' p-0'}>
                                                    <input
                                                        type="date"
                                                        className={inputStyle + ' border-0'}
                                                        value={OrderDetails.TradeConfirmDate}
                                                        onChange={e => setOrderDetails(pre => ({ ...pre, TradeConfirmDate: e.target.value }))}
                                                    />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className={tdStyle}>Owner Name</td>
                                                <td className={tdStyle + ' p-0'}>
                                                    <input
                                                        className={inputStyle + ' border-0'}
                                                        value={OrderDetails.OwnerName}
                                                        onChange={e => setOrderDetails(pre => ({ ...pre, OwnerName: e.target.value }))}
                                                    />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className={tdStyle}>Broker Name</td>
                                                <td className={tdStyle + ' p-0'}>
                                                    <input
                                                        className={inputStyle + ' border-0'}
                                                        value={OrderDetails.BrokerName}
                                                        onChange={e => setOrderDetails(pre => ({ ...pre, BrokerName: e.target.value }))}
                                                    />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className={tdStyle}>Order Status</td>
                                                <td className={tdStyle + ' p-0'}>
                                                    <select
                                                        className={inputStyle + ' border-0'}
                                                        value={OrderDetails?.OrderStatus}
                                                        onChange={e => setOrderDetails(pre => ({ ...pre, OrderStatus: e.target.value }))}
                                                    >
                                                        <option value="New Order">New Order</option>
                                                        <option value="On Process">On Process</option>
                                                        <option value="Completed">Completed</option>
                                                        <option value="Canceled">Canceled</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                                <td className={tdStyle}>
                                    <div className="d-flex flex-wrap bg-white">
                                        <span className='flex-grow-1 p-2'>
                                            <h6>Party Name</h6>
                                            <input
                                                className={inputStyle + ' mb-2'}
                                                value={OrderDetails.PartyName}
                                                onChange={e => setOrderDetails(pre => ({ ...pre, PartyName: e.target.value }))}
                                            /><br />

                                            <h6>Party Address</h6>
                                            <textarea
                                                className={inputStyle + ' mb-2'}
                                                rows={3}
                                                value={OrderDetails.PartyAddress}
                                                onChange={e => setOrderDetails(pre => ({ ...pre, PartyAddress: e.target.value }))}
                                            />
                                        </span>

                                        <span className='p-2'>
                                            <h6>Payment Condition</h6>
                                            <textarea
                                                className={inputStyle}
                                                rows={2}
                                                value={OrderDetails.PaymentCondition}
                                                onChange={e => setOrderDetails(pre => ({ ...pre, PaymentCondition: e.target.value }))}
                                            />
                                            <h6>Remarks</h6>
                                            <textarea
                                                className={inputStyle}
                                                rows={2}
                                                value={OrderDetails.Remarks}
                                                onChange={e => setOrderDetails(pre => ({ ...pre, Remarks: e.target.value }))}
                                            />
                                        </span>
                                    </div>
                                </td>
                            </tr>

                            <tr>
                                <td className={'p-3'} colSpan={2}></td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Item Details */}
                    {(options.PurchaseOrderOnly || options.PurchaseOderWithDelivery) && (!options.DeliveryEntry) && (
                        <table className="table m-0">
                            <thead>
                                <tr>
                                    <td className={tdStyle + ' text-primary fw-bold bg-light'} colSpan={6}>
                                        ORDER ITEMS
                                    </td>
                                    <td className={tdStyle + ' text-end bg-light p-0'}>
                                        <Button
                                            startIcon={<Add />}
                                            varient='outlined'
                                            onClick={() => setDialogs(pre => ({ ...pre, itemsDialog: true }))}
                                        >Add Product</Button>
                                    </td>
                                </tr>
                                <tr>
                                    <th className={tdStyle + ' text-center'}>SNo</th>
                                    <th className={tdStyle + ' text-center'}>Item Name</th>
                                    <th className={tdStyle + ' text-center'}>Tonnage</th>
                                    <th className={tdStyle + ' text-center'}>
                                        Rate <br />
                                        Deliver/Spot
                                    </th>
                                    <th className={tdStyle + ' text-center'}>Discount</th>
                                    <th className={tdStyle + ' text-center'}>Quality Condition</th>
                                    <th className={tdStyle + ' text-center'}>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {OrderItemsArray.map((o, i) => (
                                    <tr key={i}>
                                        <td className={tdStyle}>{i + 1}</td>
                                        <td className={tdStyle}>{o?.ItemName}</td>
                                        <td className={tdStyle}>{o?.Weight + ' ' + o?.Units}</td>
                                        <td className={tdStyle}>{o?.Rate}</td>
                                        <td className={tdStyle}>{o?.Discount}</td>
                                        <td className={tdStyle}>{o?.QualityCondition}</td>
                                        <td className={tdStyle + ' p-0 text-center'}>
                                            <IconButton
                                                onClick={() => {
                                                    setOrderItemArray(prev => {
                                                        return prev.filter((_, index) => index !== i);
                                                    });
                                                }}
                                                size='small'
                                            >
                                                <Delete color='error' />
                                            </IconButton>
                                        </td>
                                    </tr>
                                ))}

                                <tr>
                                    <td className={'p-3'} colSpan={7}></td>
                                </tr>
                            </tbody>
                        </table>
                    )}

                    {(options.PurchaseOderWithDelivery || options.DeliveryEntry) && (
                        <>
                            {/* TRANSPOTER DETAILS */}
                            <table className="table m-0">
                                <thead>
                                    <tr>
                                        <td className={tdStyle + ' text-primary fw-bold bg-light'} colSpan={9}>
                                            OTHER DETAILS
                                        </td>
                                        <td className={tdStyle + ' text-end bg-light p-0'}>
                                            <Button
                                                startIcon={<Add />}
                                                varient='outlined'
                                                onClick={() => setDialogs(pre => ({ ...pre, transporterDialog: true }))}
                                            >Add Transporter</Button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th className={tdStyle + ' text-center'} rowSpan={2}>SNo</th>
                                        <th className={tdStyle + ' text-center'} colSpan={2}>Loading Wt</th>
                                        <th className={tdStyle + ' text-center'} colSpan={2}>Unloading Wt</th>
                                        <th className={tdStyle + ' text-center'}>Weight</th>
                                        <th className={tdStyle + ' text-center'} colSpan={3}>Transport Details</th>
                                        <th className={tdStyle + ' text-center'} rowSpan={2}>Action</th>
                                    </tr>
                                    <tr>
                                        <th className={tdStyle + ' text-center'}>Load</th>
                                        <th className={tdStyle + ' text-center'}>Empty</th>
                                        <th className={tdStyle + ' text-center'}>Load</th>
                                        <th className={tdStyle + ' text-center'}>Empty</th>
                                        <th className={tdStyle + ' text-center'}>EX / SH</th>
                                        <th className={tdStyle + ' text-center'}>Name</th>
                                        <th className={tdStyle + ' text-center'}>Vehicle No</th>
                                        <th className={tdStyle + ' text-center'}>Phone Number</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {TranspoterArray.map((o, i) => (
                                        <tr key={i}>
                                            <td className={tdStyle}>{i + 1}</td>
                                            <td className={tdStyle}>{o?.Loading_Load}</td>
                                            <td className={tdStyle}>{o?.Loading_Empty}</td>
                                            <td className={tdStyle}>{o?.Unloading_Load}</td>
                                            <td className={tdStyle}>{o?.Unloading_Empty}</td>
                                            <td className={tdStyle}>{o?.EX_SH}</td>
                                            <td className={tdStyle}>{o?.DriverName}</td>
                                            <td className={tdStyle}>{o?.VehicleNo}</td>
                                            <td className={tdStyle}>{o?.PhoneNumber}</td>
                                            <td className={tdStyle + ' p-0 text-center'}>
                                                <IconButton
                                                    onClick={() => {
                                                        setTranspoterArray(prev => {
                                                            return prev.filter((_, index) => index !== i);
                                                        });
                                                    }}
                                                    size='small'
                                                >
                                                    <Delete color='error' />
                                                </IconButton>
                                            </td>
                                        </tr>
                                    ))}
                                    <tr>
                                        <td className={tdStyle + ' p-3'} colSpan={10}></td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* Delivery Details */}
                            <table className="table m-0">
                                <thead>
                                    <tr>
                                        <td className={tdStyle + ' text-primary fw-bold bg-light'} colSpan={11}>DELIVERY DETAILS</td>
                                        <td className={tdStyle + ' text-end bg-light p-0'}>
                                            <Button
                                                startIcon={<Add />}
                                                varient='outlined'
                                                disabled={TranspoterArray.length === 0}
                                                onClick={() => setDialogs(pre => ({ ...pre, deliveryDialog: true }))}
                                            >Add Delivery</Button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th className={tdStyle + ' text-center'}>SNo</th>
                                        <th className={tdStyle + ' text-center'}>Location</th>
                                        <th className={tdStyle + ' text-center'}>Arrival Date</th>
                                        <th className={tdStyle + ' text-center'}>Item Name</th>
                                        <th className={tdStyle + ' text-center'}>Concern</th>

                                        <th className={tdStyle + ' text-center'}>Bill No</th>
                                        <th className={tdStyle + ' text-center'}>Bill Date</th>
                                        <th className={tdStyle + ' text-center'}>Quantity</th>
                                        <th className={tdStyle + ' text-center'}>Tonnage / KGs</th>
                                        <th className={tdStyle + ' text-center'}>Batch / Location</th>

                                        <th className={tdStyle + ' text-center'}>Pending Quantity</th>
                                        <th className={tdStyle + ' text-center'}>Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {DeliveryArray.map((o, i) => (
                                        <tr key={i}>
                                            <td className={tdStyle}>{i + 1}</td>
                                            <td className={tdStyle}>{o?.Location}</td>
                                            <td className={tdStyle}>{o?.ArrivalDate}</td>
                                            <td className={tdStyle}>{o?.ItemName}</td>
                                            <td className={tdStyle}>{o?.Concern}</td>

                                            <td className={tdStyle}>{o?.BillNo}</td>
                                            <td className={tdStyle}>{o?.BillDate}</td>
                                            <td className={tdStyle}>{o?.Quantity}</td>
                                            <td className={tdStyle}>{o?.Weight + ' ' + o?.Units}</td>
                                            <td className={tdStyle}>{o?.BatchLocation}</td>

                                            <td className={tdStyle}>{o?.PendingQuantity}</td>
                                            <td className={tdStyle + ' p-0 text-center'}>
                                                <IconButton
                                                    onClick={() => {
                                                        setDeliveryArray(prev => {
                                                            return prev.filter((_, index) => index !== i);
                                                        });
                                                    }}
                                                    size='small'
                                                >
                                                    <Delete color='error' />
                                                </IconButton>
                                            </td>
                                        </tr>
                                    ))}

                                    <tr>
                                        <td className={'p-3'} colSpan={12}></td>
                                    </tr>
                                </tbody>
                            </table>
                        </>
                    )}

                    <div className="d-flex justify-content-end flex-wrap my-3">
                        <Button
                            onClick={() => {
                                setOrderDetails(initialOrderDetailsValue);
                                setOrderItemArray([]);
                                setDeliveryArray([]);
                                setTranspoterArray([]);
                            }}
                            className='me-2'
                            variant='outlined'
                            startIcon={<ClearAll />}
                        >Clear Values</Button>
                        <Button
                            onClick={postOrder}
                            variant='contained'
                            startIcon={<Save />}
                            disabled={
                                (() => {
                                    const noOrderItems = isEqualNumber(OrderItemsArray.length, 0);
                                    const noPartyName = !OrderDetails.PartyName;
                                    const noDeliveryDetails =
                                        isEqualNumber(DeliveryArray.length, 0) &&
                                        isEqualNumber(TranspoterArray.length, 0);
                                    const noOrderId = !OrderDetails.Id;

                                    return (
                                        (options.PurchaseOrderOnly && (noOrderItems || noPartyName)) ||
                                        (options.PurchaseOderWithDelivery && ((noDeliveryDetails && noOrderItems) || noPartyName)) ||
                                        (options.DeliveryEntry && (noOrderId || noDeliveryDetails))
                                    );
                                })()
                            }
                        >Save</Button>
                    </div>

                </div>

                <Dialog
                    open={dialogs.itemsDialog}
                    onClose={() => setDialogs(pre => ({ ...pre, itemsDialog: false }))}
                    maxWidth='sm' fullWidth
                >
                    <DialogTitle>Add Items</DialogTitle>
                    <form onSubmit={e => {
                        e.preventDefault();
                        changeItems(orderItemsInput)
                    }}>
                        <DialogContent>
                            <table className="table m-0">
                                <tbody>
                                    <tr>
                                        <td className={tdStyle}>Item Name <RequiredStar /></td>
                                        <td className={tdStyle}>
                                            <Select
                                                value={{ value: orderItemsInput.ItemId, label: orderItemsInput.ItemName }}
                                                onChange={(e) => setOrderItemsInput(pre => ({ ...pre, ItemId: e.value, ItemName: e.label }))}
                                                options={[
                                                    { value: '', label: 'select', isDisabled: true },
                                                    ...products.map(obj => ({
                                                        value: obj?.Product_Id,
                                                        label: obj?.Product_Name,
                                                        isDisabled: (OrderItemsArray.findIndex(o => isEqualNumber(
                                                            o?.ItemId, obj?.Product_Id
                                                        ))) === -1 ? false : true
                                                    }))
                                                ]}
                                                styles={customSelectStyles}
                                                required
                                                isSearchable={true}
                                                placeholder={"Select Product"}
                                                maxMenuHeight={200}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className={tdStyle}>Weight <RequiredStar /></td>
                                        <td className={tdStyle}>
                                            <input
                                                type="number"
                                                className='cus-inpt p-2 w-auto'
                                                value={orderItemsInput.Weight}
                                                required
                                                placeholder='Weight'
                                                onChange={e => setOrderItemsInput(pre => ({ ...pre, Weight: e.target.value }))}
                                            />
                                            <input
                                                className='cus-inpt p-2 w-auto'
                                                value={orderItemsInput.Units}
                                                placeholder='Units ex: kg, l, ml...'
                                                onChange={e => setOrderItemsInput(pre => ({ ...pre, Units: e.target.value }))}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className={tdStyle}>Rate <RequiredStar /></td>
                                        <td className={tdStyle}>
                                            <input
                                                type="number"
                                                required
                                                className='cus-inpt p-2'
                                                value={orderItemsInput.Rate}
                                                placeholder='Rate'
                                                onChange={e => setOrderItemsInput(pre => ({ ...pre, Rate: e.target.value }))}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className={tdStyle}>Delivery Location <RequiredStar /></td>
                                        <td className={tdStyle}>
                                            <input
                                                className='cus-inpt p-2'
                                                required
                                                value={orderItemsInput.DeliveryLocation}
                                                placeholder='Location '
                                                onChange={e => setOrderItemsInput(pre => ({ ...pre, DeliveryLocation: e.target.value }))}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className={tdStyle}>Discount</td>
                                        <td className={tdStyle}>
                                            <input
                                                type="number"
                                                className='cus-inpt p-2'
                                                placeholder='Discount Amount'
                                                value={orderItemsInput.Discount}
                                                onChange={e => setOrderItemsInput(pre => ({ ...pre, Discount: e.target.value }))}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className={tdStyle}>Quality Condition</td>
                                        <td className={tdStyle}>
                                            <input
                                                className='cus-inpt p-2'
                                                value={orderItemsInput.QualityCondition}
                                                placeholder='Pencentage or condition'
                                                onChange={e => setOrderItemsInput(pre => ({ ...pre, QualityCondition: e.target.value }))}
                                            />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </DialogContent>
                        <DialogActions className='d-flex justify-content-between'>
                            <span>
                                <Button variant='outlined' type='button' onClick={() => setOrderItemsInput(initialItemDetailsValue)}>clear</Button>
                            </span>
                            <span>
                                <Button
                                    variant='outlined'
                                    className='me-2'
                                    type='button'
                                    onClick={() => setDialogs(pre => ({ ...pre, itemsDialog: false }))}
                                >cancel</Button>
                                <Button variant='contained' type='submit'>submit</Button>
                            </span>
                        </DialogActions>
                    </form>
                </Dialog>

                <Dialog
                    open={dialogs.deliveryDialog}
                    onClose={() => setDialogs(pre => ({ ...pre, deliveryDialog: false }))}
                    maxWidth='md' fullWidth
                >
                    <DialogTitle>Add Delivery Details</DialogTitle>
                    <form onSubmit={e => {
                        e.preventDefault();
                        changeDeliveryInfo(deliveryInput);
                    }}>
                        <DialogContent>
                            <table className="table mb-2">
                                <tbody>
                                    <tr>
                                        <td className={tdStyle}>Location</td>
                                        <td className={tdStyle}>
                                            <input
                                                className={'cus-inpt p-2'}
                                                value={deliveryInput?.Location}
                                                onChange={e => setDeliveryInput(pre => ({ ...pre, Location: e.target.value }))}
                                                placeholder='Location'
                                            />
                                        </td>
                                        <td className={'border-0'}></td>
                                        <td className={tdStyle}>Arrival Date</td>
                                        <td className={tdStyle}>
                                            <input
                                                type="date"
                                                value={deliveryInput?.ArrivalDate}
                                                className='cus-inpt p-2'
                                                onChange={e => setDeliveryInput(pre => ({ ...pre, ArrivalDate: e.target.value }))}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className={tdStyle}>Item Name</td>
                                        <td className={tdStyle}>
                                            <Select
                                                value={{ value: deliveryInput?.ItemId, label: deliveryInput?.ItemName }}
                                                onChange={(e) => setDeliveryInput(pre => ({ ...pre, ItemId: e.value, ItemName: e.label }))}
                                                options={[
                                                    { value: '', label: 'select', isDisabled: true },
                                                    ...products.map(obj => ({
                                                        value: obj?.Product_Id,
                                                        label: obj?.Product_Name
                                                    }))
                                                ]}
                                                styles={customSelectStyles}
                                                required
                                                isSearchable={true}
                                                placeholder={"Select Product"}
                                                maxMenuHeight={200}
                                            />
                                        </td>
                                        <td className={'border-0'}></td>
                                        <td className={tdStyle}>Concern</td>
                                        <td className={tdStyle}>
                                            <input
                                                className={'cus-inpt p-2'}
                                                value={deliveryInput?.Concern}
                                                onChange={e => setDeliveryInput(pre => ({ ...pre, Concern: e.target.value }))}
                                                placeholder=''
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className={tdStyle}>Bill No</td>
                                        <td className={tdStyle}>
                                            <input
                                                className={'cus-inpt p-2'}
                                                value={deliveryInput?.BillNo}
                                                onChange={e => setDeliveryInput(pre => ({ ...pre, BillNo: e.target.value }))}
                                                placeholder=''
                                            />
                                        </td>
                                        <td className={'border-0'}></td>
                                        <td className={tdStyle}>Bill Date</td>
                                        <td className={tdStyle}>
                                            <input
                                                type="date"
                                                value={deliveryInput?.BillDate}
                                                className='cus-inpt p-2'
                                                onChange={e => setDeliveryInput(pre => ({ ...pre, BillDate: e.target.value }))}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className={tdStyle}>Quantity</td>
                                        <td className={tdStyle}>
                                            <input
                                                type="number"
                                                value={deliveryInput?.Quantity}
                                                className='cus-inpt p-2'
                                                onChange={e => setDeliveryInput(pre => ({ ...pre, Quantity: e.target.value }))}
                                            />
                                        </td>
                                        <td className={'border-0'}></td>
                                        <td className={tdStyle}>Tonnage</td>
                                        <td className={tdStyle}>
                                            <input
                                                type="number"
                                                value={deliveryInput?.Weight}
                                                className='cus-inpt p-2 w-50'
                                                placeholder='Weight'
                                                onChange={e => setDeliveryInput(pre => ({ ...pre, Weight: e.target.value }))}
                                            />
                                            <input
                                                value={deliveryInput?.Units}
                                                className='cus-inpt p-2 w-50'
                                                placeholder='Units ex: kg, L, ml'
                                                onChange={e => setDeliveryInput(pre => ({ ...pre, Units: e.target.value }))}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className={tdStyle}>Batch / Location</td>
                                        <td className={tdStyle}>
                                            <input
                                                className={'cus-inpt p-2'}
                                                value={deliveryInput?.BatchLocation}
                                                onChange={e => setDeliveryInput(pre => ({ ...pre, BatchLocation: e.target.value }))}
                                                placeholder='location or batch'
                                            />
                                        </td>
                                        <td className={'border-0'}></td>
                                        <td className={tdStyle}>Pending Quantity</td>
                                        <td className={tdStyle}>
                                            <input
                                                type="number"
                                                value={deliveryInput?.PendingQuantity}
                                                className='cus-inpt p-2'
                                                placeholder='penging quantity'
                                                onChange={e => setDeliveryInput(pre => ({ ...pre, PendingQuantity: e.target.value }))}
                                            />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            <div className="p-2 d-flex flex-wrap justify-content-end align-items-center">
                                <label>Transporter: </label>
                                <select
                                    value={deliveryInput?.TransporterIndex}
                                    className='cus-inpt w-auto ms-2'
                                    style={{ minWidth: '130px' }}
                                    required
                                    onChange={e => setDeliveryInput(pre => ({ ...pre, TransporterIndex: e.target.value }))}
                                >
                                    <option value={''} disabled>Select Trip</option>
                                    {TranspoterArray.map((o, i) => (
                                        <option value={i} key={i}>Trip - {i + 1}</option>
                                    ))}
                                </select>
                            </div>
                        </DialogContent>
                        <DialogActions className='d-flex justify-content-between'>
                            <span>
                                <Button variant='outlined' type='button' onClick={() => setOrderItemsInput(initialItemDetailsValue)}>clear</Button>
                            </span>
                            <span>
                                <Button
                                    variant='outlined'
                                    className='me-2'
                                    type='button'
                                    onClick={() => setDialogs(pre => ({ ...pre, deliveryDialog: false }))}
                                >cancel</Button>
                                <Button variant='contained' type='submit'>submit</Button>
                            </span>
                        </DialogActions>
                    </form>
                </Dialog>

                <Dialog
                    open={dialogs.transporterDialog}
                    onClose={() => setDialogs(pre => ({ ...pre, transporterDialog: false }))}
                    maxWidth='sm' fullWidth
                >
                    <DialogTitle>Add Transporter Details</DialogTitle>
                    <form onSubmit={e => {
                        e.preventDefault();
                        changeTransporterInfo(transpoterInput);
                    }}>
                        <DialogContent>
                            <table className="table m-0">
                                <tbody>

                                    <tr>
                                        <td className={tdStyle + ' text-center bg-light'} colSpan={4}>
                                            Loading Details
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className={tdStyle}>Load</td>
                                        <td className={tdStyle + ' p-0'}>
                                            <input
                                                type="number"
                                                value={transpoterInput?.Loading_Load}
                                                className={inputStyle + ' border-0'}
                                                onChange={e => setTransportInput(pre => ({ ...pre, Loading_Load: e.target.value }))}
                                            />
                                        </td>
                                        <td className={tdStyle}>Empty</td>
                                        <td className={tdStyle + ' p-0'}>
                                            <input
                                                type="number"
                                                value={transpoterInput?.Loading_Empty}
                                                className={inputStyle + ' border-0'}
                                                onChange={e => setTransportInput(pre => ({ ...pre, Loading_Empty: e.target.value }))}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className={tdStyle + ' text-center bg-light'} colSpan={4}>
                                            Unloading Details
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className={tdStyle}>Load</td>
                                        <td className={tdStyle + ' p-0'}>
                                            <input
                                                type="number"
                                                value={transpoterInput?.Unloading_Load}
                                                className={inputStyle + ' border-0'}
                                                onChange={e => setTransportInput(pre => ({ ...pre, Unloading_Load: e.target.value }))}
                                            />
                                        </td>
                                        <td className={tdStyle}>Empty</td>
                                        <td className={tdStyle + ' p-0'}>
                                            <input
                                                type="number"
                                                value={transpoterInput?.Unloading_Empty}
                                                className={inputStyle + ' border-0'}
                                                onChange={e => setTransportInput(pre => ({ ...pre, Unloading_Empty: e.target.value }))}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className={tdStyle} colSpan={2}>EX SH</td>
                                        <td className={tdStyle + ' p-0'} colSpan={2}>
                                            <input
                                                value={transpoterInput?.EX_SH}
                                                onChange={e => setTransportInput(pre => ({ ...pre, EX_SH: e.target.value }))}
                                                className={inputStyle + ' border-0'}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className={tdStyle} colSpan={2}>Driver Name</td>
                                        <td className={tdStyle + ' p-0'} colSpan={2}>
                                            <input
                                                value={transpoterInput?.DriverName}
                                                onChange={e => setTransportInput(pre => ({ ...pre, DriverName: e.target.value }))}
                                                className={inputStyle + ' border-0'}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className={tdStyle} colSpan={2}>Vehicle No</td>
                                        <td className={tdStyle + ' p-0'} colSpan={2}>
                                            <input
                                                value={transpoterInput?.VehicleNo}
                                                onChange={e => setTransportInput(pre => ({ ...pre, VehicleNo: e.target.value }))}
                                                className={inputStyle + ' border-0'}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className={tdStyle} colSpan={2}>Phone Number</td>
                                        <td className={tdStyle + ' p-0'} colSpan={2}>
                                            <input
                                                type='number'
                                                value={transpoterInput?.PhoneNumber}
                                                onChange={e => setTransportInput(pre => ({ ...pre, PhoneNumber: e.target.value }))}
                                                className={inputStyle + ' border-0'}
                                                maxLength={15}
                                            />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </DialogContent>
                        <DialogActions className='d-flex justify-content-between'>
                            <span>
                                <Button variant='outlined' type='button' onClick={() => setTransportInput(initialTranspoterDetailsValue)}>clear</Button>
                            </span>
                            <span>
                                <Button
                                    variant='outlined'
                                    className='me-2'
                                    type='button'
                                    onClick={() => setDialogs(pre => ({ ...pre, transporterDialog: false }))}
                                >cancel</Button>
                                <Button variant='contained' type='submit'>submit</Button>
                            </span>
                        </DialogActions>
                    </form>
                </Dialog>
            </CardContent>
        </Card>
    )
}

export default PurchaseOrderFormTemplate;