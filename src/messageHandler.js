const utils = require('./utils');
const { usageMessage, sourceMessage } = require('./messages.json');

function checkRoles(roleMap, rolesToCheck, memberRolesMap, adding) {
  let toDo = {},
    toError = [];

  for (let roleName of rolesToCheck) {
    const memberRole = memberRolesMap[roleName],
      role = roleMap[roleName];
    if (memberRole && adding) {
      toError.push(memberRole.name);
    } else if (memberRole && !adding) {
      toDo[memberRole.name] = memberRole;
    } else if (role && adding) {
      toDo[role.name] = role;
    } else if (role && !adding) {
      toError.push(role.name);
    } else {
      toError.push(roleName);
    }
  }

  return { toDo, toError };
}

async function roleHandling(member, adding, toDo, toError) {
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

async function sendMessage(location, message) {
  return await location.send(message);
}

async function messageDelegate(msg, roleMap, highestPermissions) {
  const [command, ...rest] = msg.content.toLowerCase().split(' ');

  if (command === '/usage') {
    sendMessage(msg.author, usageMessage);
    return [msg];
  } if (command === '/src') {
    sendMessage(msg.author, sourceMessage);
    return [msg];
  } if (command === '/roles') {
    sendMessage(msg.author, Object.keys(roleMap).join(', '));
    return [msg];
  }
  let toDelete = [];
  const { channel, member } = msg;
  const [matched, remove] = command.match(/\/(remove)?role$/) || [];
  if (matched) {
    const { toDo, toError } = checkRoles(
      roleMap,
      rest,
      utils.makeRoleNameToRole(member.roles, highestPermissions),
      !remove 
    );
    const { botMsg, errorMsg } = await roleHandling(
      member,
      !remove,
      toDo,
      toError
    );
    toDelete.push(msg);
    toDelete.push(sendMessage(channel, botMsg));
    if (errorMsg) {
      toDelete.push(sendMessage(channel, errorMsg));
    }
  }
  return toDelete;
}

async function handleMessage(msg, roleMap, highestPermissions) {
  let toDelete = await messageDelegate(msg, roleMap, highestPermissions);
  for (let message of toDelete) {
    (await message).delete(5000);
  }
}

module.exports = {
  handleMessage
};
