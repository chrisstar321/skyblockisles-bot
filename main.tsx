const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, "GUILD_MESSAGES"] });
const { token, boards, skills } = require('./config.json');
const axios = require('axios');

const commandPrefix = '>';
const boardLimit = 25;

const getBoard = async (board) => {
    if(!boards.find(b => b === board || b === `skills-${board}`)) {
        throw '';
    } else {
        const boardName = (board.startsWith('skills-') || board.startsWith('economy-')) ? board : `skills-${board}`;
        return axios.get(`https://api.skyblockisles.com/leaderboards/${boardName}.1`);
    }
}

const getPlayer = async (player) => {
    return axios.get(`https://api.skyblockisles.com/player/${player}.skills`);
}

const handleMessage = async (message) => {
    const content = message.content;

    if (!content.startsWith(commandPrefix)) return;

    if (content.startsWith(`${commandPrefix}board `)) {
        const boardName = content.split(' ')[1];
        getBoard(boardName)
            .then(result => {
                let i = 0;
                const reply = result.data.contents.reduce((prev, curr) => {
                    // curr: {
                    //     name: 'Inting4MiningXp',
                    //     id: 3094,
                    //     level: 69,
                    //     xp: 6226880.5,
                    //     rank: 1
                    // }
                    if (i >= boardLimit) return prev;
                    i++;
                    if (boardName !== 'economy-coins') {
                        return prev + `\n#${curr.rank}: ${curr.name}, lvl ${curr.level} (${curr.xp})`;
                    } else {
                        return prev + `\n#${curr.rank}: ${curr.name}, ${curr.value} coins`;
                    }
                }, '');
                message.reply('```' + reply + '```');
            })
            .catch(() => {});
    }
    else if (content.startsWith(`${commandPrefix}skills `)) {
        const playerName = content.split(' ')[1];
        getPlayer(playerName)
            .then(response => {
                const reply = skills.reduce((prev, curr) => {
                    const skillData = response.data[curr];
                    return prev + `\n${curr}: level ${skillData.level} (${skillData.xp} xp)`;
                }, '');
                message.reply('```' + reply + '```');
            })
            .catch(() => {});

    }
}

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async message => {
    try {
        await handleMessage(message);
    } catch {
        // Do nothing
    }
});

client.login(token);