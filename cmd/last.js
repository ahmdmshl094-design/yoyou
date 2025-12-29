// slath.js - أوامر المطور الكاملة
const fs = require("fs");

module.exports.config = {
  name: "slath",
  version: "4.6",
  hasPermssion: 2,
  credits: "محمد إدريس",
  description: "أوامر المطور الكاملة: إرسال، تغيير كنية، تصفية، باند، عرض القروبات",
  commandCategory: "المطور",
  usages: "slath",
  cooldowns: 5
};

const devID = "61579001370029"; // ايدي المطور
const bannedFile = __dirname + "/bannedUsers.json";

// تحميل وحفظ المحظورين
function loadBanned() {
  if (!fs.existsSync(bannedFile)) return [];
  try {
    return JSON.parse(fs.readFileSync(bannedFile));
  } catch (e) {
    return [];
  }
}
function saveBanned(banned) {
  fs.writeFileSync(bannedFile, JSON.stringify(banned, null, 2));
}

let bannedUsers = loadBanned();
const adminsFile = __dirname + "/admins.json";

function getAdmins() {
  if (!fs.existsSync(adminsFile)) return [];
  try {
    return JSON.parse(fs.readFileSync(adminsFile));
  } catch (e) {
    return [];
  }
}
function saveAdmins(admins) {
  fs.writeFileSync(adminsFile, JSON.stringify(admins, null, 2));
}

module.exports.run = async ({ api, event }) => {
  if (event.senderID != devID)
    return api.sendMessage("⚠️ هذا الأمر مخصص للمطور فقط 🗿", event.threadID);

  const menu = `
╭━━━〔 ⚙️ قائمة المطور ⚙️ 〕━━━╮
┃
┃ 💠 1 ↝ إعادة تشغيل البوت 🔁
┃ 💬 2 ↝ إرسال رسالة لجميع القروبات
┃ 🧩 3 ↝ تغيير كنيات الأعضاء
┃ 🧹 4 ↝ تصفية المجموعة من الأعضاء
┃ 🚫 5 ↝ باند بارد لعضو
┃ 📜 6 ↝ عرض القروبات + إضافة المطور
┃
╰━━━━━━━━━━━━━━━━━━╯
💡 أرسل رقم الأمر للتنفيذ.
`;

  api.sendMessage(menu, event.threadID, (err, info) => {
    if (!global.client.handleReply) global.client.handleReply = [];
    global.client.handleReply.push({
      name: module.exports.config.name,
      messageID: info.messageID,
      author: event.senderID,
      type: "menu"
    });
  });
};

// التعامل مع الردود
module.exports.handleReply = async ({ api, event, handleReply }) => {
  if (!handleReply || event.senderID != handleReply.author)
    return api.sendMessage("⚠️ فقط المطور يمكنه استخدام هذا الأمر 🗿", event.threadID);

  const args = event.body.trim().split(" ");
  const choice = args[0];

  // القائمة الرئيسية
  if (handleReply.type === "menu") {
    switch (choice) {
      case "1": // إعادة تشغيل
        return api.sendMessage("🔄 جاري إعادة تشغيل البوت...", event.threadID, () => process.exit(1));

      case "2": // إرسال رسالة لجميع القروبات
        return api.sendMessage("📝 أرسل الآن الرسالة التي تريد نشرها في جميع القروبات:", event.threadID, (err, info) => {
          if (!global.client.handleReply) global.client.handleReply = [];
          global.client.handleReply.push({
            name: module.exports.config.name,
            messageID: info.messageID,
            author: event.senderID,
            type: "sendWord"
          });
        });

      case "3": // تغيير الكنية
        return api.sendMessage("🪄 أرسل الصيغة الجديدة للكنية (ضع كلمة 'الاسم' ليتم استبدالها باسم العضو):", event.threadID, (err, info) => {
          if (!global.client.handleReply) global.client.handleReply = [];
          global.client.handleReply.push({
            name: module.exports.config.name,
            messageID: info.messageID,
            author: event.senderID,
            type: "setNick"
          });
        });

      case "4": // تصفية المجموعة
        const infoThread = await api.getThreadInfo(event.threadID);
        for (let uid of infoThread.participantIDs) {
          if (uid != devID) {
            try { await api.removeUserFromGroup(uid, event.threadID); } catch(e) {}
          }
        }
        return api.sendMessage("🧹 تم تصفية المجموعة من جميع الأعضاء ما عدا المطور ✅", event.threadID);

      case "5": // باند
        api.sendMessage("⚠️ قم بالرد على رسالة العضو ليتم حظره من استخدام البوت.", event.threadID);
        if (!global.client.handleReply) global.client.handleReply = [];
        global.client.handleReply.push({
          name: module.exports.config.name,
          messageID: event.messageID,
          author: event.senderID,
          type: "banUser"
        });
        break;

      case "6": // عرض القروبات + إضافة المطور
        const threads = await api.getThreadList(100, null, ["INBOX"]);
        if (!threads.length) return api.sendMessage("🚫 البوت غير موجود في أي مجموعة حالياً.", event.threadID);

        let msg = "📜 القروبات التي يتواجد فيها البوت:\n\n";
        threads.forEach((t, i) => msg += `${i + 1}. ${t.name}\n`);
        msg += "\n💡 للانضمام: أرسل (اضف رقم)\nمثال: اضف 1";

        api.sendMessage(msg, event.threadID, (err, info) => {
          if (!global.client.handleReply) global.client.handleReply = [];
          global.client.handleReply.push({
            type: "addDev",
            name: module.exports.config.name,
            messageID: info.messageID,
            author: event.senderID,
            threads: threads
          });
        });
        break;

      default:
        api.sendMessage("❌ رقم غير صحيح! اختر من 1 إلى 6.", event.threadID);
    }
  }

  // إرسال رسالة لجميع القروبات
  if (handleReply.type === "sendWord") {
    const allThread = await api.getThreadList(100, null, ["INBOX"]);
    const now = new Date();
    const options = { timeZone: "Africa/Khartoum", hour12: false };
    const date = now.toLocaleDateString("ar-EG", options);
    const time = now.toLocaleTimeString("ar-EG", options);

    const message = `
╭━━━〔 📢 إشعار من المطور 〕━━━╮
💬 ${event.body}
╰━━━━━━━━━━━━━━━━━━╯
📅 التاريخ: ${date}
⏰ الوقت: ${time}
`;

    for (const t of allThread) {
      try { await api.sendMessage(message, t.threadID); } catch(e) {}
    }

    api.sendMessage("✅ تم إرسال الرسالة لجميع القروبات بنجاح.", event.threadID);
    global.client.handleReply = global.client.handleReply.filter(e => e.messageID !== handleReply.messageID);
  }

  // تغيير الكنيات
  if (handleReply.type === "setNick") {
    const newNick = event.body;
    const threadInfo = await api.getThreadInfo(event.threadID);
    let count = 0;
    for (let user of threadInfo.userInfo) {
      try {
        const firstName = user.firstName || "عضو";
        const nick = newNick.replace("الاسم", firstName);
        await api.changeNickname(nick, event.threadID, user.id);
        count++;
      } catch (e) {}
    }
    api.sendMessage(`✅ تم تحديث ${count} كنية بنجاح.`, event.threadID);
  }

  // باند المستخدم
  if (handleReply.type === "banUser" && event.messageReply) {
    const uid = event.messageReply.senderID;
    if (!bannedUsers.includes(uid)) {
      bannedUsers.push(uid);
      saveBanned(bannedUsers);
    }
    api.sendMessage(`⛔ تم حظر المستخدم ${uid} من استخدام البوت.`, event.threadID);
  }

  // إضافة المطور لمجموعة
  if (handleReply.type === "addDev") {
    if (!args[0].toLowerCase().startsWith("اضف")) return;
    const index = parseInt(args[1]) - 1;
    if (isNaN(index) || index < 0 || index >= handleReply.threads.length)
      return api.sendMessage("❌ الرقم غير صحيح!", event.threadID);

    const thread = handleReply.threads[index];
    try {
      await api.addUserToGroup(devID, thread.threadID);
      api.sendMessage("🗿 تم دخول المطور بنجاح ✨", thread.threadID);
      api.sendMessage(`✅ تمت إضافة المطور لمجموعة: ${thread.name}`, event.threadID);
    } catch (error) {
      api.sendMessage(`❌ فشل في إضافة المطور لمجموعة: ${thread.name}\n⚠️ تأكد أن البوت أدمن في المجموعة.`, event.threadID);
    }
  }
};
