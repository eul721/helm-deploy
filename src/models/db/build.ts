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
import { AtLeastOne, INTERNAL_ID, INTERNAL_ID_REFERENCE } from '../../utils/database';
import { PublicBuildDescription } from '../http/public/publicbuilddescription';
import { PublisherBuildDescription } from '../http/rbac/publisherbuilddescription';
import { BranchCreationAttributes, BranchModel } from './branch';
import { GameModel } from './game';

export const BuildDef: ModelAttributes = {
  id: INTERNAL_ID(),
  ownerId: INTERNAL_ID_REFERENCE(),
  bdsBuildId: {
    allowNull: false,
    type: DataTypes.BIGINT,
    unique: true,
  },
  mandatory: {
    allowNull: true,
    type: DataTypes.BOOLEAN,
  },
  patchNotesId: {
    allowNull: true,
    type: DataTypes.STRING(64),
  },
};

export interface BuildAttributes {
  id: number;
  ownerId: number;
  bdsBuildId: number;
  mandatory: boolean;
  patchNotesId: string;
  readonly branches?: BranchModel[];
  readonly owner?: GameModel;
}

export type BuildCreationAttributes = Optional<BuildAttributes, 'id' | 'mandatory' | 'ownerId' | 'patchNotesId'>;

export type BuildUniqueIdentifier = AtLeastOne<Pick<BuildAttributes, 'id' | 'bdsBuildId'>>;

export class BuildModel extends Model<BuildAttributes, BuildCreationAttributes> implements BuildAttributes {
  public id!: number;

  public bdsBuildId!: number;

  public mandatory!: boolean;

  public ownerId!: number;

  public patchNotesId!: string;

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

  public toPublicHttpModel(): PublicBuildDescription {
    return {
      patchNotesId: this.patchNotesId,
      mandatory: this.mandatory,
    };
  }

  public toPublisherHttpModel(): PublisherBuildDescription {
    return {
      id: this.id,
      patchNotesId: this.patchNotesId,
      ownerId: this.ownerId,
      bdsBuildId: this.bdsBuildId,
      mandatory: this.mandatory,
    };
  }
}
