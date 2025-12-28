// cmd/help.js
const { getUserRank } = require("../handlers/handleCmd");
const log = require('../logger');
const config = require('../config.json');
const { styleText, styleNum } = require('../tools');

module.exports = {
  name: "اوامر",
  otherName: ['help', 'أوامر'],
  rank: 0,
  cooldown: 0,
  hide: false,
  prefix: true,
  description: 'يقوم بعرض الأوامر المتاحة',
  usageCount: 0,

  run: async (api, event, allCommands) => {
    try {
      const { senderID, threadID, messageID } = event;
      const args = event.body.split(/\s+/).slice(1);
      const userRank = getUserRank(senderID, config);

      const availableCommands = (allCommands || [])
        .filter(cmd => cmd.rank <= userRank)
        .filter(cmd => cmd.hide === false)
        .filter(cmd => cmd.name !== 'اوامر');

      if (availableCommands.length === 0) {
        return api.sendMessage(`${config.name}`, threadID, messageID);
      }

      const itemsPerPage = 10;
      const pageNumber = parseInt(args[0], 10) || 1;
      const totalCommands = availableCommands.length;
      const totalPages = Math.ceil(totalCommands / itemsPerPage);

      if (pageNumber > totalPages || pageNumber < 1) {
        return api.sendMessage(
          `إجمالي عدد الصفحات ⊰◉ ${totalPages}`,
          threadID,
          messageID
        );
      }

      const startIndex = (pageNumber - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;

      const commandsList = availableCommands
        .slice(startIndex, endIndex)
        .map(cmd => `⊰◉ ${cmd.name}`)
        .join('\n');

      const messageText = `
ــــــــــــــــــــــــ
${styleText('قائمة الأوامر')}
ــــــــــــــــــــــــ
${commandsList}

${styleText('عدد الأوامر')} ⊰◉ ${totalCommands}
${styleText('الصفحة')} ⊰◉ ${styleNum(pageNumber)} من ${styleNum(totalPages)}
ــــــــــــــــــــــــ
بوت هياتو
`;

      api.sendMessage(messageText, threadID, messageID);
    } catch (err) {
      log.error(err);
      api.sendMessage('خطأ في ملف help.js', config.editor, null, true);
    }
  }
};
