import { Model, WhereOptions } from 'sequelize';
import { warn } from '../../logger';

export class ModelBase<TModelAttributes, TCreationAttributes = TModelAttributes> extends Model<
  TModelAttributes,
  TCreationAttributes
> {
  public static async updateEntry(item: Model): Promise<typeof item> {
    try {
      await item.save();
      return item;
    } catch (sqlErr) {
      warn('Encountered error updating db entry, error=%s', sqlErr);
      throw new Error('DB error');
    }
  }

  protected static async findEntryBase<TModelAttributesAlias>(
    filter: WhereOptions<TModelAttributesAlias>
  ): Promise<Model | null> {
    try {
      return await this.findOne({ where: filter });
    } catch (sqlErr) {
      warn('Encountered error finding branch record, error=%s', sqlErr);
      throw new Error('DB error');
    }
  }

  protected static async findEntriesBase<TModelAttributesAlias>(
    filter: WhereOptions<TModelAttributesAlias>
  ): Promise<Model[]> {
    try {
      return await this.findAll({ where: filter });
    } catch (sqlErr) {
      warn('Encountered error finding branch record, error=%s', sqlErr);
      throw new Error('DB error');
    }
  }
}
