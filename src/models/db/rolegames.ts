import { ModelAttributes, Optional, WhereOptions } from 'sequelize/types';
import { TableNames } from '../defines/tablenames';
import { INTERNAL_ID_REFERENCE, INTERNAL_ID } from '../defines/definitions';
import { ModelBase } from './modelbase';

export const RoleGamesDef: ModelAttributes = {
  id: INTERNAL_ID(),
  roleId: INTERNAL_ID_REFERENCE(TableNames.Role),
  gameId: INTERNAL_ID_REFERENCE(TableNames.Game),
};

export interface RoleGamesAttributes {
  id: number;
  roleId: number;
  gameId: number;
}

export type RoleGamesCreationAttributes = Optional<RoleGamesAttributes, 'id'>;

export class RoleGamesModel
  extends ModelBase<RoleGamesAttributes, RoleGamesCreationAttributes>
  implements RoleGamesAttributes {
  id!: number;

  roleId!: number;

  gameId!: number;

  public static async findEntry(filter: WhereOptions<RoleGamesAttributes>): Promise<RoleGamesModel | null> {
    return <RoleGamesModel>await this.findEntryBase(filter);
  }

  public static async findEntries(filter: WhereOptions<RoleGamesAttributes>): Promise<RoleGamesModel[]> {
    return (await this.findEntriesBase(filter)).map(item => <RoleGamesModel>item);
  }
}
