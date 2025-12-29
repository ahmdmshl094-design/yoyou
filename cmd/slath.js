const path = require('path');
// استيراد getUserRank مباشرة من ملف الهاندلر
const { getUserRank } = require("../handlers/handleCmd");

module.exports = {
  name: "لاست",
  rank: 2, // للمطورين فقط
  cooldown: 5,
  prefix: true,
  run: async function (api, event, commands, args) {
    try {
      const senderID = event.senderID;
      
      // في ملف handleCmd.js الخاص بك، الدالة تأخذ senderID فقط
      const userRank = getUserRank(senderID); 
      
      if (userRank < 2) {
        return api.sendMessage("| مش لك مقلبي ☝🏿🐸", event.threadID, event.messageID);
      }

      // استخدام getThreadList لأنها المدعومة في ws3-fca
      api.getThreadList(20, null, ["INBOX"], (err, list) => {
        if (err) {
          return api.sendMessage("❌ حدث خطأ أثناء جلب القائمة.", event.threadID);
        }

        const groups = list.filter(group => group.isGroup);

        if (groups.length === 0) {
          return api.sendMessage("❌ لا توجد مجموعات حالياً.", event.threadID);
        }

        let msg = "╭──〔 قـائمة الـمجموعات 〕───\n";
        groups.forEach((group, index) => {
          msg += `│\n│ ${index + 1}. ${group.name || "بدون اسم"}\n│ ID: ${group.threadID}\n│ الأعضاء: ${group.participantIDs.length}\n`;
        });
        msg += "│\n╰───〔 LINUX V2 〕───";

        return api.sendMessage(msg, event.threadID, event.messageID);
      });

    } catch (e) {
      console.error(e);
      api.sendMessage("❌ حدث خطأ داخلي في الأمر.", event.threadID);
    }
  }
};
