
const myConsts = {
    // apparently the port changes on integration test?
    //host_url : 'http://localhost:3000/',
    //// empty string works on integration test, but not locally
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

            /* cy.contains('cypress@example.com')
            cy.contains('Mr.Cypress') */

            cy.get('#register-button').click()

            //cy.contains('#register-error').should('not.exist')

        })

        //Right now it doesn't actually know, wheather or not is actually logged in
        it('logging in should be possible with an email', () => {
            cy.get('a[id=login-link]').click()
            cy.get('#emailUser').type('cypress@example.com')
            cy.get('#psw').type('secretPassword123')
            cy.get('#login-button').click()

            cy.get('#logout-link').click()

            //cy.contains('#login-error').should('not.exist')

        })

        it('logging in should be possible with a username', () => {
            cy.get('#login-link').click()
            cy.get('#emailUser').type('Mr.Cypress')
            cy.get('#psw').type('secretPassword123')
            cy.get('#login-button').click()
            
            cy.contains('#login-error').should('not.exist')

            cy.get('#logout-link').click()

            //cy.contains('#login-error').should('not.exist')

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

    describe('Has nodetext', () => {
        it('Has an input to enter node name', () => {
            cy.get('input#nodetext');
        });
    });

    describe('nodetext has add button', () => {
        it('Has button to add node', () => {
            cy.get('input#nodetext').parent().contains('Create')
        });
    });

    describe('test add node', () => {

        const node_name_1 = '__test__1';
        const node_name_2 = '__test__2';

        it('Can add and remove nodes', () => {
            const n_nodes_to_add = 3;

            if (!myConsts.global_clean) {
                // remove nodes prefixed with __test__
                cy.removeAllTestNodes();

                cy.get(`.react-flow__node-default:contains(${node_name_1})`).should('not.exist');
                cy.get(`.react-flow__node-default:contains(${node_name_2})`).should('not.exist');
            }
            
            cy.insertNode(node_name_1);

            cy.get(`.react-flow__node-default:contains(${node_name_1})`).should('exist');

            for (let i = 0; i < n_nodes_to_add; i++) {
                cy.insertNode(node_name_1);
            }

            cy.get(`.react-flow__node-default:contains(${node_name_1})`).should('exist');
            cy.get(`.react-flow__node-default:contains(${node_name_2})`).should('not.exist');

            cy.insertNode(node_name_2);

            cy.get(`.react-flow__node-default:contains(${node_name_1})`).should('exist');
            cy.get(`.react-flow__node-default:contains(${node_name_2})`).should('exist');

            cy.removeAllTestNodes();

            cy.get(`.react-flow__node-default:contains(${node_name_1})`).should('not.exist');
            cy.get(`.react-flow__node-default:contains(${node_name_2})`).should('not.exist');

        });

        it('Can rename nodes with double click', () => {
            const new_node_name = '__test__NEW_NODE';
            cy.get('input#nodetext').type(node_name_1)
            cy.get('input#nodetext').parent().contains('Create').click()

            cy.get(`.react-flow__node-default:contains(${node_name_1})`).dblclick('center')
            cy.get('.react-flow__node input').type('{selectall}{backspace}' + new_node_name + '{enter}')

            cy.get(`.react-flow__node-default:contains(${new_node_name})`).should('exist')

            if (!myConsts.global_clean) {
                cy.removeAllTestNodes();
                cy.get(`.react-flow__node-default:contains(${new_node_name})`).should('not.exist');
            }
        });

        it('Can create nodes with ctrl click', () => {
            const new_node_name1 = '__test__NEW_NODE_1'

            cy.get('.react-flow__renderer').click('center', {ctrlKey: true})
            cy.get('.react-flow input').type(new_node_name1 + '{enter}')

            
            cy.get(`.react-flow__node-default:contains(${new_node_name1})`).should('exist');

            if (!myConsts.global_clean) {
                cy.removeAllTestNodes();
                cy.get(`.react-flow__node-default:contains(${new_node_name1})`).should('not.exist');
            }

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
            
            cy.insertNode(node_name_1);
            cy.insertNode(node_name_2);

            cy.get(`.react-flow__node-default:contains(${node_name_1})`).should('exist');
            cy.get(`.react-flow__node-default:contains(${node_name_2})`).should('exist');

            cy.get(`.react-flow__node-default:contains(${node_name_2})`).should('have.length', 1).then(($node) => {
                let node_pos1 = $node[0].getBoundingClientRect();

                cy.get('.react-flow__pane').should('have.length', 1).then(($node) => {
                    let pane_pos = $node[0].getBoundingClientRect();

                    // move node
                    cy.get(`.react-flow__node-default:contains(${node_name_2})`).trigger('mousehover').trigger('mousedown', 2, 2).then( () => {
                        
                        // (x, y) at (pane_pos.x + 2, pane_pos,y + 2) sets the node perfectly at the upper left corner
                        let posX = 2 + node_pos1.x + node_pos1.width*2;
                        let posY = 2 + node_pos1.y + node_pos1.height*2;

                        cy.get('body').trigger('mousemove', posX, posY, { force: true } );
                        cy.get('body').trigger('mouseup', posX, posY, { force: true });

                    });
                });
            });

            cy.get('.react-flow__edge-straight').should('not.exist');

            cy.get(`.react-flow__node-default:contains(${node_name_2})`).find('.react-flow__handle-bottom').should('have.length', 1).trigger('mousedown');

            cy.get(`.react-flow__node-default:contains(${node_name_1})`).find('.react-flow__handle-top').should('have.length', 1).trigger('mouseup');


            cy.get('.react-flow__edge-straight').should('have.length', 1);

            cy.get('.react-flow__edge-straight')
                .should('have.length', 1)
                .click('topLeft', { force: true })
                .trigger('keydown', { key: 'Backspace', charCode: 0, keyCode: 8 })

            cy.get('.react-flow__pane').should('have.length', 1)
                .trigger('keyup', { key: 'Backspace', charCode: 0, keyCode: 8 });

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

            cy.insertNode(node_name_1);
            cy.insertNode(node_name_2);

            cy.get(`.react-flow__node-default:contains(${node_name_2})`).should('have.length', 1).then(($node) => {

                let node_pos1 = $node[0].getBoundingClientRect();

                cy.get('.react-flow__pane').should('have.length', 1).then(($node) => {
                    let pane_pos = $node[0].getBoundingClientRect();

                    cy.log('pane_pos.x');
                    cy.log(pane_pos.x);

                    // move node
                    cy.get(`.react-flow__node-default:contains(${node_name_2})`).trigger('mousehover').trigger('mousedown', 2, 2).then( () => {

                        // (x, y) at (pane_pos.x + 2, pane_pos,y + 2) sets the node perfectly at the upper left corner
                        let posX = 2 + node_pos1.x + node_pos1.width*2;
                        let posY = 2 + node_pos1.y + node_pos1.height*2;

                        cy.get('body').trigger('mousemove', posX, posY, { force: true });
                        cy.get('body').trigger('mouseup', posX, posY, { force: true });

                    });
                });
            });

            cy.get(`.react-flow__node-default:contains(${node_name_2})`).find('.react-flow__handle-bottom').should('have.length', 1).trigger('mousedown');
            cy.get(`.react-flow__node-default:contains(${node_name_1})`).find('.react-flow__handle-top').should('have.length', 1).trigger('mouseup');

            cy.get(`.react-flow__node-default:contains(${node_name_1})`).find('.react-flow__handle-bottom').should('have.length', 1).trigger('mousedown');
            cy.get(`.react-flow__node-default:contains(${node_name_2})`).find('.react-flow__handle-top').should('have.length', 1).trigger('mouseup');

            cy.get('.react-flow__edge-straight').should('have.length', 1);
        });
    });
});