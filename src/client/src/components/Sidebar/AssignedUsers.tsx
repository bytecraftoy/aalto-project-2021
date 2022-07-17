import { useEffect, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { INode, UserData } from '../../../../../types';
import { getAssignedUsers } from '../../services/assignmentService';
import './Sidebar.css';
import { BsFillPersonFill } from 'react-icons/bs';

interface assignedUsersProps {
    node: INode;
    setEditOne: React.Dispatch<React.SetStateAction<string | null>>;
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
                <ul
                    className="assigned-users-list"
                    onClick={() => {
                        props.setEditOne('user');
                    }}
                >
                    {assigned.map((user) => (
                        <li>
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
