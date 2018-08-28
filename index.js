/*
 * SGDC Bot
 * Albert Tang - 8/28/2018
 */

const fs = require('fs-extra');
const start = new Date(); // credit to Adam Gincel, using to ignore old messages
const discord = require('discord.js');
const { token, permissions } = require('./discordToken.json');

function makeRoleNameToRole(roles) {
  let ret = {};
  for (let snowflake in roles) {
    for (let role in roles[snowflake]) {
      ret[role.name] = role;
    }
  }
  return ret;
}

function checkRoles(rolesMap, rolesToCheck) {
  let rolesToAdd = [],
    rolesAdded = [];

  for (let role of rolesToCheck) {
    const toPush = rolesMap[role];

    if (toPush && toPush.position > 3) {
      rolesToAdd.push(toPush);
      rolesAdded.push(role);
    }
  }

  return { rolesToAdd, rolesAdded };
}

async function handleMessage(msg) {
  const { content } = msg;

  if (content.slice(0, 6) === '/usage') {
    return 'msg';
  }

  if (content.slice(0, 5) === '/role') {
    const { rolesToAdd, rolesAdded } = checkRoles(
      makeRoleNameToRole(msg.guild.roles),
      content.slice(6).split(' ')
    );

    await msg.member.addRoles(rolesToAdd);
    console.log(`${msg.author.username} was added to ${rolesAdded}`);
  }
}

async function main() {
  let discordBot = new discord.Client();

  console.log('Logging in');
  await discordBot.login(token.toString('utf8'));
  console.log('Logged in');

  discordBot.on('message', async msg => {
    if (!msg.system) {
      const botMsg = await handleMessage(msg);
      if (botMsg) {
        await discordBot.user.send(botMsg);
      }
    }
  });
}

main().catch(err => {
  console.error(err);
});
