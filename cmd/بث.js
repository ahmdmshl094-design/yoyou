const { styleText, styleNum } = require('../tools');
const log = require('../logger');
const { getUserRank } = require("../handlers/handleCmd");

module.exports = {
  name: "بث",
  rank: 2, // للمطور فقط
  cooldown: 10,
  prefix: true,
  description: "إرسال رسالة لجميع المجموعات (عضو أو مشرف)",
  run: function (api, event, commands, args) {
    const { threadID, messageID, senderID } = event;

    // التحقق من أنك المطور (Rank 2)
    if (getUserRank(senderID) < 2) {
      return api.sendMessage("| هذا الأمر مخصص للمطورين فقط.", threadID, messageID);
    }

    const broadcastMessage = args.join(' ');
    if (!broadcastMessage) {
      return api.sendMessage(styleText("يرجى كتابة نص الرسالة بعد كلمة بث"), threadID, messageID);
    }

    // جلب المجموعات
    api.getThreadList(400, null, ["INBOX"], (err, list) => {
      if (err) return api.sendMessage("❌ خطأ في جلب القائمة.", threadID, messageID);

      // تصفية المحادثات لتشمل المجموعات التي البوت عضو فيها فقط
      const groupThreads = list.filter(t => t.isGroup && t.isSubscribed);

      if (groupThreads.length === 0) {
        return api.sendMessage("| لا توجد مجموعات نشطة حالياً.", threadID, messageID);
      }

      api.sendMessage(`⏳ جاري بدء البث إلى ${styleNum(groupThreads.length)} مجموعة...\n(سيتم الإرسال سواء كنت مشرفاً أم لا)`, threadID);

      let successCount = 0;
      let completed = 0;

      groupThreads.forEach((group, index) => {
        // توزيع الإرسال بفارق زمني (ثانية بين كل رسالة) لتجنب الحظر
        setTimeout(() => {
          api.sendMessage(`| إشعار من المطور:\n\n${broadcastMessage}`, group.threadID, (sendErr) => {
            if (!sendErr) successCount++;
            
            completed++;
            // عند الانتهاء من آخر مجموعة في القائمة
            if (completed === groupThreads.length) {
              api.sendMessage(`✅ تم اكتمال البث:\n• نجاح الإرسال لـ: ${styleNum(successCount)} مجموعة.`, threadID);
            }
          });
        }, index * 1000); 
      });
    });
  }
};
