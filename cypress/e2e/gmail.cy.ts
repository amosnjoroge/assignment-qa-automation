import faker from 'faker';
import { messageBuilder } from '../fixtures/data-factory';

describe('Main Functionality', () => {
    beforeEach(() => {
        cy.authenticate();
        cy.fixture('data').as('testData');
    });

    it('GET - list email messages', function () {
        cy.clearInbox();
        for (let index = 0; index < 3; index++) cy.sendMessage();

        cy.listMessages().then(function () {
            const { resultSizeEstimate, messages } = this.messagesList;
            expect(resultSizeEstimate).to.equal(3);
            expect(messages).to.have.length(3);
            for (const message of messages) {
                expect(message).to.have.property('id');
                expect(message).to.have.property('threadId');
            }
        });
    });

    it('POST - send an email message', function () {
        const from = `${this.testAccount}+sender@gmail.com`;
        const to = `${this.testAccount}+receiver@gmail.com`;
        const subject = faker.lorem.sentence(5);
        const message = faker.lorem.sentences(4);
        cy.log(message)

        cy.sendMessage({ from, to, subject, message }).then(function () {
            expect(this.sentMessage).to.have.property('id');
            expect(this.sentMessage).to.have.property('labelIds');

            const { id, labelIds } = this.sentMessage;
            const { unread, inbox } = this.testData.labels;

            expect(labelIds).to.include(unread);
            expect(labelIds).to.include(inbox);

            cy.getMessage({ id }).then(() => {
                const {
                    payload: { headers },
                    snippet,
                } = this.queriedMessage;
                expect(headers[1].value).to.equal(from);
                expect(headers[2].value).to.equal(to);
                expect(headers[3].value).to.equal(subject);
                expect(message).to.include(snippet);
            });
        });
    });

    it('POST - mark message as read', function () {
        const { unread } = this.testData.labels;
        cy.sendMessage().then(function () {
            const { id, labelIds } = this.sentMessage;
            expect(labelIds).to.include(unread);

            cy.modifyMessageLabels({ id, removeLabelIds: [unread] }).then(
                function () {
                    const { labelIds } = this.modifiedMessage;
                    expect(labelIds).to.not.include(unread);
                }
            );
        });
    });

    it('POST - move message to the trash', function () {
        cy.sendMessage().then(function () {
            const { id } = this.sentMessage;
            cy.trashMessage(id).then(() => {
                const { labelIds } = this.trashedMessage;
                const { trash } = this.testData.labels;
                expect(labelIds).to.include(trash);
            });
        });
    });

    it('DELETE - delete message', function () {
        const expectedError = {
            code: 404,
            message: 'Requested entity was not found.',
            status: 'NOT_FOUND',
        };

        cy.sendMessage().then(function () {
            const { id } = this.sentMessage;
            cy.deleteMessage(id);
            cy.getMessage({ id, failOnStatusCode: false }).then(() => {
                const { code, message, status } = this.queriedMessage.error;
                expect(expectedError.code).to.equal(code);
                expect(expectedError.message).to.equal(message);
                expect(expectedError.status).to.equal(status);
            });
        });
    });
});
