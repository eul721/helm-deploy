/**
 * To avoid table names conflicting with potential real application table names,
 * manually specify each tablename
 */
export enum TableNames {
  Agreement = 'agreements',
  Branch = 'branches',
  Build = 'builds',
  Division = 'divisions',
  Game = 'games',
  LocalizedFields = 'localized_fields',

  User = 'rbac_users',
  Permission = 'rbac_permissions',

  Role = 'rbac_roles',
  RolePermissions = 'rbac_role_permissions',
  RoleGames = 'rbac_role_games',

  Group = 'rbac_groups',
  GroupRole = 'rbac_group_roles',
  GroupUsers = 'rbac_group_users',
}
