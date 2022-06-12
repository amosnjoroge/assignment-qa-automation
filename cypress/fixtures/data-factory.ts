import { lorem } from 'faker';
import { MessagePayload } from '../support';
import { build, perBuild } from '@jackfranklin/test-data-bot';

export const messageBuilder = build<MessagePayload>({
    fields: {
        from: '',
        to: '',
        subject: perBuild(() => lorem.sentence(5)),
        message: perBuild(() => lorem.sentences(4)),
        userId: 'me',
    },
    postBuild: function (message) {
        message.from = `${globalThis.testAccount}+sender@gmail.com`;
        message.to = `${globalThis.testAccount}+to@gmail.com`;
        return message;
    },
});
