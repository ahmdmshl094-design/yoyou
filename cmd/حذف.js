module.exports = {
  name: "حذف",
  rank: 0, // متاح للجميع
  cooldown: 2,
  prefix: true,
  run: async function (api, event) {
    if (event.type !== "message_reply") {
      return api.sendMessage("| يرجى الرد على رسالة البوت التي تريد حذفها.", event.threadID, event.messageID);
    }
    
    if (event.messageReply.senderID !== api.getCurrentUserID()) {
      return api.sendMessage("| يمكنني حذف رسائلي فقط.", event.threadID, event.messageID);
    }

    return api.unsendMessage(event.messageReply.messageID);
  }
};
