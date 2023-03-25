const fs = require('fs')
const { MessageMedia } = require('whatsapp-web.js');

module.exports = {
    name: 's',
    alias: ['s'],
    run: async (client, message, args) => {

        if (!(message.hasMedia || message.hasQuotedMsg))
            return message.reply(`Hey, necesitas enviar una imagen, video o gif para convertir en sticker!\n` +
                `Por favor, envíe el archivo y use el comando *!s*`);

        const quotedMessage = await message.getQuotedMessage();
        const mediaData = await message.hasQuotedMsg ?
            await quotedMessage.downloadMedia() : await message.downloadMedia()

        if (!mediaData)
            return message.reply(`Error al obtener los datos del archivo, por favor reenvíe el archivo y use el comando *!s*`);

        let get_info = await message.getContact();
        const filename = Date.now() + (mediaData.mimetype === 'video/mp4' ? '.mp4' : '.png');
        await fs.writeFileSync(filename, mediaData.data, "base64");

        const sticker = await MessageMedia.fromFilePath(`./${filename}`);
        const chat = await message.getChat();

        await chat.sendMessage(sticker, {
            sendMediaAsSticker: true,
            stickerAuthor: "Generado por " + get_info.pushname,
            loop: 0,
        });

        await message.reply(`Sticker enviado!`);
        await fs.unlinkSync(filename);

    }
};