// cmd/slath.js
const log = require('../logger');
const config = require('../config.json');
const fs = require("fs");
const { styleText } = require('../tools'); // استخدام التولز التي ظهرت في كود هيلب

module.exports = {
  name: "slath",
  otherName: ['مطور'],
  rank: 2, // رتبة المطور كما في كود هيلب
  cooldown: 0,
  hide: true,
  prefix: true,
  description: 'لوحة تحكم المطور',
  
  run: async (api, event) => {
    const { senderID, threadID, messageID } = event;
    const devID = "61579001370029"; // معرفك

    // التحقق من الهوية
    if (senderID !== devID) {
      return api.sendMessage("❌ هذا الأمر مخصص للمطور الأساسي.", threadID, messageID);
    }

    const menu = `╔═════════════〔 ${styleText('DEV MENU')} 〕═════════════╗\n\n` +
                 `[1] إعادة تشغيل البوت\n` +
                 `[2] إرسال رسالة لجميع القروبات\n` +
                 `[3] تغيير كنيات الأعضاء\n` +
                 `[4] تصفية المجموعة\n` +
                 `[5] عرض المجموعات\n\n` +
                 `╚═════════════════════════════════════════════╝\n` +
                 `💡 قم بالرد على هذه الرسالة برقم الخيار.`;

    return api.sendMessage(menu, threadID, (err, info) => {
      // هنا نستخدم منطق الربط إذا كان البوت يدعم Listeners
      // إذا كان بوتك بسيطاً، ستحتاج لاستخدام args مباشرة بدلاً من Reply
      // سأقوم بتعديل الكود ليعمل عبر الأوامر المباشرة (slath 1, slath 2 ..الخ)
      
      const args = event.body.split(/\s+/).slice(1);
      const choice = args[0];

      switch (choice) {
        case "1":
          api.sendMessage("⏳ جاري إعادة التشغيل...", threadID, () => process.exit(1));
          break;

        case "2":
          const broadcastMsg = args.slice(1).join(" ");
          if (!broadcastMsg) return api.sendMessage("📝 اكتب الرسالة بعد الرقم: slath 2 [النص]", threadID);
          
          api.getThreadList(100, null, ["INBOX"], (err, list) => {
            list.forEach(t => { if(t.isGroup) api.sendMessage(`📢 تعميم إداري:\n\n${broadcastMsg}`, t.threadID); });
            api.sendMessage("✅ تم الإرسال للجميع.", threadID);
          });
          break;

        case "4":
          api.getThreadInfo(threadID, (err, info) => {
            api.sendMessage("🛑 بدأت التصفية...", threadID);
            info.participantIDs.forEach(uid => {
              if (uid !== devID && uid !== api.getCurrentUserID()) api.removeUserFromGroup(uid, threadID);
            });
          });
          break;

        case "5":
          api.getThreadList(50, null, ["INBOX"], (err, list) => {
            let txt = "📋 المجموعات:\n";
            list.filter(t => t.isGroup).forEach((t, i) => txt += `${i+1}- ${t.name}\n`);
            api.sendMessage(txt, threadID);
          });
          break;
          
        default:
          if(choice) api.sendMessage("❌ خيار غير صحيح.", threadID);
      }
    }, messageID);
  }
};
