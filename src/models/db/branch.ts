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
import { AtLeastOne, INTERNAL_ID, INTERNAL_ID_REFERENCE } from '../../utils/database';
import { Locale, LocalizedHashmap } from '../../utils/language';
import { BranchDescription } from '../http/resources/branchdescription';
import { PublicBranchDescription } from '../http/branchdescription';
import { BranchDescription } from '../http/rbac/branchdescription';
import { BuildModel } from './build';
import { GameModel } from './game';
import { Fields, LocalizedFieldModel } from './localizedfield';
import { LocalizableModel } from './mixins/localizablemodel';

export const BranchDef: ModelAttributes = {
  id: INTERNAL_ID(),
  ownerId: INTERNAL_ID_REFERENCE(),
  bdsBranchId: {
    allowNull: false,
    type: DataTypes.BIGINT,
    unique: true,
  },
  password: {
    allowNull: true,
    type: DataTypes.STRING(64),
  },
};

export interface BranchAttributes {
  id: number;
  ownerId: number;
  bdsBranchId: number;
  password: string;
  readonly builds?: BuildModel[];
  readonly owner?: GameModel;
}

export type BranchCreationAttributes = Optional<BranchAttributes, 'id' | 'password' | 'ownerId'>;

export type BranchUniqueIdentifier = AtLeastOne<Pick<BranchAttributes, 'id' | 'bdsBranchId'>>;

export class BranchModel
  extends LocalizableModel<BranchAttributes, BranchCreationAttributes>
  implements BranchAttributes {
  public id!: number;

  public bdsBranchId!: number;

  public password!: string;

  public ownerId!: number;

  // #region association: builds
  public readonly builds?: BuildModel[];

  public createBuild!: BelongsToManyCreateAssociationMixin<BuildModel>;

  public removeBuild!: BelongsToManyRemoveAssociationMixin<BuildModel, number>;

  public getBuilds!: BelongsToManyGetAssociationsMixin<BuildModel>;

  public addBuild!: BelongsToManyAddAssociationMixin<BuildModel, number>;

  public addBuilds!: BelongsToManyAddAssociationsMixin<BuildModel, number>;
  // #endregion

  // #region association: localizedfields

  public get names(): LocalizedHashmap {
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

  public toPublicHttpModel(): PublicBranchDescription {
    return {
      bdsBranchId: this.bdsBranchId,
      id: this.id,
      names: this.names,
      ownerId: this.ownerId,
      passwordProtected: this.password !== null,
    };
  }

  public toPublisherHttpModel(): BranchDescription {
    return {
      bdsBranchId: this.bdsBranchId,
      id: this.id,
      names: this.names,
      ownerId: this.ownerId,
      password: this.password,
    };
  }
}
