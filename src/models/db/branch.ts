import {
  Association,
  BelongsToGetAssociationMixin,
  BelongsToManyAddAssociationMixin,
  BelongsToManyAddAssociationsMixin,
  BelongsToManyCreateAssociationMixin,
  BelongsToManyGetAssociationsMixin,
  BelongsToManyRemoveAssociationMixin,
  DataTypes,
  ModelAttributes,
  Optional,
} from 'sequelize';
import { INTERNAL_ID } from '../defines/definitions';
import { BuildModel } from './build';
import { GameModel } from './game';
import { Fields, Locale, LocalizedFieldModel } from './localizedfield';
import { LocalizableModel } from './mixins/localizablemodel';

export const BranchDef: ModelAttributes = {
  id: INTERNAL_ID(),
  bdsBranchId: {
    allowNull: false,
    type: DataTypes.BIGINT,
    unique: true,
  },
  password: {
    allowNull: true,
    type: DataTypes.STRING(64),
  },
  visibility: {
    allowNull: true,
    type: DataTypes.STRING(16),
    defaultValue: 'private',
  },
};

export type Visibility = 'public' | 'private';

export interface BranchAttributes {
  id: number;
  bdsBranchId: number;
  password: string;
  /**
   * Visibility of this Branch - public or private
   */
  visibility: Visibility;
  readonly builds?: BuildModel[];
  readonly owner?: GameModel;
}

export type BranchCreationAttributes = Optional<BranchAttributes, 'id' | 'visibility' | 'password'>;

export class BranchModel
  extends LocalizableModel<BranchAttributes, BranchCreationAttributes>
  implements BranchAttributes {
  public id!: number;

  public bdsBranchId!: number;

  public password!: string;

  public visibility!: Visibility;

  public get isPublic() {
    return this.visibility === 'public';
  }

  // #region association: builds
  public readonly builds?: BuildModel[];

  public createBuild!: BelongsToManyCreateAssociationMixin<BuildModel>;

  public removeBuild!: BelongsToManyRemoveAssociationMixin<BuildModel, number>;

  public getBuilds!: BelongsToManyGetAssociationsMixin<BuildModel>;

  public addBuild!: BelongsToManyAddAssociationMixin<BuildModel, number>;

  public addBuilds!: BelongsToManyAddAssociationsMixin<BuildModel, number>;
  // #endregion

  // #region association: localizedfields

  public get names(): Record<string, string> {
    return this.reduceFields(Fields.name);
  }

  /**
   * Name of this item given the locale.
   *
   * This will only be accessible if the model has been eagarly loaded. It will not exist if the
   * fields are lazily loaded.
   */
  public getNameLoaded(locale: Locale) {
    const [nameObj] =
      this.fields?.filter(locField => locField.field === Fields.name && locField.locale === locale) ?? [];
    return nameObj?.value;
  }

  public getName(locale: Locale): Promise<string | undefined> {
    return this.getLocalizedField(Fields.name, locale);
  }

  public addName(value: string, locale: Locale) {
    return this.upsertLocalizedField(Fields.name, value, locale);
  }

  public getNames() {
    return this.getLocalizedFields(Fields.name);
  }

  public removeName(locale: Locale) {
    return this.removeLocalizedField(Fields.name, locale);
  }

  // #endregion

  // #region association: owner
  public readonly owner?: GameModel;

  public getOwner!: BelongsToGetAssociationMixin<GameModel>;
  // #endregion

  public static associations: {
    builds: Association<BranchModel, BuildModel>;
    fields: Association<BranchModel, LocalizedFieldModel>;
    owner: Association<BranchModel, GameModel>;
  };
}
