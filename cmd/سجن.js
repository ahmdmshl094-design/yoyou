const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");
const tools = require("../tools");

module.exports = {
  name: "سجن",
  description: "وضع شخص خلف القضبان",
  usage: "سجن [@منشن / بالرد]",
  cooldown: 5,
  rank: 0,
  run: async (api, event, commands, args) => {
    const { threadID, messageID, senderID, type, messageReply, mentions } = event;
    
    let uid;
    if (type === "message_reply") uid = messageReply.senderID;
    else if (Object.keys(mentions).length > 0) uid = Object.keys(mentions)[0];
    else uid = senderID;

    const pathImg = path.join(__dirname, "cache", `jail_${uid}.png`);
    const jailFrame = "https://i.postimg.cc/1zmxGQTS/8uv38cfmc74ur1p5rtntitrddi.png";

    try {
      const avatarUrl = `https://graph.facebook.com/${uid}/picture?height=1500&width=1500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      const avatarBuffer = (await axios.get(avatarUrl, { responseType: "arraybuffer" })).data;
      
      const img = await loadImage(Buffer.from(avatarBuffer));
      const frame = await loadImage(jailFrame);

      const canvas = createCanvas(img.width, img.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);

      const buffer = canvas.toBuffer();
      fs.writeFileSync(pathImg, buffer);

      api.sendMessage({ body: tools.styleText("تم سجن المتهم بنجاح! 👮‍♂️"), attachment: fs.createReadStream(pathImg) }, threadID, () => {
        fs.unlinkSync(pathImg);
      }, messageID);
    } catch (e) {
      api.sendMessage("❌ | حدث خطأ أثناء محاولة السجن.", threadID, messageID);
    }
  }
};
