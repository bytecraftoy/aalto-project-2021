const { idText } = require("typescript");

describe('node highlighting', () => {
    const node_nane_prefix = '__test__';
    const node_1_name = node_nane_prefix + '1'
    const node_2_name = node_nane_prefix + '2'
    const node_3_name = node_nane_prefix + '3'    

    before(() => {
        cy.registerLogin()
        cy.get('#home-link').click()
        cy.get('#name-field>input').type('Project')
        cy.get('#description-field>textarea').type('Lorem Ipsum')
        cy.get('#project-button-row>button').click()

        cy.get('.project-card').last().click()

        cy.get('#graph').should('exist')
    })

    beforeEach(() => {
        cy.get('.detail-sidebar-topbar').should('not.exist');    

        cy.insertNode(node_1_name, 'left')
        cy.insertNode(node_2_name, 'center')
        cy.insertNode(node_3_name, 'bottom')
    });

    afterEach(() => {
        cy.get('#hide-done-checkbox').uncheck();
        cy.removeAllTestNodes();
    });

    after(() => {
        cy.deleteAllProjects();
    });

    it('highlight checkbox should exist', () => {
        cy.get('#leaf-highlight-checkbox').should('exist');
    })

    it ('interaction with hide checkbox', () => {
        const highlight_cb = () => cy.get('#leaf-highlight-checkbox');
        const hide_cb = () => cy.get('#hide-done-checkbox');

        highlight_cb().should('not.be.checked');
        hide_cb().should('not.be.checked');

        highlight_cb().check();

        highlight_cb().should('be.checked');
        hide_cb().should('be.checked');

        hide_cb().uncheck();

        highlight_cb().should('not.be.checked');
        hide_cb().should('not.be.checked');

    })

    it('should unhighlight undoable nodes', () => {
        const node1 = () => cy.get(`.react-flow__node-default:contains(${node_1_name})`);
        const node2 = () => cy.get(`.react-flow__node-default:contains(${node_2_name})`);
        const node3 = () => cy.get(`.react-flow__node-default:contains(${node_3_name})`);
        const highlight_cb = () => cy.get('#leaf-highlight-checkbox');
        const hide_cb = () => cy.get('#hide-done-checkbox');
 
        node1().should('not.have.class', 'unhighlited-node');
        node2().should('not.have.class', 'unhighlited-node');
        node3().should('not.have.class', 'unhighlited-node');

        highlight_cb().check();

        node1().should('not.have.class', 'unhighlited-node');
        node2().should('not.have.class', 'unhighlited-node');
        node3().should('not.have.class', 'unhighlited-node');

        hide_cb().uncheck();

        cy.get('#connectBtn').click();
        node1().trigger('mousedown', 'center');
        node2().trigger('mouseup', 'center');
        node2().trigger('mousedown', 'center');
        node3().trigger('mouseup', 'center');
        cy.get('#connectBtn').click();

        highlight_cb().check();
        highlight_cb().should('be.checked');

        node1().should('have.class', 'unhighlited-node')
        node2().should('have.class', 'unhighlited-node')
        node3().should('not.have.class', 'unhighlited-node')
    
        hide_cb().uncheck();

        node1().should('have.css', 'background-color', 'rgb(255, 255, 255)');
        node2().should('have.css', 'background-color', 'rgb(255, 255, 255)');
        node3().should('have.css', 'background-color', 'rgb(255, 255, 255)');
    })
})
