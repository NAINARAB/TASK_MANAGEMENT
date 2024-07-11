import React, { useState } from 'react';
import { Table, TableBody, TableContainer, TableRow, Paper, TablePagination, TableHead, TableCell } from '@mui/material';
import { isEqualNumber, LocalDate, NumberFormat } from './functions';

const FilterableTable = ({ dataArray, columns }) => {

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedData = dataArray.slice(startIndex, endIndex);

    const formatString = (val, dataType) => {
        switch (dataType) {
            case 'number': 
                return NumberFormat(val)
            case 'date':
                return LocalDate(val);
            case 'string':
                return val;
            default: 
                return ''
        }
    }

    return (
        <div>
            <TableContainer component={Paper} sx={{ maxHeight: 550 }}>
                <Table stickyHeader size="small">
                    <TableHead>
                        <TableRow>
                            {columns.map((column, ke) => (isEqualNumber(column?.Defult_Display, 1) || isEqualNumber(column?.isVisible, 1)) && (
                                <TableCell key={ke} className='fa-14 fw-bold border-end border-top' style={{ backgroundColor: '#EDF0F7' }}>
                                    {column?.Field_Name?.replace(/_/g, ' ')}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedData.map((row, index) => (
                            <TableRow key={index}>
                                {columns.map(column => (
                                    Object.entries(row).map(([key, value]) => (
                                        (
                                            (column.Field_Name === key)
                                            &&
                                            (isEqualNumber(column?.Defult_Display, 1) || isEqualNumber(column?.isVisible, 1))
                                        ) && (
                                            <TableCell 
                                                key={column + index}
                                                className='fa-13 border-end'
                                            >
                                                {formatString(value, column?.Fied_Data)}
                                            </TableCell>
                                        )
                                    ))
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <div className="p-2">
                <TablePagination
                    component="div"
                    count={dataArray.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[20, 50, 100, 200, 500]}
                    labelRowsPerPage="Rows per page"
                    showFirstButton
                    showLastButton
                />
            </div>
        </div>
    );
};

export default FilterableTable;
