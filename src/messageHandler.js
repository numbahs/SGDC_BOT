const utils = require('./utils');

const usageMessage =
  '\
/role <SpaceSeparatedValue> adds the SpaceSeparatedValue as roles to the user\n\
/removeRole <SpaceSeparatedValue> removes the SpaceSeparatedValue of roles from the user\
';

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

async function roleHandling(roleMap, content, member, adding) {
  const { toDo, toError } = checkRoles(
    roleMap,
    content,
    utils.makeRoleNameToRole(member.roles),
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

async function sendMessage(location, message) {
  return await location.send(message);
}

async function messageDelegate(msg, roleMap) {
  const [command, ...rest] = msg.content.toLowerCase().split(' ');

  if (command === '/usage') {
    sendMessage(msg.author, usageMessage);
    return [msg];
  }
  let toDelete = [];
  const { channel, member } = msg;
  const [matched, , remove] = command.match(/(\/(remove)*role)*$/);
  if (matched) {
    const { botMsg, errorMsg } = await roleHandling(
      roleMap,
      rest,
      member,
      !remove
    );
    toDelete.push(msg);
    toDelete.push(sendMessage(channel, botMsg));
    if (errorMsg) {
      toDelete.push(sendMessage(channel, errorMsg));
    }
  }
  return toDelete;
}

async function handleMessage(msg, roleMap) {
  let toDelete = await messageDelegate(msg, roleMap);
  for (let message of toDelete) {
    (await message).delete(5000);
  }
}

module.exports = {
  handleMessage
};
