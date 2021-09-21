const fs = require('fs');
const fetch = require('node-fetch');
const color = require('colors');
const lib = require('./ext/lib.js');

console.log(`© Rose Childs 2021 - ${new Date().getFullYear()}`.rainbow);
console.log(`     >> OmegleBot <<`.rainbow);
console.log(``);
console.log(`Starting..`.yellow);
console.log(`Getting ID..`.yellow);

// Code taken from omegle.com/static/omegle.js
var randID = function(){
    for(var a="23456789ABCDEFGHJKLMNPQRSTUVWXYZ",b="",c=0;8>c;c++){
        var d=Math.floor(Math.random()*a.length);b+=a.charAt(d)
    }return b
}();

console.log(`ID is ${randID}`.green);
async function main(){
    console.log(`Getting server..`.yellow);
    var status = await lib.getStatus();
    var server = `https://${status.servers.random()}.omegle.com`;
    console.log(`Using ${server}`.green);
    console.log(`Starting event loop..`.yellow);
    lib.eventLoop(randID, server);
    console.log(`Event loop started`.green);
}

main();