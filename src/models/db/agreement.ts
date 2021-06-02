import { Association, BelongsToGetAssociationMixin, DataTypes, ModelAttributes, Optional } from 'sequelize';
import { INTERNAL_ID } from '../defines/definitions';
import { AgreementDescription } from '../http/rbac/agreementdescription';
import { GameModel } from './game';
import { Fields, Locale, LocalizedFieldModel } from './localizedfield';
import { LocalizableModel } from './mixins/localizablemodel';

export const AgreementDef: ModelAttributes = {
  id: INTERNAL_ID(),
  url: {
    allowNull: false,
    unique: false,
    type: DataTypes.TEXT(),
  },
};

export interface AgreementAttributes {
  id: number;
  url: string;
  ownerId: number;
  games?: GameModel[];
}

export type AgreementCreationAttributes = Optional<AgreementAttributes, 'id' | 'ownerId'>;

export class AgreementModel
  extends LocalizableModel<ModelAttributes, AgreementCreationAttributes>
  implements AgreementAttributes {
  public id!: number;

  public url!: string;

  ownerId!: number;

  games?: GameModel[];

  // #region association: owner
  public readonly owner?: GameModel;

  public getOwner!: BelongsToGetAssociationMixin<GameModel>;
  // #endregion

  // #region association: localizedfields

  public get names(): Record<string, string> {
    return (
      this.fields?.reduce<Record<string, string>>((acc, fieldData) => {
        if (Fields.name === fieldData.field) {
          acc[fieldData.locale] = fieldData.value;
        }
        return acc;
      }, {}) ?? {}
    );
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
  public static associations: {
    fields: Association<AgreementModel, LocalizedFieldModel>;
    owner: Association<AgreementModel, GameModel>;
  };

  public toHttpModel(): AgreementDescription {
    return {
      id: this.id,
      url: this.url,
      names: this.names,
    };
  }
}
