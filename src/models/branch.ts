import { Model } from 'sequelize';

import { getDBInstance } from './database';
import { Branch as BranchDef } from './definitions';

export class Branch extends Model {}

Branch.init(BranchDef, { sequelize: getDBInstance(), tableName: 'branches' });
