import type { Context } from './context';
import type { Block } from '@polkadot/types/interfaces';
import { hexToString } from '@polkadot/util';

const cols = {
  PRODUCT_TRACKING: 'product_tracking',
  PRODUCT_TRACKING_EVENT: 'product_tracking_event',
  PRODUCTS: 'products',
};

const eventHandler: any = {
  'system.NewAccount': async (ctx: Context, _block: Block, event: any, extrs: [any]) => {
    const accountId = event.data[0].toHuman();
    await ctx.db
      .collection('accounts')
      .updateOne({ _id: accountId }, { $set: { created_ts: getTimestampFromExtrinsics(extrs) } }, { upsert: true });
  },
  'balances.Transfer': async (ctx: Context, _block: Block, event: any, extrs: any[]) => {
    const accountId1 = event.data[0].toHuman();
    const accountId2 = event.data[1].toHuman();
    updateTransfer(ctx, accountId1, accountId2, event.data[2].toNumber(), extrs);
    await updateAccount(ctx, accountId1);
    await updateAccount(ctx, accountId2);
  },
  'identity.IdentitySet': async (ctx: Context, _block: Block, event: any, _extrs: any[]) => {
    const accountId = event.data[0].toHuman();
    await updateAccount(ctx, accountId, new UpdateOptions().setIdentity(true));
  },
  'organization.OrganizationAdded': async (ctx: Context, _block: Block, event: any, extrs: any[]) => {
    const orgId = event.data[0].toHuman();
    await updateOrganization(ctx, orgId, extrs);
  },
  'organization.OrganizationUpdated': async (ctx: Context, _block: Block, event: any, extrs: any[]) => {
    const orgId = event.data[0].toHuman();
    await updateOrganization(ctx, orgId, extrs);
  },
  'organization.OrganizationSuspended': async (ctx: Context, _block: Block, event: any, extrs: any[]) => {
    const orgId = event.data[0].toHuman();
    await updateOrganization(ctx, orgId, extrs);
  },
  'organization.AdminChanged': async (ctx: Context, _block: Block, event: any, extrs: any[]) => {
    const orgId = event.data[0].toHuman();
    await updateOrganization(ctx, orgId, extrs);
  },
  'productRegistry.ProductRegistered': async (ctx: Context, _block: Block, event: any, extrs: any[]) => {
    const registererId = event.data[0].toHuman();
    const productId = event.data[1].toHuman();
    // const orgId = event.data[2].toHuman();
    await updateProduct(ctx, registererId, productId, extrs);
  },
  'productTracking.TrackingRegistered': async (ctx: Context, _block: Block, event: any, extrs: any[]) => {
    const trackingId = event.data[1].toHuman();
    await updateProductTracking(ctx, trackingId, extrs);
  },
  'productTracking.TrackingStatusUpdated': async (ctx: Context, _block: Block, event: any, extrs: any[]) => {
    const trackingId = event.data[1].toHuman();
    const eventIdx = event.data[2].toNumber();
    await updateProductTrackingStatus(ctx, trackingId, eventIdx, extrs);
  },
  'certificate.CertAdded': async (ctx: Context, _block: Block, event: any, extrs: any[]) => {
    const certificateId = event.data[1].toHuman();
    await updateCertificate(ctx, certificateId, extrs);
  },
};

async function updateCertificate(ctx: Context, certificateId: string, extrs: any[]) {
  const certificate = await (ctx.api.query as any).certificate.certificates(certificateId);
  if (!certificate) {
    return;
  }

  console.log('Processing cert:', certificate.toHuman());
  await ctx.db
    .collection('certificates')
    .updateOne(
      { _id: certificateId },
      { $set: { ...certificate.toJSON(), created_at_block: ctx.currentBlockNumber, ts: getTimestampFromExtrinsics(extrs) } },
      { upsert: true }
    );
}

async function updateProductTrackingStatus(ctx: Context, trackingId: string, eventIdx: number, _extrs: any[]) {
  const _tracking = await (ctx.api.query as any).productTracking.tracking(trackingId);
  if (!_tracking) {
    return;
  }
  const trackingEvent = await (ctx.api.query as any).productTracking.allEvents(eventIdx);
  if (!trackingEvent) {
    return;
  }
  console.log('update product tracking:', trackingId);
  console.log(_tracking.toHuman());
  console.log('event:', eventIdx);
  console.log(trackingEvent.toHuman());
  const tracking = _tracking.toJSON();
  await ctx.db
    .collection(cols.PRODUCT_TRACKING)
    .updateOne(
      { _id: trackingId },
      { $set: { status: tracking.status, updated: tracking.updated } },
      { upsert: true }
    );
  await ctx.db
    .collection(cols.PRODUCT_TRACKING_EVENT)
    .updateOne(
      { _id: eventIdx },
      { $set: { ...trackingEvent.toJSON(), created_at_block: ctx.currentBlockNumber } },
      { upsert: true }
    );
}

async function updateProductTracking(ctx: Context, trackingId: string, extrs: any[]) {
  const tracking = await (ctx.api.query as any).productTracking.tracking(trackingId);
  if (!tracking) {
    return;
  }
  console.log('Processing product tracking:', tracking.toHuman());
  await ctx.db.collection(cols.PRODUCT_TRACKING).updateOne(
    { _id: trackingId },
    {
      $set: { ...tracking.toJSON(), created_at_block: ctx.currentBlockNumber, ts: getTimestampFromExtrinsics(extrs) },
    },
    { upsert: true }
  );
}

async function getOrganization(ctx: Context, orgId: string) {
  return (ctx.api.query as any).organization.organizations(orgId);
}

async function updateProduct(ctx: Context, _registererId: string, productId: string, extrs: any[]) {
  const product = await (ctx.api.query as any).productRegistry.products(productId);
  if (!product) {
    return;
  }
  console.log('Processing product:', product.toHuman());
  await ctx.db.collection('products').updateOne(
    { _id: productId },
    {
      $set: { ...product.toJSON(), created_at_block: ctx.currentBlockNumber, ts: getTimestampFromExtrinsics(extrs) },
    },
    { upsert: true }
  );
}

async function updateOrganization(ctx: Context, orgId: string, extrs: any[]) {
  const org = await getOrganization(ctx, orgId);
  if (!org) {
    return;
  }
  console.log('Processing org:', org.toHuman());
  await ctx.db
    .collection('organizations')
    .updateOne(
      { _id: orgId },
      { $set: { ...org.toJSON(), created_at_block: ctx.currentBlockNumber, ts: getTimestampFromExtrinsics(extrs) } },
      { upsert: true }
    );
}

function getTimestampFromExtrinsics(extrs: any[]) {
  return extrs
    .filter((a) => a.method.section == 'timestamp' && a.method.method == 'set')
    .map((a) => a.args[0].toNumber())
    .pop();
}

function updateTransfer(ctx: Context, src: string, dst: string, amount: number, extrs: any[]) {
  const timestamp = getTimestampFromExtrinsics(extrs);
  const nonce = extrs[1]?.nonce.toNumber();
  if (nonce != null && nonce != undefined) {
    console.log(src, dst, amount, timestamp, nonce);

    const query = {
      src: src,
      nonce: nonce,
    };

    ctx.db.collection('transfers').updateOne(
      query,
      {
        $set: {
          src: src,
          nonce: nonce,
          block: ctx.currentBlockNumber,
          extrinsic_index: "1",
          dst: dst,
          amount: `${amount}`,
          ts: timestamp,
        },
      },
      { upsert: true }
    );
  }
}

class UpdateOptions {
  identity: boolean;

  constructor(identity: boolean = false) {
    this.identity = identity;
  }

  static default(): UpdateOptions {
    return new UpdateOptions();
  }

  setIdentity(identity: boolean) {
    this.identity = identity;
    return this;
  }
}

async function updateAccount(ctx: Context, accountId: string, opts: UpdateOptions = UpdateOptions.default()) {
  const bal = await ctx.api.query.system.account(accountId);
  await ctx.db
    .collection('accounts')
    .updateOne({ _id: accountId }, { $set: { balance: bal.data.toJSON() } }, { upsert: true });

  // update identity
  if (opts.identity) {
    const rv = await ctx.api.query.identity.identityOf(accountId);
    if (rv.isSome) {
      const identity = rv.unwrap();
      const ident: any = {};
      if (identity.info.display.isRaw) {
        ident['display'] = hexToString(identity.info.display.asRaw.toHex());
      }
      if (identity.info.legal.isRaw) {
        ident['legal'] = hexToString(identity.info.legal.asRaw.toHex());
      }
      if (identity.info.web.isRaw) {
        ident['web'] = hexToString(identity.info.web.asRaw.toHex());
      }
      if (identity.info.email.isRaw) {
        ident['email'] = hexToString(identity.info.email.asRaw.toHex());
      }
      if (identity.info.twitter.isRaw) {
        ident['twitter'] = hexToString(identity.info.twitter.asRaw.toHex());
      }
      if (identity.info.image.isRaw) {
        ident['image'] = hexToString(identity.info.image.asRaw.toHex());
      }
      await ctx.db
        .collection('accounts')
        .updateOne({ _id: accountId }, { $set: { identity: ident } }, { upsert: true });
    }
  }
}

async function updateStats(ctx: Context) {
  const { api, db } = ctx;

  const nodes = (await api.rpc.system.peers()).map((a) => a.toHuman());
  const runtimeVersion = (api.consts.system.version).specVersion.toNumber();
  const era = (await api.query.staking.currentEra()).unwrap().toNumber();
  const session = (await api.query.session.currentIndex()).toNumber();
  const validators = (await api.query.session.validators()).map((a) => a.toHuman());

  db.collection('metadata').updateOne(
    { _id: 'stats' },
    {
      $set: {
        era,
        session,
        validators,
        runtimeVersion,
        nodes
      },
    },
    { upsert: true }
  );
}

export { eventHandler, updateAccount, updateStats };
