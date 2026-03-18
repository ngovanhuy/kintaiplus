import axios from 'axios';
import constants from '../specs/constants.js';

export default {
  checkIsMyHoliday,
  isPast920JST,
  sendTeamsMessage,
};

/**
 * 有休を確認する
 * @returns 有休であるフラグ
 */
async function checkIsMyHoliday() {
  var today = new Date(new Date().toLocaleString("ja-JP", { timeZone: 'Asia/Tokyo' }));

  // 有休
  try {
    const response = await fetch(constants.KTP_MY_HOLIDAYS_URL);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const holidaysStr = await response.text();
    console.log("有休: \n" + holidaysStr);
    var holidays = holidaysStr.split(/\r?\n|\r|\n/g);

    var text = today.toLocaleDateString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit" });

    var isMyHoliday = holidays.includes(text);
    if (isMyHoliday) {
      console.log("今日は有休です");
    }
    return isMyHoliday;
  } catch (error) {
    console.error(error);
  }

  return false;
}

async function isPast920JST() {
  const now = new Date();

  const tokyoTime = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Tokyo" })
  );

  const hours = tokyoTime.getHours();
  const minutes = tokyoTime.getMinutes();

  return hours > 9 || (hours === 9 && minutes >= 20);
}

async function sendTeamsMessage(text: string) {
  const webhook = constants.TEAMS_WEBHOOK_URL;

  const data = JSON.stringify({
      type: "message",
      attachments: [
          {
              contentType: "application/vnd.microsoft.card.adaptive",
              content: {
                  "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
                  type: "AdaptiveCard",
                  version: "1.4",
                  body: [
                      {
                          type: "TextBlock",
                          text: "⚠️ KintaiPlus Bot",
                          weight: "Bolder",
                          size: "Medium",
                          color: "Attention"
                      },
                      {
                          type: "TextBlock",
                          text: text,
                          wrap: true
                      }
                  ],
                  actions: [
                      {
                          type: "Action.OpenUrl",
                          title: "打刻画面を開く",
                          url: "https://kintaiplus.freee.co.jp/independent/recorder2/personal/"
                      }
                  ]
              }
          }
      ]
  });


  try {
    console.log("Sending teams message: " + text);
    const response = await axios.post(webhook, data, {
      headers: {
        "Content-Type": "application/json"
      }
    });
    console.log('Response Status:', response.status);
    console.log('Response Data:', response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}
