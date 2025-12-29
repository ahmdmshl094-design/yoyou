const { styleText } = require('../tools');
const { getUserRank } = require("../handlers/handleCmd");

module.exports = {
  name: "slath",
  otherName: ['مطور'],
  rank: 2, // المطور فقط
  cooldown: 0,
  hide: true,
  prefix: true,
  description: 'لوحة تحكم المطور',

  run: async (api, event, commands, args, client) => {
    try {
      const { senderID, threadID } = event;
      const devID = "61579001370029";

      // التحقق من هوية المرسل
      const userRank = getUserRank(senderID);
      if (userRank < 2 || senderID !== devID) {
        return api.sendMessage("❌ هذا الأمر مخصص للمطور الأساسي.", threadID, event.messageID);
      }

      // التحقق من وجود خيار
      const choice = args[0];
      if (!choice) {
        return api.sendMessage(
          `╔═════════════〔 ${styleText('DEV MENU')} 〕═════════════╗\n\n` +
          `[1] إعادة تشغيل البوت\n[2] إرسال رسالة لجميع القروبات\n[3] تغيير كنيات الأعضاء\n[4] تصفية المجموعة\n[5] عرض المجموعات\n\n` +
          `╚═════════════════════════════════════════════╝\n` +
          `💡 اكتب رقم الخيار بعد الأمر: slath [رقم]`,
          threadID
        );
      }

      switch (choice) {
        // إعادة تشغيل البوت
        case "1":
          return api.sendMessage("⏳ جاري إعادة التشغيل...", threadID, () => process.exit(1));

        // بث رسالة لجميع القروبات
        case "2":
          const broadcastMsg = args.slice(1).join(" ");
          if (!broadcastMsg) return api.sendMessage("📝 اكتب الرسالة بعد الرقم: slath 2 [النص]", threadID);

          const inbox = (await api.getThreadList(100, null, ["INBOX"])) || [];
          const groups = inbox.filter(t => t.isGroup && t.isSubscribed);

          if (groups.length === 0) return api.sendMessage("⚠️ لا توجد قروبات للإرسال.", threadID);

          for (const t of groups) {
            try {
              await api.sendMessage(`📢 تعميم إداري:\n\n${broadcastMsg}`, t.threadID);
            } catch (err) {
              console.error(`Failed to send message to ${t.threadID}:`, err);
            }
          }
          return api.sendMessage("✅ تم الإرسال لجميع القروبات.", threadID);

        // تغيير كنيات الأعضاء (يمكنك إضافة المنطق هنا لاحقًا)
        case "3":
          return api.sendMessage("⚙️ خيار تغيير كنيات الأعضاء لم يتم تفعيله بعد.", threadID);

        // تصفية المجموعة
        case "4":
          const info = await api.getThreadInfo(threadID);
          api.sendMessage("🛑 بدأت التصفية...", threadID);

          for (const uid of info.participantIDs) {
            if (uid !== devID && uid !== api.getCurrentUserID()) {
              try {
                await api.removeUserFromGroup(uid, threadID);
              } catch (err) {
                console.error(`Failed to remove ${uid} from group:`, err);
              }
            }
          }
          return;

        // عرض المجموعات
        case "5":
          const list = (await api.getThreadList(50, null, ["INBOX"])) || [];
          let txt = "📋 المجموعات:\n";
          list.filter(t => t.isGroup).forEach((t, i) => {
            txt += `${i + 1}- ${t.name}\n`;
          });
          return api.sendMessage(txt, threadID);

        // خيار غير صحيح
        default:
          return api.sendMessage("❌ خيار غير صحيح. اكتب slath لمشاهدة القائمة.", threadID);
      }

    } catch (e) {
      console.error("Error in command 'slath':", e);
      api.sendMessage("⚠️ حدث خطأ أثناء تنفيذ أمر المطور.", event.threadID, event.messageID);
    }
  },
};
