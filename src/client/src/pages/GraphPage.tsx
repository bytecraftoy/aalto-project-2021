import React, { useEffect, useState } from 'react';
import { Graph } from '../components/Graph';
import { ElementDetail } from '../components/ElementDetail';
import { MemberModal } from '../components/MemberModal';
import {
    IEdge,
    INode,
    IProject,
    ProjectPermissions,
    RootState,
    UserData,
} from '../../../../types';
import {
    ArrowHeadType,
    Edge,
    Elements,
    FlowElement,
    isEdge,
    isNode,
    Node,
} from 'react-flow-renderer';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router';
import { BsFillPeopleFill } from 'react-icons/bs';
import * as nodeService from '../services/nodeService';
import * as edgeService from '../services/edgeService';
import * as projectService from '../services/projectService';
import * as graphProps from '../components/GraphProps';
import CSS from 'csstype';

const buttonStyle: CSS.Properties = {
    position: 'absolute',
    right: '12px',
    top: '40px',
    height: '40px',
    width: '40px',
    zIndex: '4',
};

export const GraphPage = (): JSX.Element => {
    const { id } = useParams();
    const projectId = parseInt(id || '');

    // Sidebar related data
    const [selectedElement, setSelectedElement] = useState<
        Node<INode> | Edge<IEdge> | null
    >(null);
    const [selectedDataType, setSelectedDataType] = useState<
        'Node' | 'Edge' | null
    >(null);
    const [selectedProject, setSelectedProject] = useState<
        IProject | undefined
    >(undefined);
    const [permissions, setPermissions] = useState<ProjectPermissions>({
        view: false,
        edit: false,
    });
    const [members, setMembers] = useState<UserData[]>([]);
    const [show, setShow] = useState(false);

    const DefaultNodeType = 'default';

    const [elements, setElements] = useState<Elements>([]);

    const projects = useSelector((state: RootState) => state.project);

    useEffect(() => {
        const project = projects.find((p) => p.id === projectId);
        if (project) {
            setSelectedProject(project);
        } else if (projectId) {
            projectService
                .getProject(projectId)
                .then((project) => setSelectedProject(project))
                .catch(() => setSelectedProject(undefined));
        } else {
            setSelectedProject(undefined);
        }
    }, [projectId]);

    useEffect(() => {
        if (selectedProject) {
            projectService
                .getProjectPermissions(projectId)
                .then((permissions) => setPermissions(permissions));
        } else {
            setPermissions({ view: false, edit: false });
        }
    }, [selectedProject]);

    useEffect(() => {
        if (selectedProject) {
            projectService
                .getMembers(projectId)
                .then((members) => setMembers(members));
        } else {
            setMembers([]);
        }
    }, [selectedProject]);

    useEffect(() => {
        if (selectedProject) {
            const getElementsHook = async () => {
                let nodes: INode[];
                let edges: IEdge[];
                try {
                    [nodes, edges] = await Promise.all([
                        nodeService.getAll(selectedProject.id),
                        edgeService.getAll(selectedProject.id),
                    ]);
                } catch (e) {
                    return;
                }

                const nodeElements: Elements = nodes.map((n) => ({
                    id: String(n.id),
                    type: DefaultNodeType,
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
        }
    }, [selectedProject]);

    useEffect(() => {
        const element = elements.find((e) => e.id === selectedElement?.id);
        if (element) {
            element && setSelectedElement(element);
        } else if (!element) {
            closeSidebar();
        }
    }, [elements]);

    const onElementClick = (event: React.MouseEvent, element: FlowElement) => {
        if (isNode(element)) {
            setSelectedElement(element);
            setSelectedDataType('Node');
        } else if (isEdge(element)) {
            setSelectedElement(element);
            setSelectedDataType('Edge');
        }
    };

    const addProjectMembers = async (member: string) => {
        const newMember = await projectService.addMember(projectId, member);
        if (newMember) {
            setMembers([...members, newMember]);
        }
    };

    const deleteProjectMembers = async (userId: number) => {
        setMembers(members.filter((member) => member.id !== userId));
        await projectService.deleteMember(projectId, userId);
    };

    const closeSidebar = () => {
        setSelectedElement(null);
        setSelectedDataType(null);
    };

    return (
        <>
            <Graph
                elements={elements}
                setElements={setElements}
                selectedProject={selectedProject}
                onElementClick={onElementClick}
                DefaultNodeType={DefaultNodeType}
                permissions={permissions}
                {...graphProps}
            />
            <ElementDetail
                element={selectedElement}
                type={selectedDataType}
                elements={elements}
                setElements={setElements}
                closeSidebar={closeSidebar}
                permissions={permissions}
            />
            {selectedProject && (
                <>
                    <button
                        style={buttonStyle}
                        className="icon-button"
                        onClick={() => setShow(true)}
                    >
                        <BsFillPeopleFill />
                    </button>
                    <MemberModal
                        project={selectedProject}
                        members={members}
                        show={show}
                        handleClose={() => setShow(false)}
                        addMember={addProjectMembers}
                        deleteMembers={deleteProjectMembers}
                        allowInvite={permissions.edit}
                    />
                </>
            )}
        </>
    );
};
