import {
  Association,
  DataTypes,
  HasManyCreateAssociationMixin,
  HasManyGetAssociationsMixin,
  HasManyRemoveAssociationMixin,
  Model,
  ModelAttributes,
  Optional,
} from 'sequelize';
import { INTERNAL_ID } from '../../utils/database';
import { GameCreationAttributes, GameModel } from './game';
import { UserCreationAttributes, UserModel } from './user';
import { RoleCreationAttributes, RoleModel } from './role';
import { GroupCreationAttributes, GroupModel } from './group';

export const DivisionDef: ModelAttributes = {
  id: INTERNAL_ID(),
  name: {
    allowNull: false,
    type: DataTypes.STRING(128),
    unique: true,
  },
};

export interface DivisionAttributes {
  id: number;
  name: string;
  readonly games?: GameModel[];
  readonly users?: UserModel[];
  readonly groups?: GroupModel[];
  readonly roles?: RoleModel[];
}

export type DivisionCreationAttributes = Optional<DivisionAttributes, 'id'>;

export class DivisionModel extends Model<DivisionAttributes, DivisionCreationAttributes> implements DivisionAttributes {
  id!: number;

  name!: string;

  // #region association: games
  public readonly games?: GameModel[];

  public createGame!: HasManyCreateAssociationMixin<GameModel>;

  public removeGame!: HasManyRemoveAssociationMixin<GameModel, number>;

  public getGames!: HasManyGetAssociationsMixin<GameModel>;

  public createGameEntry(attributes: GameCreationAttributes): Promise<GameModel> {
    return this.createGame(attributes);
  }
  // #endregion

  // #region association: users
  public readonly users?: UserModel[];

  public createUser!: HasManyCreateAssociationMixin<UserModel>;

  public removeUser!: HasManyRemoveAssociationMixin<UserModel, number>;

  public getUsers!: HasManyGetAssociationsMixin<UserModel>;

  public createUserEntry(attributes: UserCreationAttributes): Promise<UserModel> {
    return this.createUser(attributes);
  }
  // #endregion

  // #region association: groups
  public readonly groups?: GroupModel[];

  public createGroup!: HasManyCreateAssociationMixin<GroupModel>;

  public removeGroup!: HasManyRemoveAssociationMixin<GroupModel, number>;

  public getGroups!: HasManyGetAssociationsMixin<GroupModel>;

  public createGroupEntry(attributes: GroupCreationAttributes): Promise<GroupModel> {
    return this.createGroup(attributes);
  }
  // #endregion

  // #region association: roles
  public readonly roles?: RoleModel[];

  public createRole!: HasManyCreateAssociationMixin<RoleModel>;

  public removeRole!: HasManyRemoveAssociationMixin<RoleModel, number>;

  public getRoles!: HasManyGetAssociationsMixin<RoleModel>;

  public createRoleEntry(attributes: RoleCreationAttributes): Promise<RoleModel> {
    return this.createRole(attributes);
  }
  // #endregion

  public static associations: {
    games: Association<DivisionModel, GameModel>;
    users: Association<DivisionModel, UserModel>;
    groups: Association<DivisionModel, GroupModel>;
    roles: Association<DivisionModel, RoleModel>;
  };
}
