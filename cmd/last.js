// cmd/last.js
const log = require('../logger');
const config = require('../config.json');

module.exports.config = {
  name: "last",
  version: '1.0.0',
  credits: 'عمر',
  hasPermssion: 2,
  description: 'عرض المجموعات التي يتواجد بها البوت والتحكم بها',
  commandCategory: 'المطور',
  usages: 'last',
  cooldowns: 15
};

module.exports.handleReply = async function({ api, event, Threads, handleReply }) {
  const { senderID, threadID, messageID, body } = event;
  
  // التحقق من أن الشخص الذي يرد هو المطور الذي طلب القائمة
  if (parseInt(senderID) !== parseInt(handleReply.author)) return;

  const args = body.split(/\s+/);
  const action = args[0]; // خروج أو حظر
  const index = parseInt(args[1]) - 1; // تحويل الرقم المكتوب إلى ترتيب في المصفوفة
  const targetID = handleReply.groupid[index];

  if (!targetID) {
    return api.sendMessage("⚠️ الرقم الذي اخترته غير موجود في القائمة.", threadID, messageID);
  }

  switch (handleReply.type) {
    case "reply":
      {
        // خيار الحظر
        if (action === "حظر") {
          try {
            if (Threads && Threads.setData) {
              const threadData = (await Threads.getData(targetID)).data || {};
              threadData.banned = 1;
              await Threads.setData(targetID, { data: threadData });
              
              if (global.data && global.data.threadBanned) {
                global.data.threadBanned.set(parseInt(targetID), 1);
              }
              api.sendMessage(`✅ تم حظر المجموعة بنجاح:\nID: ${targetID}`, threadID, messageID);
            } else {
              api.sendMessage("⚠️ نظام قاعدة بيانات المجموعات (Threads) غير متوفر حالياً.", threadID, messageID);
            }
          } catch (e) {
            log.error(e);
            api.sendMessage("❌ فشل تنفيذ عملية الحظر.", threadID, messageID);
          }
          break;
        }

        // خيار الخروج
        if (action === "خروج" || action === "غادري") {
          try {
            api.removeUserFromGroup(api.getCurrentUserID(), targetID, (err) => {
              if (err) return api.sendMessage(`❌ فشل الخروج من المجموعة: ${targetID}`, threadID, messageID);
              api.sendMessage(`✅ تم الخروج من المجموعة بنجاح.`, threadID, messageID);
            });
          } catch (e) {
            log.error(e);
          }
          break;
        }
      }
  }
};

module.exports.run = async function({ api, event }) {
  const { senderID, threadID, messageID } = event;
  const devID = 61579001370029; // معرفك كمطور

  // التحقق من صلاحية المطور
  if (parseInt(senderID) !== devID) {
    return api.sendMessage("⚠️ هذا الأمر مخصص للمطور فقط.", threadID, messageID);
  }

  try {
    // جلب قائمة بآخر 100 محادثة
    const inbox = await api.getThreadList(100, null, ['INBOX']);
    // تصفية المجموعات النشطة فقط
    const groups = inbox.filter(g => g.isGroup && g.isSubscribed);

    if (groups.length === 0) {
      return api.sendMessage("📩 البوت لا يتواجد في أي مجموعات حالياً.", threadID, messageID);
    }

    const groupid = [];
    let msg = "╭──〔 قائمة المجموعات 〕───\n│\n";
    
    groups.forEach((group, i) => {
      msg += `│ ${i + 1}. ${group.name || "مجموعة بدون اسم"}\n│ ID: ${group.threadID}\n│ 👥 الأعضاء: ${group.participantIDs.length}\n│\n`;
      groupid.push(group.threadID);
    });

    msg += `╰───〔 انتهى 〕───\n\n💡 للتحكم، رد على الرسالة بـ:\n(خروج [رقم]) أو (حظر [رقم])`;

    return api.sendMessage(msg, threadID, (err, info) => {
      if (err) return log.error(err);
      
      if (!global.client.handleReply) global.client.handleReply = [];
      
      global.client.handleReply.push({
        name: this.config.name,
        author: senderID,
        messageID: info.messageID,
        groupid: groupid,
        type: 'reply'
      });
    }, messageID);

  } catch (error) {
    log.error(error);
    return api.sendMessage("❌ حدث خطأ أثناء جلب القائمة.", threadID, messageID);
  }
};
