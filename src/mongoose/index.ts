import type { ClientSession, Connection, ConnectOptions } from 'mongoose';
import mongoose from 'mongoose';
import { createMigration } from '../database/migrations/createMigration';
import type { Payload } from '../index';
import type { DatabaseAdapter } from '../database/types';
import { connect } from './connect';
import { init } from './init';
import { webpack } from './webpack';
import { createGlobal } from './createGlobal';
import { createVersion } from './createVersion';
import { beginTransaction } from './transactions/beginTransaction';
import { rollbackTransaction } from './transactions/rollbackTransaction';
import { commitTransaction } from './transactions/commitTransaction';
import { queryDrafts } from './queryDrafts';
import { find } from './find';
import { findGlobalVersions } from './findGlobalVersions';
import { findVersions } from './findVersions';
import { create } from './create';
import { deleteOne } from './deleteOne';
import { deleteVersions } from './deleteVersions';
import { findGlobal } from './findGlobal';
import { findOne } from './findOne';
import { updateGlobal } from './updateGlobal';
import { updateOne } from './updateOne';
import { updateVersion } from './updateVersion';
import { deleteMany } from './deleteMany';
import { baseDatabaseAdapter } from '../database/baseDatabaseAdapter';
import { destroy } from './destroy';
import type { CollectionModel, GlobalModel } from './types';

export interface Args {
  payload: Payload;
  /** The URL to connect to MongoDB or false to start payload and prevent connecting */
  url: string | false;
  migrationDir?: string;
  /** Extra configuration options */
  connectOptions?: ConnectOptions & {
    /** Set false to disable $facet aggregation in non-supporting databases, Defaults to true */
    useFacet?: boolean;
  };
}

export type MongooseAdapter = DatabaseAdapter &
  Args & {
    mongoMemoryServer: any;
    collections: {
      [slug: string]: CollectionModel;
    };
    globals: GlobalModel;
    versions: {
      [slug: string]: CollectionModel
    }
    sessions: Record<string | number, ClientSession>
    connection: Connection
  }

export function mongooseAdapter({
  payload,
  url,
  connectOptions,
  migrationDir,
}: Args): MongooseAdapter {
  const adapter = baseDatabaseAdapter({
    payload,
    migrationDir,
  });
  mongoose.set('strictQuery', false);
  return {
    ...adapter,
    connection: undefined,
    mongoMemoryServer: undefined,
    sessions: {},
    payload,
    url,
    connectOptions: connectOptions || {},
    globals: undefined,
    collections: {},
    versions: {},
    connect,
    destroy,
    init,
    webpack,
    createMigration: async (migrationName) => createMigration({ payload, migrationDir, migrationName }),
    beginTransaction,
    rollbackTransaction,
    commitTransaction,
    queryDrafts,
    findOne,
    find,
    create,
    updateOne,
    deleteOne,
    deleteMany,
    findGlobal,
    createGlobal,
    updateGlobal,
    findVersions,
    findGlobalVersions,
    createVersion,
    updateVersion,
    deleteVersions,
  };
}
