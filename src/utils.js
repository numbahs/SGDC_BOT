function makeRoleNameToRole(roles) {
  let ret = {};
  for (let role of roles.array()) {
    if (role.position < 5) {
      ret[role.name.toLowerCase()] = role;
    }
  }
  return ret;
}

module.exports = {
  makeRoleNameToRole
};
