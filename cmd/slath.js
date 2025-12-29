const { getUserRank } = require("../handlers/handleCmd");
const config = require("../config.json");

module.exports = {
  name: "لاست",
  otherName: [],
  rank: 2,
  cooldown: 15,
  description: "عرض قائمة المجموعات المتواجد فيها البوت",
  run: async (api, event, commands, args, client) => {
    try {
      const senderID = event.senderID;
      const userRank = getUserRank(senderID, config);
      if (userRank < 2) return await api.sendMessage("مش لك مقلبي ☝🏿🐸", event.threadID);

      // جلب جميع القروبات
      const allThreads = await api.allThreads(); // بدل getThreadList
      const groups = allThreads.filter(thread => thread.isGroup && thread.isSubscribed);

      if (!groups.length) return await api.sendMessage("❌ لا توجد مجموعات للبوت.", event.threadID);

      const listthread = groups.map((group) => ({
        id: group.threadID,
        name: group.name,
        sotv: group.participantIDs ? group.participantIDs.length : 0, // عدد الأعضاء
      }));

      const sortedList = listthread.sort((a, b) => b.sotv - a.sotv);

      let msg = "╭──〔 قائمة المجموعات 〕───\n";
      const groupid = [];
      sortedList.forEach((group, index) => {
        msg += `│\n│ ${index + 1}. ${group.name}\n│ ID: ${group.id}\n│ الأعضاء: ${group.sotv}\n`;
        groupid.push(group.id);
      });
      msg += "│\n╰───〔 انتهى 〕───\n\nرد بـ 'خروج رقم' أو 'حظر رقم' للتنفيذ";

      if (!client.handleReply) client.handleReply = [];
      const info = await api.sendMessage(msg, event.threadID);
      client.handleReply.push({
        name: module.exports.name,
        author: senderID,
        messageID: info.messageID,
        groupid,
        type: "reply",
      });

    } catch (e) {
      console.error("Error in command 'لاست':", e);
      await api.sendMessage("❌ حدث خطأ أثناء تنفيذ الأمر.", event.threadID);
    }
  },
};
