// Copyright 2021 Rantai Nusantara Foundation.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { MongoClient, Db } from 'mongodb';
import { isHex, toNumber } from '@arascan/components';
import { WsProvider } from '@polkadot/api';
import { Server as IOServer } from "socket.io";
import * as restify from "restify";
import { Nuchain } from "@arascan/components";

require('dotenv').config();

const dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';

function withDb<T>(callback: (db: Db, client: MongoClient) => Promise<T>) {
  let afterCompleted = () => ({});
  const doner = {
    done(whenDone: () => T) {
      afterCompleted = whenDone;
    },
  };
  MongoClient.connect(dbUri, { poolSize: 10 }, async (err: any, client: MongoClient) => {
    if (err != null) {
      console.log(`[ERROR] cannot get db: ${err}`);
      afterCompleted();
      return;
    }
    try {
      await callback(client.db('nuchain'), client);
    } catch (error) {
      console.log(`[ERROR] ${error}`);
    } finally {
      client.close();
      afterCompleted();
    }
  });
  return doner;
}

function getAccounts(req: any, res: any, next: any) {
  const { skip, limit } = parseSkipLimit(req);

  if (!validOffsetLimit(skip, limit)) {
    res.send({ entries: [] });
    return next();
  }

  withDb((db, _client) => {
    db.collection('accounts')
      .find({})
      .sort({ created_ts: -1 })
      .skip(skip)
      .limit(limit)
      .toArray((err: any, result: Array<any>) => {
        if (err == null) {
          res.send({ entries: result.filter((a) => a.created_ts != null && a.created_ts > 0) });
        }
      });
    return Promise.resolve();
  }).done(next);
}

function parseSkipLimit(req: any) {
  const skip = parseInt(req.query.skip || '0');
  const limit = parseInt(req.query.limit || '50');
  return { skip, limit };
}

function getAccountTransfers(req: any, res: any, next: any) {
  const addr = req.params.addr;
  const { skip, limit } = parseSkipLimit(req);
  if (!validOffsetLimit(skip, limit)) {
    res.send({ entries: [] });
    return next();
  }

  const filter = { $or: [{ src: addr }, { dst: addr }] };

  withDb(async (db, _client) => {
    const count = await db.collection('transfers').count(filter);
    if (count > 0) {
      db.collection('transfers')
        .find(filter)
        .sort({ ts: -1 })
        .skip(skip)
        .limit(limit)
        .toArray((err: any, result: Array<any>) => {
          if (err == null) {
            res.send({ entries: result, count });
          }
        });
    } else {
      res.send({ entries: [], count });
    }
  }).done(next);
}

function getAccountStakingTxs(req: any, res: any, next: any) {
  const addr = req.params.addr;
  const { skip, limit } = parseSkipLimit(req);
  if (!validOffsetLimit(skip, limit)) {
    res.send({ entries: [] });
    return next();
  }

  const filter = { stash_id: addr, event_id: { $nin: ['Reward', 'Slash'] } };

  withDb(async (db, _client) => {
    const count = await db.collection('staking_txs').count(filter);
    if (count > 0) {
      db.collection('staking_txs')
        .find(filter)
        .sort({ block_timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .toArray((err: any, result: Array<any>) => {
          if (err == null) {
            res.send({ data: { entries: result, count } });
          }
        });
    } else {
      res.send({ entries: [], count });
    }
  }).done(next);
}

function getAccountStakingRewardsSlashes(req: any, res: any, next: any) {
  const addr = req.params.addr;
  const { skip, limit } = parseSkipLimit(req);
  if (!validOffsetLimit(skip, limit)) {
    res.send({ entries: [] });
    return next();
  }

  const filter = { stash_id: addr, event_id: { $in: ['Reward', 'Slash'] } };

  withDb(async (db, _client) => {
    const count = await db.collection('staking_txs').count(filter);
    if (count > 0) {
      db.collection('staking_txs')
        .find(filter)
        .sort({ block_timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .toArray((err: any, result: Array<any>) => {
          if (err == null) {
            res.send({ data: { entries: result, count } });
          }
        });
    } else {
      res.send({ entries: [], count });
    }
  }).done(next);
}

function getAccountOne(req: any, res: any, next: any) {
  const addr = req.params.addr;

  withDb((db, _client) => {
    return db
      .collection('accounts')
      .findOne({ _id: addr })
      .then((result) => {
        res.send({ result });
      });
  }).done(next);
}

function validOffsetLimit(offset: number, limit: number): boolean {
  return offset > -1 && offset < 100000 && limit > -1 && limit < 1000;
}

function getBlockOne(req: any, res: any, next: any) {
  let blockNumOrHash = req.params.block;
  blockNumOrHash = isHex(blockNumOrHash) ? blockNumOrHash : toNumber(blockNumOrHash);
  if (blockNumOrHash.length > 500) {
    res.send({ result: null });
    next();
    return;
  }
  withDb((db, _client) => {
    return db
      .collection('blocks')
      .findOne({ $or: [{ _id: blockNumOrHash }, { block_hash: blockNumOrHash }] })
      .then((result: any) => {
        res.send({ result });
      });
  }).done(next);
}

function getBlocks(req: any, res: any, next: any) {
  const skip = parseInt(req.query.skip || '0');
  const limit = parseInt(req.query.limit || '50');
  if (!validOffsetLimit(skip, limit)) {
    res.send({ entries: [] });
    return next();
  }

  withDb((db, _client) => {
    db.collection('blocks')
      .find({})
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit)
      .toArray((err: any, result: Array<any>) => {
        if (err == null) {
          res.send({ entries: result });
        }
      });
    return Promise.resolve();
  }).done(next);
}

function getEvents(req: any, res: any, next: any) {
  const skip = parseInt(req.query.skip || '0');
  const limit = parseInt(req.query.limit || '50');
  if (!validOffsetLimit(skip, limit)) {
    res.send({ entries: [] });
    return next();
  }

  withDb((db, _client) => {
    db.collection('events')
      .find({})
      .sort({ block: -1 })
      .skip(skip)
      .limit(limit)
      .toArray((err: any, result: Array<any>) => {
        if (err == null) {
          res.send({ entries: result });
        }
      });
    return Promise.resolve();
  }).done(next);
}

async function queryStats(db: any) {
  const accountCount = await db.collection('accounts').countDocuments({});
  const eventCount = await db.collection('events').countDocuments({});
  const organizationCount = await db.collection('organizations').countDocuments({});
  const productCount = await db.collection('products').countDocuments({});
  const certificateCount = await db.collection('certificates').countDocuments({});
  const { era, session, validators, runtimeVersion, nodes } = await db.collection('metadata').findOne({ _id: 'stats' });

  return {
    accounts: accountCount,
    events: eventCount,
    organizations: organizationCount,
    products: productCount,
    certificates: certificateCount,
    era,
    session,
    validators,
    runtimeVersion,
    nodes
  };
}

function getStats(_req: any, res: any, next: any) {
  withDb((db, _client) => {
    return queryStats(db)
      .then((stats) => {
        res.send({ result: stats });
      })
      .catch((_err) => res.send({ result: { error: 'Cannot get stats data from database' } }));
  }).done(next);
}

function getToken(_req: any, res: any, next: any) {
  withDb(async (db, _client) => {
    // @TODO: temporary, please change with data from market when ready

    let tokens = await db.collection('tokens').find().toArray();
    tokens = tokens.sort((a: any, _b: any) => (a['_id'] == 'ARA' ? -1 : 0));
    const tokenSymbols = tokens.map(({ _id, price, asset_id }) => [_id, price, asset_id]);

    const detail = {};

    tokenSymbols.forEach((tok) => {
      detail[tok[0]] = {
        asset_id: tok[2] || 0,
        price: tok[1],
      };
    });

    res.send({
      data: {
        token: tokenSymbols.map((a) => a[0]),
        detail: detail,
      },
    });
  }).done(next);
}

const server = restify.createServer();
server.use(restify.plugins.queryParser());
server.use(function crossOrigin(_req: any, res: any, next: any) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');
  return next();
});

const io = new IOServer(server.server, {
  cors: {
    origin: "*"
  }
});

io.on("connection", (socket) => {
  console.log("Connect to client");
  socket.on('disconnect', function() {
    console.log("Disconnect");
  });
});

function wsSend(io: any, key: any, value: any) {
  try {
    io.emit(key, JSON.stringify(value));
  } catch (error) {
    console.log(error);
  }
}

const WS_SOCKET_URL = process.env.NUCHAIN_WS_SOCKET_URL || 'ws://127.0.0.1:9944';

console.log(`Using WS socket address: ${WS_SOCKET_URL}`);

Nuchain.connectApi({provider: new WsProvider(WS_SOCKET_URL)})
  .then((api) => {
    api.rpc.chain.subscribeNewHeads(async (head: any) => {
      const blockHash = await api.rpc.chain.getBlockHash(head.number);
      const finalizedBlockHash = await api.rpc.chain.getFinalizedHead();
      const finalizedBlockHead = await api.rpc.chain.getHeader(finalizedBlockHash);

      wsSend(io, 'new_block', {
        data: {
          best: {
            number: head.number.toNumber(),
            hash: blockHash,
          },

          finalized: {
            number: finalizedBlockHead.number.toNumber(),
            hash: finalizedBlockHash,
          },
        },
      });

      withDb(async (db, _client) => {
        wsSend(io, 'stats', {
          data: await queryStats(db),
        });
      });

    });
  });

server.get('/account/:addr/transfers', getAccountTransfers);
server.get('/account/:addr/staking_txs', getAccountStakingTxs);
server.get('/account/:addr/rewards_slashes', getAccountStakingRewardsSlashes);
server.get('/account/:addr', getAccountOne);
server.get('/accounts', getAccounts);
server.get('/block/:block', getBlockOne);
server.get('/blocks', getBlocks);
server.get('/events', getEvents);
server.get('/stats', getStats);
server.get('/token', getToken);

const listenAll = process.argv.indexOf('--listen-all') > -1;

server.listen('8089', listenAll ? '0.0.0.0' : '127.0.0.1', () => {
  console.log(`${server.name} listening at ${server.url}`);
});
