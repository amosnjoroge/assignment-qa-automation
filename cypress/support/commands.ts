import { MessagePayload, MessageModifyPayload } from '.';
import { messageBuilder } from '../fixtures/data-factory';

declare global {
    namespace Cypress {
        interface Chainable {
            authenticate(accountName?: string): Chainable<void>;
            listMessages(userId?: string): Chainable<void>;
            getMessage({
                id,
                userId,
                failOnStatusCode,
            }: {
                id: string;
                userId?: string;
                failOnStatusCode?: boolean;
            }): Chainable<void>;
            sendMessage(messagePayload?: MessagePayload): Chainable<void>;
            modifyMessageLabels(
                messageModifyPayload: MessageModifyPayload
            ): Chainable<void>;
            clearInbox(userId?: string): Chainable<void>;
            trashMessage(id: string, userId?: string): Chainable<void>;
            deleteMessage(id: string, userId?: string): Chainable<void>;
            batchDeleteMessages(
                ids: string[],
                userId?: string
            ): Chainable<void>;
            verifyResponse(
                expected: { status: number; bodyEmpty?: boolean },
                actual: { status: number; body: any }
            ): Chainable<void>;
        }
    }
}

export const authenticate = function (
    accountName = Cypress.env().TEST_EMAIL_ID as string
) {
    cy.log(`USER: ${Cypress.env().testEmailId}`);
    cy.session(accountName, function () {
        cy.request({
            method: 'POST',
            url: 'https://www.googleapis.com/oauth2/v4/token',
            body: {
                grant_type: 'refresh_token',
                client_id: Cypress.env('GOOGLE_CLIENT_ID'),
                client_secret: Cypress.env('GOOGLE_CLIENT_SECRET'),
                refresh_token: Cypress.env('GOOGLE_REFRESH_TOKEN'),
            },
        }).then(({ body: { access_token } }) =>
            cy.setCookie('access_token', access_token, { log: false })
        );
    });
    globalThis.testAccount = accountName;
    cy.wrap(accountName, { log: false }).as('testAccount');
    cy.getCookie('access_token', { log: false }).then(({ value }) =>
        cy.wrap(value, { log: false }).as('accessToken')
    );
};

export const listMessages = function (userId: string = 'me') {
    cy.request({
        method: 'GET',
        url: `/users/${userId}/messages`,
        headers: { Authorization: `Bearer ${this.accessToken}` },
    }).then(({ status, body }) =>
        cy.wrap({ status, body }, { log: false }).as('messagesListResponse')
    );
};

export const getMessage = function ({
    id,
    userId = 'me',
    failOnStatusCode,
}: {
    id: string;
    userId?: string;
    failOnStatusCode?: boolean;
}) {
    cy.request({
        method: 'GET',
        url: `/users/${userId}/messages/${id}`,
        headers: { Authorization: `Bearer ${this.accessToken}` },
        failOnStatusCode,
    }).then(({ status, body }) =>
        cy.wrap({ status, body }, { log: false }).as('queriedMessageResponse')
    );
};

export const sendMessage = function (
    {
        from,
        to,
        subject,
        message,
        userId = 'me',
    }: MessagePayload = messageBuilder()
) {
    const raw = Buffer.from(
        `From: ${from}\r\nTo: ${to}\r\nSubject: ${subject}\r\n\r\n${message}`
    ).toString('base64');
    cy.request({
        method: 'POST',
        url: `/users/${userId}/messages/send`,
        headers: { Authorization: `Bearer ${this.accessToken}` },
        body: { raw },
    }).then(({ status, body }) =>
        cy.wrap({ status, body }, { log: false }).as('sentMessageResponse')
    );
};

export const modifyMessageLabels = function ({
    addLabelIds,
    removeLabelIds,
    id,
    userId = 'me',
}: MessageModifyPayload) {
    cy.request({
        method: 'POST',
        url: `/users/${userId}/messages/${id}/modify`,
        headers: { Authorization: `Bearer ${this.accessToken}` },
        body: { addLabelIds, removeLabelIds },
    }).then(({ status, body }) =>
        cy.wrap({ status, body }, { log: false }).as('modifiedMessageResponse')
    );
};

export const trashMessage = function (id: string, userId: string = 'me') {
    cy.request({
        method: 'POST',
        url: `/users/${userId}/messages/${id}/trash`,
        headers: { Authorization: `Bearer ${this.accessToken}` },
    }).then(({ status, body }) =>
        cy.wrap({ status, body }, { log: false }).as('trashedMessageResponse')
    );
};

export const deleteMessage = function (id: string, userId: string = 'me') {
    cy.request({
        method: 'DELETE',
        url: `/users/${userId}/messages/${id}`,
        headers: { Authorization: `Bearer ${this.accessToken}` },
    }).then(({ status, body }) =>
    cy.wrap({ status, body }, { log: false }).as('deletedMessageResponse')
);
};

export const batchDeleteMessages = function (
    ids: string[],
    userId: string = 'me'
) {
    cy.request({
        method: 'POST',
        url: `/users/${userId}/messages/batchDelete`,
        headers: { Authorization: `Bearer ${this.accessToken}` },
        body: { ids },
    });
};

export const clearInbox = function (userId: string = 'me') {
    cy.listMessages(userId).then(function () {
        if (this.messagesListResponse.body.messages) {
            const ids = this.messagesListResponse.body.messages.map(
                ({ id }) => id
            );
            cy.batchDeleteMessages(ids, userId);
        }
    });
};

export const verifyResponse = (
    expected: { status: number; bodyEmpty?: boolean },
    actual: { status: number; body: any }
) => {
    expect(actual).to.have.property('status');
    expect(actual).to.have.property('body');
    expect(expected.status).to.equal(actual.status);
    if (expected.bodyEmpty) expect('').to.equal(actual.body);
};

Cypress.Commands.add('authenticate', authenticate);
Cypress.Commands.add('listMessages', listMessages);
Cypress.Commands.add('getMessage', getMessage);
Cypress.Commands.add('sendMessage', sendMessage);
Cypress.Commands.add('modifyMessageLabels', modifyMessageLabels);
Cypress.Commands.add('trashMessage', trashMessage);
Cypress.Commands.add('deleteMessage', deleteMessage);
Cypress.Commands.add('batchDeleteMessages', batchDeleteMessages);
Cypress.Commands.add('clearInbox', clearInbox);
Cypress.Commands.add('verifyResponse', verifyResponse);
