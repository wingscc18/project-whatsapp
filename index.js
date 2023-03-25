const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const { join } = require('path');
const { readdirSync } = require('fs');
const { pathffmpeg, pathchrome, prefix } = require('./config.json')
const commands = []
console.log('INYECTANDO COMANDOS..')

const client = new Client({
    puppeteer: {
        executablePath: pathchrome,
    },
    authStrategy: new LocalAuth({
        clientId: "client-one",
        dataPath: join(__dirname + "./.wwebjs_auth/")
    }),
    ffmpegPath: pathffmpeg
})

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {

    const files = readdirSync(`./commands`).filter(file => file.endsWith('.js'));
    if (!files || files.length <= 0) console.log("comandos - 0");
    files.forEach(file => {
        let command = require(`./commands/${file}`);
        commands.push(command)
    });
    console.log('EXITO, SE HA INYECTADO LOS COMANDOS AL +' + client.info.me.user)
});

client.on('message_create', async message => {

    if (!(message.body.length > 0)) return

    if (message.body.toLowerCase().startsWith(prefix)) {

        const args = message.body.slice(prefix.length).trim().split(/ +/g);
        const cmd = args.shift().toLowerCase();
        if (cmd.length == 0) return;

        const command = commands.find(command => command.name === cmd)

        if (!command) return

        command.run(client, message, args)
    }
})

client.initialize();
