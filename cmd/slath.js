
module.exports = {
  name: "نشر",
  description: "إرسال رسالة لكل المجموعات",
  rank: 2,
  async run(api, event, commands, args) {
    const content = args.join(" ");
    if (!content) return api.sendMessage("⚠️ أكتب الرسالة التي تريد نشرها.", event.threadID);

    api.getThreadList(100, null, ["INBOX"], (err, list) => {
      if (err) return api.sendMessage("❌ خطأ في جلب القائمة.", event.threadID);
      let count = 0;
      list.forEach(thread => {
        if (thread.isGroup && thread.threadID !== event.threadID) {
          api.sendMessage(`📢 [ إشعار من المطور ]\n\n${content}`, thread.threadID);
          count++;
        }
      });
      api.sendMessage(`✅ تم النشر في ${count} مجموعة.`, event.threadID);
    });
  }
};
