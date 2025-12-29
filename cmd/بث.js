module.exports = {
  name: "ليست",
  description: "عرض المجموعات والتحكم بها (للمطور فقط)",
  rank: 2, 
  async run(api, event, commands, args) {
    const { threadID, messageID, type, replyToMessage, body, senderID } = event;

    // 1. عرض القائمة (عند كتابة: ليست)
    if (type !== "message_reply") {
      return api.getThreadList(20, null, ["INBOX"], (err, list) => {
        if (err) return api.sendMessage("❌ فشل جلب القائمة.", threadID);
        
        let groupList = list.filter(t => t.isGroup);
        let msg = "📂 [ قائمة مجموعات لينكس ]\n\n";
        
        groupList.forEach((t, index) => {
          msg += `${index + 1}. 👥 ${t.name}\n🆔 ${t.threadID}\n\n`;
        });
        
        msg += "--- 💡 طريقة التحكم ---\n";
        msg += "قم بالرد على هذه الرسالة واكتب:\n";
        msg += "(رقم المجموعة) + (الأمر)\n\n";
        msg += "الأوامر المتاحة: غادر | ضيفني | حظر";
        
        api.sendMessage(msg, threadID, (err, info) => {
          // تخزين القائمة مؤقتاً في الذاكرة للتعرف عليها عند الرد
          global.tempGroups = groupList;
        }, messageID);
      });
    }

    // 2. معالجة الرد (عندما تقوم بالرد على القائمة)
    if (type === "message_reply" && global.tempGroups) {
      const input = body.split(" ");
      const index = parseInt(input[0]) - 1; // الرقم
      const action = input[1]; // الأمر (غادر/ضيفني/حظر)
      const targetGroup = global.tempGroups[index];

      if (!targetGroup) return api.sendMessage("❌ الرقم غير موجود في القائمة.", threadID);

      const targetID = targetGroup.threadID;

      switch (action) {
        case "غادر":
          api.sendMessage("👋 عذراً، سأغادر المجموعة بأمر من المطور..", targetID, () => {
            api.removeUserFromGroup(api.getCurrentUserID(), targetID);
            api.sendMessage(`✅ تم الخروج من: ${targetGroup.name}`, threadID);
          });
          break;

        case "ضيفني":
          api.addUserToGroup(senderID, targetID, (err) => {
            if (err) return api.sendMessage("❌ فشل الإضافة (تأكد من إعدادات الخصوصية لديك).", threadID);
            api.sendMessage(`✅ تم إرسال طلب إضافة لك لـ: ${targetGroup.name}`, threadID);
          });
          break;

        case "حظر":
          try {
            // استخدام نظام المونغو الموجود في مشروعك
            const { updateGroup } = require('../data/thread');
            await updateGroup(targetID, { status: { on: false } });
            api.sendMessage(`🚫 تم حظر البوت في مجموعة: ${targetGroup.name}`, threadID);
          } catch (e) {
            api.sendMessage("❌ خطأ في قاعدة البيانات.", threadID);
          }
          break;

        default:
          api.sendMessage("⚠️ استخدم: (الرقم غادر) أو (الرقم ضيفني) أو (الرقم حظر).", threadID);
      }
    }
  }
};
