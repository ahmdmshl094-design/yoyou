const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const jimp = require("jimp");
const tools = require("../tools");

module.exports = {
  name: "زواج",
  description: "زواج بمنشن",
  usage: "زواج @منشن",
  cooldown: 5,
  rank: 0,
  run: async (api, event, commands, args) => {
    const { threadID, messageID, senderID, mentions } = event;
    const mention = Object.keys(mentions);
    if (mention.length === 0) return api.sendMessage("⚠️ | منشن شريك حياتك!", threadID, messageID);

    const one = senderID, two = mention[0];
    const pathImg = path.join(__dirname, `cache`, `marry_${two}.png`);
    const avt1 = path.join(__dirname, `cache`, `m1_${one}.png`);
    const avt2 = path.join(__dirname, `cache`, `m2_${two}.png`);

    try {
      const background = await jimp.read("https://i.ibb.co/9ZZCSzR/ba6abadae46b5bdaa29cf6a64d762874.jpg");
      const getAvt1 = (await axios.get(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' })).data;
      const getAvt2 = (await axios.get(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' })).data;

      fs.writeFileSync(avt1, Buffer.from(getAvt1));
      fs.writeFileSync(avt2, Buffer.from(getAvt2));

      const img1 = (await jimp.read(avt1)).circle();
      const img2 = (await jimp.read(avt2)).circle();

      background.composite(img1.resize(130, 130), 200, 70).composite(img2.resize(130, 130), 350, 150);
      await background.writeAsync(pathImg);

      api.sendMessage({ body: tools.styleText("بارك الله لكما وجمع بينكما في خير! 💍"), attachment: fs.createReadStream(pathImg) }, threadID, () => {
        fs.unlinkSync(pathImg); fs.unlinkSync(avt1); fs.unlinkSync(avt2);
      }, messageID);
    } catch (e) {
      api.sendMessage("❌ | فشلت عملية الزواج، حاول مرة أخرى.", threadID, messageID);
    }
  }
};
