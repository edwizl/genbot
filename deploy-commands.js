const { REST, Routes } = require('discord.js');
const { clientId, token } = require('./config.json');
const fs = require('fs');

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data);
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log('Komutlar yükleniyor...');
    await rest.put(Routes.applicationCommands(clientId), { body: commands });
    console.log('Başarıyla yüklendi.');
  } catch (error) {
    console.error(error);
  }
})();
