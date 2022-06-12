import { defineConfig } from 'cypress';
import { loginByPuppeteer } from './cypress/support/helpers/puppeteer-okta-auth';
require('dotenv').config();

export default defineConfig({
    e2e: {
        baseUrl: 'https://gmail.googleapis.com/gmail/v1',
        experimentalSessionAndOrigin: true,
        env: {
            googleRefreshToken: process.env.GOOGLE_REFRESH_TOKEN,
            googleClientId: process.env.GOOGLE_CLIENTID,
            googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
            testEmailId: process.env.TEST_EMAIL_ID,
        },
        setupNodeEvents(on, config) {
            on('task', { loginByPuppeteer });
        },
    },
});
