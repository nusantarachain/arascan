import moment from 'moment';
import io from "socket.io-client";

import Dashboard from '~/layouts/dashboard/index.vue';
import Icon from '~/components/Icon/index.vue';
import Input from '~/components/Input/index.vue';
import ApiService from '~/modules/arascan';

Object.assign(String.prototype, {
  shorty() {
    return this.slice(0, 5) + '...' + this.slice(-5);
  },
});

const components = {
  Dashboard,
  AIcon: Icon,
  AInput: Input,
};

const data = function () {
  return {
    blocks: [],
  };
};

const created = function () {
  ApiService.setBaseUrl(this.$config.apiUrl);
  this.fetchBlocks();
};

const mounted = function () {
  const socket = io(this.$config.socketUrl, { path: '/socket' });

  socket.on('new_block', (message) => {
    message = JSON.parse(message);
    this.blocks = this.blocks.map((x) => ({
      _id: x._id,
      id: x.id,
      event_counts: x.event_counts,
      ext_counts: x.ext_counts,
      link: x.link,
      status: message.data.finalized.number >= x._id ? 'Finalized' : 'Unfinalized',
      time: x.time,
    }));
  });
};

const methods = {
  fetchBlocks() {
    return ApiService.getBlocks({ limit: 50 })
      .then((response) => {
        const blocks = response.data.entries;
        this.blocks = blocks.map((x) => ({
          _id: x.block_num,
          id: `#${x.block_num}`,
          event_counts: x.event_counts,
          ext_counts: x.extrinsics.length,
          link: `/blocks/${x.block_num}`,
          status: '-',
          time: moment(x.extrinsics[0].method.args.now).fromNow(),
        }));
      })
      .catch((e) => {
        console.log(e);
      });
  },
};

export default {
  components,
  data,
  created,
  mounted,
  methods,
};
