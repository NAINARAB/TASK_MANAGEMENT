import { Card, CardContent } from '@mui/material';
import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { isGraterOrEqual, isLesserOrEqual, NumberFormat } from '../../../Components/functions'

const ExcelDataReadTest = () => {
    const [fileInput, setFileInput] = useState(null)
    const [data, setData] = useState([]);
    const [columns, setColumns] = useState([]);

    useEffect(() => {
        if (fileInput) {
            const reader = new FileReader();

            reader.onload = (event) => {
                const binaryStr = event?.target?.result;
                const workbook = XLSX.read(binaryStr, { type: 'binary' });

                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];

                const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

                const cols = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0];
                setColumns(cols);

                setData(jsonData);
            };

            reader.readAsBinaryString(fileInput);
        }
    }, [fileInput])

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

    return (
        <Card>
            <div className="p-3 fa-16 fw-bold border-bottom">
                <span>EXCEL DATA</span>
            </div>
            <CardContent>
                <label className='mb-2 w-100'>SELECT EXCEL FILE</label>
                <input
                    type="file"
                    className='cus-inpt w-auto'
                    accept=".xlsx, .xls"
                    onChange={e => setFileInput(e?.target?.files[0])}
                />
                <br />
                {data?.length > 0 && (
                    <div className="table-responsive mt-3">
                        <table className='table'>
                            <thead>
                                <tr>
                                    <th colSpan={2} className={'fa-14 border text-center'}></th>
                                    <th colSpan={5} className={'fa-14 border text-center bg-light'}>LRY SHED & LOCAL</th>
                                    <th colSpan={3} className={'fa-14 border text-center'}>OTHER GODOWNS</th>
                                    <th colSpan={3} className={'fa-14 border text-center bg-light'}>TRANSFER</th>
                                    <th className='border'></th>
                                </tr>
                                <tr>
                                    {columns.map((o, i) => (
                                        <th key={i} className={'fa-14 border text-center'}>{o}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((row, index) => (
                                    <tr key={index}>
                                        {Object.values(row).map((cell, idx) => (
                                            <td key={idx} className={'fa-13 border text-end ' + (idx % 2 !== 0 ? 'bg-light' : '')}>
                                                {cell}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                                <tr>
                                    <td colSpan={2}></td>
                                    <th colSpan={5} className={'fa-14 border text-center bg-light'}>
                                        {calTotal(3, 7)}
                                    </th>
                                    <th colSpan={3} className={'fa-14 border text-center'}>
                                        {calTotal(8, 10)}
                                    </th>
                                    <th colSpan={3} className={'fa-14 border text-center bg-light'}>
                                        {calTotal(11, 13)}
                                    </th>
                                    <th className={'fa-16 border text-center '}>
                                        {calTotal(14, 14)}
                                    </th>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default ExcelDataReadTest;
