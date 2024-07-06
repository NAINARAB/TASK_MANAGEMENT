// import { useMaterialReactTable } from 'material-react-table';
import { NumberFormat } from '../../../Components/functions';

const QPayListComp = ({ dataArray, brokers, district, owners }) => {

    const qPayColumn = [
        {
            header: 'Q-Pay Days',
            accessorKey: 'Q_Pay_Days',
            sortable: true,
            size: 150,
            Cell: ({ cell }) => <p className="text-center m-0 w-100">{NumberFormat(cell.getValue())}</p>,
            filterVariant: 'range',
            filterFn: 'between',
        },
        {
            header: 'Ledger Name',
            accessorKey: 'Ledger_name',
            sortable: true,
            size: 270
        },
        {
            header: 'Ref Brokers',
            accessorKey: 'Ref_Brokers',
            size: 200,
            Cell: ({ cell }) => <span className="blue-text text-center w-100">{cell.getValue()}</span>,
            filterVariant: 'multi-select',
            filterSelectOptions: brokers,
        },
        {
            header: 'Ref Owners',
            accessorKey: 'Ref_Owners',
            sortable: true,
            size: 170,
            filterVariant: 'multi-select',
            filterSelectOptions: owners,
            Cell: ({ cell }) => <span className="text-center w-100">{cell.getValue()}</span>,
        },
        {
            header: 'Party District',
            accessorKey: 'Party_District',
            sortable: true,
            size: 170,
            filterVariant: 'multi-select',
            filterSelectOptions: district,
            Cell: ({ cell }) => <span className="text-center w-100">{cell.getValue()}</span>,
        },
        {
            header: 'Freq Days',
            accessorKey: 'Freq_Days',
            sortable: true,
            size: 160,
            Cell: ({ cell }) => <span className="text-center w-100">{cell.getValue()}</span>,
            // AggregatedCell: ({ cell }) => <div className="blue-text float-end w-100">{parseInt(cell.getValue())}</div>,
        },
        {
            header: 'Sales Count',
            accessorKey: 'Sales_Count',
            size: 160,
            filterVariant: 'range',
            filterFn: 'between',
            Cell: ({ cell }) => <span className="text-center w-100">{cell.getValue()}</span>,
        },
        {
            header: 'Sales Amount',
            accessorKey: 'Sales_Amount',
            sortable: true,
            minWidth: '200px',
            size: 230,
            Cell: ({ cell }) => Number(cell.getValue())?.toLocaleString('en-IN', {
                currency: 'INR',
                style: 'currency'
            }),
            filterVariant: 'range',
            filterFn: 'between',
        },
    ];

    // const table = useMaterialReactTable({
    //     columns: qPayColumn,
    //     data: dataArray,
    //     enableColumnResizing: true,
    //     enableGrouping: true,
    //     enableStickyHeader: true,
    //     enableColumnOrdering: true,
    //     initialState: {
    //         density: 'compact',
    //         pagination: { pageIndex: 0, pageSize: 100 },
    //         sorting: [{ id: 'Q_Pay_Days' },],
    //         // showColumnFilters: true
    //     },
    //     muiToolbarAlertBannerChipProps: { color: 'primary' },
    //     muiTableContainerProps: { sx: { maxHeight: '65vh', minHeight: '56vh' } }
    // })

    return (
        <>
            {/* <MaterialReactTable table={table} /> */}
            <div className="table-responsive" style={{ maxHeight: '67vh' }}>
                <table className="table">
                    <thead>
                        <tr>
                            {qPayColumn.map((o, i) => (
                                <th className='border fa-14 text-center tble-hed-stick' key={i}>{o?.header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {dataArray?.map((o, i) => (
                            <tr key={i}>
                                {qPayColumn?.map((oo, ii) => (
                                    <td className={`fa-13 border ${oo.accessorKey === 'Sales_Amount' ? 'text-end' : 'text-center'}`}>
                                        {oo.accessorKey === 'Sales_Amount' ? Number(o[oo.accessorKey])?.toLocaleString('en-IN', {
                                            currency: 'INR',
                                            style: 'currency'
                                        }) : o[oo.accessorKey]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    )

}



export default QPayListComp