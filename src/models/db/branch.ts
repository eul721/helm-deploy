import {
  Association,
  BelongsToGetAssociationMixin,
  BelongsToManyAddAssociationMixin,
  BelongsToManyGetAssociationsMixin,
  BelongsToManyRemoveAssociationMixin,
  DataTypes,
  Model,
  ModelAttributes,
  Optional,
} from 'sequelize';
import { INTERNAL_ID } from '../defines/definitions';
import { BuildModel } from './build';
import { GameModel } from './game';

export const BranchDef: ModelAttributes = {
  id: INTERNAL_ID(),
  contentfulId: {
    allowNull: false,
    type: DataTypes.STRING(256),
    unique: true,
  },
  bdsBranchId: {
    allowNull: false,
    type: DataTypes.BIGINT,
    unique: true,
  },
};

export interface BranchAttributes {
  id: number;
  contentfulId: string;
  bdsBranchId: number;
}

export type BranchCreationAttributes = Optional<BranchAttributes, 'id'>;

export class BranchModel extends Model<BranchAttributes, BranchCreationAttributes> implements BranchAttributes {
  public id!: number;

  public contentfulId!: string;

  public bdsBranchId!: number;

  // #region association: builds
  public readonly builds?: BuildModel[];

  public removeBuild!: BelongsToManyRemoveAssociationMixin<BuildModel, number>;

  public getBuilds!: BelongsToManyGetAssociationsMixin<BuildModel>;

  public addBuild!: BelongsToManyAddAssociationMixin<BuildModel, number>;
  // #endregion

  // #region association: owner
  public readonly owner?: GameModel;

  public getOwner!: BelongsToGetAssociationMixin<GameModel>;
  // #endregion

  public static associations: {
    builds: Association<BranchModel, BuildModel>;
    owner: Association<BranchModel, GameModel>;
  };
}
