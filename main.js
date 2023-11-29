const mineflayer = require("mineflayer")
const { Block } = require("prismarine-block")
const { brotliCompress, gunzip } = require("zlib")
const Viewer = require("prismarine-viewer").mineflayer
const inventory = require('mineflayer-web-inventory')
// const pathfinder = require('mineflayer-pathfinder').pathfinder;
const { GoalNear } = require('mineflayer-pathfinder').goals;
const { pathfinder, Movements } = require('mineflayer-pathfinder');
const { start } = require("repl")

var text = 'ні'
const NameBot = "Bot"

const bot = mineflayer.createBot({
    host: "localhost",
    port: '55848',
    version: "1.19.2", 
    username: "Bot",
    mods: [
        "C:\\Users\\Viktor\\AppData\\Roaming\\.minecraft\\mods\\DivineRPG-1.9.6.9-1.19.2.jar",
    ]
});
bot.loadPlugin(pathfinder);

bot.on("spawn", function () {
    bot.chat('Привіт мір');
});

bot.on("chat", function HI(username, message) {
    if (username === "Bot") return;

    if (message == "Ти бот" && username) {
        setTimeout(() => bot.chat(username + " " + text), 5000);
    } else {
        if (message !== "Ти бот") return;
        setTimeout(() => bot.chat(username + " " + "Я тебе не знаю"), 5000);
    }
});

bot.on("chat", function (username, message) {
    if (message == "до мене") {
        bot.chat(`/tp ${NameBot} ${username}`);
    }
    else if(message == "до тебе"){
        bot.chat(`/tp ${username} ${NameBot}`)
    }
    else if(message == "зроби ночь"){
        bot.chat("/time set night")
    }
    else if(message == "зроби день"){
        bot.chat("/time set day")
    }
    else if(message == `тп до себе ${username}`){
        bot.chat(`/tp ${username} ${NameBot}`)
    }
    else if(message == `викл дождь`){
        bot.chat(`/weather clear`)
    }
    else if(message == "вкл дождь"){
        bot.chat('/weather rain')
    } 
    else if(message == " вкл грозу"){
        bot.chat('/weather thunder')
    }
    else if(message == `постав собі спавн`){
        bot.chat(`/spawnpoint`)
    }
    else if(message == `постав мені спавн`){
        bot.chat(`/spawnpoint ${username}`)
    }
    else if(message == "режим бога вкл"){
        bot.chat('/gamemode creative')
    }
    else if(message == 'режим бога викл'){
        bot.chat('/gamemode survival')
    }

})

bot.on("spawn", function () {
    Viewer(bot, {
        port: 3007,
        firstPerson: true,
        viewDistance: "11"
    });
});

bot.on("chat", function (username, message) {
    if (username === bot.username) return;
    switch (message) {
        case 'Спать':
            gotToSleep();
            break;
        case 'Вставай':
            wakeUp();
            break;
    }
});

bot.on('sleep', () =>{
    bot.chat('На добранічь')

});

bot.on('wake', () =>{
    bot.chat("Добрий ранок")
});

async function gotToSleep(){
    const bed = bot.findBlock({
        matching: block => bot.isABed(block)
})
    if (bed){
        try{    
            await bot.sleep(bed)
            bot.chat("Я сплю")
        }catch(err){
            bot.chat(`Я не можу спати із-за ${err.message}`)
        }
    }
        else{
        bot.chat("Рядом немає кроваті")
    }
}

async function wakeUp(){
    try{
        await bot.wake()
    }catch(err){
        bot.chat(`Я не можу встать із-за ${err.message}`)
    }
}

let milking = false
bot.on('chat', (username, message) => {
    if (message.toLowerCase() === 'молоко') {
        if (!milking) {
            milking = true;
            startMilking();
        }
    } else if (message.toLowerCase() === 'стоп') {
        milking = false;
    }
});

async function startMilking() {
    while (milking) {
        let nearbyCows = getNearbyCows();

        if (nearbyCows.length > 0) {
            let cow = nearbyCows[Math.floor(Math.random() * nearbyCows.length)];

            if (bot.entity.position.distanceTo(cow.position) > 2) {
                const goal = new GoalNear(cow.position.x, cow.position.y, cow.position.z, 1);
                bot.pathfinder.setGoal(goal);

                await new Promise(resolve => {
                    bot.once('goal_reached', resolve);
                });
            }

            await bot.lookAt(cow.position, false);

            let emptyBucket = bot.inventory.items().filter(item => item.name == 'bucket')[0];

            if (emptyBucket) {
                bot.chat(`/use ${emptyBucket.slot}`);
                await sleep(2000);
                bot.chat(`/use ${emptyBucket.slot}`);
            } else {
                console.log("В мене немає порожніх відер.");
                milking = false;
            }
        } else {
            console.log("Поруч немає корів. Зачекайте, поки корів з'явиться.");
            milking = false;
        }
        await sleep(2000);
    }
}

function getNearbyCows() {
    return Object.values(bot.entities).filter(e => e.name == "cow" && e.position.distanceTo(bot.entity.position) < 20 && !e.metadata[16]);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}