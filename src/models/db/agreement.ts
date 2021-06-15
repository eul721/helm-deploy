import { Association, BelongsToGetAssociationMixin, ModelAttributes, Optional } from 'sequelize';
import { INTERNAL_ID } from '../defines/definitions';
import { AgreementDescription } from '../http/resources/agreementdescription';
import { GameModel } from './game';
import { Fields, Locale, LocalizedFieldModel } from './localizedfield';
import { LocalizableModel } from './mixins/localizablemodel';

export const AgreementDef: ModelAttributes = {
  id: INTERNAL_ID(),
};

export interface AgreementAttributes {
  id: number;
  ownerId: number;
  games?: GameModel[];
}

export type AgreementCreationAttributes = Optional<AgreementAttributes, 'id' | 'ownerId'>;

export class AgreementModel
  extends LocalizableModel<AgreementAttributes, AgreementCreationAttributes>
  implements AgreementAttributes {
  public id!: number;

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

  public get urls(): Record<string, string> {
    return (
      this.fields?.reduce<Record<string, string>>((acc, fieldData) => {
        if (Fields.url === fieldData.field) {
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

  public getUrlLoaded(locale: Locale) {
    const [urlObj] = this.fields?.filter(locField => locField.field === Fields.url && locField.locale === locale) ?? [];
    return urlObj?.value;
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

  public getUrl(locale: Locale): Promise<string | undefined> {
    return this.getLocalizedField(Fields.url, locale);
  }

  public addUrl(value: string, locale: Locale) {
    return this.upsertLocalizedField(Fields.url, value, locale);
  }

  public getUrls() {
    return this.getLocalizedFields(Fields.url);
  }

  public removeUrl(locale: Locale) {
    return this.removeLocalizedField(Fields.url, locale);
  }

  // #endregion
  public static associations: {
    fields: Association<AgreementModel, LocalizedFieldModel>;
    owner: Association<AgreementModel, GameModel>;
  };

  public toHttpModel(): AgreementDescription {
    return {
      id: this.id,
      names: this.names,
      urls: this.urls,
    };
  }
}
