import React, { FC, useEffect, useState } from 'react';
import { GraphPage } from './pages/GraphPage';
import { INode, UserToken } from '../../../types';
import { Projects } from './components/Projects';
import { Topbar } from './components/TopBar';
import { useDispatch } from 'react-redux';
import * as projectReducer from './reducers/projectReducer';
import './App.css';
import { Route, Routes } from 'react-router';
import { Registration } from './pages/Registration';
import { loginUser, setToken } from './services/userService';
import { LoginForm } from './components/LoginForm';
//import { useNavigate } from 'react-router-dom';
import toast, { resolveValue, Toaster } from 'react-hot-toast';
import { checkLogin } from './services/userService';

export const basicNode: INode = {
    status: 'ToDo',
    label: 'Text',
    priority: 'Urgent',
    x: 0,
    y: 0,
    project_id: 0,
};

export const App: FC = () => {
    const dispatch = useDispatch();

    const [user, setUser] = useState<UserToken | null>(null);
    const [userParsed, setUserParsed] = useState<boolean>(false);

    useEffect(() => {
        const loggedUserJson = window.localStorage.getItem('loggedGraphUser');
        if (loggedUserJson) {
            const user = JSON.parse(loggedUserJson);
            checkLogin(user).then((x) => {
                if (x) {
                    console.log('User is valid!');
                    setUser(user);
                    setToken(user.token);
                } else {
                    console.log('OLD USER!');
                    setUser(null);
                    setToken('');
                    window.localStorage.removeItem('loggedGraphUser');
                }

                setUserParsed(true);
            });
        } else {
            setUserParsed(true);
        }
    }, []);

    /**
     * Fetches the projects from a database
     */
    useEffect(() => {
        if (user) {
            dispatch(projectReducer.projectInit());
        }
    }, [dispatch, user]);

    // Wait for the parsing of localStorage
    if (!userParsed) {
        return <></>;
    }

    if (!user && !location.pathname.startsWith('/user')) {
        //useNavigate causes a warning when used here for some reason, but works!
        //navigate('/user/login');

        // This solution shows the home page for a moment if not logged in, but does not cause an error
        window.location.href = '/user/login';
    }

    return (
        <div className="app">
            <Toaster toastOptions={{ duration: 30000 }}>
                {(t) => (
                    <span
                        style={{
                            opacity: t.visible ? 1 : 0,
                            background: 'white',
                            padding: 8,
                            cursor: 'pointer',
                            border: '1px solid black',
                            borderRadius: '10px',
                            color: 'black',
                        }}
                        onClick={() => toast.dismiss(t.id)}
                    >
                        {resolveValue(t.message, t)}
                    </span>
                )}
            </Toaster>
            <div>
                <Topbar user={user} setUser={setUser} />
            </div>
            <Routes>
                <Route path="/" element={<Projects user={user} />}></Route>
                <Route path="/project/:id" element={<GraphPage />}></Route>
                <Route path="/user/register" element={<Registration />}></Route>
                <Route
                    path="/user/login"
                    element={
                        <LoginForm loginUser={loginUser} setUser={setUser} />
                    }
                ></Route>
            </Routes>
        </div>
    );
};
