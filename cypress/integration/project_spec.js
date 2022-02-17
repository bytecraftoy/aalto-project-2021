describe('Project', () => {
    before(() => {
        cy.registerLogin()
    })

    beforeEach(() => {
        cy.get('#home-link').click()
    })

    after(() => {
        cy.deleteAllProjects()
    })

    it('should render project create form correctly', () => {
        cy.get('#name-field>input').should('exist')
        cy.get('#description-field>textarea').should('exist')
    })

    it('should create a project', () => {
        const name = 'Project'
        const description = 'Lorem Ipsum'
        cy.get('#name-field>input').type(name)
        cy.get('#description-field>textarea').type(description)
        cy.get('#project-button-row>button').click()

        cy.get('.project-card').should('exist')
        cy.get(`.project-card .card-title:contains(${name})`).should('exist')
        cy.get(`.project-card .card-text:contains(${description})`).should('exist')
    })

    it('should edit a project on save', () => {
        const editedName = 'EDITED NAME'
        const editedDescription = 'EDITED DESCRIPTION'

        cy.get('#name-field>input').type('Project')
        cy.get('#description-field>textarea').type('Lorem Ipsum')
        cy.get('#project-button-row>button').click()

        cy.get('.project-card').last().find('.dropdown button').click('center', { force: true })
        cy.get('.project-card').last().find('a').contains('Edit').click('center', { force: true })

        cy.get('.project-card #name-field input').type('{selectall}{backspace}' + editedName)
        cy.get('.project-card #description-field textarea').type('{selectall}{backspace}' + editedDescription)
        cy.get('#project-button-row>button').contains('Save').click()

        cy.get(`.project-card .card-title:contains(${editedName})`).should('exist')
        cy.get(`.project-card .card-text:contains(${editedDescription})`).should('exist')
    })

    it('should not edit a project on cancel', () => {
        const editedName = 'EDITED NAME 2'
        const editedDescription = 'EDITED DESCRIPTION 2'

        cy.get('#name-field>input').type('Project')
        cy.get('#description-field>textarea').type('Lorem Ipsum')
        cy.get('#project-button-row>button').click()

        cy.get('.project-card').last().find('.dropdown button').click('center', { force: true })
        cy.get('.project-card').last().find('a').contains('Edit').click('center', { force: true })

        cy.get('.project-card #name-field input').type('{selectall}{backspace}' + editedName)
        cy.get('.project-card #description-field textarea').type('{selectall}{backspace}' + editedDescription)
        cy.get('#project-button-row>button').contains('Cancel').click()

        cy.get(`.project-card .card-title:contains(${editedName})`).should('not.exist')
        cy.get(`.project-card .card-text:contains(${editedDescription})`).should('not.exist')
    })

    it('should delete a project with the delete button', () => {
        cy.get('.project-card').then($elements => {
            const projectCount = $elements.length;

            cy.get('#name-field>input').type('Project')
            cy.get('#description-field>textarea').type('Lorem Ipsum')
            cy.get('#project-button-row>button').click()
        
            cy.get('.project-card').last().find('.dropdown button').click('center', { force: true })
            cy.get('.project-card').last().get('#deleteButton').contains('Delete').click('center', { force: true })
    
            cy.get('.project-card').should('have.length', projectCount)
        });
    })

    it('should open a graph on clicking a project', () => {
        cy.get('#name-field>input').type('Project')
        cy.get('#description-field>textarea').type('Lorem Ipsum')
        cy.get('#project-button-row>button').click()

        cy.get('.project-card').last().click()

        cy.get('.project-card').should('not.exist')
        cy.get('.graph').should('exist')
    })
})