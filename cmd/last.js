module.exports.config = {
  name: "لاست",
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

  var arg = event.body.split(" ");
  var idgr = handleReply.groupid[arg[1] - 1];

  switch (handleReply.type) {

    case "reply":
      {
        if (arg[0] == "حظر" || arg[0] == "حظر") {
          const data = (await Threads.getData(idgr)).data || {};
          data.banned = 1;
          await Threads.setData(idgr, { data });
          global.data.threadBanned.set(parseInt(idgr), 1);

          api.sendMessage(`تم حظر المجموعة بنجاح\nID: [${idgr}]`, event.threadID, event.messageID);
          break;
        }

        if (arg[0] == "خروج" || arg[0] == "غادري") {
          api.removeUserFromGroup(`${api.getCurrentUserID()}`, idgr);
          api.sendMessage(`تم الخروج من المجموعة:\n${idgr}\n${(await Threads.getData(idgr)).name}`, event.threadID, event.messageID);
          break;
        }

      }
  }
};

module.exports.run = async function({ api, event, client }) {

  // منع غير المطورين
  if (event.senderID != "61579001370029") {
    return api.sendMessage("مش لك يقلبي ☝🏿🐸", event.threadID, event.messageID);
  }

  var inbox = await api.getThreadList(100, null, ['INBOX']);
  let list = [...inbox].filter(group => group.isSubscribed && group.isGroup);

  var listthread = [];

  for (var groupInfo of list) {
    let data = (await api.getThreadInfo(groupInfo.threadID));

    listthread.push({
      id: groupInfo.threadID,
      name: groupInfo.name,
      sotv: data.userInfo.length,
    });

  }

  var listbox = listthread.sort((a, b) => b.sotv - a.sotv);

  let msg = "╭──〔 قائمة المجموعات 〕───\n";
  let i = 1;

  var groupid = [];
  for (var group of listbox) {
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
