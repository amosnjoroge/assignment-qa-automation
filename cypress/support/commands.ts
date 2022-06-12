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
            loginByGoogleUI(): Chainable<void>;
        }
    }
}

export const authenticate = function (
    accountName = Cypress.env().testEmailId as string
) {
    cy.session(accountName, function () {
        cy.request({
            method: 'POST',
            url: 'https://www.googleapis.com/oauth2/v4/token',
            body: {
                grant_type: 'refresh_token',
                client_id: Cypress.env('googleClientId'),
                client_secret: Cypress.env('googleClientSecret'),
                refresh_token: Cypress.env('googleRefreshToken'),
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
    }).then(({ body }) => cy.wrap(body, { log: false }).as('messagesList'));
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
    }).then(({ body }) => cy.wrap(body, { log: false }).as('queriedMessage'));
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
    }).then(({ body }) => cy.wrap(body, { log: false }).as('sentMessage'));
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
    }).then(({ body }) => cy.wrap(body, { log: false }).as('modifiedMessage'));
};

export const trashMessage = function (id: string, userId: string = 'me') {
    cy.request({
        method: 'POST',
        url: `/users/${userId}/messages/${id}/trash`,
        headers: { Authorization: `Bearer ${this.accessToken}` },
    }).then(({ body }) => cy.wrap(body, { log: false }).as('trashedMessage'));
};

export const deleteMessage = function (id: string, userId: string = 'me') {
    cy.request({
        method: 'DELETE',
        url: `/users/${userId}/messages/${id}`,
        headers: { Authorization: `Bearer ${this.accessToken}` },
    });
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
        if (this.messagesList.messages) {
            const ids = this.messagesList.messages.map(({ id }) => id);
            cy.batchDeleteMessages(ids, userId);
        }
    });
};

export const loginByGoogleUI = () => {
    cy.log('Logging in to Google');
    cy.origin('https://accounts.google.com', () => {
        cy.visit('/ServiceLogin');
        cy.get('#identifierId').type('testing');
    });
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
Cypress.Commands.add('loginByGoogleUI', loginByGoogleUI);
