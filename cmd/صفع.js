const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const jimp = require("jimp");
const tools = require("../tools");

module.exports = {
  name: "اصفعي",
  description: "تصفع شخص بمنشن (صورة)",
  usage: "اصفعي @منشن",
  cooldown: 5,
  rank: 0,
  run: async (api, event, commands, args) => {
    const { threadID, messageID, senderID, mentions } = event;
    const mention = Object.keys(mentions);
    
    if (mention.length === 0) return api.sendMessage("⚠️ | لازم تمنشن الشخص العايز تصفعو!", threadID, messageID);

    const one = senderID;
    const two = mention[0];
    
    // إعداد المسارات
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
    
    const pathImg = path.join(cacheDir, `slap_${two}.png`);
    const avatarOne = path.join(cacheDir, `avt1_${one}.png`);
    const avatarTwo = path.join(cacheDir, `avt2_${two}.png`);

    try {
      api.sendMessage("⏳ | جاري تجهيز الصفعة...", threadID, messageID);

      // قراءة خلفية الصورة (بات مان يصفع روبن)
      const background = await jimp.read("https://i.imgur.com/dsrmtlg.jpg");
      
      // جلب صور البروفايل
      const getAvatarOne = (await axios.get(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' })).data;
      const getAvatarTwo = (await axios.get(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' })).data;

      fs.writeFileSync(avatarOne, Buffer.from(getAvatarOne));
      fs.writeFileSync(avatarTwo, Buffer.from(getAvatarTwo));

      // تحويل الصور لدوائر
      const circleOne = (await jimp.read(avatarOne)).circle();
      const circleTwo = (await jimp.read(avatarTwo)).circle();

      // دمج الصور على الخلفية في الإحداثيات الصحيحة
      background
        .composite(circleOne.resize(150, 150), 260, 80) // مكان المهاجم
        .composite(circleTwo.resize(150, 150), 80, 190); // مكان الضحية

      await background.writeAsync(pathImg);

      // إرسال النتيجة
      api.sendMessage({ 
        body: tools.styleText("خذ هذه الصفعة! 👊😂"), 
        attachment: fs.createReadStream(pathImg) 
      }, threadID, () => {
        // حذف الملفات المؤقتة بعد الإرسال
        if (fs.existsSync(pathImg)) fs.unlinkSync(pathImg);
        if (fs.existsSync(avatarOne)) fs.unlinkSync(avatarOne);
        if (fs.existsSync(avatarTwo)) fs.unlinkSync(avatarTwo);
      }, messageID);

    } catch (e) {
      console.error(e);
      api.sendMessage("❌ | حدث خطأ أثناء معالجة الصورة.", threadID, messageID);
    }
  }
};
