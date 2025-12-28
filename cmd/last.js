// cmd/last.js
const { getUserRank } = require("../handlers/handleCmd");
const log = require('../logger');
const config = require('../config.json');

module.exports.config = {
  name: "last",
  version: '1.0.0',
  credits: 'عمر',
  hasPermssion: 2,
  description: 'قائمة المجموعات المتواجد فيهم البوت',
  commandCategory: 'المطور',
  usages: 'قائمة المجموعات',
  cooldowns: 15
};

module.exports.handleReply = async function({ api, event, args, Threads, handleReply }) {
  if (parseInt(event.senderID) !== parseInt(handleReply.author)) return;

  const arg = event.body.split(" ");
  const idgr = handleReply.groupid[arg[1] - 1];

  switch (handleReply.type) {
    case "reply":
      {
        if (arg[0] === "حظر") {
          const data = (await Threads.getData(idgr)).data || {};
          data.banned = 1;
          await Threads.setData(idgr, { data });
          global.data.threadBanned.set(parseInt(idgr), 1);

          api.sendMessage(`تم حظر المجموعة بنجاح\nID: [${idgr}]`, event.threadID, event.messageID);
          break;
        }

        if (arg[0] === "خروج" || arg[0] === "غادري") {
          api.removeUserFromGroup(`${api.getCurrentUserID()}`, idgr);
          api.sendMessage(`تم الخروج من المجموعة:\n${idgr}\n${(await Threads.getData(idgr)).name}`, event.threadID, event.messageID);
          break;
        }
      }
  }
};

module.exports.run = async function({ api, event, client }) {

  // السماح فقط للمطور
  if (parseInt(event.senderID) !== 61579001370029) {
    return api.sendMessage("مش لك مقلبي", event.threadID, event.messageID);
  }

  const inbox = await api.getThreadList(100, null, ['INBOX']);
  const list = [...inbox].filter(group => group.isSubscribed && group.isGroup);

  const listthread = [];

  for (const groupInfo of list) {
    const data = await api.getThreadInfo(groupInfo.threadID);
    listthread.push({
      id: groupInfo.threadID,
      name: groupInfo.name,
      sotv: data.userInfo.length,
    });
  }

  const listbox = listthread.sort((a, b) => b.sotv - a.sotv);

  let msg = "╭──〔 قائمة المجموعات 〕───\n";
  let i = 1;
  const groupid = [];

  for (const group of listbox) {
    msg += `│\n│ ${i}. ${group.name}\n│ ID: ${group.id}\n│ الأعضاء: ${group.sotv}\n`;
    groupid.push(group.id);
    i++;
  }

  msg += `│\n╰───〔 انتهى 〕───\n\nرد بـ "خروج رقم" أو "حظر رقم" للتنفيذ`;

  api.sendMessage(msg, event.threadID, (e, data) =>
    global.client.handleReply.push({
      name: this.config.name,
      author: event.senderID,
      messageID: data.messageID,
      groupid,
      type: 'reply'
    })
  );
};
