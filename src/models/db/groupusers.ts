import { ModelAttributes, Optional, WhereOptions } from 'sequelize/types';
import { TableNames } from '../defines/tablenames';
import { INTERNAL_ID, INTERNAL_ID_REFERENCE } from '../defines/definitions';
import { ModelBase } from './modelbase';

export const GroupUsersDef: ModelAttributes = {
  id: INTERNAL_ID(),
  groupId: INTERNAL_ID_REFERENCE(TableNames.Group),
  userId: INTERNAL_ID_REFERENCE(TableNames.User),
};

export interface GroupUsersAttributes {
  id: number;
  groupId: number;
  userId: number;
}

export type GroupUsersCreationAttributes = Optional<GroupUsersAttributes, 'id'>;

export class GroupUsersModel
  extends ModelBase<GroupUsersAttributes, GroupUsersCreationAttributes>
  implements GroupUsersAttributes {
  id!: number;

  groupId!: number;

  userId!: number;

  public static async findEntry(filter: WhereOptions<GroupUsersAttributes>): Promise<GroupUsersModel | null> {
    return <GroupUsersModel>await this.findEntryBase(filter);
  }

  public static async findEntries(filter: WhereOptions<GroupUsersAttributes>): Promise<GroupUsersModel[]> {
    return (await this.findEntriesBase(filter)).map(item => <GroupUsersModel>item);
  }
}
