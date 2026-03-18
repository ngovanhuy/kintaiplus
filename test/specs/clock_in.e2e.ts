import { browser } from '@wdio/globals';
import LoginPage from '../pageobjects/login.page.js';
import Utils from '../pageobjects/utils.js';
import constants from './constants.js';

describe('KintaiPlus', () => {
    it('clock_in', async () => {
        var holiday = await Utils.checkIsMyHoliday();
        var past920JST = await Utils.isPast920JST();

        if (past920JST) {
            console.log("現在は9:20 JSTを過ぎています");
            await Utils.sendTeamsMessage(
                "現在は9:20 JSTを過ぎています。打刻がまだされていません。"
            );
            await browser.pause(5000);
        } else if (!holiday) {
            console.log("今日は祝日ではありません");
            await LoginPage.open()
            await LoginPage.login(constants.KTP_ID, constants.KTP_PASSWORD);
            await browser.pause(5000);
            console.log("start clock in");
            await LoginPage.clockIn();
            await browser.pause(5000);
        } else {
            console.log("今日休み");
        }
    })
})

