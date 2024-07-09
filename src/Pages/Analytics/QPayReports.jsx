import { useState, useEffect } from "react";
import api from "../../API";
import { Card, FormControlLabel, Switch, Tab, Box, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, Checkbox, TextField, Autocomplete } from "@mui/material";
import { Done, RotateLeft, CheckBoxOutlineBlank, CheckBox } from '@mui/icons-material'
import QPayListComp from "./QPayComps/qpayList";
import { TabPanel, TabList, TabContext } from '@mui/lab';
import QPaySalesBasedComp from "./QPayComps/salesBased";
import QPayBasedComp from "./QPayComps/qPayBased";
import FilterableTable from "../../Components/filterableTable";


const icon = <CheckBoxOutlineBlank fontSize="small" />;
const checkedIcon = <CheckBox fontSize="small" />;

const QPayReports = () => {
    const [repData, setRepData] = useState([]);
    const [otherFilter, setOtherFilter] = useState([]);
    const [district, setDistrict] = useState([]);
    const [brokers, setBrokers] = useState([]);
    const [owners, setOwners] = useState([]);
    const [showData, setShowData] = useState([]);
    const tabList = ['LIST', 'Q-PAY BASED', 'SALES VALUE BASED', 'test'];
    const filterInitialValue = {
        zeros: false,
        company: 2,
        consolidate: 1,
        view: 'test',
        filterDialog: false,
        Q_Pay_Days: {
            min: '',
            max: '',
        },
        Ledger_name: '',
        Ref_Brokers: [],
        Ref_Owners: [],
        Party_District: [],
        Freq_Days: {
            min: '',
            max: '',
        },
        Sales_Count: {
            min: '',
            max: '',
        },
        Sales_Amount: {
            min: '',
            max: '',
        },
    }
    const [cusFilter, setCusFilter] = useState(filterInitialValue);

    useEffect(() => {
        setRepData([])
        fetch(`${api}TallyReports/qPay?Company_Id=${cusFilter?.company}&Consolidate=${cusFilter?.consolidate}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setRepData(data.data)
                }
            })
            .catch(e => console.error(e))
    }, [cusFilter?.company, cusFilter?.consolidate])

    const comStr = (str) => str ? (str.trim()).toLowerCase() : '';

    useEffect(() => {
        const temp = [...repData];
        const zerosIncluded = !cusFilter.zeros ? temp.filter(o => o?.Q_Pay_Days) : repData;

        const uniqueDistrict = [];
        const uniqueBroker = [];
        const uniqueOwner = [];

        zerosIncluded.forEach(o => {
            const index1 = uniqueDistrict.findIndex(ob => comStr(ob) === comStr(o?.Party_District));
            const index2 = uniqueBroker.findIndex(ob => comStr(ob) === comStr(o?.Ref_Brokers));
            const index3 = uniqueOwner.findIndex(ob => comStr(ob) === comStr(o?.Ref_Owners));

            if (index1 === -1) {
                uniqueDistrict.push(o?.Party_District)
            }
            if (index2 === -1) {
                uniqueBroker.push(o?.Ref_Brokers)
            }
            if (index3 === -1) {
                uniqueOwner.push(o?.Ref_Owners)
            }
        })

        uniqueDistrict.sort();
        uniqueBroker.sort();
        uniqueOwner.sort();

        setOtherFilter(zerosIncluded);
        setShowData(zerosIncluded);
        setDistrict(uniqueDistrict);
        setBrokers(uniqueBroker);
        setOwners(uniqueOwner);
    }, [repData, cusFilter.zeros, cusFilter.consolidate, cusFilter.company])

    const dispTab = (val) => {
        switch (val) {
            case 'LIST': return <QPayListComp dataArray={showData} brokers={brokers} district={district} owners={owners} />
            case 'Q-PAY BASED': return <QPayBasedComp dataArray={showData} />
            case 'SALES VALUE BASED': return <QPaySalesBasedComp dataArray={showData} />
            case 'test': return <FilterableTable dataArray={showData} />
            default: <></>
        }
    }

    useEffect(() => {
        const beforeFilter = [...otherFilter];

        const filteredData = beforeFilter.filter(item => {

            if (cusFilter.Q_Pay_Days.min !== '' && item?.Q_Pay_Days < cusFilter.Q_Pay_Days.min) {
                return false;
            }
            if (cusFilter.Q_Pay_Days.max !== '' && item?.Q_Pay_Days > cusFilter.Q_Pay_Days.max) {
                return false;
            }

            if (cusFilter.Ledger_name && !item?.Ledger_name?.toLowerCase().includes(cusFilter.Ledger_name.toLowerCase())) {
                return false;
            }

            if (cusFilter.Ref_Brokers.length > 0 && !cusFilter.Ref_Brokers.map(broker => broker.toLowerCase()).includes(comStr(item?.Ref_Brokers))) {
                return false;
            }

            if (cusFilter.Ref_Owners.length > 0 && !cusFilter.Ref_Owners.map(owner => owner.toLowerCase()).includes(comStr(item?.Ref_Owners))) {
                return false;
            }

            if (cusFilter.Party_District.length > 0 && !cusFilter.Party_District.map(district => district.toLowerCase()).includes(comStr(item?.Party_District))) {
                return false;
            }

            if (cusFilter.Freq_Days.min !== '' && item?.Freq_Days < cusFilter.Freq_Days.min) {
                return false;
            }
            if (cusFilter.Freq_Days.max !== '' && item?.Freq_Days > cusFilter.Freq_Days.max) {
                return false;
            }

            if (cusFilter.Sales_Count.min !== '' && item?.Sales_Count < cusFilter.Sales_Count.min) {
                return false;
            }
            if (cusFilter.Sales_Count.max !== '' && item?.Sales_Count > cusFilter.Sales_Count.max) {
                return false;
            }

            if (cusFilter.Sales_Amount.min !== '' && item?.Sales_Amount < cusFilter.Sales_Amount.min) {
                return false;
            }
            if (cusFilter.Sales_Amount.max !== '' && item?.Sales_Amount > cusFilter.Sales_Amount.max) {
                return false;
            }

            return true;
        });

        setShowData(filteredData);
    }, [
        cusFilter.Q_Pay_Days,
        cusFilter.Ledger_name,
        cusFilter.Ref_Brokers,
        cusFilter.Ref_Owners,
        cusFilter.Party_District,
        cusFilter.Freq_Days,
        cusFilter.Sales_Count,
        cusFilter.Sales_Amount,
        otherFilter
    ]);

    return (
        <>
            <Card>

                <div className="d-flex flex-wrap justify-content-between p-2">
                    <span>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={!cusFilter.zeros}
                                    onChange={e => setCusFilter(pre => ({ ...pre, zeros: !(e.target.checked) }))}
                                />
                            }
                            label="Remove Zeros"
                            labelPlacement="start"
                            className=" fw-bold text-primary"
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={cusFilter.consolidate === 1 ? true : false}
                                    onChange={e => setCusFilter(pre => ({ ...pre, consolidate: e.target.checked ? 1 : 0 }))}
                                />
                            }
                            label="Consolidate"
                            labelPlacement="start"
                            className=" fw-bold text-primary"
                        />
                    </span>

                    <span>
                        <IconButton
                            size="small"
                            onClick={() => {
                                setCusFilter(pre => ({ ...filterInitialValue, view: pre.view }));
                            }}
                        >
                            <RotateLeft color='secondary' />
                        </IconButton>
                    </span>
                </div>

                <div className="row flex-md-row-reverse">

                    <div className="col-lg-3 col-md-4">

                        <div className="px-3 mb-2">
                            <p className="fa-15 mt-2 mb-1 text-muted">Ref Brokers</p>

                            <Autocomplete
                                multiple
                                id="checkboxes-tags-demo"
                                options={brokers}
                                disableCloseOnSelect
                                getOptionLabel={option => option}
                                value={cusFilter?.Ref_Brokers || []}
                                onChange={(f, e) => setCusFilter(pre => ({ ...pre, Ref_Brokers: e }))}
                                renderOption={(props, option, { selected }) => (
                                    <li {...props}>
                                        <Checkbox
                                            icon={icon}
                                            checkedIcon={checkedIcon}
                                            style={{ marginRight: 8 }}
                                            checked={selected}
                                        />
                                        {option}
                                    </li>
                                )}
                                // className="w-1"
                                isOptionEqualToValue={(opt, val) => opt === val}
                                renderInput={(params) => (
                                    <TextField {...params} label="Ref-Brokers" placeholder="Select Ref-Brokers" />
                                )}
                            />

                            <p className="fa-15 mt-2 mb-1 text-muted">Ref Owners</p>

                            <Autocomplete
                                multiple
                                id="checkboxes-tags-demo"
                                options={owners}
                                disableCloseOnSelect
                                getOptionLabel={option => option}
                                value={cusFilter?.Ref_Owners || []}
                                onChange={(f, e) => setCusFilter(pre => ({ ...pre, Ref_Owners: e }))}
                                renderOption={(props, option, { selected }) => (
                                    <li {...props}>
                                        <Checkbox
                                            icon={icon}
                                            checkedIcon={checkedIcon}
                                            style={{ marginRight: 8 }}
                                            checked={selected}
                                        />
                                        {option}
                                    </li>
                                )}
                                className="w-1"
                                isOptionEqualToValue={(opt, val) => opt === val}
                                renderInput={(params) => (
                                    <TextField {...params} label="Ref-Owners" placeholder="Select Ref-Owners" />
                                )}
                            />

                            <p className="fa-15 mt-2 mb-1 text-muted">Party District</p>

                            <Autocomplete
                                multiple
                                id="checkboxes-tags-demo"
                                options={district}
                                disableCloseOnSelect
                                getOptionLabel={option => option}
                                value={cusFilter?.Party_District || []}
                                onChange={(f, e) => setCusFilter(pre => ({ ...pre, Party_District: e }))}
                                renderOption={(props, option, { selected }) => (
                                    <li {...props}>
                                        <Checkbox
                                            icon={icon}
                                            checkedIcon={checkedIcon}
                                            style={{ marginRight: 8 }}
                                            checked={selected}
                                        />
                                        {option}
                                    </li>
                                )}
                                className="w-1"
                                isOptionEqualToValue={(opt, val) => opt === val}
                                renderInput={(params) => (
                                    <TextField {...params} label="Party-District" placeholder="Select Party-District" />
                                )}
                            />

                            <p className="fa-15 mt-2 mb-1 text-muted">Q-Pay Days</p>

                            <input
                                className="cus-inpt"
                                value={cusFilter?.Ledger_name}
                                onChange={e => setCusFilter(pre => ({ ...pre, Ledger_name: e.target.value }))}
                                placeholder="Search Ledger-Name"
                            />

                            <p className="fa-15 mt-2 mb-1 text-muted">Q-Pay Days</p>
                            <div className="d-flex">

                                <input
                                    type="number"
                                    value={cusFilter?.Q_Pay_Days?.min}
                                    onChange={e => setCusFilter(pre => ({ ...pre, Q_Pay_Days: { ...pre.Q_Pay_Days, min: e.target.value } }))}
                                    className="bg-light border-0 m-1 p-1 w-50"
                                    placeholder="Min"
                                />
                                <input
                                    type="number"
                                    value={cusFilter?.Q_Pay_Days?.max}
                                    onChange={e => setCusFilter(pre => ({ ...pre, Q_Pay_Days: { ...pre.Q_Pay_Days, max: e.target.value } }))}
                                    className="bg-light border-0 m-1 p-1 w-50"
                                    placeholder="Max"
                                />
                            </div>

                            <p className="fa-15 mt-2 mb-1 text-muted">Frequency Days</p>
                            <div className="d-flex">

                                <input
                                    type="number"
                                    value={cusFilter?.Freq_Days?.min}
                                    onChange={e => setCusFilter(pre => ({ ...pre, Freq_Days: { ...pre.Freq_Days, min: e.target.value } }))}
                                    className="bg-light border-0 m-1 p-1 w-50"
                                    placeholder="Min"
                                />
                                <input
                                    type="number"
                                    value={cusFilter?.Freq_Days?.max}
                                    onChange={e => setCusFilter(pre => ({ ...pre, Freq_Days: { ...pre.Freq_Days, max: e.target.value } }))}
                                    className="bg-light border-0 m-1 p-1 w-50"
                                    placeholder="Max"
                                />
                            </div>

                            <p className="fa-15 mt-2 mb-1 text-muted">Sales Count</p>
                            <div className="d-flex">

                                <input
                                    type="number"
                                    value={cusFilter?.Sales_Count?.min}
                                    onChange={e => setCusFilter(pre => ({ ...pre, Sales_Count: { ...pre.Sales_Count, min: e.target.value } }))}
                                    className="bg-light border-0 m-1 p-1 w-50"
                                    placeholder="Min"
                                />
                                <input
                                    type="number"
                                    value={cusFilter?.Sales_Count?.max}
                                    onChange={e => setCusFilter(pre => ({ ...pre, Sales_Count: { ...pre.Sales_Count, max: e.target.value } }))}
                                    className="bg-light border-0 m-1 p-1 w-50"
                                    placeholder="Max"
                                />
                            </div>


                            <p className="fa-15 mt-2 mb-1 text-muted">Sales Amount</p>
                            <div className="d-flex">

                                <input
                                    type="number"
                                    value={cusFilter?.Sales_Amount?.min}
                                    onChange={e => setCusFilter(pre => ({ ...pre, Sales_Amount: { ...pre.Sales_Amount, min: e.target.value } }))}
                                    className="bg-light border-0 m-1 p-1 w-50"
                                    placeholder="Min"
                                />
                                <input
                                    type="number"
                                    value={cusFilter?.Sales_Amount?.max}
                                    onChange={e => setCusFilter(pre => ({ ...pre, Sales_Amount: { ...pre.Sales_Amount, max: e.target.value } }))}
                                    className="bg-light border-0 m-1 p-1 w-50"
                                    placeholder="Max"
                                />
                            </div>

                        </div>
                    </div>

                    <div className="col-lg-9 col-md-8">
                        <div className="p-2">
                            <TabContext value={cusFilter.view}>
                                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                    <TabList
                                        indicatorColor='transparant'
                                        onChange={(e, n) => setCusFilter(pre => ({ ...pre, view: n }))}
                                        variant="scrollable"
                                        scrollButtons="auto"
                                        allowScrollButtonsMobile
                                    >
                                        {tabList.map(o => (
                                            <Tab sx={cusFilter.view === o ? { backgroundColor: '#c6d7eb' } : {}} label={o} value={o} key={o} />
                                        ))}
                                    </TabList>
                                </Box>
                                {tabList.map(o => (
                                    <TabPanel value={o} sx={{ px: 0, py: 2 }} key={o}>
                                        {dispTab(cusFilter.view)}
                                    </TabPanel>
                                ))}
                            </TabContext>
                        </div>
                    </div>


                </div>

            </Card>


            <Dialog
                open={cusFilter.filterDialog}
                onClose={() => setCusFilter(pre => ({ ...pre, filterDialog: false }))}
                fullWidth maxWidth='md'
            >
                <DialogTitle>Filters</DialogTitle>
                <DialogContent>
                    <div className="table-responsive">
                        <table className="table">
                            <tbody>
                                <tr>
                                    <td className="border-0" style={{ verticalAlign: 'middle' }}>Q-Pay Days</td>
                                    <td className="border-0">
                                        <div className="d-flex ">
                                            <input
                                                type="number"
                                                value={cusFilter?.Q_Pay_Days?.min}
                                                onChange={e => setCusFilter(pre => ({ ...pre, Q_Pay_Days: { ...pre.Q_Pay_Days, min: e.target.value } }))}
                                                className="cus-inpt w-auto me-1 p-2"
                                                placeholder="Min"
                                            />
                                            <input
                                                type="number"
                                                value={cusFilter?.Q_Pay_Days?.max}
                                                onChange={e => setCusFilter(pre => ({ ...pre, Q_Pay_Days: { ...pre.Q_Pay_Days, max: e.target.value } }))}
                                                className="cus-inpt w-auto me-1 p-2"
                                                placeholder="Max"
                                            />
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border-0" style={{ verticalAlign: 'middle' }}>Ledger name</td>
                                    <td className="border-0">
                                        <input
                                            className="cus-inpt"
                                            value={cusFilter?.Ledger_name}
                                            onChange={e => setCusFilter(pre => ({ ...pre, Ledger_name: e.target.value }))}
                                            placeholder="Search Ledger-Name"
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border-0" style={{ verticalAlign: 'middle' }}>Ref Brokers</td>
                                    <td className="border-0">
                                        <Autocomplete
                                            multiple
                                            id="checkboxes-tags-demo"
                                            options={brokers}
                                            disableCloseOnSelect
                                            getOptionLabel={option => option}
                                            value={cusFilter?.Ref_Brokers || []}
                                            onChange={(f, e) => setCusFilter(pre => ({ ...pre, Ref_Brokers: e }))}
                                            renderOption={(props, option, { selected }) => (
                                                <li {...props}>
                                                    <Checkbox
                                                        icon={icon}
                                                        checkedIcon={checkedIcon}
                                                        style={{ marginRight: 8 }}
                                                        checked={selected}
                                                    />
                                                    {option}
                                                </li>
                                            )}
                                            className="w-1"
                                            isOptionEqualToValue={(opt, val) => opt === val}
                                            renderInput={(params) => (
                                                <TextField {...params} label="Ref-Brokers" placeholder="Select Ref-Brokers" />
                                            )}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border-0" style={{ verticalAlign: 'middle' }}>Ref Owners</td>
                                    <td className="border-0">
                                        <Autocomplete
                                            multiple
                                            id="checkboxes-tags-demo"
                                            options={owners}
                                            disableCloseOnSelect
                                            getOptionLabel={option => option}
                                            value={cusFilter?.Ref_Owners || []}
                                            onChange={(f, e) => setCusFilter(pre => ({ ...pre, Ref_Owners: e }))}
                                            renderOption={(props, option, { selected }) => (
                                                <li {...props}>
                                                    <Checkbox
                                                        icon={icon}
                                                        checkedIcon={checkedIcon}
                                                        style={{ marginRight: 8 }}
                                                        checked={selected}
                                                    />
                                                    {option}
                                                </li>
                                            )}
                                            className="w-1"
                                            isOptionEqualToValue={(opt, val) => opt === val}
                                            renderInput={(params) => (
                                                <TextField {...params} label="Ref-Owners" placeholder="Select Ref-Owners" />
                                            )}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border-0" style={{ verticalAlign: 'middle' }}>Party District</td>
                                    <td className="border-0">
                                        <Autocomplete
                                            multiple
                                            id="checkboxes-tags-demo"
                                            options={district}
                                            disableCloseOnSelect
                                            getOptionLabel={option => option}
                                            value={cusFilter?.Party_District || []}
                                            onChange={(f, e) => setCusFilter(pre => ({ ...pre, Party_District: e }))}
                                            renderOption={(props, option, { selected }) => (
                                                <li {...props}>
                                                    <Checkbox
                                                        icon={icon}
                                                        checkedIcon={checkedIcon}
                                                        style={{ marginRight: 8 }}
                                                        checked={selected}
                                                    />
                                                    {option}
                                                </li>
                                            )}
                                            className="w-1"
                                            isOptionEqualToValue={(opt, val) => opt === val}
                                            renderInput={(params) => (
                                                <TextField {...params} label="Party-District" placeholder="Select Party-District" />
                                            )}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border-0" style={{ verticalAlign: 'middle' }}>Freq Days</td>
                                    <td className="border-0">
                                        <div className="d-flex flex-wrap">
                                            <input
                                                type="number"
                                                value={cusFilter?.Freq_Days?.min}
                                                onChange={e => setCusFilter(pre => ({ ...pre, Freq_Days: { ...pre.Freq_Days, min: e.target.value } }))}
                                                className="cus-inpt w-auto me-1 p-2"
                                                placeholder="Min"
                                            />
                                            <input
                                                type="number"
                                                value={cusFilter?.Freq_Days?.max}
                                                onChange={e => setCusFilter(pre => ({ ...pre, Freq_Days: { ...pre.Freq_Days, max: e.target.value } }))}
                                                className="cus-inpt w-auto me-1 p-2"
                                                placeholder="Max"
                                            />
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border-0" style={{ verticalAlign: 'middle' }}>Sales Count</td>
                                    <td className="border-0">
                                        <div className="d-flex flex-wrap">
                                            <input
                                                type="number"
                                                value={cusFilter?.Sales_Count?.min}
                                                onChange={e => setCusFilter(pre => ({ ...pre, Sales_Count: { ...pre.Sales_Count, min: e.target.value } }))}
                                                className="cus-inpt w-auto me-1 p-2"
                                                placeholder="Min"
                                            />
                                            <input
                                                type="number"
                                                value={cusFilter?.Sales_Count?.max}
                                                onChange={e => setCusFilter(pre => ({ ...pre, Sales_Count: { ...pre.Sales_Count, max: e.target.value } }))}
                                                className="cus-inpt w-auto me-1 p-2"
                                                placeholder="Max"
                                            />
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border-0" style={{ verticalAlign: 'middle' }}>Sales Amount</td>
                                    <td className="border-0">
                                        <div className="d-flex flex-wrap">
                                            <input
                                                type="number"
                                                value={cusFilter?.Sales_Amount?.min}
                                                onChange={e => setCusFilter(pre => ({ ...pre, Sales_Amount: { ...pre.Sales_Amount, min: e.target.value } }))}
                                                className="cus-inpt w-auto me-1 p-2"
                                                placeholder="Min"
                                            />
                                            <input
                                                type="number"
                                                value={cusFilter?.Sales_Amount?.max}
                                                onChange={e => setCusFilter(pre => ({ ...pre, Sales_Amount: { ...pre.Sales_Amount, max: e.target.value } }))}
                                                className="cus-inpt w-auto me-1 p-2"
                                                placeholder="Max"
                                            />
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            setCusFilter({ ...filterInitialValue, filterDialog: true });
                        }}
                        startIcon={<RotateLeft />}
                    >
                        Reset Filter
                    </Button>
                    <Button
                        onClick={() => setCusFilter(pre => ({ ...pre, filterDialog: false }))}
                        variant="contained"
                        startIcon={<Done />}
                    >
                        Apply
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )

}



export default QPayReports