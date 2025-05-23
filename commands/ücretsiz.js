const fs = require('fs');
const path = require('path');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config.json');

const cooldowns = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ücretsiz')
    .setDescription('Ücretsiz bir hesap verir.')
    .addStringOption(opt =>
      opt.setName('service')
         .setDescription('Hizmet adı (ör: valorant, test)')
         .setRequired(true)
    ),

  async execute(interaction) {
    const userId = interaction.user.id;
    const service = interaction.options.getString('service').toLowerCase();

    if (!config.guildIds.includes(interaction.guildId)) {
      return interaction.reply({ content: '❌ Bu sunucuda komut kullanılamaz.', ephemeral: true });
    }

    const allowed = config.allowedChannels["ücretsiz"];
    if (!allowed.includes(interaction.channelId)) {
      return interaction.reply({ content: '❌ Bu kanalda bu komut kullanılamaz.', ephemeral: true });
    }

    const cooldownSeconds = config.cooldowns["ücretsiz"];
    const lastUsed = cooldowns.get(userId);

    if (lastUsed && (Date.now() - lastUsed) < cooldownSeconds * 1000) {
      const remaining = Math.ceil((cooldownSeconds * 1000 - (Date.now() - lastUsed)) / 1000);
      return interaction.reply({ content: `⏳ Bu komutu tekrar kullanmak için ${remaining} saniye beklemelisin.`, ephemeral: true });
    }

    const dosya = path.join(__dirname, `../ücretsiz/${service}.txt`);
    const kullanildi = path.join(__dirname, '../kullanıldı.txt');

    if (!fs.existsSync(dosya)) {
      return interaction.reply({ content: `❌ \`${service}\` hizmeti bulunamadı.`, ephemeral: true });
    }

    const satirlar = fs.readFileSync(dosya, 'utf8').split('\n').filter(Boolean);
    if (satirlar.length === 0) {
      return interaction.reply({ content: '❌ Şu anda hesap kalmadı.', ephemeral: true });
    }

    const account = satirlar.shift().trim();
    fs.writeFileSync(dosya, satirlar.join('\n'));
    fs.appendFileSync(kullanildi, account + '\n');

    cooldowns.set(userId, Date.now());

    try {
      await interaction.user.send({
        embeds: [
          new EmbedBuilder()
            .setTitle('Ücretsiz Hesabınız')
            .addFields(
              { name: 'Service', value: service, inline: true },
              { name: 'Account', value: account, inline: true }
            )
            .setFooter({
              text: `${interaction.user.tag} • ${new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`,
              iconURL: interaction.user.displayAvatarURL()
            })
            .setColor(0x00ff00)
        ]
      });
    } catch (err) {
      return interaction.reply({ content: '❌ DM gönderilemedi. Lütfen DM’lerini aç.', ephemeral: true });
    }

    const kanalEmbed = new EmbedBuilder()
      .setAuthor({ name: 'KalorantShop', iconURL: interaction.client.user.displayAvatarURL() })
      .setDescription(`📦 **Kalan Stok:** ${kalanStok}\n\n✅ **Hesap Başarıyla DM’den İletildi!**`)
      .setColor(0x00ff00)
      .setFooter({
        text: `${interaction.user.tag} • ${new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`,
        iconURL: interaction.user.displayAvatarURL()
      });

    await interaction.reply({ embeds: [kanalEmbed] });
  }
};
