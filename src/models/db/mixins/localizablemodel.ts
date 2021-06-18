import {
  HasManyCreateAssociationMixin,
  HasManyGetAssociationsMixin,
  HasManyRemoveAssociationMixin,
  Model,
} from 'sequelize';
import { Locale, LocalizedHashmap } from '../../../utils/language';
import { Fields, LocalizedFieldModel } from '../localizedfield';

/**
 * Helper class to enable code de-duplication among Models that use LocalizedField
 * associations.
 *
 * Usage: Instead of extending Model, extend LocalizableModel. This grants the child access to
 * various *fields* functionality to avoid duplication.
 *
 * Child classes can then implement their own getters/setters that call into these protected
 * methods. For example:
 *     public function setName(value: string) {
 *       this.upsertLocalizedField('name', value, Locale.en);
 *     }
 */
export class LocalizableModel<T1, T2> extends Model<T1, T2> {
  protected createField!: HasManyCreateAssociationMixin<LocalizedFieldModel>;

  protected getFields!: HasManyGetAssociationsMixin<LocalizedFieldModel>;

  protected removeFields!: HasManyRemoveAssociationMixin<LocalizedFieldModel, number>;

  protected readonly fields?: LocalizedFieldModel[];

  /**
   * Returns a hashmap of locale:value for the given field. This requires the model be memoized and
   * fully loaded to function.
   *
   * @param field Field to select
   * @returns Hashmap of locale:value
   */
  protected reduceFields(field: Fields): LocalizedHashmap {
    return (
      this.fields?.reduce<LocalizedHashmap>((acc, fieldData) => {
        if (field === fieldData.field) {
          acc[fieldData.locale] = fieldData.value;
        }
        return acc;
      }, {}) ?? {}
    );
  }

  protected async getLocalizedFields(field: Fields): Promise<LocalizedHashmap> {
    const fields = await this.getLocalizedFieldModels(field);
    return Object.keys(fields).reduce<Record<string, string>>((acc, locale) => {
      acc[locale] = fields[locale].value;
      return acc;
    }, {});
  }

  protected async getLocalizedFieldModels(field: Fields): Promise<Record<string, LocalizedFieldModel>> {
    return (
      await this.getFields({
        where: {
          field,
        },
      })
    ).reduce<Record<string, LocalizedFieldModel>>((acc, lfModel) => {
      if (lfModel && lfModel !== null) {
        acc[lfModel.locale] = lfModel;
      }
      return acc;
    }, {});
  }

  protected async getLocalizedField(field: Fields, locale: Locale): Promise<string | undefined> {
    return (await this.getLocalizedFieldModel(field, locale))?.value;
  }

  protected async getLocalizedFieldModel(field: Fields, locale: Locale): Promise<LocalizedFieldModel | undefined> {
    const values = await this.getFields({
      where: {
        field,
        locale,
      },
    });
    if (!values.length) {
      return undefined;
    }
    if (values.length > 1) {
      // TODO: Handle bad state somehow
    }
    return values[0];
  }

  /**
   * Helper to upsert generic LocalizedField models
   */
  protected async upsertLocalizedField(field: Fields, value: string, locale: Locale) {
    const existing = await this.getFields({
      where: {
        field,
        locale,
      },
    });
    if (existing.length) {
      return existing[0].update({
        value,
      });
    }
    return this.createField({
      field,
      locale,
      value,
    });
  }

  protected async removeLocalizedField(field: Fields, locale: Locale) {
    return this.removeFields(await this.getLocalizedFieldModel(field, locale));
  }
}
