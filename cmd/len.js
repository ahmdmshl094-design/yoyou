const fs = require("fs");
const path = require("path");

// 🔒 إنشاء مجلد cache ثابت
const cacheDir = path.join(__dirname, "cache");
if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

// 📁 قاعدة بيانات ردود المستخدمين
const usersPath = path.join(cacheDir, "users_replies.json");
if (!fs.existsSync(usersPath)) fs.writeFileSync(usersPath, JSON.stringify({}));
let usersReplies = JSON.parse(fs.readFileSync(usersPath, "utf-8"));

// 📁 ملف وضع هياتو
const hiyatoPath = path.join(cacheDir, "hiyato.json");
if (!fs.existsSync(hiyatoPath)) fs.writeFileSync(hiyatoPath, JSON.stringify({ status: "off" }));
let hiyato = JSON.parse(fs.readFileSync(hiyatoPath, "utf-8"));

// حفظ البيانات
function saveUsers() { fs.writeFileSync(usersPath, JSON.stringify(usersReplies, null, 2)); }
function saveHiyato() { fs.writeFileSync(hiyatoPath, JSON.stringify(hiyato, null, 2)); }

module.exports.config = {
  name: "تعلم",
  version: "2.3.0",
  credits: "GPT + محمد إدريس",
  description: "نظام تعلم الردود لكل مستخدم باللهجة السودانية وزخارف مع هياتو",
  commandCategory: "النظام",
  usages: "تعلم الكلمة => الرد",
  cooldowns: 2
};

// ✨ التحقق إذا المرسل أدمن
async function isAdmin(api, threadID, senderID) {
  const info = await api.getThreadInfo(threadID);
  return info.adminIDs.some(ad => ad.id == senderID);
}

// ------------------- تنفيذ الأمر -------------------
module.exports.run = async function ({ api, event, args }) {
  const text = args.join(" ").trim();
  const sender = event.senderID;

  if (!usersReplies[sender]) usersReplies[sender] = {};

  if (!text) {
    return api.sendMessage(
      "◉⊱ ⚙️ **أوامر نظام التعلم باللهجة السودانية**:\n\n" +
      "◉⊱ 📘 إضافة رد:\nتعلم الكلمة => الرد\n\n" +
      "◉⊱ 🛡 أوامر الأدمن فقط:\nتعلم تعديل الكلمة => الرد الجديد\nتعلم حذف الكلمة\nتعلم قائمة\nتعلم هياتو on\nتعلم هياتو off",
      event.threadID
    );
  }

  // 🔥 تشغيل هياتو
  if (text === "هياتو on") {
    if (!(await isAdmin(api, event.threadID, sender)))
      return api.sendMessage("⧉ ❌ دا أمر الأدمن بس يا زول.", event.threadID);

    hiyato.status = "on"; saveHiyato();
    return api.sendMessage("◉⊱ ⚡ تم تشغيل وضع هياتو — البوت حيرد على أي كلمة متعلمة.", event.threadID);
  }

  // 🛑 إيقاف هياتو
  if (text === "هياتو off") {
    if (!(await isAdmin(api, event.threadID, sender)))
      return api.sendMessage("⧉ ❌ دا أمر الأدمن بس يا زول.", event.threadID);

    hiyato.status = "off"; saveHiyato();
    return api.sendMessage("◉⊱ 🛑 تم إيقاف وضع هياتو — حيرد بس على: كايروس الكلمة", event.threadID);
  }

  // 📜 قائمة ردود المستخدم
  if (text === "قائمة") {
    const userReplies = usersReplies[sender];
    if (Object.keys(userReplies).length === 0)
      return api.sendMessage("◉⊱ 📭 ما عندك ردود متعلمة هسي.", event.threadID);

    let msg = "◉⊱ 📚✨ **قائمة الردود المتعلمة ليك** ✨📚\n\n";
    let i = 1;
    for (let w in userReplies) {
      msg += `◉⊱ ${i}) **${w}** → ${userReplies[w]}\n`;
      i++;
    }
    msg += "\n◉⊱ 💠 استعمل: كايروس + الكلمة";
    return api.sendMessage(msg, event.threadID);
  }

  // ❌ حذف كلمة
  if (text.startsWith("حذف ")) {
    const word = text.replace("حذف ", "").trim();
    if (!usersReplies[sender][word]) return api.sendMessage("⧉ ⚠️ الكلمة ما موجودة.", event.threadID);

    delete usersReplies[sender][word]; saveUsers();
    return api.sendMessage(`◉⊱ 🗑️ تم حذف "${word}" بنجاح.`, event.threadID);
  }

  // ✏ تعديل كلمة
  if (text.startsWith("تعديل ")) {
    const parts = text.replace("تعديل ", "").split("=>");
    if (parts.length !== 2) return api.sendMessage("⧉ ⚠️ الصيغة: تعديل الكلمة => الرد الجديد", event.threadID);

    const word = parts[0].trim();
    const reply = parts[1].trim();
    if (!usersReplies[sender][word]) return api.sendMessage("⧉ ⚠️ الكلمة ما موجودة.", event.threadID);

    usersReplies[sender][word] = reply; saveUsers();
    return api.sendMessage(`◉⊱ ✏️ تم تعديل الرد للكلمة "${word}".`, event.threadID);
  }

  // ➕ تعليم كلمة جديدة
  const parts = text.split("=>");
  if (parts.length !== 2)
    return api.sendMessage("⧉ ❌ الصيغة: تعلم الكلمة => الرد", event.threadID);

  const word = parts[0].trim();
  const reply = parts[1].trim();
  usersReplies[sender][word] = reply; saveUsers();

  return api.sendMessage(`◉⊱ ✔️ تم تعلم الكلمة "${word}" ليك يا زول.`, event.threadID);
};

// 🤖 نظام الردود
module.exports.handleEvent = function ({ api, event }) {
  const msg = event.body;
  if (!msg) return;
  const sender = event.senderID;

  if (!usersReplies[sender]) usersReplies[sender] = {};

  // هياتو ON — يرد على أي كلمة متعلمة
  if (hiyato.status === "on") {
    const w = msg.trim();
    if (usersReplies[sender][w])
      return api.sendMessage(usersReplies[sender][w], event.threadID, event.messageID);
  }

  // الوضع العادي: كايروس الكلمة
  if (msg.startsWith("كايروس ")) {
    const w = msg.replace("كايروس ", "").trim();
    if (usersReplies[sender][w])
      return api.sendMessage(usersReplies[sender][w], event.threadID, event.messageID);
  }
};
