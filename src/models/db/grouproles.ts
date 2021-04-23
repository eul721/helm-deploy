import { ModelAttributes, Optional, WhereOptions } from 'sequelize/types';
import { TableNames } from '../defines/tablenames';
import { INTERNAL_ID, INTERNAL_ID_REFERENCE } from '../defines/definitions';
import { ModelBase } from './modelbase';

export const GroupRolesDef: ModelAttributes = {
  id: INTERNAL_ID(),
  groupId: INTERNAL_ID_REFERENCE(TableNames.Group),
  roleId: INTERNAL_ID_REFERENCE(TableNames.Role),
};

export interface GroupRolesAttributes {
  id: number;
  groupId: number;
  roleId: number;
}

export type GroupRolesCreationAttributes = Optional<GroupRolesAttributes, 'id'>;

export class GroupRolesModel
  extends ModelBase<GroupRolesAttributes, GroupRolesCreationAttributes>
  implements GroupRolesAttributes {
  id!: number;

  groupId!: number;

  roleId!: number;

  public static async findEntry(filter: WhereOptions<GroupRolesAttributes>): Promise<GroupRolesModel | null> {
    return <GroupRolesModel>await this.findEntryBase(filter);
  }

  public static async findEntries(filter: WhereOptions<GroupRolesAttributes>): Promise<GroupRolesModel[]> {
    return (await this.findEntriesBase(filter)).map(item => <GroupRolesModel>item);
  }
}
