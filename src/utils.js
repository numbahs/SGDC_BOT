function makeRoleNameToRole(roles) {
  let ret = {};
  for (let role of roles.array()) {
    if (1 <= role.position && role.position <= 3 ) {
      ret[role.name.toLowerCase()] = role;
    }
  }
  return ret;
}

module.exports = {
  makeRoleNameToRole
};
