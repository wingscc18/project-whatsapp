const { MessageMedia } = require('whatsapp-web.js');
const { createCanvas, Image } = require('canvas');
const fs = require('fs');

module.exports = {
    name: 'text',
    alias: ['text'],
    run: async (client, message, args) => {

        if (!(message.hasMedia || message.hasQuotedMsg))
            return message.reply(`Hey, necesitas enviar la imagen! `);

        const quotedMessage = await message.getQuotedMessage();
        const mediaData = await message.hasQuotedMsg ?
            await quotedMessage.downloadMedia() : await message.downloadMedia()

        if (!mediaData)
            return message.reply(`Error al obtener los datos del archivo, por favor reenvíe el archivo y use el comando *$text*`);

        if (!(mediaData.mimetype === 'image/jpeg'))
            return message.reply(`Error solamente se puede usar en imagenes`);

        if (!(args.length > 0)) return message.reply(`Que quieres que agregue?`);

        const filename_img = Date.now() + '.png'
        message.reply(`Procesando tu imagen, espera!`);

        await fs.writeFileSync(filename_img, mediaData.data, "base64");

        const canvas = createCanvas(800, 600);
        const ctx = canvas.getContext('2d');

        const image = new Image();
        image.onload = function () {

            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, 800, 150);

            const aspectRatio = image.width / image.height;

            let width = Math.min(image.width, 800);
            let height = Math.min(image.height, 450);
            
            if (width / height < aspectRatio) {
                height = width / aspectRatio;
            } else {
                width = height * aspectRatio;
            }

            const x = (800 - width) / 2;
            const y = 150 + (450 - height) / 2;
            ctx.drawImage(image, x, y, width, height);


            ctx.fillStyle = '#000000';
            ctx.font = '40px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(args.join(' '), 400, 90);

            const new_file_img = Date.now() + '.png'
            const out = fs.createWriteStream(new_file_img);
            const stream = canvas.createJPEGStream({ quality: 0.75 });
            stream.pipe(out);
            out.on('finish', async () => {
                fs.unlinkSync(filename_img)

                const send_img = await MessageMedia.fromFilePath(`./${new_file_img}`);
                const chat = await message.getChat();

                await chat.sendMessage(send_img);

                fs.unlinkSync(new_file_img)

            });
        }
        image.src = filename_img;

    }
};