const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const jimp = require("jimp");
const tools = require("../tools");

module.exports = {
  name: "شنق",
  description: "شنق شخص بمنشن",
  usage: "شنق @منشن",
  cooldown: 5,
  rank: 0,
  run: async (api, event, commands, args) => {
    const { threadID, messageID, senderID, mentions } = event;
    const mention = Object.keys(mentions);
    if (mention.length === 0) return api.sendMessage("⚠️ | منشن الشخص العايز تشنقه!", threadID, messageID);

    const one = senderID, two = mention[0];
    const pathImg = path.join(__dirname, `cache`, `shang_${two}.png`);
    const avatarOne = path.join(__dirname, `cache`, `avt1_${one}.png`);
    const avatarTwo = path.join(__dirname, `cache`, `avt2_${two}.png`);

    if (!fs.existsSync(path.join(__dirname, `cache`))) fs.mkdirSync(path.join(__dirname, `cache`));

    try {
      api.sendMessage("⏳ | جاري تحضير المشنقة...", threadID, messageID);
      
      const background = await jimp.read("https://i.postimg.cc/brq6rDDB/received-1417994055426496.jpg");
      const getAvatarOne = (await axios.get(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' })).data;
      const getAvatarTwo = (await axios.get(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' })).data;

      fs.writeFileSync(avatarOne, Buffer.from(getAvatarOne));
      fs.writeFileSync(avatarTwo, Buffer.from(getAvatarTwo));

      const circleOne = (await jimp.read(avatarOne)).circle();
      const circleTwo = (await jimp.read(avatarTwo)).circle();

      background.composite(circleOne.resize(200, 200), 255, 250) // تعديل الإحداثيات لتناسب الصورة
                .composite(circleTwo.resize(118, 118), 350, 80);

      await background.writeAsync(pathImg);
      
      api.sendMessage({ body: tools.styleText("تم تنفيذ حكم الإعدام! 😂"), attachment: fs.createReadStream(pathImg) }, threadID, () => {
        fs.unlinkSync(pathImg); fs.unlinkSync(avatarOne); fs.unlinkSync(avatarTwo);
      }, messageID);
    } catch (e) {
      api.sendMessage("❌ | حدث خطأ أثناء معالجة الصورة.", threadID, messageID);
    }
  }
};
