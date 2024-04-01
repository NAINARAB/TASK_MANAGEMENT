import React, { useEffect, useState } from "react";
import api from "../../API";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import "react-toastify/dist/ReactToastify.css";
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list';
import Select from 'react-select';
import { customSelectStyles } from "../../Components/tablecolumn";

const ReportCalendar = () => {
    const localData = localStorage.getItem("user");
    const parseData = JSON.parse(localData);
    const initialValueFilter = {
        Emp_Id: '',
        Project_Id: 0,
        Task_Id: 0,
        from: new Date().toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0],
        EmpGet: 'All Employee',
        ProjectGet: 'All Project',
        TaskGet: 'All Task'
    }
    const [workedDetais, setWorkedDetais] = useState([]);
    const [selectedTask, setSelectedTask] = useState({});
    const [dialog, setDialog] = useState(false);
    const [filters, setFileters] = useState(initialValueFilter);
    const [projects, setProjects] = useState([]);
    const [usersDropDown, setUsersDropdown] = useState([]);
    const [tasks, setTasks] = useState([]);

    // const GetFormatedTime = (timeString) => {
    //     const [timePart, period] = timeString.split(" ");
    //     const [hoursStr, minutesStr] = timePart.split(":");

    //     let hours = parseInt(hoursStr);
    //     if (period === "PM") {
    //         hours = (hours === 12) ? 12 : hours + 12;
    //     } else {
    //         hours = (hours === 12) ? 0 : hours;
    //     }

    //     const dateString = new Date().toISOString().split('T')[0];
    //     const isoTimeString = `${dateString}T${hours.toString().padStart(2, '0')}:${minutesStr}:00`;

    //     return new Date(isoTimeString);
    // }

    useEffect(() => {
        fetch(`${api}workReport?Emp_Id=${filters.Emp_Id}&Project_Id=${filters.Project_Id}&from=${filters.from}&to=${filters.to}&Task_Id=${filters.Task_Id}`)
            // fetch(`${api}workReport`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    // data.data.forEach(o => {
                    //     o.Start_Time = new Date(GetFormatedTime(o?.Start_Time)).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
                    //     o.End_Time = new Date(GetFormatedTime(o?.End_Time)).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })
                    // })
                    // console.log({ ...data.data.forEach(o => console.log(o.Start_Time)) })
                    setWorkedDetais(data.data)
                }
            }).catch(e => console.error(e))
    }, [filters])

    useEffect(() => {
        fetch(`${api}projectDropDown`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setProjects(data.data)
                }
            }).catch(e => console.error(e))
        fetch(`${api}userName?AllUser=${true}&BranchId=${parseData?.BranchId}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setUsersDropdown(data.data)
                }
            }).catch(e => console.error(e))
        fetch(`${api}tasksDropdown`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setTasks(data.data)
                }
            }).catch(e => console.error(e))
    }, [parseData?.BranchId])

    const formatTime24 = (time24) => {
        const [hours, minutes] = time24.split(':').map(Number);

        let hours12 = hours % 12;
        hours12 = hours12 || 12;
        const period = hours < 12 ? 'AM' : 'PM';
        const formattedHours = hours12 < 10 ? '0' + hours12 : hours12;
        const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
        const time12 = `${formattedHours}:${formattedMinutes} ${period}`;

        return time12;
    }

    // useEffect(() => console.log(workedDetais), [workedDetais])

    console.log(Boolean(Number('2')))

    return (
        <>
            <div className="row">
                <div className="col-xxl-2 col-lg-3 col-md-4 col-sm-4 p-2">
                    <Select
                        value={{ value: filters?.Emp_Id, label: filters?.EmpGet }}
                        onChange={(e) => setFileters({ ...filters, Emp_Id: e.value, EmpGet: e.label })}
                        options={[{ value: '', label: 'All Employee' }, ...usersDropDown.map(obj => ({ value: obj.UserId, label: obj.Name }))]}
                        styles={customSelectStyles}
                        isSearchable={true}
                        placeholder={"Employee Name"} />
                </div>
                <div className="col-xxl-2 col-lg-3 col-md-4 col-sm-4 p-2">
                    <Select
                        value={{ value: filters?.Project_Id, label: filters?.ProjectGet }}
                        onChange={(e) => setFileters({ ...filters, Project_Id: e.value, ProjectGet: e.label })}
                        options={[...projects.map(obj => ({ value: obj.Project_Id, label: Number(obj.Project_Id) === 0 ? 'All Project' : obj.Project_Name }))]}
                        styles={customSelectStyles}
                        isSearchable={true}
                        placeholder={"Project Title"} />
                </div>
                <div className="col-xxl-2 col-lg-3 col-md-4 col-sm-4 p-2">
                    <Select
                        value={{ value: filters?.Task_Id, label: filters?.TaskGet }}
                        onChange={(e) => setFileters({ ...filters, Task_Id: e.value, TaskGet: e.label })}
                        options={[{ value: 0, label: 'All Task' }, ...tasks.map(obj => ({ value: obj.Task_Id, label: obj.Task_Name }))]}
                        styles={customSelectStyles}
                        isSearchable={true}
                        placeholder={"Select Task"} />
                </div>
            </div>

            <div className="px-3 py-2 calendar" >
                <h4 className="mb-3 text-center text-primary">Completed Tasks</h4>

                <FullCalendar
                    plugins={[timeGridPlugin, listPlugin, dayGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    initialDate={new Date()}
                    events={
                        workedDetais.map(o => ({
                            title: o?.Task_Name,
                            start: new Date(o?.Work_Dt).toISOString().split('T')[0] + 'T' + o?.Start_Time,
                            end: new Date(o?.Work_Dt).toISOString().split('T')[0] + 'T' + o?.End_Time,
                            objectData: o
                        }))
                    }
                    headerToolbar={{
                        left: 'prev next',
                        center: 'title',
                        right: 'timeGridDay, timeGridWeek, dayGridMonth, listMonth',
                    }}
                    slotDuration={'00:20:00'}
                    slotMinTime={'08:00:00'}
                    slotMaxTime={'22:00:00'}
                    showNonCurrentDates={false}
                    editable={false}
                    // selectable
                    selectMirror
                    eventClick={eve => {
                        const eveObj = eve.event.extendedProps.objectData;
                        setSelectedTask(eveObj);
                        setDialog(true)
                    }}
                    datesSet={date => {
                        setFileters(pre => ({ ...pre, from: date.startStr.split('T')[0], to: date.endStr.split('T')[0] }))
                    }}
                    height={1200}
                />
            </div>

            <Dialog
                open={dialog} maxWidth="sm" fullWidth
                onClose={() => { setDialog(false); setSelectedTask({}) }}>
                <DialogTitle className="fa-18">
                    Work Details
                </DialogTitle>
                <DialogContent className="pb-0">

                    <div className="table-responsive pb-0">
                        <table className="table mb-0">
                            <tbody>
                                <tr>
                                    <td className="border-1 fa-14">EmpName</td>
                                    <td className="border-1 fa-14">{selectedTask?.EmployeeName}</td>
                                </tr>
                                <tr>
                                    <td className="border-1 fa-14">Task</td>
                                    <td className="border-1 fa-14">{selectedTask?.Task_Name}</td>
                                </tr>
                                <tr>
                                    <td className="border-1 fa-14">Date</td>
                                    <td className="border-1 fa-14">
                                        {selectedTask?.Work_Dt && new Date(selectedTask?.Work_Dt).toLocaleDateString('en-IN', {
                                            day: '2-digit', month: '2-digit', year: 'numeric'
                                        })}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border-1 fa-14">Start Time</td>
                                    <td className="border-1 fa-14">
                                        {selectedTask?.Start_Time && formatTime24(selectedTask?.Start_Time)}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border-1 fa-14">End Time</td>
                                    <td className="border-1 fa-14">
                                        {selectedTask?.End_Time && formatTime24(selectedTask?.End_Time)}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border-1 fa-14">Duration</td>
                                    <td className="border-1 fa-14">
                                        {selectedTask?.Tot_Minutes} ( Minutes )
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border-1 fa-14">Description</td>
                                    <td className="border-1 fa-14">
                                        {selectedTask?.Work_Done}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border-1 fa-14">Status</td>
                                    <td className="border-1 fa-14">
                                        {selectedTask?.WorkStatus}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border-1 fa-14">Project</td>
                                    <td className="border-1 fa-14">{selectedTask?.Project_Name}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setDialog(false); setSelectedTask({}) }}>close</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default ReportCalendar;
