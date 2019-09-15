/*
 * SGDC Bot
 * Albert Tang - 8/28/2018
 */

const discord = require('discord.js');
const { token, permissions } = process.env || require('./discordToken.json');
const { messageHandler, utils } = require('./src');

let roleMap = {};

async function main() {
  let discordBot = new discord.Client();

  console.log('Logging in');
  await discordBot.login(token.toString('utf8'));
  console.log(`Logged in as ${discordBot.user.username}`);
  const sgdcGuild = discordBot.guilds.array()[0];
  let myPermissions = sgdcGuild.me.highestRole.position;
  roleMap = utils.makeRoleNameToRole(sgdcGuild.roles, myPermissions);

  discordBot.on('message', async (msg) => {
    if (!msg.system && !msg.author.bot) {
      await messageHandler.handleMessage(msg, roleMap, myPermissions);
    }
  });

  discordBot.on('roleCreate', (role) => {
    myPermissions = sgdcGuild.me.highestRole.position;
    if(role.position < myPermissions) {
      roleMap[role.name.toLowerCase()] = role;
      console.log(`${role.name} was created`);
    }
  });

  discordBot.on('roleDelete', (role) => {
    myPermissions = sgdcGuild.me.highestRole.position;
    toDelete = role.name.toLowerCase();
    if(roleMap[toDelete]) {
      delete roleMap[toDelete];
      console.log(`${role.name} was deleted`);
    }
  });

  discordBot.on('roleUpdate', (oldRole, newRole) => {
    myPermissions = sgdcGuild.me.highestRole.position;
    toUpdate = oldRole.name.toLowerCase();
    if(roleMap[toUpdate]) {
      delete roleMap[toUpdate];
      if(newRole.position < myPermissions) {
        roleMap[newRole.name.toLowerCase()] = newRole;
        console.log(`${oldRole.name} has been updated to ${newRole.name}`);
      }
    }
  });

  discordBot.on('error', (err) => {
    console.error(err);
  });
}

main().catch(err => {
  console.error(err);
});
