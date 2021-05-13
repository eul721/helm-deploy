import {
  Association,
  BelongsToGetAssociationMixin,
  DataTypes,
  HasManyCreateAssociationMixin,
  HasManyGetAssociationsMixin,
  HasManyRemoveAssociationMixin,
  Model,
  ModelAttributes,
  Optional,
} from 'sequelize';
import { INTERNAL_ID } from '../defines/definitions';
import { BranchCreationAttributes, BranchModel } from './branch';
import { GameModel } from './game';

export const BuildDef: ModelAttributes = {
  id: INTERNAL_ID(),
  contentfulId: {
    allowNull: false,
    type: DataTypes.STRING(256),
    unique: true,
  },
  bdsBuildId: {
    allowNull: false,
    type: DataTypes.BIGINT,
    unique: true,
  },
};

export interface BuildAttributes {
  id: number;
  contentfulId: string;
  bdsBuildId: number;
  readonly branches?: BranchModel[];
  readonly owner?: GameModel;
}

export type BuildCreationAttributes = Optional<BuildAttributes, 'id'>;

export class BuildModel extends Model<BuildAttributes, BuildCreationAttributes> implements BuildAttributes {
  public id!: number;

  public contentfulId!: string;

  public bdsBuildId!: number;

  // #region association: branches
  public readonly branches?: BranchModel[];

  public createBranch!: HasManyCreateAssociationMixin<BranchModel>;

  public removeBranch!: HasManyRemoveAssociationMixin<BranchModel, number>;

  public getBranches!: HasManyGetAssociationsMixin<BranchModel>;

  public createBranchEntry(attributes: BranchCreationAttributes): Promise<BranchModel> {
    return this.createBranch(attributes);
  }
  // #endregion

  // #region association: owner
  public readonly owner?: GameModel;

  public getOwner!: BelongsToGetAssociationMixin<GameModel>;
  // #endregion

  public static associations: {
    owner: Association<BuildModel, GameModel>;
    branches: Association<GameModel, BranchModel>;
  };
}
