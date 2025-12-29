const { getUserRank } = require("../handlers/handleCmd");

module.exports = {
  name: "slath",
  rank: 2, // للمطورين فقط
  cooldown: 0,
  prefix: true,
  run: async function (api, event, commands, args) {
    const { threadID, messageID, senderID } = event;

    // التحقق من الرتبة باستخدام نظامك الخاص
    if (getUserRank(senderID) < 2) {
      return api.sendMessage("⚠️ هذا الأمر مخصص للمطور فقط 🗿", threadID, messageID);
    }

    const action = args[0]; // الكلمة الأولى بعد slath
    const content = args.slice(1).join(" "); // بقية النص

    // 1. إذا لم يكتب شيئاً: عرض التعليمات
    if (!action) {
      const manual = 
        `╭━━━〔 ⚙️ أوامر المطور ⚙️ 〕━━━╮\n` +
        `┃\n` +
        `┃ • slath ريست ↝ إعادة التشغيل\n` +
        `┃ • slath بث [النص] ↝ نشر للكل\n` +
        `┃ • slath قائمة ↝ عرض المجموعات\n` +
        `┃ • slath طرد ↝ تصفية المجموعة\n` +
        `┃ • slath لقب [النص] ↝ لقب للكل\n` +
        `┃\n` +
        `╰━━━━━━━━━━━━━━━━━━╯\n` +
        `💡 اكتب الأمر بجانب slath للتنفيذ المباشر.`;
      return api.sendMessage(manual, threadID, messageID);
    }

    // 2. تنفيذ الأفعال مباشرة
    switch (action.toLowerCase()) {
      
      case "ريست":
        await api.sendMessage("🔄 جاري إعادة التشغيل الآن...", threadID);
        process.exit(1); // هذا سيجعل nodemon يعيد تشغيل البوت فوراً
        break;

      case "بث":
        if (!content) return api.sendMessage("📝 اكتب رسالتك: slath بث السلام عليكم", threadID);
        api.getThreadList(200, null, ["INBOX"], (err, list) => {
          const groups = list.filter(t => t.isGroup && t.isSubscribed);
          groups.forEach(g => api.sendMessage(`📢 إشعار من المطور:\n\n${content}`, g.threadID));
          api.sendMessage(`✅ تم إرسال البث لـ ${groups.length} مجموعة.`, threadID);
        });
        break;

      case "قائمة":
        api.getThreadList(50, null, ["INBOX"], (err, list) => {
          const groups = list.filter(t => t.isGroup);
          let msg = "📜 القروبات النشطة:\n\n";
          groups.forEach((g, i) => msg += `${i+1}. ${g.name || "بدون اسم"}\n🆔 ${g.threadID}\n\n`);
          api.sendMessage(msg, threadID);
        });
        break;

      case "طرد":
        api.getThreadInfo(threadID, (err, info) => {
          if (err) return api.sendMessage("❌ فشل جلب البيانات.", threadID);
          const members = info.participantIDs.filter(id => id != senderID && id != api.getCurrentUserID());
          members.forEach(id => api.removeUserFromGroup(id, threadID));
          api.sendMessage(`🧹 تم البدء بطرد ${members.length} عضو من المجموعة.`, threadID);
        });
        break;

      case "لقب":
        if (!content) return api.sendMessage("🪄 اكتب اللقب: slath لقب كينغ", threadID);
        api.getThreadInfo(threadID, (err, info) => {
          info.participantIDs.forEach(id => api.changeNickname(content, threadID, id));
          api.sendMessage(`✅ جاري تغيير ألقاب جميع الأعضاء إلى: ${content}`, threadID);
        });
        break;

      default:
        api.sendMessage("❌ أمر غير مدعوم! استخدم: (ريست، بث، قائمة، طرد، لقب)", threadID);
    }
  }
};
