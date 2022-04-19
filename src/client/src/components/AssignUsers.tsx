import { useEffect, useState } from 'react';
import { INode, UserData } from '../../../../types';
import {
    assignUser,
    getAssignedUsers,
    unassignUser,
} from '../services/assignmentService';
import { getMembers } from '../services/projectService';
import { Spinner } from 'react-bootstrap';
import './styles/Sidebar.css';
import { BsFillPeopleFill, BsFillPersonPlusFill } from 'react-icons/bs';

interface assignUsersProps {
    node: INode;
}

export const AssignUsers = (props: assignUsersProps): JSX.Element => {
    const nodeId = props.node.id;
    if (!nodeId) return <></>;

    const [assignable, setAssignable] = useState<UserData[]>([]);
    const [assigned, setAssigned] = useState<UserData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const updateUsers = async () => {
        setIsLoading(true);

        const assigned = await getAssignedUsers(nodeId);
        const everyone = await getMembers(props.node.project_id);

        setAssigned(assigned);

        //filter out already assigned users
        setAssignable(
            everyone.filter((u1) => !assigned.find((u2) => u2.id === u1.id))
        );

        setIsLoading(false);
    };

    useEffect(() => {
        updateUsers();
    }, []);

    if (isLoading) return <Spinner animation="border" />;

    return (
        <div>
            {assigned.length ? (
                <div>
                    <p>
                        <BsFillPeopleFill className="icon" /> Assigned users:
                    </p>
                    <ul>
                        {assigned.map((user, i) => (
                            <li key={i}>
                                {user.username}{' '}
                                <button
                                    onClick={async () => {
                                        await unassignUser(nodeId, user.id);
                                        await updateUsers();
                                    }}
                                >
                                    Unassign
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <></>
            )}
            {assignable.length ? (
                <div>
                    <p>
                        <BsFillPersonPlusFill className="icon" /> Assign users:
                    </p>
                    <ul>
                        {assignable.map((user, i) => (
                            <li key={i}>
                                {user.username}{' '}
                                <button
                                    onClick={async () => {
                                        await assignUser(nodeId, user.id);
                                        await updateUsers();
                                    }}
                                >
                                    Assign
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <></>
            )}
        </div>
    );
};
