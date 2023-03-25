const ffmpeg = require('fluent-ffmpeg')
const { pathffmpeg } = require('../config.json')
ffmpeg.setFfmpegPath( pathffmpeg)
const fs = require('fs')
const { MessageMedia } = require('whatsapp-web.js');

module.exports = {
    name: 'a',
    alias: ['a'],
    run: async (client, message, args) => {

        if (!(message.hasMedia || message.hasQuotedMsg))
            return message.reply(`Hey, necesitas enviar el video! `);

        const quotedMessage = await message.getQuotedMessage();
        const mediaData = await message.hasQuotedMsg ?
            await quotedMessage.downloadMedia() : await message.downloadMedia()

        if (!mediaData)
            return message.reply(`Error al obtener los datos del archivo, por favor reenvíe el archivo y use el comando *!s*`);

        if (!(mediaData.mimetype === 'video/mp4'))
            return message.reply(`Error solamente se puede usar en videos mp4`);

        const filename_mp4 = Date.now() + '.mp4'
        const filename_mp3 = filename_mp4.replace('mp4', 'mp3')
        message.reply(`Procesando tu video, espera!`);

        await fs.writeFileSync(filename_mp4, mediaData.data, "base64");

        ffmpeg(filename_mp4)
            .output(filename_mp3)
            .format('mp3')
            .on('end', async () => {
                await fs.unlinkSync(filename_mp4)
                const media = await MessageMedia.fromFilePath(filename_mp3);
                await message.reply(media);
                await fs.unlinkSync(filename_mp3);
            })
            .on('error', (err) => {
                console.log(`Error: ${err.message}`);
            })
            .run();
    }
};