import React, { useEffect, useState } from 'react';
import { Graph } from '../components/Graph';
import { ElementDetail } from '../components/ElementDetail';
import { MemberModal } from '../components/MemberModal';
import {
    IEdge,
    INode,
    IProject,
    NoPermission,
    ProjectPermissions,
    RootState,
    UserToken,
    UserData,
    ITag,
    ITaggedNode,
} from '../../../../types';
import {
    ArrowHeadType,
    Edge,
    Elements,
    FlowElement,
    isEdge,
    isNode,
    Node,
    Position,
} from 'react-flow-renderer';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router';
import { BsFillPeopleFill } from 'react-icons/bs';
import * as nodeService from '../services/nodeService';
import * as edgeService from '../services/edgeService';
import * as projectService from '../services/projectService';
import * as tagService from '../services/tagService';
import * as graphProps from '../components/GraphProps';
import CSS from 'csstype';
import { Spinner } from 'react-bootstrap';

const buttonStyle: CSS.Properties = {
    position: 'absolute',
    right: '12px',
    top: '40px',
    height: '40px',
    width: '40px',
    zIndex: '4',
};

interface GraphPageProps {
    user?: UserToken;
}

export const GraphPage = (props: GraphPageProps): JSX.Element => {
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
    const [permissions, setPermissions] = useState<
        NoPermission | ProjectPermissions
    >({
        view: false,
        edit: false,
        projectId: undefined,
    });
    const [members, setMembers] = useState<UserData[]>([]);
    const [show, setShow] = useState(false);

    const DefaultNodeType = 'default';

    const [elements, setElements] = useState<Elements>([]);

    const projects = useSelector((state: RootState) => state.project);

    const [isLoadingProject, setIsLoadingProject] = useState(true);
    const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);
    
    const [projTags, setProjTags] = useState<ITag[]>([]);
    const [nodeTags, setNodeTags] = useState<ITag[]>([]);

    const [taggedNodes, setTaggedNodes] = useState<ITaggedNode[]>([]);

    useEffect(() => {
        setIsLoadingProject(true);

        const project = projects.find((p) => p.id === projectId);
        if (project) {
            setSelectedProject(project);
            setIsLoadingProject(false);
        } else if (projectId) {
            projectService
                .getProject(projectId)
                .then((project) => setSelectedProject(project))
                .catch(() => setSelectedProject(undefined))
                .finally(() => setIsLoadingProject(false));
        } else {
            setSelectedProject(undefined);
            setIsLoadingProject(false);
        }
    }, [projectId]);

    useEffect(() => {
        if (selectedProject) {
            setIsLoadingPermissions(true);

            projectService
                .getProjectPermissions(projectId)
                .then((permissions) => setPermissions(permissions))
                .finally(() => setIsLoadingPermissions(false));
        } else {
            setPermissions({ view: false, edit: false, projectId: undefined });
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
                    sourcePosition: Position.Right,
                    targetPosition: Position.Left,
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

    useEffect(() => {
        if (selectedProject) {
            const getProjTagsHook = async () => {
                const gotProjTags = await tagService.getAllProjTags(selectedProject.id);
                
                setProjTags(gotProjTags);
            }
            const getTaggedNodesHook = async () => {
                const gotTaggedNodes = await tagService.getAllProjTaggedNodes(selectedProject.id);

                setTaggedNodes(gotTaggedNodes);
            }
            getProjTagsHook();
            getTaggedNodesHook();
        }
    }, [selectedProject]);

    const onElementClick = (event: React.MouseEvent, element: FlowElement) => {
        if (isNode(element)) {
            setSelectedElement(element);
            setSelectedDataType('Node');

            const elemData: INode = element.data;
            if (elemData && elemData.id) {
                setNodeTagsByNodeId(elemData.id);
            }
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

    if (isLoadingPermissions || isLoadingProject) {
        return (
            <div className="project-loading-container">
                <Spinner animation="border" style={{ margin: '10px' }} />
                <h2>Loading</h2>
            </div>
        );
    }

    if (!selectedProject || !permissions.view) {
        return (
            <h2 style={{ marginTop: '75px' }}>
                No permissions or project doesn't exist
            </h2>
        );
    }
    const setNodeTagsByNodeId = (nodeId: number) => {
        const nodeTaggedNodes = taggedNodes.filter((taggedNode) => taggedNode.node_id == nodeId);
        const nodeTagIds: number[] = nodeTaggedNodes.map((taggedNode) => taggedNode.tag_id);
        const gotNodeTags = projTags.filter((tag) => nodeTagIds.includes(tag.id));

        setNodeTags(gotNodeTags);
    }

    const addNodeTag = async (nodeId: number | undefined, tagName: string): Promise<boolean> => {
        if (nodeId) {
            // TODO: check that a tag with the same name doesn't exist in the same node before adding

            const newTag: ITag | undefined = await tagService.addNodeTagName(projectId, nodeId, tagName);

            if (newTag) {
                setProjTags(projTags.concat(newTag));
                
                const resTaggedNode: ITaggedNode = {project_id: projectId, node_id: nodeId, tag_id: newTag.id};
                setTaggedNodes(taggedNodes.concat(resTaggedNode));

                const selNode = getINodeFromSelectedElement();
                if (selNode && selNode.id == nodeId) {
                    setNodeTags(nodeTags.concat(newTag));
                    return true;
                }
            }
        }

        // will prevent text input from clearing when entering tag name
        return false;
    };

    const getINodeFromSelectedElement = (): INode | undefined => {
        if (selectedDataType == 'Node') {
            return (selectedElement as Node<INode>).data;
        }
    }

    const removeNodeTag = async (nodeId: number | undefined, tagId: number): Promise<void> => {
        const taggedNodeEq = (nodeA: ITaggedNode, nodeB: ITaggedNode): boolean => {
            return (nodeA.tag_id == nodeB.tag_id) && (nodeA.node_id == nodeB.node_id) && (nodeA.project_id == nodeB.project_id);
        }

        if (nodeId) {
            const retTaggedNode = await tagService.removeNodeTagId(projectId, nodeId, tagId);

            if (retTaggedNode) {
                setTaggedNodes(taggedNodes.filter((taggedNode) => !taggedNodeEq(taggedNode, retTaggedNode)));

                const selNode: INode | undefined = getINodeFromSelectedElement();
                
                if (selNode && selNode.id) {
                    if (selNode.id == retTaggedNode.node_id) {
                        setNodeTags(nodeTags.filter((tag) => tag.id != retTaggedNode.tag_id))
                    }
                }
            }
        }
        return;
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
                nodeTags={nodeTags}
                addNodeTag={addNodeTag}
                removeNodeTag={removeNodeTag}
                permissions={permissions}
                user={props.user}
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
