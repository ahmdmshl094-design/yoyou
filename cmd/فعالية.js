const tools = require('../tools');

// مخزن الجلسات لإدارة اللعبة في كل مجموعة على حدة
const sessions = new Map();

module.exports = {
  name: "فعالية",
  description: "لعبة القلوب: تفكيك، تركيب، عواصم، وإيموجي مع نظام هجوم",
  usage: "فعالية [انشاء/انضمام/ابدأ/حذف]",
  cooldown: 0,
  rank: 0,
  run: async (api, event, commands, args) => {
    const { threadID, messageID, senderID, body, type: eventType, messageReply } = event;
    const arg = args[0];
    const session = sessions.get(threadID);

    // --- 1. إنشاء الفعالية ---
    if (arg === "انشاء") {
      if (session) return api.sendMessage("⚠️ | يا زول في فعالية شغالة أصلاً في القروب ده!", threadID, messageID);
      
      sessions.set(threadID, {
        status: "waiting",
        creator: senderID,
        players: [],
        winnerOfRound: null,
        currentAnswer: null
      });

      // إضافة المنشئ تلقائياً بـ 3 قلوب
      api.getUserInfo(senderID, (err, ret) => {
        const name = ret[senderID].name;
        const s = sessions.get(threadID);
        s.players.push({ id: senderID, hearts: 3, name: name });
        api.sendMessage(`🎮 | تم إنشاء الفعالية بنجاح!\n❤️ لكل لاعب [ 3 قلوب ]\n👤 المالك: ${name}\n\n📝 للانضمام اكتب: فعالية انضمام\n🚀 المالك يكتب: فعالية ابدأ`, threadID, messageID);
      });
      return;
    }

    // --- 2. الانضمام للفعالية ---
    if (arg === "انضمام") {
      if (!session) return api.sendMessage("❌ | مافي فعالية مفتوحة حالياً، اكتب 'فعالية انشاء'.", threadID, messageID);
      if (session.status !== "waiting") return api.sendMessage("🚫 | اللعبة بدأت خلاص، انتظر الجولة الجاية.", threadID, messageID);
      if (session.players.find(p => p.id === senderID)) return api.sendMessage("إنت منضم أصلاً، ركز يا حبيب! 😂", threadID, messageID);

      api.getUserInfo(senderID, (err, ret) => {
        const name = ret[senderID].name;
        session.players.push({ id: senderID, hearts: 3, name: name });
        api.setMessageReaction("✅", messageID);
        api.sendMessage(`👤 | تم انضمام [ ${name} ] للفعالية.\nالعدد الحالي: ${session.players.length} لاعبين.`, threadID, messageID);
      });
      return;
    }

    // --- 3. بدء اللعبة ---
    if (arg === "ابدأ") {
      if (!session) return;
      if (session.creator !== senderID) return api.sendMessage("فقط منشئ الفعالية يمكنه البدء! ✋", threadID, messageID);
      if (session.players.length < 2) return api.sendMessage("يا زول العب مع منو؟ لازم لاعبين على الأقل!", threadID, messageID);
      
      session.status = "playing";
      return sendChallenge(api, threadID);
    }

    // --- 4. حذف الفعالية (للطوارئ) ---
    if (arg === "حذف") {
      if (session && session.creator === senderID) {
        sessions.delete(threadID);
        return api.sendMessage("🗑️ | تم إنهاء الفعالية وحذف الجلسة.", threadID, messageID);
      }
    }

    // --- منطق الاستعلام واللعب المستمر ---
    if (!session) return;

    // ميزة "قلوبي"
    if (body && body.trim() === "قلوبي") {
      const player = session.players.find(p => p.id === senderID);
      if (player) {
        const heartIcons = "❤️".repeat(player.hearts);
        return api.sendMessage(`👤 | يا ${player.name}\nرصيدك: [ ${player.hearts} ] قلوب متبقية.\n${heartIcons}`, threadID, messageID);
      }
      return;
    }

    // 5. حالة الهجوم (بعد ما شخص يجاوب صح)
    if (session.status === "attack" && senderID === session.winnerOfRound) {
      let target = null;
      
      // الهجوم بالرد (Reply)
      if (eventType === "message_reply") {
        target = session.players.find(p => p.id === messageReply.senderID);
      } 
      // الهجوم بالاسم
      else if (body) {
        target = session.players.find(p => body.toLowerCase().includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(body.toLowerCase()));
      }

      if (target) {
        if (target.id === senderID) return api.sendMessage("بتكتل نفسك؟ ركز وهاجم زول غيرك! 😂", threadID, messageID);
        
        target.hearts--;
        let deadMsg = "";
        if (target.hearts <= 0) {
          deadMsg = `\n💀 | اللاعب [ ${target.name} ] خسر كل قلوبه وخرج!`;
          session.players = session.players.filter(p => p.id !== target.id);
        }

        api.sendMessage(`🔪 | هجوووم ناجح!\nنقصت قلب من: ${target.name}\nالمتبقي له: ${target.hearts > 0 ? target.hearts : 0} ❤️${deadMsg}`, threadID);

        // التحقق من الفائز النهائي
        if (session.players.length === 1) {
          const finalWinner = session.players[0];
          api.sendMessage(`🏆 | مبروووك! الفائز النهائي بالفعالية هو: [ ${finalWinner.name} ]\nتستاهل الـ Diamond! 💎`, threadID);
          return sessions.delete(threadID);
        }

        session.status = "playing";
        return setTimeout(() => sendChallenge(api, threadID), 2500);
      }
    }

    // 6. التحقق من الإجابة أثناء الجولة
    if (session.status === "playing" && body && !body.startsWith("فعالية")) {
      if (body.trim().toLowerCase() === session.currentAnswer.toLowerCase()) {
        session.winnerOfRound = senderID;
        session.status = "attack";
        api.setMessageReaction("🔥", messageID);
        return api.sendMessage(`⭐ | بطل! إجابة صحيحة.\nالآن هاجم خصمك (رد على رسالته أو اكتب اسمه)! 🔪`, threadID, messageID);
      }
    }
  }
};

// --- دالة إرسال التحديات المتنوعة ---
async function sendChallenge(api, threadID) {
  const session = sessions.get(threadID);
  if (!session) return;

  const challenges = [
    // عواصم
    { q: "ما هي عاصمة (السودان)؟", a: "الخرطوم" },
    { q: "ما هي عاصمة (السعودية)؟", a: "الرياض" },
    { q: "ما هي عاصمة (قطر)؟", a: "الدوحة" },
    { q: "ما هي عاصمة (مصر)؟", a: "القاهرة" },
    { q: "ما هي عاصمة (اليابان)؟", a: "طوكيو" },
    { q: "ما هي عاصمة (فرنسا)؟", a: "باريس" },
    
    // تفكيك (يعطيه الكلمة ويطلب المسافات)
    { q: "فكك الكلمة التالية: (سوداني)", a: "س و د ا ن ي" },
    { q: "فكك الكلمة التالية: (مستشفى)", a: "م س ت ش ف ى" },
    { q: "فكك الكلمة التالية: (تلفون)", a: "ت ل ف و ن" },
    
    // تركيب / تجميع (يعطيه الحروف ويجمعها)
    { q: "ركب الكلمة من الحروف: (ل ي ن ك س)", a: "لينكس" },
    { q: "ركب الكلمة من الحروف: (ب ر م ج ة)", a: "برمجة" },
    { q: "ركب الكلمة من الحروف: (م ا س ن ج ر)", a: "ماسنـجر" },

    // إيموجي (البحث عن إيموجي محدد)
    { q: "أرسل إيموجي: (قلب أسود)", a: "🖤" },
    { q: "أرسل إيموجي: (نار)", a: "🔥" },
    { q: "أرسل إيموجي: (وجه يضحك)", a: "😂" },
    { q: "أرسل إيموجي: (علم السودان)", a: "🇸🇩" },
    { q: "أرسل إيموجي: (قنبلة)", a: "💣" },
    { q: "أرسل إيموجي: (عين)", a: "👁️" }
  ];

  const random = challenges[Math.floor(Math.random() * challenges.length)];
  session.currentAnswer = random.a;

  // استخدام استايل الخط من ملف tools.js الخاص بك
  const styledMsg = tools.styleText(`✨ | جولة جديدة:\n\n${random.q}`);
  api.sendMessage(styledMsg, threadID);
}
