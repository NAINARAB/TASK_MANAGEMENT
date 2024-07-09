import React, { useState } from 'react';
import { Table, TableBody, TableContainer, TableRow, Paper, TablePagination} from '@mui/material';

const FilterableTable = ({ dataArray, columns }) => {
    
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);

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

    return (
        <div>
            <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
                <Table stickyHeader size="small">
                    {/* <TableHead>
                        <TableRow>
                            {columns.map(column => (
                                <TableCell key={column}>{column}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead> */}
                    <TableBody>
                        {paginatedData.map((row, index) => (
                            <TableRow key={index}>
                                {/* {columns.map(column => (
                                    <TableCell key={column}>{row[column]}</TableCell>
                                ))} */}
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
                    rowsPerPageOptions={[10, 25, 50, 100, 200, 500, dataArray.length]}
                    labelRowsPerPage="Rows per page"
                    showFirstButton
                    showLastButton
                />
            </div>
        </div>
    );
};

export default FilterableTable;
