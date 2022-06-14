import { lorem } from 'faker';

describe('Main Functionality', () => {
    beforeEach(() => {
        cy.authenticate();
        cy.fixture('data').as('testData');
    });

    it('GET - list email messages', function () {
        cy.clearInbox();
        for (let index = 0; index < 3; index++) cy.sendMessage();

        cy.listMessages().then(function () {
            const expectedResponse = { status: 200 };
            const { resultSizeEstimate, messages } =
                this.messagesListResponse.body;

            cy.verifyResponse(expectedResponse, this.messagesListResponse).then(
                () => {
                    expect(this.messagesListResponse.body).to.not.have.property(
                        'nextPageToken'
                    );
                    expect(resultSizeEstimate).to.equal(3);
                    expect(messages).to.have.length(3);
                    for (const message of messages) {
                        expect(message).to.have.property('id');
                        expect(message).to.have.property('threadId');
                    }
                }
            );
        });
    });

    it('POST - send an email message', function () {
        const from = `${this.testAccount}+sender@gmail.com`;
        const to = `${this.testAccount}+receiver@gmail.com`;
        const subject = lorem.sentence(5);
        const message = lorem.sentences(4);

        cy.sendMessage({ from, to, subject, message }).then(function () {
            const { id, labelIds } = this.sentMessageResponse.body;
            const { unread, inbox } = this.testData.labels;
            const expectedResponse = { status: 200 };

            cy.verifyResponse(expectedResponse, this.sentMessageResponse).then(
                () => {
                    expect(labelIds).to.include(unread);
                    expect(labelIds).to.include(inbox);
                }
            );

            cy.getMessage({ id }).then(() => {
                const {
                    payload: { headers },
                    snippet,
                } = this.queriedMessageResponse.body;
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
            const { id, labelIds } = this.sentMessageResponse.body;
            expect(labelIds).to.include(unread);

            cy.modifyMessageLabels({ id, removeLabelIds: [unread] }).then(
                function () {
                    const expectedResponse = { status: 200 };
                    const { labelIds } = this.modifiedMessageResponse.body;

                    cy.verifyResponse(
                        expectedResponse,
                        this.modifiedMessageResponse
                    ).then(() => expect(labelIds).to.not.include(unread));
                }
            );
        });
    });

    it('POST - move message to the trash', function () {
        cy.sendMessage().then(function () {
            const { id } = this.sentMessageResponse.body;

            cy.trashMessage(id).then(() => {
                const expectedResponse = { status: 200 };
                const { labelIds } = this.trashedMessageResponse.body;
                const { trash } = this.testData.labels;
                cy.verifyResponse(
                    expectedResponse,
                    this.trashedMessageResponse
                ).then(() => expect(labelIds).to.include(trash));
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
            const { id } = this.sentMessageResponse.body;
            cy.deleteMessage(id).then(function () {
                const expectedResponse = { status: 204, bodyEmpty: true };
                cy.verifyResponse(
                    expectedResponse,
                    this.deletedMessageResponse
                );
                cy.getMessage({ id, failOnStatusCode: false }).then(() => {
                    const { code, message, status } =
                        this.queriedMessageResponse.body.error;
                    expect(expectedError.code).to.equal(code);
                    expect(expectedError.message).to.equal(message);
                    expect(expectedError.status).to.equal(status);
                });
            });
        });
    });
});
