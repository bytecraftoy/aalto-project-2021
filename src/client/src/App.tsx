import React, { useEffect, useState } from 'react';
import { Graph } from './components/Graph';
import { Elements, ArrowHeadType } from 'react-flow-renderer';
import * as nodeService from './services/nodeService';
import * as edgeService from './services/edgeService';
import { INode, IEdge, UserToken } from '../../../types';
import { Topbar } from './components/TopBar';

import './App.css';
import { Route, Routes } from 'react-router';
import { Registration } from './pages/Registration';
import { loginUser } from './services/userService';
import { LoginForm } from './components/LoginForm';
import { Navigate } from 'react-router-dom';

export const basicNode: INode = {
    status: 'ToDo',
    label: 'Text',
    priority: 'Urgent',
    x: 0,
    y: 0,
};

export const App: React.FC = () => {
    const [elements, setElements] = useState<Elements>([]);

    const [user, setUser] = useState<UserToken | null>(null);

    /**
     * Fetches the elements from a database
     */
    useEffect(() => {
        const getElementsHook = async () => {
            let nodes: INode[];
            let edges: IEdge[];
            try {
                [nodes, edges] = await Promise.all([
                    nodeService.getAll(),
                    edgeService.getAll(),
                ]);
            } catch (e) {
                return;
            }

            const nodeElements: Elements = nodes.map((n) => ({
                id: String(n.id),
                data: n,
                position: { x: n.x, y: n.y },
            }));
            // Edge Types: 'default' | 'step' | 'smoothstep' | 'straight'
            const edgeElements: Elements = edges.map((e) => ({
                id: String(e.source_id) + '-' + String(e.target_id),
                source: String(e.source_id),
                target: String(e.target_id),
                type: 'straight',
                arrowHeadType: ArrowHeadType.ArrowClosed,
                data: e,
            }));
            setElements(nodeElements.concat(edgeElements));
        };
        getElementsHook();
    }, []);

    useEffect(() => {
        const loggedUserJson = window.localStorage.getItem('loggedGraphUser');
        if (loggedUserJson) {
            setUser(JSON.parse(loggedUserJson));
        }
    }, []);

    if (!user && !location.pathname.startsWith('/user')) {
        return <Navigate to="/user/login" />;
    }

    return (
        <div className="app">
            <div>
                <Topbar user={user} setUser={setUser} />
            </div>
            <Routes>
                <Route
                    path="/"
                    element={
                        <Graph
                            elements={elements}
                            setElements={setElements}
                            className="graph"
                        />
                    }
                ></Route>
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
