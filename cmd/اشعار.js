// cmd/notify.js
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "اشعار",
  otherName: ["notify"],
  rank: 3, // فقط المطور
  cooldown: 5,
  description: "ارسال اشعارات لجميع القروبات",
  
  async execute({ api, event, args }) {
    const { senderID, threadID } = event;
    
    // التأكد أن المرسل هو المطور
    if (senderID != "61579001370029") {
      return api.sendMessage("هذا الأمر خاص بالمطور فقط.", threadID);
    }

    // إذا الأمر فقط "اشعار"
    if (!args[0]) {
      return api.sendMessage("اكتب الداير ترسلو", threadID);
    }

    // أخذ النص بعد الأمر
    const textToSend = args.join(" ");

    // جلب جميع القروبات التي البوت موجود فيها
    const threadsDataPath = path.join(__dirname, "../data/threads.json");
    let threads = [];

    if (fs.existsSync(threadsDataPath)) {
      threads = JSON.parse(fs.readFileSync(threadsDataPath, "utf-8"));
    }

    if (threads.length === 0) {
      return api.sendMessage("لا يوجد قروبات مسجلة لإرسال الرسالة.", threadID);
    }

    // إرسال الرسالة لكل القروبات
    for (const tID of threads) {
      api.sendMessage(textToSend, tID);
    }

    return api.sendMessage("تم إرسال الرسالة لجميع القروبات.", threadID);
  },
};
