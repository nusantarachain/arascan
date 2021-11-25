import { Nuchain, WsProvider } from 'nuchain-api';
import moment from 'moment';
import io from "socket.io-client";
import { isHex } from '@polkadot/util'

import Dashboard from '~/layouts/dashboard/index.vue';
import Icon from '~/components/Icon/index.vue';
import Tabs from '~/components/Tabs/index.vue';
import Identicon from '~/components/Identicon/index.vue';
import ApiService from '~/modules/arascan';

const components = {
  Dashboard,
  AIcon: Icon,
  Tabs,
  Identicon,
};

const data = function () {
  return {
    isAvailable: false,
    isFinalized: false,
    block: {
      number: 0,
      timestamp: '',
      status: 'Unfinalized',
      hash: '',
      parent_hash: '',
      validator: '',
      blocktime: '',
    },
    currentTab: 1,
    tabs: [
      {
        title: 'Extrinsics',
        count: 0,
      },
      {
        title: 'Comments',
        count: 0,
      },
    ],
    extrinsics: [],
  };
};

const mounted = function () {
  ApiService.setBaseUrl(this.$config.apiUrl);
  this.fetchBlock(this.$route.params.id);
  this.fetchDetail(this.$route.params.id);

  const socket = io(this.$config.baseUrl, { path: '/socket' });

  socket.on('new_block', (message) => {
    message = JSON.parse(message);
    this.isFinalized = message.data.finalized.number >= this.block.number && this.block.number > 0;
    this.block.status = this.isFinalized ? 'Finalized' : 'Unfinalized';
  });
};

const methods = {
  fetchBlock(block) {
    return ApiService.getBlock(block)
      .then((response) => {
        const block = response.data.result;
        this.block = {
          number: block.block_num,
          timestamp: new Date(block.extrinsics[0].method.args.now).toUTCString(),
          status: 'Unfinalized',
          hash: block.block_hash,
          parent_hash: block.block_parent_hash,
          parent_hash_link: `/blocks/${block.block_num - 1}`,
          validator: '-',
          blocktime: moment(block.extrinsics[0].method.args.now).fromNow(),
        };
      })
      .catch((e) => {
        console.log(e);
      });
  },

  fetchDetail(block) {
    Nuchain.connectApi({ provider: new WsProvider(this.$config.nuchainSocketUrl) })
      .then(async (api) => {
        let blockHash;

        if(!isHex(block)) {
          blockHash = await api.rpc.chain.getBlockHash(block);
        } else {
          blockHash = block;
        }

        let signedBlock = await api.rpc.chain.getBlock(blockHash);

        let countindex = 0;
        let extrinsics = [];
        signedBlock.block.extrinsics.forEach((ex, index) => {
          const {
            method: { args, method, section },
          } = ex;
          console.log(`${section}.${method}(${args.map((a) => a.toString()).join(', ')})`);
          if (section != 'timestamp' && section != 'authorship') {
            countindex = countindex + 1;
            extrinsics.push({
              id: `${block}-${index}`,
              hash: '-',
              time: '',
              result: true,
              action: `${section}(${method})`,
              content: this.extrinsicsContent(section, method, args),
              expand: false,
            });
          }
        });

        this.extrinsics = extrinsics;
        this.tabs = [
          {
            title: 'Extrinsics',
            count: countindex,
          },
          {
            title: 'Comments',
            count: 0,
          },
        ];

        api.derive.chain.getHeader(blockHash).then((header) => {
          this.block.validator = header.author;
          this.isAvailable = true;
        });
        
      });
  },

  extrinsicsContent(section, method, args) {
    switch (section) {
      case 'timestamp':
        if (method === 'set') {
          return [{ key: 'Time', value: args[0].toString() }];
        }
        break;
      case 'balances':
        if (method === 'transferKeepAlive') {
          return [
            { key: 'Dest', value: args[0] },
            { key: 'Amount', value: args[1] },
          ];
        }
        break;
      case 'organization':
        if (method === 'update') {
          return [
            { key: 'Org', value: args[0] },
            { key: 'Name', value: args[1] },
            { key: 'Description', value: args[2] },
            { key: 'Website', value: args[3] },
            { key: 'Email', value: args[4] },
            { key: 'Props', value: args[5] },
          ];
        } else if (method === 'addMembers') {
          return [
            { key: 'Org', value: args[0] },
            { key: 'Members', value: args[1].join(', ') },
          ];
        } else if (method === 'create') {
          return [
            { key: 'Name', value: args[0] },
            { key: 'Desc', value: args[1] },
            { key: 'Owner', value: args[2] },
            { key: 'Web', value: args[3] },
            { key: 'Email', value: args[4] },
          ];
        }
        break;
      case 'authorship':
        if (method === 'setUncles') {
          return [{ key: 'Content', value: args[0] }];
        }
        break;
      case 'identity':
        if (method === 'setIdentity') {
          return [{ key: 'Display', value: args[0].toJSON().display.raw }];
        }
        break;
      default:
        return [];
    }
  },

  copyToClipboard(elClass, id) {
    if (!navigator.clipboard) {
      return;
    }

    let text = id === '#icon-clipboard-validator' ? this.block.validator : this.block.hash;
    navigator.clipboard.writeText(text).then(
      () => {
        let clip = document.querySelector(elClass + ' .tooltip');
        let tailIcon = document.querySelector(id);
        clip.classList.add('tooltip-visible');
        tailIcon.classList.remove('arascan-icon--gray');
        setTimeout(function () {
          clip.classList.remove('tooltip-visible');
          tailIcon.classList.add('arascan-icon--gray');
        }, 1000);
      },
      () => {
        console.log('failed');
      }
    );
  },
};

export default {
  components,
  data,
  methods,
  mounted,
};
