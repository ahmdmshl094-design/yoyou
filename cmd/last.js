module.exports = {
  name: "حب",
  description: "قياس نسبة الحب بزخارف نصية (بالرد أو المنشن)",
  rank: 0,
  cooldown: 5,
  async run(api, event, commands, args) {
    const { threadID, messageID, mentions, senderID, type, replyToMessage } = event;

    let targetID;
    let targetName;

    // 1. تحديد الشخص المستهدف (إما بالرد أو المنشن)
    if (type === "message_reply") {
      targetID = replyToMessage.senderID;
      // محاولة جلب اسم الشخص من الرد
      targetName = "الطرف الآخر"; 
    } else if (Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
      targetName = mentions[targetID].replace("@", "");
    } else {
      return api.sendMessage("‹ ⚠️ › يا زول رد على رسالة زول أو منشنه عشان نقيس النسبة!", threadID, messageID);
    }

    // منع الشخص من قياس النسبة مع نفسه
    if (targetID === senderID) {
      return api.sendMessage("‹ ⚠️ › ما ممكن تحب نفسك يا نرجسي، منشن زول تاني!", threadID, messageID);
    }

    // 2. حساب النسبة وتوليد الزخرفة
    const percentage = Math.floor(Math.random() * 101);
    const hearts = "« ♡ ♡ ♡ ♡ ♡ ♡ ♡ ♡ ♡ ♡ »";
    const filledHeartsCount = Math.floor(percentage / 10);
    const visualBar = "♥".repeat(filledHeartsCount) + "♡".repeat(10 - filledHeartsCount);

    // 3. رسائل التعليق باللهجة السودانية
    let comment = "";
    if (percentage > 85) comment = "‹ ⚖️ › علاقة في السلك، زولك ده أصلي عديل.";
    else if (percentage > 50) comment = "‹ ⚖️ › الأمور ماشة، بس محتاجة اهتمام شوية.";
    else if (percentage > 20) comment = "‹ ⚖️ › النسبة ضعيفة، أحسن تخليها أخوة وصداقة.";
    else comment = "‹ ⚖️ › مافي أي توافق، الزول ده ما شبهك نهائي.";

    // 4. إرسال النتيجة النهائية بالزخارف
    const resultMsg = 
      `‹ تقرير الإعجاب الخاص بلينكس ›\n` +
      `━━━━━━━━━━━━━━━\n` +
      `‹ 👤 › الطرف الأول: أنت\n` +
      `‹ 👤 › الطرف الثاني: ${targetName}\n` +
      `━━━━━━━━━━━━━━━\n` +
      `‹ 📊 › النسبة: [ ${percentage}% ]\n` +
      `‹ 🔒 › المقياس: [ ${visualBar} ]\n` +
      `━━━━━━━━━━━━━━━\n` +
      `${comment}\n` +
      `━━━━━━━━━━━━━━━`;

    api.sendMessage(resultMsg, threadID, messageID);
  }
};
