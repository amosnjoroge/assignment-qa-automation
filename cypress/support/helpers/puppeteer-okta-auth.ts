import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

export const loginByPuppeteer = async ({ username, password }) => {
    puppeteer.use(StealthPlugin());
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    try {
        const page = await browser.newPage();
        await page.goto('https://mail.google.com');

        await page.waitForSelector('#identifierId');
        await page.type('#identifierId', username);
        await page.keyboard.press('Enter');

        await page.waitForTimeout('5000');
        await page.waitForSelector('[name="password"]');
        await page.type('[name="password"]', password);
        await page.keyboard.press('Enter');

        await page.waitForSelector('[data-tooltip="Inbox"]');
        const ls = await page.evaluate(() => window.localStorage);
        const {cookies} = await page._client.send('Network.getAllCookies');

        await browser.close();

        return {cookies, ls};
    } catch (error) {
        await browser.close();
        throw new Error(error);
    }
};
