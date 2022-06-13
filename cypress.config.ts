import { defineConfig } from 'cypress';
import { loginByPuppeteer } from './cypress/support/helpers/puppeteer-okta-auth';
require('dotenv').config();

export default defineConfig({
    e2e: {
        baseUrl: 'https://gmail.googleapis.com/gmail/v1',
        experimentalSessionAndOrigin: true,
        projectId: "wudx8f",
        setupNodeEvents(on, config) {
            on('task', { loginByPuppeteer });
        },
    },
});
