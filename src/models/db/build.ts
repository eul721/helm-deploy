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
import { AtLeastOne, INTERNAL_ID, INTERNAL_ID_REFERENCE } from '../../utils/database';
import { Locale, LocalizedHashmap } from '../../utils/language';
import { PublicBuildDescription } from '../http/public/publicbuilddescription';
import { PublisherBuildDescription } from '../http/rbac/publisherbuilddescription';
import { BranchCreationAttributes, BranchModel } from './branch';
import { GameModel } from './game';
import { Fields, LocalizedFieldModel } from './localizedfield';
import { LocalizableModel } from './mixins/localizablemodel';

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
};

export interface BuildAttributes {
  id: number;
  ownerId: number;
  bdsBuildId: number;
  mandatory: boolean;
  readonly branches?: BranchModel[];
  readonly owner?: GameModel;
}

export type BuildCreationAttributes = Optional<BuildAttributes, 'id' | 'mandatory' | 'ownerId'>;

export type BuildUniqueIdentifier = AtLeastOne<Pick<BuildAttributes, 'id' | 'bdsBuildId'>>;

export class BuildModel extends LocalizableModel<BuildAttributes, BuildCreationAttributes> implements BuildAttributes {
  public id!: number;

  public bdsBuildId!: number;

  public mandatory!: boolean;

  public ownerId!: number;

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

  public get notes(): LocalizedHashmap {
    return this.reduceFields(Fields.patchnotes);
  }

  public getNotesLoaded(locale: Locale) {
    const [nameObj] =
      this.fields?.filter(locField => locField.field === Fields.patchnotes && locField.locale === locale) ?? [];
    return nameObj?.value;
  }

  // #endregion

  public static associations: {
    fields: Association<BuildModel, LocalizedFieldModel>;
    owner: Association<BuildModel, GameModel>;
    branches: Association<GameModel, BranchModel>;
  };

  public toPublicHttpModel(): PublicBuildDescription {
    return {
      patchNotes: this.notes,
      mandatory: this.mandatory,
    };
  }

  public toPublisherHttpModel(): PublisherBuildDescription {
    return {
      id: this.id,
      patchNotes: this.notes,
      ownerId: this.ownerId,
      bdsBuildId: this.bdsBuildId,
      mandatory: this.mandatory,
    };
  }
}
