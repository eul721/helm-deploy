import { Model } from 'sequelize';

import { getDBInstance } from './database';
import { Game as GameDef } from './definitions';

export class Game extends Model {}

Game.init(GameDef, { sequelize: getDBInstance(), tableName: 'games' });
