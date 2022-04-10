
const myConsts = {
    host_url : '',
    global_clean : true,
    node_name_prefix : '__test__'
}
describe('Login / Register', () => {
    describe('test navigation bar', () => {

        it('pages exist', () => {
            cy.visit('/user/login')
            cy.visit('/user/register')
        })

        it('hyperlinks in the top work', () => {

            cy.get('a[id=login-link]').click()
            cy.get('a[id=register-link]').click()
        });
    })

    describe('forms', () => {

        it('registering should be possible', () => {
            cy.get('a[id=register-link]').click()
            cy.get('#email').type('cypress@example.com')
            cy.get('#username').type('Mr.Cypress')
            cy.get('#psw').type('secretPassword123')
            cy.get('#psw-repeat').type('secretPassword123')

            cy.get('#register-button').click()

        })

        //Right now it doesn't actually know, wheather or not is actually logged in
        it('logging in should be possible with an email', () => {
            cy.get('a[id=login-link]').click()
            cy.get('#emailUser').type('cypress@example.com')
            cy.get('#psw').type('secretPassword123')
            cy.get('#login-button').click()

            cy.get('#logout-link').click()

        })

        it('logging in should be possible with a username', () => {
            cy.get('#login-link').click()
            cy.get('#emailUser').type('Mr.Cypress')
            cy.get('#psw').type('secretPassword123')
            cy.get('#login-button').click()
            
            cy.contains('#login-error').should('not.exist')

            cy.get('#logout-link').click()

        })
    })
})

describe('Graph', () => {
    beforeEach(() => {
        cy.visit('/user/login')
        cy.get('#login-link').click()
        cy.get('#emailUser').type('Mr.Cypress')
        cy.get('#psw').type('secretPassword123')
        cy.get('#login-button').click()

        cy.get('#name-field>input').type('Project')
        cy.get('#description-field>textarea').type('Lorem Ipsum')
        cy.get('#project-button-row>button').click()

        cy.get('.project-card').click()

        if (myConsts.global_clean) {
            cy.get('body').then( ($body) => {
                if ($body.find('.App').length) {
                    cy.removeAllTestNodes();
    
                    cy.get(`.react-flow__node-default:contains(${myConsts.node_name_prefix})`).should('not.exist');
                }
            });
        }
    });
    
    afterEach(() => {
        if (myConsts.global_clean) {
            cy.get('body').then( () => {
                cy.removeAllTestNodes();
    
                cy.get(`.react-flow__node-default:contains(${myConsts.node_name_prefix})`).should('not.exist');
            });
        }

        cy.get('#home-link').click()
        cy.get('.project-card .dropdown button').click()
        cy.get('a').contains('Delete').click();

        cy.get('#logout-link').click()
    });

    describe('test add node', () => {

        const node_name_1 = myConsts.node_name_prefix + 'TEST-NODE1';
        const node_name_2 = myConsts.node_name_prefix + 'TEST-NODE2';

        it('Can create and remove nodes', () => {

            cy.get('#createBtn').click(); // Toggle on
            cy.get('.react-flow__renderer').click('center')
            cy.get('.react-flow input').type(node_name_1 + '{enter}')
            
            cy.get(`.react-flow__node-default:contains(${node_name_1})`).should('exist');

            cy.get('.react-flow__renderer').click('left')
            cy.get('.react-flow input').type(node_name_2 + '{enter}')

            cy.get('#createBtn').click(); // Toggle off

            cy.get(`.react-flow__node-default:contains('${node_name_2}')`).should('exist').click().trigger('keydown', {keyCode: 8}).trigger('keyup', {keyCode: 8});

            cy.removeAllTestNodes();

            cy.get(`.react-flow__node-default:contains(${node_name_1})`).should('not.exist');
            cy.get(`.react-flow__node-default:contains(${node_name_2})`).should('not.exist');

        });

    });

    describe('test add edge', () => {
        it('Can add and remove edges', () => {
            let node_name_1 = '__test__1';
            let node_name_2 = '__test__2';

            if (!myConsts.global_clean) {
                cy.removeAllTestNodes();
                cy.get(`.react-flow__node-default:contains(${node_name_1})`).should('not.exist');
                cy.get(`.react-flow__node-default:contains(${node_name_2})`).should('not.exist');
            }
            
            cy.insertNode(node_name_1, 'center');
            cy.insertNode(node_name_2, 'left');

            cy.get(`.react-flow__node-default:contains(${node_name_1})`).should('exist');
            cy.get(`.react-flow__node-default:contains(${node_name_2})`).should('exist');

            cy.get('.react-flow__edge-straight').should('not.exist');

            cy.get(`.react-flow__node-default:contains(${node_name_2})`).find('.react-flow__handle-bottom').should('have.length', 1).trigger('mousedown');

            cy.get(`.react-flow__node-default:contains(${node_name_1})`).find('.react-flow__handle-top').should('have.length', 1).trigger('mouseup');


            cy.get('.react-flow__edge-straight').should('have.length', 1);

            cy.get('.react-flow__edge-straight')
                .should('have.length', 1)
                .click('topLeft', { force: true })
                .trigger('keydown', { key: 'Backspace', charCode: 0, keyCode: 8, force: true})

            cy.get('.react-flow__pane').should('have.length', 1)
                .trigger('keyup', { key: 'Backspace', charCode: 0, keyCode: 8, force: true});

            cy.get('.react-flow__edge-straight').should('not.exist');
            
            if (!myConsts.global_clean) {
                cy.removeAllTestNodes();
                cy.get(`.react-flow__node-default:contains(${node_name_1})`).should('not.exist');
                cy.get(`.react-flow__node-default:contains(${node_name_2})`).should('not.exist');
            }
        });

        it('should replace both-way edges', () => {
            let node_name_1 = '__test__1';
            let node_name_2 = '__test__2';

            cy.insertNode(node_name_1, 'center');
            cy.insertNode(node_name_2, 'left');

            cy.get(`.react-flow__node-default:contains(${node_name_2})`).find('.react-flow__handle-bottom').should('have.length', 1).trigger('mousedown');
            cy.get(`.react-flow__node-default:contains(${node_name_1})`).find('.react-flow__handle-top').should('have.length', 1).trigger('mouseup');

            cy.get(`.react-flow__node-default:contains(${node_name_1})`).find('.react-flow__handle-bottom').should('have.length', 1).trigger('mousedown');
            cy.get(`.react-flow__node-default:contains(${node_name_2})`).find('.react-flow__handle-top').should('have.length', 1).trigger('mouseup');

            cy.get('.react-flow__edge-straight').should('have.length', 1);
        });
    });

    describe('test element sidebar', () => {

        const node_name_1 = '__test__1';

        it('Can open and delete nodes on sidebar', () => {
            const n_nodes_to_add = 1;

            if (!myConsts.global_clean) {
                // remove nodes prefixed with __test__
                cy.removeAllTestNodes();
            }

            cy.get('.flow-wrapper').should('exist');

            cy.insertNode(node_name_1);

            cy.get(`.react-flow__node-default:contains(${node_name_1})`).click();
    
            cy.get('.detail-sidebar').should('exist');

            cy.get(`.detail-sidebar-topbar .icon-button`).first().click();

            cy.get(`.react-flow__node-default:contains(${node_name_1})`).should('not.exist');
        });

        it('Can rename nodes on the sidebar', () => {
            const node_name_1 = '__test__1';
            const new_node_name = '__test__NEW_NODE';

            cy.get('.flow-wrapper').should('exist');

            cy.insertNode(node_name_1);

            cy.get(`.react-flow__node-default:contains(${node_name_1})`).dblclick('center')
            cy.get('#edit-button').click();
            cy.get('#label-field').click().type('{selectall}{backspace}' + new_node_name + '{enter}')

            cy.get(`.react-flow__node-default:contains(${new_node_name})`).should('exist')

            if (!myConsts.global_clean) {
                cy.removeAllTestNodes();
                cy.get(`.react-flow__node-default:contains(${new_node_name})`).should('not.exist');
            }
        });

        it('Can add description on the sidebar', () => {
            const node_name_1 = '__test__1';
            const new_node_description = '__test__NEW_DESCRIPTION';

            cy.get('.flow-wrapper').should('exist');

            cy.insertNode(node_name_1);

            cy.get(`.react-flow__node-default:contains(${node_name_1})`).dblclick('center')
            cy.get('#edit-button').click();
            cy.get('#description-field').click().type('{selectall}{backspace}' + new_node_description + '{enter}')
            
            cy.get(`.node-description:contains(${new_node_description})`).should('exist')

            if (!myConsts.global_clean) {
                cy.removeAllTestNodes();
                cy.get(`.react-flow__node-default:contains(${node_name_1})`).should('not.exist');
            }
        });
    });
});