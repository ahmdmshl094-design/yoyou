const { getUserRank } = require("../handlers/handleCmd");

module.exports = {
  name: "لاست",
  otherName: [],
  rank: 2,
  cooldown: 15,
  description: "عرض قائمة المجموعات المتواجد فيها البوت",
  commandCategory: "المطور",
  usages: "لاست",
  run: async (api, event, commands, args, client) => {
    try {
      const senderID = event.senderID;
      const userRank = getUserRank(senderID);
      
      if (userRank < 2) {
        return api.sendMessage("مش لك مقلبي ☝🏿🐸", event.threadID, event.messageID);
      }

      const inbox = await api.getThreadList(100, null, ["INBOX"]);
      const list = inbox.filter(thread => thread.isGroup && thread.isSubscribed);

      const listthread = [];
      for (const groupInfo of list) {
        const data = await api.getThreadInfo(groupInfo.threadID);
        listthread.push({
          id: groupInfo.threadID,
          name: groupInfo.name,
          sotv: Array.isArray(data.userInfo) ? data.userInfo.length : 0,
        });
      }

      const sortedList = listthread.sort((a, b) => b.sotv - a.sotv);

      let msg = "╭──〔 قائمة المجموعات 〕───\n";
      let groupid = [];
      sortedList.forEach((group, index) => {
        msg += `│\n│ ${index + 1}. ${group.name}\n│ ID: ${group.id}\n│ الأعضاء: ${group.sotv}\n`;
        groupid.push(group.id);
      });
      msg += "│\n╰───〔 انتهى 〕───\n\nرد بـ 'خروج رقم' أو 'حظر رقم' للتنفيذ";

      // حفظ handleReply باستخدام client الصحيح
      if (!client.handleReply) client.handleReply = [];
      api.sendMessage(msg, event.threadID, (err, info) => {
        client.handleReply.push({
          name: module.exports.name,
          author: senderID,
          messageID: info.messageID,
          groupid,
          type: "reply",
        });
      });

    } catch (e) {
      console.error("Error in command 'لاست':", e);
      api.sendMessage("حدث خطأ أثناء تنفيذ الأمر.", event.threadID, event.messageID);
    }
  },
};
