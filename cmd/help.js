const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "اوامر",
  version: "1.1.4",
  hasPermssion: 0,
  credits: "انجالاتي",
  description: "قائمة الاوامر",
  commandCategory: "الاوامر",
  usages: "[صفحة]",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID } = event;
  const commands = [...global.client.commands.values()];

  const commandsPerPage = 6;
  const page = parseInt(args[0]) || 1;
  const totalPages = Math.ceil(commands.length / commandsPerPage);

  if (page < 1 || page > totalPages) {
    return api.sendMessage(
      `الصفحة غير موجودة (1 - ${totalPages})`,
      threadID,
      messageID
    );
  }

  const start = (page - 1) * commandsPerPage;
  const pageCommands = commands.slice(start, start + commandsPerPage);

  let message = `
قائمة الاوامر
────────

`;

  pageCommands.forEach(cmd => {
    message += `${cmd.config.name}\n`;
  });

  message += `
────────
${page}/${totalPages}
عدد الاوامر: ${commands.length}

هياتو بوت
`;

  const imagePath = path.join(
    process.cwd(),
    "attached_assets",
    "received_1354469396415619_1765356692054.jpeg"
  );

  try {
    if (fs.existsSync(imagePath)) {
      return api.sendMessage(
        { body: message, attachment: fs.createReadStream(imagePath) },
        threadID,
        messageID
      );
    }
    return api.sendMessage(message, threadID, messageID);
  } catch {
    return api.sendMessage(message, threadID, messageID);
  }
};
