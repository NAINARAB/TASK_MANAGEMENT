import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, Button, DialogActions } from '@mui/material';
import { Close, Download } from '@mui/icons-material';
import { checkIsNumber, isEqualNumber, isGraterNumber, LocalDate, NumberFormat, numberToWords, Multiplication, Subraction, Addition } from '../../../Components/functions';
import { useReactToPrint } from 'react-to-print';
import { fetchLink } from '../../../Components/fetchComponent';


const taxCalc = (method = 1, amount = 0, percentage = 0) => {
    if (method == 1 && checkIsNumber(amount) && checkIsNumber(percentage)) {
        return amount - (amount * (100 / (100 + percentage)));
    } else if (method == 0 && checkIsNumber(amount) && checkIsNumber(percentage)) {
        return amount * (percentage / 100);
    } else {
        return 0;
    }
}

const findProductDetails = (arr = [], productid) => arr.find(obj => isEqualNumber(obj.Product_Id, productid)) ?? {};

const InvoiceBillTemplate = ({ orderDetails, orderProducts, download, actionOpen, clearDetails, children, TitleText }) => {
    const storage = JSON.parse(localStorage.getItem('user'));
    const [open, setOpen] = useState(false);
    const [products, setProducts] = useState([]);
    const [retailerInfo, setRetailerInfo] = useState({});
    const [companyInfo, setCompanyInfo] = useState({});
    const printRef = useRef(null)

    useEffect(() => {
        fetchLink({
            address: `masters/products?Company_Id=${storage?.Company_id}`
        }).then(data => {
            if (data.success) {
                setProducts(data.data)
            }
        }).catch(e => console.error(e))

        fetchLink({
            address: `masters/company?Company_id=${storage?.Company_id}`
        }).then(data => {
            if (data.success) {
                setCompanyInfo(data?.data[0] ? data?.data[0] : {})
            }
        }).catch(e => console.error(e))

    }, [storage?.Company_id])

    useEffect(() => {
        if (actionOpen) {
            setOpen(true);
        }
    }, [actionOpen])

    useEffect(() => {
        if (orderDetails?.Retailer_Id) {
            fetchLink({
                address: `masters/retailers/info?Retailer_Id=${orderDetails?.Retailer_Id}`
            }).then(data => {
                if (data.success) {
                    setRetailerInfo(data?.data[0] ? data?.data[0] : {})
                }
            }).catch(e => console.error(e))
        }
    }, [orderDetails?.Retailer_Id])

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        if (clearDetails) {
            clearDetails();
        }
    };

    const includedProducts = orderProducts.filter(orderProduct => {
        return products?.some(product => isEqualNumber(
            orderProduct?.Item_Id, product?.Product_Id
        ) && isGraterNumber(orderProduct?.Bill_Qty, 0));
    });

    const Total_Invoice_value = includedProducts.reduce((o, item) => {
        const product = findProductDetails(products, item.Item_Id);
        const itemRate = parseFloat(item?.Item_Rate);
        const billQty = parseInt(item?.Bill_Qty);
        const Amount = Multiplication(billQty, itemRate)
        const gstPercentage = isEqualNumber(orderDetails.IS_IGST, 1) ? product.Igst_P : product.Gst_P;

        if (isEqualNumber(orderDetails.GST_Inclusive, 1)) {
            return o += Amount;
        } else {
            const tax = taxCalc(0, itemRate, gstPercentage)
            return o += (Amount + (tax * billQty));
        }
    }, 0);

    const totalValueBeforeTax = includedProducts.reduce((acc, item) => {
        const product = findProductDetails(products, item.Item_Id);
        const itemRate = parseFloat(item?.Item_Rate) || 0;
        const billQty = parseInt(item?.Bill_Qty) || 0;
        const gstPercentage = isEqualNumber(orderDetails.IS_IGST, 1) ? product.Igst_P : product.Gst_P;

        if (isEqualNumber(orderDetails.GST_Inclusive, 1)) {
            const itemTax = taxCalc(1, itemRate, gstPercentage)
            const basePrice = Subraction(itemRate, itemTax);
            acc.TotalTax += Multiplication(billQty, itemTax);
            acc.TotalValue += Multiplication(billQty, basePrice);
        } else {
            const itemTax = taxCalc(0, itemRate, gstPercentage);
            acc.TotalTax += Multiplication(billQty, itemTax);
            acc.TotalValue += Multiplication(billQty, itemRate);
        }

        return acc;
    }, {
        TotalValue: 0,
        TotalTax: 0
    });

    const handlePrint = useReactToPrint({
        content: () => printRef.current,
    });

    const extraDetails = [
        {
            labelOne: 'Invoice No',
            dataOne: orderDetails?.So_Id,
            labelTwo: 'Dated',
            dataTwo: LocalDate(orderDetails?.So_Date),
        },
        {
            labelOne: 'Delivery Note',
            dataOne: '',
            labelTwo: 'Mode/Terms of Payment',
            dataTwo: '',
        },
        {
            labelOne: 'Reference No. & Date',
            dataOne: '',
            labelTwo: 'Other References',
            dataTwo: '',
        },
        {
            labelOne: 'Buyer\'s Order No',
            dataOne: '',
            labelTwo: 'Dated',
            dataTwo: '',
        },
        {
            labelOne: 'Dispatch Doc No',
            dataOne: '',
            labelTwo: 'Delivery Note Date',
            dataTwo: '',
        },
        {
            labelOne: 'Dispatched through',
            dataOne: '',
            labelTwo: 'Destination',
            dataTwo: '',
        },
        {
            labelOne: 'Bill of Lading/LR-RR No',
            dataOne: '',
            labelTwo: 'Motor Vehicle No',
            dataTwo: '',
        },
    ]

    const TaxData = orderProducts?.reduce((data, item) => {
        const HSNindex = data.findIndex(obj => obj.hsnCode == item.HSN_Code);

        const {
            Taxable_Amount, Cgst_Amo, Sgst_Amo, Igst_Amo, HSN_Code,
            Cgst, Sgst, Igst,
        } = item;

        if (HSNindex !== -1) {
            const prev = data[HSNindex];
            const newValue = {
                ...prev,
                taxableValue: prev.taxableValue + Taxable_Amount,
                cgst: Addition(prev.cgst, Cgst_Amo),
                sgst: Addition(prev.sgst, Sgst_Amo),
                igst: Addition(prev.igst, Igst_Amo),
                totalTax: prev.totalTax + Number(orderDetails.IS_IGST ? Igst_Amo : Addition(Cgst_Amo, Sgst_Amo)),
            };

            data[HSNindex] = newValue;
            return data;
        }

        const newEntry = {
            hsnCode: HSN_Code,
            taxableValue: Taxable_Amount,
            cgst: Cgst_Amo,
            cgstPercentage: Cgst,
            sgst: Sgst_Amo,
            sgstPercentage: Sgst,
            igst: Igst_Amo,
            igstPercentage: Igst,
            totalTax: orderDetails.IS_IGST ? Number(Igst_Amo) : Addition(Cgst_Amo, Sgst_Amo),
        };

        return [...data, newEntry];
    }, []);

    return (
        <>
            <span onClick={handleOpen}>{children}</span>

            <Dialog open={open} onClose={handleClose} fullWidth maxWidth='lg'>

                <DialogTitle>Order Preview</DialogTitle>

                <DialogContent ref={printRef}>
                    <h3 className='text-center mb-2'>{TitleText ?? 'Invoice Details'}</h3>

                    {/* General Info */}
                    <div className="row">
                        <div className="col-6 p-0 border border-bottom-0 border-end-0"> {/* Company Info */}
                            <div className="border-bottom p-2">
                                <p className='m-0 fa-17'>{companyInfo?.Company_Name}</p>
                                <p className='m-0 fa-14'>Address: {companyInfo?.Company_Address}</p>
                                {/* <p className='m-0 fa-14'></p> */}
                                <p className='m-0 fa-14'>City: {companyInfo?.Region} - {companyInfo?.Pincode}</p>
                                <p className='m-0 fa-14'>GSTIN / UIN: {companyInfo?.Gst_Number}</p>
                                <p className='m-0 fa-14'>State: {companyInfo?.State}</p>
                                <p className='m-0 fa-14'>Code: </p>
                            </div>
                            <div className="p-2"> {/* buyer info */}
                                <p className='m-0 fa-12'>Buyer (Bill to)</p>
                                <p className='m-0 fa-15'>{retailerInfo?.Retailer_Name}</p>
                                <p className='m-0 fa-14'>{retailerInfo?.Reatailer_Address}</p>
                                <p className='m-0 fa-14'>{retailerInfo?.Reatailer_City} - {retailerInfo?.PinCode}</p>
                                <p className='m-0 fa-14'>GSTIN / UIN: {companyInfo?.Gstno}</p>
                                <p className='m-0 fa-14'>State Name: {companyInfo?.StateGet}</p>
                                <p className='m-0 fa-14'>Code: </p>
                            </div>
                        </div>
                        <div className="col-6 p-0 border border-bottom-0">
                            <table className="table m-0">
                                <tbody>
                                    {extraDetails.map((detail, index) => (
                                        <tr key={index}>
                                            <td className="border-end fa-12 p-0 px-1">
                                                <p className="m-0">{detail.labelOne}</p>
                                                <p className="m-0">&emsp;{detail.dataOne}</p>
                                            </td>
                                            <td className='fa-12 p-0 px-1'>
                                                <p className="m-0">{detail.labelTwo}</p>
                                                <p className="m-0">&emsp;{detail.dataTwo}</p>
                                            </td>
                                        </tr>
                                    ))}
                                    <tr>
                                        <td colSpan={2} className='border-0 fa-12 p-0'>
                                            <p className="m-0">Terms of Delivery</p>
                                            <p className="m-0"></p>
                                            <br />
                                            <br />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="row">
                        <div className="col-12 p-0">
                            <table className="table m-0">
                                <thead>
                                    <tr>
                                        <td className='border bg-light fa-14'>Sno</td>
                                        <td className='border bg-light fa-14'>Product</td>
                                        <td className='border bg-light fa-14'>HSN/SAC</td>
                                        <td className='border bg-light fa-14 text-end'>Quantity</td>
                                        <td className='border bg-light fa-14 text-end'>Rate</td>
                                        <td className='border bg-light fa-14 text-end'>
                                            <p className='m-2 '>Rate</p>
                                            <p className='m-0 '>
                                                {isEqualNumber(
                                                    orderDetails.GST_Inclusive, 1
                                                ) ? '(Incl. of Tax)' : '(Excl. of Tax)'}
                                            </p>
                                        </td>
                                        <td className='border bg-light fa-14 text-end'>Amount</td>
                                    </tr>
                                </thead>

                                <tbody>

                                    {includedProducts.map((o, i) => {
                                        const productDetails = findProductDetails(products, o.Item_Id);
                                        const percentage = (orderDetails.IS_IGST ? productDetails?.Igst_P : productDetails?.Gst_P) ?? 0;
                                        const uom = o?.UOM;
                                        const quantity = Number(o?.Bill_Qty || 0);
                                        const Item_Rate = Number(o?.Item_Rate || 0);
                                        const itemTax = taxCalc(orderDetails.GST_Inclusive, Item_Rate, percentage)
                                        const amount = quantity * Item_Rate;
                                        const amountTax = taxCalc(orderDetails.GST_Inclusive, amount, percentage)
                                        return (
                                            <tr key={i}>
                                                <td className='border fa-13'>{i + 1}</td>
                                                <td className='border fa-13'>{productDetails?.Product_Name}</td>
                                                <td className='border fa-13'>{productDetails?.HSN_Code}</td>

                                                <td className='border fa-13 text-end'>
                                                    {NumberFormat(quantity)}
                                                    {uom && ' (' + uom + ') '}
                                                </td>

                                                <td className='border fa-13 text-end'> {/* taxable item value */}
                                                    {NumberFormat(isEqualNumber(
                                                        orderDetails.GST_Inclusive, 1
                                                    ) ? (Item_Rate - itemTax) : Item_Rate)}
                                                </td>

                                                <td className='border fa-13 text-end'> {/* rate per item */}
                                                    {NumberFormat(isEqualNumber(
                                                        orderDetails.GST_Inclusive, 1
                                                    ) ? Item_Rate : (Item_Rate + itemTax))}
                                                </td>

                                                <td className='border fa-13 text-end'> {/* taxable amount (qty * rate) */}
                                                    {/* {NumberFormat(isEqualNumber(
                                                    orderDetails.GST_Inclusive, 1
                                                ) ? amount : (amount + amountTax))} */}
                                                    {NumberFormat(isEqualNumber(
                                                        orderDetails.GST_Inclusive, 1
                                                    ) ? (amount - amountTax) : amount)}
                                                    {/* {NumberFormat(o?.Taxable_Amount)} */}
                                                </td>

                                            </tr>
                                        );
                                    })}

                                    <tr>
                                        <td
                                            className="border p-2"
                                            rowSpan={isEqualNumber(orderDetails.IS_IGST, 1) ? 4 : 5}
                                            colSpan={4}
                                        >
                                            <p className='m-0'>Amount Chargeable (in words):</p>
                                            <p className='m-0'>&emsp; INR {numberToWords(parseInt(Total_Invoice_value))} Only.</p>
                                        </td>
                                        <td className="border p-2 fa-14" colSpan={2}>Total Taxable Amount</td>
                                        <td className="border p-2 text-end fa-14">
                                            {NumberFormat(totalValueBeforeTax.TotalValue)}
                                        </td>
                                    </tr>

                                    {!isEqualNumber(orderDetails.IS_IGST, 1) ? (
                                        <>
                                            <tr>
                                                <td className="border p-2 fa-14" colSpan={2}>CGST</td>
                                                <td className="border p-2 text-end fa-14">
                                                    {NumberFormat(totalValueBeforeTax.TotalTax / 2)}
                                                    {/* {includedProducts.reduce((gst, item) => gst += item.Cgst_Amo, 0)} */}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="border p-2 fa-14" colSpan={2}>SGST</td>
                                                <td className="border p-2 fa-14 text-end">
                                                    {NumberFormat(totalValueBeforeTax.TotalTax / 2)}
                                                    {/* {includedProducts.reduce((gst, item) => gst += item.Sgst_Amo, 0)} */}
                                                </td>
                                            </tr>
                                        </>
                                    ) : (
                                        <tr>
                                            <td className="border p-2 fa-14" colSpan={2}>IGST</td>
                                            <td className="border p-2 fa-14 text-end">
                                                {NumberFormat(totalValueBeforeTax.TotalTax)}
                                                {/* {includedProducts.reduce((gst, item) => gst += item.Igst_Amo, 0)} */}
                                            </td>
                                        </tr>
                                    )}

                                    <tr>
                                        <td className="border p-2 fa-14" colSpan={2}>Round Off</td>
                                        <td className="border p-2 fa-14 text-end">
                                            {NumberFormat(
                                                Total_Invoice_value - (
                                                    totalValueBeforeTax.TotalValue + totalValueBeforeTax.TotalTax
                                                )
                                            )}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td className="border p-2 fa-14" colSpan={2}>Total</td>
                                        <td className="border p-2 fa-14 text-end fw-bold">
                                            {NumberFormat(Total_Invoice_value)}
                                        </td>
                                    </tr>

                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Tax Calculations */}
                    <div className="row">
                        <div className="col-12 p-0">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <td className="border bg-light fa-14 text-center" rowSpan={2} style={{ verticalAlign: 'middle' }}>HSN / SAC</td>
                                        <td className="border bg-light fa-14 text-center" rowSpan={2} style={{ verticalAlign: 'middle' }}>Taxable Value</td>
                                        {isEqualNumber(orderDetails.IS_IGST, 1) ? (
                                            <td className="border bg-light fa-14 text-center" colSpan={2}>IGST Tax</td>
                                        ) : (
                                            <>
                                                <td className="border bg-light fa-14 text-center" colSpan={2}>Central Tax</td>
                                                <td className="border bg-light fa-14 text-center" colSpan={2}>State Tax</td>
                                            </>
                                        )}
                                        <td className="border bg-light fa-14 text-center">Total</td>
                                    </tr>
                                    <tr>
                                        {isEqualNumber(orderDetails.IS_IGST, 1) ? (
                                            <>
                                                <td className="border bg-light fa-14 text-center">Rate</td>
                                                <td className="border bg-light fa-14 text-center">Amount</td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="border bg-light fa-14 text-center">Rate</td>
                                                <td className="border bg-light fa-14 text-center">Amount</td>
                                                <td className="border bg-light fa-14 text-center">Rate</td>
                                                <td className="border bg-light fa-14 text-center">Amount</td>
                                            </>
                                        )}
                                        <td className="border bg-light fa-14 text-center">Tax Amount</td>
                                    </tr>
                                </thead>
                                <tbody>
                                    {TaxData.map((o, i) => {
                                        return (
                                            <tr key={i}>
                                                <td className="border fa-13 text-end">{o?.hsnCode}</td>
                                                <td className="border fa-13 text-end">{NumberFormat(o?.taxableValue)}</td>
                                                {orderDetails.IS_IGST ? (
                                                    <>
                                                        <td className="border fa-13 text-end">{NumberFormat(o?.igstPercentage)}</td>
                                                        <td className="border fa-13 text-end">{NumberFormat(o?.igst)}</td>
                                                    </>
                                                ) : (
                                                    <>
                                                        <td className="border fa-13 text-end">{NumberFormat(o?.cgstPercentage)}</td>
                                                        <td className="border fa-13 text-end">{NumberFormat(o?.cgst)}</td>
                                                        <td className="border fa-13 text-end">{NumberFormat(o?.sgstPercentage)}</td>
                                                        <td className="border fa-13 text-end">{NumberFormat(o?.sgst)}</td>
                                                    </>
                                                )}
                                                <td className="border fa-13 text-end">
                                                    {NumberFormat(o?.totalTax)}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                    <tr>
                                        <td className="border fa-13 text-end">Total</td>
                                        <td className="border fa-13 text-end fw-bold">
                                            {NumberFormat(TaxData.reduce((sum, item) => sum += Number(item.taxableValue), 0))}
                                        </td>

                                        {orderDetails.IS_IGST ? (
                                            <>
                                                <td className="border fa-13 text-end"></td>
                                                <td className="border fa-13 text-end fw-bold">
                                                    {NumberFormat(TaxData.reduce((sum, item) => sum += Number(item.igst), 0))}
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="border fa-13 text-end"></td>
                                                <td className="border fa-13 text-end fw-bold">
                                                    {NumberFormat(TaxData.reduce((sum, item) => sum += Number(item.cgst), 0))}
                                                </td>
                                                <td className="border fa-13 text-end"></td>
                                                <td className="border fa-13 text-end fw-bold">
                                                    {NumberFormat(TaxData.reduce((sum, item) => sum += Number(item.sgst), 0))}
                                                </td>
                                            </>
                                        )}

                                        <td className="border fa-13 text-end fw-bold">
                                            {NumberFormat(TaxData.reduce((sum, item) => sum += Number(item.totalTax), 0))}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td 
                                            colSpan={isEqualNumber(orderDetails.IS_IGST, 1) ? 5 : 7}
                                            className='border fa-13 fw-bold'
                                        >
                                            Tax Amount (in words) : INR &nbsp;
                                            {numberToWords(
                                                parseInt(
                                                    TaxData.reduce((sum, item) => sum += Number(item.totalTax), 0)
                                                )
                                            )} only.
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="col-12 text-center">
                            <p>This is a Computer Generated Invoice</p>
                        </div>
                    </div>

                </DialogContent>

                <DialogActions>
                    <Button startIcon={<Close />} variant='outlined' color='error' onClick={handleClose}>
                        Close
                    </Button>
                    {download && (
                        <Button
                            startIcon={<Download />}
                            variant='outlined'
                            onClick={handlePrint}
                        >
                            Download
                        </Button>
                    )}
                </DialogActions>

            </Dialog >
        </>
    )
}

export default InvoiceBillTemplate;