/**
 * To avoid table names conflicting with potential real application table names,
 * manually specify each tablename
 */
export enum TableNames {
  Build = 'builds',

  Branch = 'branches',
  BranchBuilds = 'branch_builds',

  Game = 'games',
  GameBranches = 'game_branches',

  Division = 'divisions',

  User = 'rbac_users',
  Permission = 'rbac_permissions',

  Role = 'rbac_roles',
  RolePermissions = 'rbac_role_permissions',
  RoleGames = 'rbac_role_games',

  Group = 'rbac_groups',
  GroupRole = 'rbac_group_roles',
  GroupUsers = 'rbac_group_users',
}
