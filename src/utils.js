function makeRoleNameToRole(roles, highestPermission) {
  let ret = {};
  for (let role of roles.array()) {
    if (0 < role.position && role.position < highestPermission) {
      ret[role.name.toLowerCase()] = role;
    }
  }
  return ret;
}

module.exports = {
  makeRoleNameToRole
};
