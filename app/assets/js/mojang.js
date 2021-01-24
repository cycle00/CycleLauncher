/*
 * Mojong API wrapper
 *
 * @module mojang
*/

// Requirements
const request = require('request');
const logger = require('./logger')('%c[Mojang]', 'color: #c94a47; font-weight: bold');

// Constants
const minecraftAgent = {
    name: 'Minecraft',
    version: 1
}

const authpath = 'https://authserver.mojang.com'
const statuses = [
    {
        service: 'sessionserver.mojang.com',
        status: 'grey',
        name: 'Multiplayer Session Service',
        essential: true
    },
    {
        service: 'authserver.mojang.com',
        status: 'grey',
        name: 'Authentication Service',
        essential: true
    },
    {
        service: 'textures.mojang.com',
        status: 'grey',
        name: 'Minecraft Skins',
        essential: false
    },
    {
        service: 'api.mojang.com',
        status: 'grey',
        name: 'Public API',
        essential: false
    },
    {
        service: 'minecraft.net',
        status: 'grey',
        name: 'Minecraft.net',
        essential: false
    },
    {
        service: 'accounts.mojang.com',
        status: 'grey',
        name: 'Minecraft Accounts Website',
        essential: false
    }
]

// Functions
exports.statusToHex = function(status) {
    switch(status.toLowerCase()) {
        case 'green':
            return '#55ffa2';
        case 'yellow':
            return '#fff35d';
        case 'red':
            return '#ff5d5d';
        case 'grey':
        default:
            return '#999999';
    }
}

exports.status = function() {
    return new Promise((resolve, reject) => {
        
    });
}