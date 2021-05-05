import type { ApiPromise } from '@polkadot/api';
import type { MongoClient, Db } from 'mongodb';

class Context {
  api!: ApiPromise;
  db!: Db;
  client!: MongoClient;
  currentBlock: any;
  currentBlockNumber: number = 0;

  constructor(api: ApiPromise, db: Db, client: MongoClient) {
    this.db = db;
    this.client = client;
    this.api = api;
  }
}

export { Context };
