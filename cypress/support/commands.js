// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add('registerLogin', () => {
    cy.visit('/user/register')
    
    cy.get('#email').type('user@example.com')
    cy.get('#username').type('Tester')
    cy.get('#psw').type('password123456')
    cy.get('#psw-repeat').type('password123456')
    cy.get('#register-button').click()

    cy.visit('/user/login')

    cy.get('#emailUser').type('user@example.com')
    cy.get('#psw').type('password123456')
    cy.get('#login-button').click()
});

Cypress.Commands.add('deleteAllProjects', () => {
    cy.contains('Depsee').scrollIntoView()
    cy.get('#home-link').click()
    cy.get("body").then($body => {
        if ($body.find(".project-card").length > 0) {   
            cy.get('.project-card').each(($el, index, $list) => {
                cy.wrap($el).find('.dropdown button').click('center', { force: true })
                cy.wrap($el).find('a').contains('Delete').click('center', { force: true })
            })
        }
    });
})

// cypress is able to click the nodes even if they're outside the bounds as long as they are not covered by another node
Cypress.Commands.add('removeNodeDiv', (index, $div, _$list) => {
    cy.wrap($div).click('topLeft', { force: true });
    cy.wrap($div).should('have.class', 'selected');
    cy.get('body').trigger('keydown', { key: 'Backspace', charCode: 0, keyCode: 8 })
        .trigger('keyup', { key: 'Backspace', charCode: 0, keyCode: 8 });
});

Cypress.Commands.add('insertNode', (nodeName, location) => {
    var b_NodeNamePrefixed = true;

    cy.get('#createBtn').click(); // Toggle on
    cy.wait(100);
    cy.get('.react-flow__renderer').click(location)
    cy.wait(100);
    cy.get('.react-flow input').type(nodeName + '{enter}')
    cy.get('#createBtn').click(); // Toggle off

    if (b_NodeNamePrefixed) {
        // nodeName should be prefixed by '__test__'
        expect(nodeName).match(/^__test__/);
    }
    cy.get('.react-flow__node').should(($div) => {
        expect(Array.from($div, elem => elem.innerText)).to.include(nodeName)
    })

});

// remove nodes prefixed with __test__
Cypress.Commands.add('removeAllTestNodes', () => {
    var nodeNamePrefix = '__test__';

    cy.get('body').then(($body) => {
        $body.find(`.react-flow__node-default:contains(${nodeNamePrefix})`).each((index, $div, $list) => {
            cy.removeNodeDiv(index, $div, $list);
            cy.get('.detail-sidebar-topbar').should('not.exist');
        });
    });
});

Cypress.Commands.add('getElemRect', (elemString) => {
    let elem_pos = 0;

    cy.get(elemString).should('have.length', 1).then(
        ($elem) => {
            elem_pos = $elem[0].getBoundingClientRect();
        }
    );

    return elem_pos;
});
