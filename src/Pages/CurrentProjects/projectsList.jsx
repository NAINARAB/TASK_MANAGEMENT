import { useEffect, useState, useContext } from "react";
import api from "../../API";
import '../common.css';
import { IconButton } from '@mui/material'
import { Launch } from '@mui/icons-material'
import { BarChart, Group, WorkHistory, CalendarMonth } from '@mui/icons-material';
import { CgUserList } from "react-icons/cg";
import { useNavigate } from 'react-router-dom';
import { MyContext } from "../../Components/context/contextProvider";


const ActiveProjects = () => {
    const [projects, setProjects] = useState([]);
    const { contextObj } = useContext(MyContext);
    const nav = useNavigate();

    useEffect(() => {
        fetch(`${api}projectAbstract`)
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setProjects(data.data);
                }
            });
    }, []);

    const calcPercentage = (task, completed) => {
        if (Number(task) === 0) {
            return 0;
        } else {
            return ((Number(completed) / Number(task)) * 100).toFixed(0);
        }
    }

    const CardDisplay = ({ icon, label, value, value2 }) => {
        return (
            <div className="col-xxl-3 col-lg-4 col-md-6 mb-3">
                <div className="p-3 rounded-3 mnh">
                    <div className="d-flex">
                        <span className='smallicon fa-17 me-2'>{icon}</span>
                        <span className={`text-uppercase fw-bold text-muted fa-16`}>
                            {label}
                        </span>
                    </div>
                    <p className={`text-end mb-0 fw-bold`} style={{ fontSize: '26px' }} >
                        {value}
                        <span className="fa-20">{value2 && ' /' + value2}</span>
                    </p>
                </div>
            </div>
        )
    }

    return (
        <>
            <>
                {/* <div className="table-responsive">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Project</th>
                            <th>Progress</th>
                            <th>Estimation</th>
                            <th>Schedule</th>
                            <th>Completed Tasks</th>
                            <th>Employees Involved</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {projects.map((o, i) => (
                            <tr key={i}>
                                <td>{o.Project_Name}</td>
                                <td>{calcPercentage(o?.TasksInvolved, o?.CompletedTasks)} %</td>
                                <td>
                                    {o?.Est_Start_Dt && (
                                        new Date(o.Est_Start_Dt)
                                            .toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
                                    )}
                                    {" - "}
                                    {o?.Est_End_Dt && (
                                        new Date(o.Est_End_Dt)
                                            .toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
                                    )}
                                    {" "}
                                    {"\(" + ((new Date(o.Est_End_Dt) - new Date(o.Est_Start_Dt)) / (1000 * 60 * 60 * 24) + 1) + " Days\)"}
                                </td>
                                <td>{o?.SchedulesCount}</td>
                                <td>{o?.CompletedTasks + " | " + o?.TasksInvolved}</td>
                                <td>{o?.EmployeesInvolved}</td>
                                <td>
                                    <IconButton className="btn btn-primary text-white " onClick={() => {
                                        nav('projectschedule', {
                                            state: {
                                                project: o,
                                                rights: {
                                                    read: contextObj.Read_Rights,
                                                    add: contextObj.Add_Rights,
                                                    edit: contextObj.Edit_Rights,
                                                    delete: contextObj.Delete_Rights
                                                }
                                            }
                                        })
                                    }
                                    }>
                                        <Launch className="text-dark" />
                                    </IconButton>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div> */}
            </>


            {projects.map((o, i) => (
                <div className="project-card p-0"
                    key={i}
                    onClick={() => {
                        nav('projectschedule', {
                            state: {
                                project: o,
                                rights: {
                                    read: contextObj.Read_Rights,
                                    add: contextObj.Add_Rights,
                                    edit: contextObj.Edit_Rights,
                                    delete: contextObj.Delete_Rights
                                }
                            }
                        })
                    }} >
                    <div className="fa-18 mb-3 text-dark text-uppercase fw-bold d-flex align-items-center px-3 py-2 border-bottom ">
                        <span className="flex-grow-1">{o.Project_Name} </span>
                        <IconButton className="bg-light" onClick={() => {
                            nav('projectschedule', {
                                state: {
                                    project: o,
                                    rights: {
                                        read: contextObj.Read_Rights,
                                        add: contextObj.Add_Rights,
                                        edit: contextObj.Edit_Rights,
                                        delete: contextObj.Delete_Rights
                                    }
                                }
                            })
                        }
                        }>
                            <Launch className="text-dark" />
                        </IconButton>
                    </div>

                    <div className="row px-3">

                        <CardDisplay
                            icon={<BarChart className="fa-in" />}
                            label={'progress'}
                            value={calcPercentage(o?.TasksScheduled, o?.CompletedTasks) + ' %'}
                        />

                        <CardDisplay
                            icon={<WorkHistory className="fa-in" />}
                            label={'schedule / completed'}
                            value={o?.SchedulesCompletedCount}
                            value2={o?.SchedulesCount}
                        />

                        <CardDisplay
                            icon={<WorkHistory className="fa-in" />}
                            label={'task / Completed'}
                            value={o?.CompletedTasks}
                            value2={o?.TasksScheduled}
                        />

                        <CardDisplay
                            icon={<CgUserList className="fa-in" />}
                            label={'task process / assigned'}
                            value={o?.TasksProgressCount}
                            value2={o?.TasksAssignedToEmployee}
                        />

                        <CardDisplay
                            icon={<Group className="fa-in" />}
                            label={'employee involved'}
                            value={o?.EmployeesInvolved}
                        />

                        <div className="col-xxl-3 col-lg-4 col-md-6 mb-3">
                            <div className="p-3 rounded-3 mnh" >
                                <div className="d-flex">
                                    <span className='smallicon fa-17 me-2'><CalendarMonth className="fa-in" /></span>
                                    <span className='text-uppercase fw-bold fa-16 text-muted'>duration</span>
                                </div>
                                <p className="text-end fa-15 mb-0 fw-bold">
                                    {o?.Est_Start_Dt && (
                                        new Date(o.Est_Start_Dt)
                                            .toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
                                    )}
                                    {" - "}
                                    {o?.Est_End_Dt && (
                                        new Date(o.Est_End_Dt)
                                            .toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
                                    )}
                                    {" "}
                                    {"\(" + ((new Date(o.Est_End_Dt) - new Date(o.Est_Start_Dt)) / (1000 * 60 * 60 * 24) + 1) + "DAYS\)"}
                                </p>
                            </div>
                        </div>

                    </div>

                    {/* <hr className="m-0" /> */}

                    {/* <div className="text-end mt-2">
                        <button className="btn btn-primary rounded-5 px-4 text-white fw-bold" onClick={() => {
                            nav('projectschedule', {
                                state: {
                                    project: o,
                                    rights: {
                                        read: contextObj.Read_Rights,
                                        add: contextObj.Add_Rights,
                                        edit: contextObj.Edit_Rights,
                                        delete: contextObj.Delete_Rights
                                    }
                                }
                            })
                        }
                        }>
                            OPEN
                        </button>
                    </div> */}

                </div>
            ))}
        </>
    )
}

export default ActiveProjects;