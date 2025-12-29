const { styleText, styleNum } = require('../tools');
const log = require('../logger');

module.exports = {
  name: "بث",
  otherName: ['sendall'],
  rank: 2,
  hide: true,
  cooldown: 15,
  description: 'إرسال بث إلى جميع المجموعات',
  run: async (api, event, commands, args) => {
    const startTime = Date.now();
    const { threadID, messageID } = event;
    const broadcastMessage = args.join(' ');

    if (!broadcastMessage) {
      return api.sendMessage(
        styleText('اكتب رسالة البث'),
        threadID,
        messageID
      );
    }

    try {
      // جلب عدد أكبر من المحادثات
      const threads = await api.getThreadList(1000, null, ['INBOX']);
      const groupThreads = threads.filter(t => t.isGroup);

      if (!groupThreads.length) {
        return api.sendMessage(
          'البوت غير موجود في أي مجموعة حالياً',
          threadID,
          messageID
        );
      }

      let successCount = 0;
      let failedCount = 0;

      for (const thread of groupThreads) {
        try {
          await api.sendMessage(
            `رسالة من المطور:\n\n${broadcastMessage}`,
            thread.threadID
          );
          successCount++;
        } catch (err) {
          failedCount++;
        }
      }

      const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);

      const response =
        `تم تنفيذ البث بنجاح\n\n` +
        `عدد المجموعات: ${styleNum(groupThreads.length)}\n` +
        `تم الإرسال: ${styleNum(successCount)}\n` +
        `فشل الإرسال: ${styleNum(failedCount)}\n` +
        `الوقت: ${styleNum(durationSec)} ثانية`;

      api.sendMessage(response, threadID, messageID);

    } catch (err) {
      log.error("خطأ في أمر البث: " + err);
      api.sendMessage(
        'حدث خطأ أثناء تنفيذ أمر البث',
        threadID,
        messageID
      );
    }
  }
};
