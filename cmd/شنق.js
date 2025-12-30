const { getUser, updateUser } = require('../data/user');
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
module.exports = {
  name: 'شفشفة',
  otherName: ['سرقة'],
  type: ['الالعاب'],
  cooldown: 20,
  run: async (api, event, commands, args) => {
    const { senderID, threadID, messageID, messageReply } = event;
    const { sendMessage, editMessage } = api;

    if (!messageReply) return sendMessage("رد علي زول", threadID, messageID);

    const victimID = messageReply.senderID;
    const attacker = await getUser(senderID);
    const victim = await getUser(victimID);

    if (!attacker) return sendMessage("ما عندك حساب", threadID, messageID);
    if (!victim) return sendMessage("ما عندو حساب", threadID, messageID);
    // إرسال الرسالة وانتظار النتيجة (بدون Callback)
    const info = await sendMessage(" جاري التسلل...", threadID, messageID);

    await new Promise(res => setTimeout(res, 2000));

    const success = Math.random() < 0.4;
    let finalMsg;

    if (success) {
      const amount = Math.floor(victim.money * 0.1);
      attacker.money += amount;
      victim.money -= amount;
      await updateUser(senderID, { money: attacker.money });
      await updateUser(victimID, { money: victim.money });
      finalMsg = `${attacker.character.name} شفشف ${victim.character.name} ${amount} جنيه`;
    } else {
      finalMsg = `قبضوك يا حرامي`;
    }

    // تعديل الرسالة باستخدام المعرف الذي حصلنا عليه من sendMessage
    return editMessage(finalMsg, info.messageID);
  }
};
