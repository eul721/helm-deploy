import {
  Association,
  BelongsToGetAssociationMixin,
  BelongsToManyGetAssociationsMixin,
  DataTypes,
  HasManyCreateAssociationMixin,
  HasManyGetAssociationsMixin,
  HasManyRemoveAssociationMixin,
  Model,
  ModelAttributes,
  Optional,
} from 'sequelize';
import { INTERNAL_ID, INTERNAL_ID_REFERENCE } from '../defines/definitions';
import { BuildCreationAttributes, BuildModel } from './build';
import { BranchCreationAttributes, BranchModel } from './branch';
import { DivisionModel } from './division';
import { RoleModel } from './role';

export const GameDef: ModelAttributes = {
  id: INTERNAL_ID(),
  contentfulId: {
    allowNull: false,
    type: DataTypes.STRING(256),
    unique: true,
  },
  bdsTitleId: {
    allowNull: false,
    type: DataTypes.BIGINT,
    unique: true,
  },
  ownerId: INTERNAL_ID_REFERENCE(),
};

export interface GameAttributes {
  id: number;
  contentfulId: string;
  bdsTitleId: number;
  ownerId: number;
  readonly builds?: BuildModel[];
  readonly branches?: BranchModel[];
  readonly owner?: DivisionModel;
  readonly rolesWithGame?: RoleModel[];
}

export type GameCreationAttributes = Optional<GameAttributes, 'id' | 'ownerId'>;

export class GameModel extends Model<GameAttributes, GameCreationAttributes> implements GameAttributes {
  public id!: number;

  public contentfulId!: string;

  public bdsTitleId!: number;

  ownerId!: number;

  // #region association: builds
  public readonly builds?: BuildModel[];

  public createBuild!: HasManyCreateAssociationMixin<BuildModel>;

  public removeBuild!: HasManyRemoveAssociationMixin<BuildModel, number>;

  public getBuilds!: HasManyGetAssociationsMixin<BuildModel>;

  public createBuildEntry(attributes: BuildCreationAttributes): Promise<BuildModel> {
    return this.createBuild(attributes);
  }
  // #endregion

  // #region association: branches
  public readonly branches?: BranchModel[];

  public createBranch!: HasManyCreateAssociationMixin<BranchModel>;

  public removeBranch!: HasManyRemoveAssociationMixin<BranchModel, number>;

  public getBranches!: HasManyGetAssociationsMixin<BranchModel>;

  public createBranchEntry(attributes: BranchCreationAttributes): Promise<BranchModel> {
    return this.createBranch(attributes);
  }
  // #endregion

  // #region association: roles
  public readonly rolesWithGame?: RoleModel[];

  public createRolesWithGame!: HasManyCreateAssociationMixin<RoleModel>;

  public removeRolesWithGame!: HasManyRemoveAssociationMixin<RoleModel, number>;

  public getRolesWithGame!: BelongsToManyGetAssociationsMixin<RoleModel>;
  // #endregion

  // #region association: owner
  public readonly owner?: DivisionModel;

  public getOwner!: BelongsToGetAssociationMixin<DivisionModel>;
  // #endregion

  public static associations: {
    builds: Association<GameModel, BuildModel>;
    branches: Association<GameModel, BranchModel>;
    rolesWithGame: Association<GameModel, RoleModel>;
    owner: Association<GameModel, DivisionModel>;
  };
}
