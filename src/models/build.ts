import { Model } from 'sequelize';

import { getDBInstance } from './database';
import { Build as BuildDef } from './definitions';

export class Build extends Model {}

Build.init(BuildDef, { sequelize: getDBInstance(), tableName: 'builds' });
