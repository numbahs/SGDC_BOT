/*
 * SGDC Bot
 * Albert Tang - 8/28/2018
 */

const fs = require('fs-extra');
const start = new Date(); // credit to Adam Gincel, using to ignore old messages
const discord = require('discord.js');
const { token, permissions } = require('./discordToken.json');
const { messageHandler, utils } = require('./src');

let roleMap = {};

async function main() {
  let discordBot = new discord.Client();

  console.log('Logging in');
  await discordBot.login(token.toString('utf8'));
  console.log(`Logged in as ${discordBot.user.username}`);
  roleMap = utils.makeRoleNameToRole(discordBot.guilds.array()[0].roles);

  discordBot.on('message', async msg => {
    if (!msg.system && !msg.author.bot) {
      await messageHandler.handleMessage(msg, roleMap);
    }
  });

  discordBot.on('roleCreate', role => {
    roleMap[role.name.toLowerCase()] = role;
    console.log(`${role.name} was created`);
  });

  discordBot.on('roleDelete', role => {
    delete roleMap[role.name.toLowerCase()];
    console.log(`${role.name} was deleted`);
  });

  discordBot.on('roleUpdate', (oldRole, newRole) => {
    delete roleMap[oldRole.name.toLowerCase()];
    roleMap[newRole.name.toLowerCase()] = newRole;
    console.log(`${oldRole.name} has been updated to ${newRole.name}`);
  });
}

main().catch(err => {
  console.error(err);
});
