const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits, REST, Routes } = require('discord.js');
const config = require('./config.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
  commands.push(command.data.toJSON());
}

client.once('ready', async () => {
  console.log(`✅ Giriş yapıldı: ${client.user.tag}`);

  const rest = new REST({ version: '10' }).setToken(config.token);
  for (const guildId of config.guildIds) {
    try {
      await rest.put(Routes.applicationGuildCommands(config.clientId, guildId), { body: commands });
      console.log(`✅ Komutlar yüklendi (Sunucu: ${guildId})`);
    } catch (err) {
      console.error(err);
    }
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction, client);
  } catch (err) {
    console.error(err);
    await interaction.reply({ content: '❌ Komut çalıştırılırken bir hata oluştu.', ephemeral: true });
  }
});

client.login(config.token);
