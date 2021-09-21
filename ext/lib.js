const fetch = require('node-fetch');
const color = require('colors');
Array.prototype.random = function () {
    return this[Math.floor((Math.random()*this.length))];
}
var messagetimeout = setTimeout(function(){}, 1);
var totaltimout = 60*1000;
const uwuifier = require('uwuify');
const uwuify = new uwuifier();
function sleep(ms){
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}
async function handleEvent(event){
    switch(event.event[0]){
        case "gotMessage":
            clearTimeout(messagetimeout);
            messagetimeout = setTimeout(function(){
                handleTimeout(event.id, event.server, event.clientid);
            }, totaltimout);
            var command = event.event[1].split(" ")[0].toLowerCase();
            var args = event.event[1].split(" ");
            args.shift();
            console.log(`Received message "${event.event[1]}"`.magenta);
            switch(command){
                case "!help":
                    await sendMessage(event.id, event.server, event.clientid, `Commands:
!help -> Shows this message
!usercount -> Get the exact amount of people on Omegle
!uwuify -> Uwuify some text, i.e. !uwuify hi im omeglebot
!disconnect -> Make me disconnect

Wanna talk to the person that made me? DM her on Discord at rose lol#6903!
You can also check out my code at https://github.com/RoseChilds/OmegleBot`);
                    break;
                case "!usercount":
                    var status = await getStatus();
                    await sendMessage(event.id, event.server, event.clientid, `There are currently ${status.count.toLocaleString()} users on Omegle!`);
                    break;
                case "!disconnect":
                    await sendMessage(event.id, event.server, event.clientid, `Bye!`);
                    await disconnect(event.id, event.server, event.clientid);
                    break;
                case "!uwuify":
                    if(args.length==0){
                        return await sendMessage(event.id, event.server, event.clientid, `When running !uwuify you have to give me some text to uwuify, i.e. !uwuify hello i am omeglebot`);
                    }
                    var uwu = uwuify.uwuify(args.join(" "));
                    console.log(`Uwuified text: "${uwu}"`.magenta);
                    await sendMessage(event.id, event.server, event.clientid, `Your uwuified text: ${uwu}`);
                    break;
                case "hi":
                case "hiya":
                case "hello":
                case "hey":
                case "m":
                case "f":
                case "what":
                    await sendMessage(event.id, event.server, event.clientid, `Hi, I'm OmegleBot! To see what commands I have, send !help`);
                    break;
                case "help":
                    await sendMessage(event.id, event.server, event.clientid, `Commands need to begin with ! to work, i.e. !help`);
                    break;
                default:
                    await sendMessage(event.id, event.server, event.clientid, `I don't know what "${event.event[1]}" means :(\nTo get a list of my commands, send !help`);
            }
            break;
        case "typing":
            console.log(`User started typing`.magenta);
            break;
        case "stoppedTyping":
            console.log(`User stopped typing`.magenta);
            break;
        case "connected":
            clearTimeout(messagetimeout);
            messagetimeout = setTimeout(function(){
                handleTimeout(event.id, event.server, event.clientid);
            }, totaltimout);
            console.log("User connected".green);
            await handleJoin(event.id, event.server, event.clientid);
            break;
        case "waiting":
            console.log("Waiting for user..".yellow);
            break;
        default:
            break;
    }
}

async function handleTimeout(id, server, clientid){
    console.log(`Idle timeout hit`.red.bold);
    await sendMessage(id, server, clientid, "Oops, you were idle for 60 seconds! I'll be going now, bye!");
    await disconnect(id, server, clientid);
}

function sendMessage(id, server, clientid, message){
    return fetch(`${server}/send`, {
        "headers": {
            "accept": "text/javascript, text/html, application/xml, text/xml, */*",
            "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "sec-ch-ua": "\"Google Chrome\";v=\"93\", \" Not;A Brand\";v=\"99\", \"Chromium\";v=\"93\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site"
        },
        "referrer": "https://www.omegle.com/",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": `msg=${encodeURIComponent(message)}&id=${encodeURIComponent(clientid)}`,
        "method": "POST",
        "mode": "cors"
    });
}

async function getStatus(){
    var status = await fetch("https://omegle.com/status");
    status = await status.json();
    return status;
}

async function eventLoop(id, server){
    var status = await getStatus();
    console.log(`${status.count.toLocaleString()} people on Omegle`.magenta);
    while(true){
        console.log(`Joining room..`.yellow);
        await joinRoom(id, server);
        var wait = Math.floor(10000*Math.random());
        console.log(`Sleeping for ${wait/1000}s..`.yellow);
        await sleep(wait);
    }
}

function disconnect(id, server, clientID){
    return fetch(`${server}/disconnect`, {
        "headers": {
            "accept": "application/json",
            "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "sec-ch-ua": "\"Google Chrome\";v=\"93\", \" Not;A Brand\";v=\"99\", \"Chromium\";v=\"93\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site"
        },
        "referrer": "https://www.omegle.com/",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": `id=${encodeURIComponent(clientID)}`,
        "method": "POST",
        "mode": "cors"
    });
}

async function handleJoin(id, server, clientid){
    await sendMessage(id, server, clientid, `Hey there! I'm OmegleBot!
You can send me commands and I'll respond to them!
If you don't send a message for 60 seconds I'll leave by myself.

To get a list of my commands, send !help`);
    console.log(`Sent welcome message`.green);
}

async function joinRoom(id, server){
    clearTimeout(messagetimeout);
    var data = await fetch(`${server}/start?caps=recaptcha2,t&firstevents=1&spid=&randid=${id}&lang=en`, {
        "headers": {
            "accept": "application/json",
            "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "sec-ch-ua": "\"Google Chrome\";v=\"93\", \" Not;A Brand\";v=\"99\", \"Chromium\";v=\"93\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site"
        },
        "referrer": "https://www.omegle.com/",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": "",
        "method": "POST",
        "mode": "cors"
    });
    data = await data.json();
    console.log(`Connected to room as ${data.clientID}`.green);
    for(const event of data.events){
        handleEvent({
            event: event,
            server: server,
            clientid: data.clientID,
            id: id
        });
    }
    while(true){
        try{
            var events = await fetch(`${server}/events`, {
                "headers": {
                    "accept": "application/json",
                    "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
                    "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                    "sec-ch-ua": "\"Google Chrome\";v=\"93\", \" Not;A Brand\";v=\"99\", \"Chromium\";v=\"93\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"Windows\"",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-site"
                },
                "referrer": "https://www.omegle.com/",
                "referrerPolicy": "strict-origin-when-cross-origin",
                "body": `id=${encodeURIComponent(data.clientID)}`,
                "method": "POST",
                "mode": "cors"
            });
        }catch(e){
            console.log(`Bot disconnected`.red.bold);
            return;
        }

        events = await events.json();

        if(!events){
            console.log(`Bot disconnected`.red.bold);
            return;
        }

        for(const event of events){
            if(event[0]!="strangerDisconnected"){
                handleEvent({
                    event: event,
                    server: server,
                    clientid: data.clientID,
                    id: id
                });
            }else{
                console.log(`Stranger disconnected`.red.bold);
                clearTimeout(messagetimeout);
                return;
            }
        }

    }
}

module.exports = {
    eventLoop,
    handleEvent,
    joinRoom,
    getStatus
}