import { useEffect, useState } from "react";
import { PieChart } from '@mui/x-charts/PieChart';
import { getRandomColor, NumberFormat } from "../../../Components/functions";
import { Button } from "@mui/material";


const QPayBasedComp = ({ dataArray }) => {
    const [qPayRange, setQPayRange] = useState([]);
    const [reload, setReload] = useState(false)

    useEffect(() => {

        const range = [
            {
                min: 0,
                max: 5,
                data: []
            },
            {
                min: 5,
                max: 10,
                data: []
            },
            {
                min: 10,
                max: 15,
                data: []
            },
            {
                min: 15,
                max: 20,
                data: []
            },
            {
                min: 20,
                max: 30,
                data: []
            },
            {
                min: 30,
                max: 40,
                data: []
            },
            {
                min: 40,
                max: 60,
                data: []
            },
            {
                min: 60,
                max: 1e4,
                data: []
            },
        ];

        dataArray.forEach(o => {
            const qpayDays = Number(o.Q_Pay_Days);
            const rangeIndex = range.findIndex(obj => (qpayDays > obj.min) && (qpayDays <= obj.max));
            if (rangeIndex !== -1) {
                range[rangeIndex].data.push(o);
            }
        });

        setQPayRange(range);

    }, [dataArray, reload])

    return (
        <>
            <div className="d-flex justify-content-around align-items-center flex-wrap px-3 py-2">

                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                {['Sno', 'Day-Range', 'Parties', 'Percentage', 'Sales Count (Avg)', 'Frequency Days (Avg)'].map(o => (
                                    <th className="border fa-14" style={{ backgroundColor: '#EDF0F7' }} key={o}>{o}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {qPayRange.map((o, i) => (
                                <tr key={i}>
                                    <td className="fa-13 border text-center">{i + 1}</td>
                                    <td className="fa-13 border text-center">
                                        {
                                            qPayRange[i + 1]
                                                ? ((o?.min + 1)?.toString() + ' - ' + o?.max?.toString())
                                                : '< ' + o?.min.toString()
                                        }
                                    </td>
                                    <td className="fa-13 border text-center">{o?.data?.length}</td>
                                    <td className="fa-13 border text-center">{NumberFormat((o?.data?.length / dataArray?.length) * 100)}</td>
                                    <td className="fa-13 border text-center">
                                        {(o.data.length === 0) ? 0 : ((o?.data?.reduce((sum, item) => sum + item.Sales_Count || 0, 0)) / o.data.length).toFixed(2)}
                                    </td>
                                    <td className="fa-13 border text-center">
                                        {(o.data.length === 0) ? 0 : ((o?.data?.reduce((sum, item) => sum + item.Freq_Days || 0, 0)) / o.data.length).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                            <tr>
                                <td className="border"></td>
                                <td className="border"></td>
                                <td className="fa-13 border text-center">
                                    {NumberFormat(qPayRange?.reduce((sum, o) => {
                                        return sum += o?.data?.length
                                    }, 0))}
                                </td>
                                <td className="fa-13 border text-center">
                                    {NumberFormat(qPayRange?.reduce((sum, o) => {
                                        return sum += ((o?.data?.length / dataArray?.length) * 100)
                                    }, 0))}%
                                </td>
                                <td className="fa-13 border text-center">
                                    {NumberFormat((dataArray?.length / (dataArray?.reduce((sum, o) => {
                                        return sum += Number(o?.Sales_Count) || 0
                                    }, 0))) * 100)}
                                    {/* {dataArray?.reduce((sum, o) => {
                                        return sum += Number(o?.Sales_Count) || 0
                                    }, 0)}   */}
                                </td>
                                <td className="fa-13 border text-center">
                                    {NumberFormat((dataArray?.length / (dataArray?.reduce((sum, o) => {
                                        return sum += Number(o?.Freq_Days) || 0
                                    }, 0))) * 100)}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="d-flex align-items-center flex-column overflow-auto">
                    <h5>Q-Pay Days</h5>
                    <PieChart
                        series={[
                            {
                                data: qPayRange?.map((range, rangeInd) => ({
                                    label: qPayRange[rangeInd + 1]
                                        ? (NumberFormat(range?.min) + '-' + NumberFormat(range?.max)) + '(' + range?.data?.length + ')'
                                        : '< ' + NumberFormat(range?.min) + '(' + range?.data?.length + ')',
                                    // value: range?.data?.length,
                                    value: ((range?.data?.length / dataArray?.length) * 100).toFixed(2),
                                    color: getRandomColor()
                                })),
                                arcLabel: (item) => `${item.label}`,
                                arcLabelMinAngle: 35,
                            }
                        ]}
                        width={650}
                        height={400}
                        title="QPay Days"
                    />

                    <Button onClick={() => setReload(pre => !pre)}>Change color</Button>
                </div>

            </div>
        </>
    )
}

export default QPayBasedComp;