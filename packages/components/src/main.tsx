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

import { isHex, isU8a, u8aToHex } from '@polkadot/util';
import type { Block, Hash } from '@polkadot/types/interfaces';
import { Context } from './context';
import { eventHandler } from './event_handler';

import type { Db } from 'mongodb';

// const _ = require('lodash');
const crc32 = require('crc32');

// const metaClassMap: any = {
//   balances: {
//     forceTransfer: 'transfer',
//     transferKeepAlive: 'transfer',
//     transfer: 'transfer',
//   },
//   timestamp: {
//     set: 'set',
//   },
// };

// const processorClass: any = {
//   timestamp: {
//     set__transfer: (ctx: Context, d: any) => {
//       ctx.db.collection('transfers').updateOne(
//         { _id: d.id },
//         {
//           $set: { ts: d.updater_extr.method.args[0].toNumber(), nonce: d.nonce },
//         }
//       );
//     },
//   },
// };

const systemEventProcessorClass: any = {
  NewAccount: async (ctx: Context, event: any, _eventIdx: number, block: Block, _blockTs: number, _extrIdx: number) => {
    const accountId = event.data[0].toHuman();
    const bal = await ctx.api.query.system.account(accountId);
    await ctx.db.collection('accounts').updateOne(
      { _id: accountId },
      {
        $set: {
          balance: bal.data.toJSON(),
          created_at_block: block.header.number.toNumber(),
        },
      },
      { upsert: true }
    );
  },
};

function processStakingEvent(
  ctx: Context,
  method: string,
  event: any,
  eventIdx: number,
  block: Block,
  blockTs: number,
  extrIdx: number
) {
  if (['Bonded', 'Reward', 'Slash', 'Unbounded', 'Withdrawn'].indexOf(method) >= 0) {
    const blockNumber = block.header.number.toNumber();

    // Note(exa): not sure which one is the correct one
    const eventIndex = `${blockNumber}-${extrIdx}`;
    const extrIndex = `${blockNumber}-${extrIdx}`;

    ctx.db.collection('staking_txs').updateOne(
      {
        stash_id: event.data[0].toHuman(),
        block_num: block.header.number.toNumber(),
        extrinsic_idx: extrIdx,
        event_idx: eventIdx,
      },
      {
        $set: {
          block_timestamp: blockTs,
          amount: `${event.data[1]}`,
          event_id: method,
          event_index: eventIndex,
          extrinsic_index: extrIndex,
        },
      },
      { upsert: true }
    );
  }
}

const eventProcessorClass: any = {
  system: async (
    ctx: Context,
    method: string,
    event: any,
    eventIdx: number,
    block: Block,
    blockTs: number,
    extrIdx: number
  ) => {
    if (systemEventProcessorClass[method]) {
      await systemEventProcessorClass[method](ctx, event, eventIdx, block, blockTs, extrIdx);
    } else {
      console.log(`Unhandled event: system.${method}`);
    }
  },
  staking: processStakingEvent,
};

function toHex(d: any) {
  return Buffer.from(d).toString('hex');
}

function toNumber(d: any) {
  return parseInt(d) || 0;
}

async function processBlock(
  ctx: Context,
  blockHash: Hash,
  verbose = false,
  callback: (skipped: boolean) => void = () => ({})
) {
  const { api, db } = ctx;

  const signedBlock = await api.rpc.chain.getBlock(blockHash);
  const {
    block: {
      header: { parentHash, number, hash },
      extrinsics,
    },
  } = signedBlock;
  const block = signedBlock.block;
  const blockNumber = number.toNumber();

  ctx.currentBlock = block;
  ctx.currentBlockNumber = blockNumber;

  if (verbose) {
    process.stdout.write(`[${number}] ${hash.toHex()}\r`);
  }

  let blockTs: any;
  block.extrinsics.forEach((extr) => {
    let method = 'unknown';
    let section = 'unknown';

    try {
      const mCall = ctx.api.registry.findMetaCall(extr.callIndex);
      if (mCall != null) {
        method = mCall.method;
        section = mCall.section;
      }
    } catch (e) {
      console.log(`[ERROR] ${e}`);
    }
    section = section.toString();

    if (section == 'timestamp') {
      if (method == 'set') {
        blockTs = extr.method.args[0];
      }
    }
  });

  // process events
  const allEvents = await api.query.system.events.at(hash);

  // const colTrf = db.collection('transfers');
  const colBlocks = db.collection('blocks');
  const colEvents = db.collection('events');

  // check is already exists
  const exists = await colBlocks.findOne({ block_num: blockNumber });

  if (exists != null) {
    console.log(`\nBlock [${blockNumber}] exists, ignored.`);
    callback(true);
    return;
  }

  // console.log(`${allEvents}`);

  await Promise.all(
    extrinsics.map(async (_extr, extrIdx) => {
      allEvents
        .filter(
          ({ phase, event }) =>
            phase.isApplyExtrinsic && phase.asApplyExtrinsic.eq(extrIdx) && event.method != 'ExtrinsicSuccess'
        )
        .map(async ({ event }, eventIdx) => {
          await eventProcessorClass[event.section]?.(
            ctx,
            event.method,
            event,
            eventIdx,
            block,
            blockTs?.toNumber(),
            extrIdx
          );

          // save event information
          const dataJson = event.data.toJSON();
          const dataHash = crc32(dataJson);
          await colEvents.updateOne(
            {
              block: blockNumber,
              extrinsic_index: extrIdx,
              section: event.section,
              method: event.method,
              data_hash: dataHash,
            },
            {
              $set: {
                block: blockNumber,
                extrinsic_index: extrIdx,
                section: event.section,
                method: event.method,
                ts: blockTs?.toNumber(),
                data: dataJson,
              },
            },
            { upsert: true }
          );
        });
    })
  );

  // proses events yang tidak terkait dengan extrinsic lainnya
  Promise.all(
    allEvents.map(async ({ event }) => {
      let key = `${event.section}.${event.method}`;
      key = key.replace(/\.\*$/,'') // remove ending .* if any
      let processed = false;
      if (eventHandler[key]) {
        await eventHandler[key](ctx, block, event, extrinsics);
        processed = true;
      }
      if (!processed && key != 'system.ExtrinsicSuccess') {
        console.log(`event not handled: ${key}`);
      }
    })
  );

  try {
    // finally add the block into the db
    await colBlocks.updateOne(
      { block_num: blockNumber },
      {
        $set: {
          block_num: blockNumber,
          block_hash: hash.toHex(),
          block_parent_hash: parentHash.toHex(),
          event_counts: allEvents.length,
          extrinsics: JSON.parse(`${extrinsics}`),
        },
      },
      { upsert: true }
    );
  } catch (error) {
    console.log(`[ERROR] updating blocks data error ${error}`);
  }

  callback(false);
}

/**
 * Get last starting block when sequencing.
 */
async function getLastStartingBlock(db: Db) {
  return await db.collection('processed').findOne({ _id: 'last_starting_block' });
}

import { decodeAddress, encodeAddress } from '@polkadot/util-crypto';
import { updateAccount, updateStats } from './event_handler';

export {
  processBlock,
  updateAccount,
  toHex,
  toNumber,
  getLastStartingBlock,
  Context,
  isHex,
  isU8a,
  u8aToHex,
  decodeAddress,
  encodeAddress,
  updateStats,
};
