import {
  Association,
  BelongsToGetAssociationMixin,
  DataTypes,
  HasManyCreateAssociationMixin,
  HasManyGetAssociationsMixin,
  HasManyRemoveAssociationMixin,
  ModelAttributes,
  Optional,
} from 'sequelize';
import { INTERNAL_ID } from '../defines/definitions';
import { BranchCreationAttributes, BranchModel } from './branch';
import { GameModel } from './game';
import { Fields, LocalizedFieldModel } from './localizedfield';
import { LocalizableModel } from './mixins/localizablemodel';

export const BuildDef: ModelAttributes = {
  id: INTERNAL_ID(),
  bdsBuildId: {
    allowNull: false,
    type: DataTypes.BIGINT,
    unique: true,
  },
  mandatory: {
    allowNull: true,
    type: DataTypes.BOOLEAN,
  },
};

export interface BuildAttributes {
  id: number;
  bdsBuildId: number;
  mandatory: boolean;
  readonly branches?: BranchModel[];
  readonly owner?: GameModel;
}

export type BuildCreationAttributes = Optional<BuildAttributes, 'id' | 'mandatory'>;

export class BuildModel extends LocalizableModel<BuildAttributes, BuildCreationAttributes> implements BuildAttributes {
  public id!: number;

  public bdsBuildId!: number;

  public mandatory!: boolean;

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

  // #region association: localized fields

  public get notes(): Record<string, string> {
    return this.reduceFields(Fields.patchnotes);
  }

  // #endregion

  public static associations: {
    fields: Association<BuildModel, LocalizedFieldModel>;
    owner: Association<BuildModel, GameModel>;
    branches: Association<GameModel, BranchModel>;
  };
}
