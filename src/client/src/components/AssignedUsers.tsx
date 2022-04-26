import { useEffect, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { INode, UserData } from '../../../../types';
import { getAssignedUsers } from '../services/assignmentService';
import './styles/Sidebar.css';
import { BsFillPersonFill } from 'react-icons/bs';

interface assignedUsersProps {
    node: INode;
}

export const AssignedUsers = (props: assignedUsersProps): JSX.Element => {
    const nodeId = props.node.id;
    if (!nodeId) return <></>;

    const [assigned, setAssigned] = useState<UserData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setAssigned([]);
        getAssignedUsers(nodeId)
            .then(async (users) => {
                setAssigned(users);
                setIsLoading(false);
            })
            .catch(() => setAssigned([]));
    }, [nodeId]);

    return assigned.length ? (
        <div>
            {isLoading ? (
                <Spinner animation="border" />
            ) : (
                <ul className="assigned-users-list">
                    {assigned.map((user, i) => (
                        <li key={i}>
                            <BsFillPersonFill />
                            {' ' + user.username}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    ) : (
        <></>
    );
};
