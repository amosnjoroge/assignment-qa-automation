# Take Home Test from Chili Piper - QA Automation Engineer

## Getting Started

This repository contains [Gmail's](https://mail.google.com/) main functionality manual and automated API test cases.

### Main Features Test Cases

#### 1. List messages

|                  |                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Description**  | This endpoint lists the messages in the user's mailbox. <br>This is a main functionality endpoint because it is always called when a user accesses Gmail's landing page after authentication.                                                                                                                                                                                                                                                                         |
| **Precondition** | Ensure that the inbox has 3 messages.                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **Endpoint**     | `https://gmail.googleapis.com/gmail/v1/users/{userId}/messages`                                                                                                                                                                                                                                                                                                                                                                                                       |
| **Request**      | Method: `GET`<br>Path Parameters: <br> - `{userId}`: The user's email address.                                                                                                                                                                                                                                                                                                                                                                                        |
| **Response**     | Status code: `200` <br> Body Fields: <br> - `messages[]`: List of messages. Note that each message resource contains only an id and a threadId; verify that the property is of length `3` <br> - `nextPageToken` - Token to retrieve the next page of results in the list; verify that the property does not exist because the list does not have a next page. <br> - `resultSizeEstimate ` - Estimated total number of results; verify the property has a value `3`. |

#### 2. Send message

|                 |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Description** | This endpoint sends a message based on the provided recipients in the To, Cc, and Bcc headers. <br>Since Gmail is an email service, the ability to send email messages is a mandatory feature.                                                                                                                                                                                                                                                                                                                                            |
| **Endpoint**    | `https://gmail.googleapis.com/gmail/v1/users/{userId}/messages/send`                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| **Request**     | Method: `POST`<br>Path Parameters: <br> - `{userId}`: The user's email address. <br>Body Fields: <br>- `raw`: The entire email message in an RFC 2822 formatted and base64url encoded string.                                                                                                                                                                                                                                                                                                                                             |
| **Response**    | Status code: `200` <br> Body Fields: <br> - `id`: an immutable message ID. <br> - `threadId`: message thread id. <br> - `labelIds[] `: list of message label ids. <br> - `snippet`: a short excerpt of the mail message. <br> - `historyId`: The ID of the last history record that modified this message. <br> - `payload`: The parsed email structure in the message parts. <br> - `sizeEstimate`: Estimated size in bytes of the message. <br>- `raw`: The entire email message in an RFC 2822 formatted and base64url encoded string. |
| **Comment**     | To make the request using the `raw` field only provide an object contains `from`, `to`, `subject`, and `message` properties and then encode into a base64 string                                                                                                                                                                                                                                                                                                                                                                          |

#### 3. Mark messages as read

|                  |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Description**  | To mark a message as read involves modifying the labels of a message. <br>Each new message received is marked as unread; the modify endpoint is essential since it ensures the messages are correctly organised, categorising them as read and unread.                                                                                                                                                                                                                                                                                                                               |
| **Precondition** | Ensure that the inbox has at least 1 message.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| **Endpoint**     | `https://gmail.googleapis.com/gmail/v1/users/{userId}/messages/{id}/modify`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **Request**      | Method: `POST`<br>Path Parameters: <br> - `{userId}`: The user's email address. <br> - `{id}`: The ID of the message to modify. <br>Body Fields: <br>- `addLabelIds[]`: A list of IDs of labels to add to this message. <br>- `removeLabelIds[]`: A list of IDs of labels to remove to this message; for this case we include the label id `UNREAD`                                                                                                                                                                                                                                  |
| **Response**     | Status code: `200` <br> Body Fields: <br> - `id`: an immutable message ID. <br> - `threadId`: message thread id. <br> - `labelIds[] `: list of message label ids. verify that the id `UNREAD` dose not exist <br> - `snippet`: a short excerpt of the mail message. <br> - `historyId`: The ID of the last history record that modified this message. <br> - `payload`: The parsed email structure in the message parts. <br> - `sizeEstimate`: Estimated size in bytes of the message. <br>- `raw`: The entire email message in an RFC 2822 formatted and base64url encoded string. |

#### 4. Move message to the trash

|                  |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Description**  | This endpoint moves the message to the trash. <br>This endpoint is essential because it ensures that we have a soft delete option for messages for 30 days, and in case we change our mind about deleting the messages, we can remove them from the trash folder.                                                                                                                                                                                                                                                                                                           |
| **Precondition** | Ensure that the inbox has at least 1 message.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **Endpoint**     | `https://gmail.googleapis.com/gmail/v1/users/{userId}/messages/{id}/trash`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| **Request**      | Method: `POST`<br>Path Parameters: <br> - `{userId}`: The user's email address. <br> - `{id}`: The ID of the message to trash. <br>Body Fields: The request body must be empty.                                                                                                                                                                                                                                                                                                                                                                                             |
| **Response**     | Status code: `200` <br> Body Fields: <br> - `id`: an immutable message ID. <br> - `threadId`: message thread id. <br> - `labelIds[] `: list of message label ids. verify that the id `TRASH` exists <br> - `snippet`: a short excerpt of the mail message. <br> - `historyId`: The ID of the last history record that modified this message. <br> - `payload`: The parsed email structure in the message parts. <br> - `sizeEstimate`: Estimated size in bytes of the message. <br>- `raw`: The entire email message in an RFC 2822 formatted and base64url encoded string. |

#### 5. Delete a message

|                  |                                                                                                                                                                                                                                                                                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Description**  | This endpoint Immediately and permanently deletes the specified message. This operation cannot be undone. <br>This endpoint is essential because it ensures that we can remove messages that are no longer needed from the inbox folder. It's also necessary if one needs to create more storage space or there is a limit on the storage space. |
| **Precondition** | Ensure that the inbox has at least 1 message.                                                                                                                                                                                                                                                                                                    |
| **Endpoint**     | `https://gmail.googleapis.com/gmail/v1/users/{userId}/messages/{id}`                                                                                                                                                                                                                                                                             |
| **Request**      | Method: `DELETE`<br>Path Parameters: <br> - `{userId}`: the user's email address. <br> - `{id}`: The ID of the message to delete. <br>Body Fields: The request body must be empty.                                                                                                                                                               |
| **Response**     | Status code: `204` <br> Body Fields: the response body is empty.                                                                                                                                                                                                                                                                                 |
| **Comment**      | After a successful deleted try to get the message and verify that the response has a status code of `401` amd a message `Requested entity was not found.`                                                                                                                                                                                        |

### Setup

#### Prerequisites

-   [Node.js](https://nodejs.org/en/) **version 14** or higher installed on your machine.
-   Google Account. We will use [Google OAuth 2.0 Playground](https://developers.google.com/oauthplayground) to create testing credentials

> 🚩 **Note**
>
> The technique we will use for testing is to use the [Google OAuth 2.0 Playground](https://developers.google.com/oauthplayground) to create a refresh token that can be exchanged for an access token.
> At the end of the steps below we should have the following data: `CLIENT_ID`, `CLIENT_SECRET` and `REFRESH_TOKEN`

_**Google Project and Application Setup**_

1. Create a Google project. More information is available in the [Google Cloud APIs Getting Started](https://cloud.google.com/apis/docs/getting-started#creating_a_google_project).
2. [Configure OAuth consent](https://developers.google.com/workspace/guides/configure-oauth-consent). For the puropse of our test ensure that the Gmail API scope has been added during the configuration and also on the `Test users` section ensure you add the test account and any other test account you wish to use.
    > 🚩 **Note**
    >
    > You need to configure the OAuth consent so that users (any test user in our case) understand and approves data access
3. Using the [Google API Console](https://console.developers.google.com/apis) to create web application credentials.
    - At the top navigation, click `Create Credentials` and choose `OAuth client ID`.
    - On the Create OAuth client ID page, enter the following:
        - Application Type: `Web Application`
        - Name: Your Web Application Name
        - Authorized redirect URIs: `https://developers.google.com/oauthplayground``
    - Once saved, note the client ID and client secret. You can find these under the "OAuth 2.0 Client IDs" on the [Google API Credentials](https://console.developers.google.com/apis/credentials) page.

_**Refresh Token Teneration**_

The refresh token generated from this process is unique to the authenticated Google user.

1. Open the [Google OAuth 2.0 Playground](https://developers.google.com/oauthplayground)
2. Click the gear icon in the upper right corner to reveal a OAuth 2.0 configuration panel.
3. On the panel set the follow:
    - OAuth flow: `Server-side`.
    - Access type: `Offline`.
    - Check `Use your own OAuth credentials`.
    - OAuth Client ID: <Client ID> generated above.
    - OAuth Client secret: <Client secret> generated above.
4. Close the panel.
5. On the left-hand panel, under `Step 1 (Select & authorize APIs)` select by checking the `https://mail.google.com/` API under the `Gmail API v1` section and click `Authorize APIs`.
6. To consent to using the api you will be requested to sign using the test account. Ensure you login using the test account configured in the `Configure OAuth consent` above.
7. You will be redirected back to the `Google OAuth 2.0 Playground` under `Step 2 (Exchange authorization code for tokens)`. Click the `Exchange authorization code for token` button.
8. You will be taken to `Step 3 (Configure request to API)`. On teh respose body note the `refresh_token` value.

_**Setting Google app credentials in Cypress**_

To have access to test user credentials within our tests we need to configure Cypress to use the Google environment variables as follows:

```bash
# Google Auth
export CYPRESS_GOOGLE_REFRESH_TOKEN="<the-generated-refresh-token>"
export CYPRESS_GOOGLE_CLIENT_ID="<the-generated-client-id>"
export CYPRESS_GOOGLE_CLIENT_SECRET="<the-generated-client-id>"
export CYPRESS_TEST_EMAIL_ID="<your-google-username>" # your username without the domain e.g if you email is spicedemail@gmail.com include only "spicedemail"
```

#### Installation

```shell
yarn install
```

#### Start Cypress

```shell
yarn cypress:open
```

Run cypress in headless mode:

```shell
yarn cypress:run
```
