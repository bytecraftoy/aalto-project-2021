import React, { FC, useState } from 'react';
import { IProject, UserToken } from '../../../../types';
import { BsThreeDotsVertical, BsXLg, BsPencilFill } from 'react-icons/bs';
import { ProjectForm } from './ProjectForm';
import { useNavigate } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap';
import CSS from 'csstype';
import { useDispatch } from 'react-redux';
import * as projectReducer from '../reducers/projectReducer';

interface ProjectCardProps {
    project: IProject;
    user: UserToken | null;
}

const dropdownButtonStyle: CSS.Properties = {
    position: 'absolute',
    top: '8px',
    right: '8px',
    borderRadius: '50%',
    padding: 0,
    display: 'flex',
};
const dropDownItemStyle: CSS.Properties = {
    display: 'flex',
    alignItems: 'center',
};

export const ProjectCard: FC<ProjectCardProps> = (props: ProjectCardProps) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [editMode, setEditMode] = useState<boolean>(false);

    const handleSubmit = async (project: IProject) => {
        dispatch(projectReducer.projectUpdate(project));
        setEditMode(false);
    };

    const deleteProject = async () => {
        if (props.project.id) {
            dispatch(projectReducer.projectDelete(props.project.id));
        }
    };

    let body;
    if (!editMode) {
        body = (
            <>
                <h2 className="card-title">{props.project.name}</h2>
                <p className="card-text">{props.project.description}</p>
            </>
        );
    } else {
        body = (
            <ProjectForm
                defaultProject={props.project}
                handleSubmit={handleSubmit}
                handleCancel={() => setEditMode(false)}
                user={props.user}
            />
        );
    }

    return (
        <div
            className={'card project-card' + (editMode ? ' edit' : ' view')}
            style={{ width: '218px', height: '198px', margin: 16 }}
            onClick={() =>
                props.project &&
                !editMode &&
                navigate('/project/' + props.project.id)
            }
        >
            <Dropdown onClick={(e) => e.stopPropagation()}>
                <Dropdown.Toggle
                    className="icon-button no-dropdown-arrow"
                    style={dropdownButtonStyle}
                >
                    <BsThreeDotsVertical className="threedots-icon" />
                </Dropdown.Toggle>
                <Dropdown.Menu>
                    <Dropdown.Item
                        href="#"
                        style={dropDownItemStyle}
                        onClick={() => setEditMode(!editMode)}
                    >
                        <BsPencilFill style={{ marginRight: '8px' }} /> Edit
                    </Dropdown.Item>
                    <Dropdown.Item
                        href="#"
                        style={dropDownItemStyle}
                        onClick={() => deleteProject()}
                    >
                        <BsXLg style={{ marginRight: '8px' }} /> Delete
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
            <div className="card-img-top fallback-card-image"></div>
            {/* Add this when we can save images in the project
                <img
                className="card-img-top"
                src={}
                alt="Card image cap"
                style={{ objectFit: 'cover', maxHeight: '100px' }}
            /> */}
            <div className="card-body">{body}</div>
        </div>
    );
};
