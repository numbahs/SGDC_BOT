/*
 * SGDC Bot
 * Albert Tang - 8/28/2018
 */

const fs = require('fs-extra');
const start = new Date(); // credit to Adam Gincel, using to ignore old messages
const discord = require('discord.js');
const { token, permissions } = require('./discordToken.json');
const usageMessage =
  '\
/role <SpaceSeparatedValue> adds the SpaceSeparatedValue as roles to the user\n\
/removeRole <SpaceSeparatedValue> removes the SpaceSeparatedValue of roles from the user\
';

function makeRoleNameToRole(roles) {
  let ret = {};
  for (let [, role] of roles) {
    if (role.position < 5) {
      ret[role.name.toLowerCase()] = role;
    }
  }
  return ret;
}

function checkRoles(rolesMap, rolesToCheck, memberRolesMap, adding) {
  let toDo = {},
    toError = [];

  for (let roleName of rolesToCheck) {
    const memberRole = memberRolesMap[roleName],
      role = rolesMap[roleName];
    if (memberRole && adding) {
      toError.push(memberRole.name);
    } else if (memberRole && !adding) {
      toDo[memberRole.name] = memberRole;
    } else if (role && adding) {
      toDo[role.name] = role;
    } else {
      toError.push(roleName);
    }
  }

  return { toDo, toError };
}

async function roleHandling(roles, content, member, adding) {
  const { toDo, toError } = checkRoles(
    makeRoleNameToRole(roles),
    content,
    makeRoleNameToRole(member.roles),
    adding
  );
  const rolesToDoNames = Object.keys(toDo),
    rolesToDoValues = Object.values(toDo);
  let botMsg, errorMsg;
  if (rolesToDoNames.length) {
    if (adding) {
      await member.addRoles(rolesToDoValues);
    } else {
      await member.removeRoles(rolesToDoValues);
    }
    botMsg = `${member.displayName} was ${
      adding ? 'added to' : 'removed from'
    } ${rolesToDoNames.join(', ')}`;
  } else {
    botMsg = `Nothing was done for ${member.displayName}`;
  }
  const errorLength = toError.length;
  if (errorLength) {
    const moreThanOne = errorLength > 1;
    errorMsg = `${toError.join(', ')} ${
      moreThanOne ? 'do' : 'does'
    } not exist or ${
      adding
        ? `you are already in ${moreThanOne ? 'them' : 'it'}`
        : `you are not in ${moreThanOne ? 'them' : 'it'}`
    }`;
  }
  return { botMsg, errorMsg };
}

async function sendMessage(location, message, del) {
  const sentMessage = await location.send(message);
  if (del) sentMessage.delete(5000);
}

async function handleMessage(msg) {
  const [command, ...rest] = msg.content.toLowerCase().split(' ');

  if (command === '/usage') {
    await sendMessage(msg.author, usageMessage, false);
    return;
  }
  const roles = msg.guild.roles,
    { channel, member } = msg;
  const [matched, , remove] = command.match(/(\/(remove)*role)*$/);
  if (matched) {
    const { botMsg, errorMsg } = await roleHandling(
      roles,
      rest,
      member,
      !remove
    );
    await sendMessage(channel, botMsg, true);
    if (errorMsg) {
      await sendMessage(channel, errorMsg, true);
    }
    msg.delete(5000);
  }
}

async function main() {
  let discordBot = new discord.Client();

  console.log('Logging in');
  await discordBot.login(token.toString('utf8'));
  console.log(`Logged in as ${discordBot.user.username}`);

  discordBot.on('message', async msg => {
    if (!msg.system && !msg.author.bot) {
      await handleMessage(msg);
    }
  });
}

main().catch(err => {
  console.error(err);
});
