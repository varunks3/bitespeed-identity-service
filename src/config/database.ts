import knex from 'knex';
import type { Knex } from 'knex';
const knexConfig = require('../../knexfile');

const environment = process.env.NODE_ENV || 'development';
const config: Knex.Config = knexConfig[environment as keyof typeof knexConfig];

export const db = knex(config);

export default db;