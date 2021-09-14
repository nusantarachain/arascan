import moment from "moment";
import io from "socket.io-client";

import Dashboard from '~/layouts/dashboard/index.vue'
import WidgedBlock from '~/components/WidgetBlock/index.vue'
import WidgedList from '~/components/WidgetList/index.vue'
import Icon from '~/components/Icon/index.vue'
import LineChart from '~/components/LineChart/index.js'
import ApiService from "~/modules/arascan";

const ARA_API_URL = process.env.ARA_API_URL || 'http://192.168.1.200:8089';
const socket = io(ARA_API_URL);

const components = {
  Dashboard,
  WidgedBlock,
  WidgedList,
  AIcon: Icon,
  LineChart
}

const data = function() {
  return {
    overviews: [
      {
        icon: 'users',
        title: 'Organizations',
        link: '/organizations',
        value: 0
      },
      {
        icon: 'user',
        title: 'Accounts',
        link: '/organizations',
        value: 0
      },
      {
        icon: 'box',
        title: 'Products',
        link: '/',
        value: 0
      },
      {
        icon: 'calendar-check',
        title: 'Events',
        link: '/events',
        value: 0
      },
      {
        icon: 'certificate',
        title: 'Certificates',
        link: '/',
        value: 0
      },
      {
        icon: 'nodes',
        title: 'Nodes',
        link: 'https://telemetry.nuchain.network',
        value: 0
      },
      {
        icon: 'blocks',
        title: 'Validators',
        link: 'https://dashboard.nuchain.network/?rpc=wss%3A%2F%2Fid.node.nuchain.network#/staking',
        value: 0
      },
      {
        icon: 'runtime',
        title: 'Runtime Version',
        link: '/',
        value: 0
      }
    ],
    chartData: {
      labels: ['2020', '', '', '2021', '', '', ''],
      datasets: [
        {
          label: 'Blocks',
          borderWidth: 2,
          borderColor: '#219436',
          backgroundColor: '#EEF9F2',
          pointColor: '#219436',
          pointStrokeColor: '#219436',
          pointHighlightFill: '#219436',
          pointHighlightStroke: '#219436',
          data: [100, 350, 330, 250, 270, 270, 220]
        }
      ]
    },
    blocks: [
      {
        icon: 'block',
        title: 'Best',
        value: '0'
      },
      {
        icon: 'block',
        title: 'Finalized',
        value: '0'
      }
    ],
    recentEvents: [],
    latestBlocks: []
  }
}

const created = function() {
  this.fetchStat();
  this.fetchEvents();
  this.fetchBlocks();
}

const mounted = function() {
  socket.on('new_block', (message) => {
      message = JSON.parse(message);
      this.blocks = [
        {
          icon: 'block',
          title: 'Best',
          link: '/blocks',
          value: message.data.best.number
        },
        {
          icon: 'block',
          title: 'Finalized',
          link: '/blocks',
          value: message.data.finalized.number
        }
      ];
  });

  socket.on('summary_block', (message) => {
    message = JSON.parse(message);
    if (message) {
      message.data.blocks.forEach((block) => {
        this.latestBlocks.unshift({
          id: Math.random().toString(36).substring(2,7),
          title: `#${block._id}`,
          extrinsil: `${block.extrinsics.length} Extrinsics`,
          event: `${block.event_counts} Events`,
          link: `/blocks/${block._id}`,
          time: moment(block.extrinsics[0].method.args.now).fromNow() 
        });
      });

      this.latestBlocks = this.latestBlocks.slice(0, 22);
    }
  });

  socket.on('summary_event', (message) => {
    message = JSON.parse(message);
    if (message) {
      message.data.events.forEach((event) => {
        this.recentEvents.unshift({
          id: event._id,
          title: event.method,
          subtitle: `#${event.block}`,
          link: `/blocks/${event._id}`,
          time: moment(event.ts).fromNow()
        });
      });

      this.recentEvents = this.recentEvents.slice(0, 20);
    }
  });

  socket.on('stats', (message) => {
      message = JSON.parse(message);
      const statData = message.data;
      this.overviews = [
        {
          icon: 'users',
          title: 'Organizations',
          link: '/organizations',
          value: statData.organizations
        },
        {
          icon: 'user',
          title: 'Accounts',
          link: '/accounts',
          value: statData.accounts
        },
        {
          icon: 'box',
          title: 'Products',
          link: '/',
          value: statData.products
        },
        {
          icon: 'calendar-check',
          title: 'Events',
          link: '/events',
          value: statData.events
        },
        {
          icon: 'certificate',
          title: 'Certificates',
          link: '/',
          value: statData.certificates
        },
        {
          icon: 'nodes',
          title: 'Nodes',
          link: 'https://telemetry.nuchain.network',
          value: statData.nodes.length
        },
        {
          icon: 'blocks',
          title: 'Validators',
          link: 'https://dashboard.nuchain.network/?rpc=wss%3A%2F%2Fid.node.nuchain.network#/staking',
          value: statData.validators.length
        },
        {
          icon: 'runtime',
          title: 'Runtime Version',
          link: '/',
          value: statData.runtimeVersion
        }
      ];
  })
}

const methods = {
  
  fetchEvents() {
    return ApiService.getEvents({ limit: 20 })
      .then((response) => {
          const events = response.data.entries;
          this.recentEvents = events.map(x => ({
              id: x._id,
              title: x.method,
              link: `/blocks/${x.block}`,
              subtitle: `#${x.block}`,
              time: moment(x.ts).fromNow()
          }));
      })
      .catch((e) => {
          console.log(e);
      });
  },

  fetchBlocks() {
    return ApiService.getBlocks({ limit: 22 })
      .then((response) => {
          const blocks = response.data.entries;
          this.latestBlocks = blocks.map(x => ({
              id: `#${x._id}`,
              title: `#${x._id}`,
              extrinsil: `${x.extrinsics.length} Extrinsics`,
              event: `${x.event_counts} Events`,
              link: `/blocks/${x._id}`,
              time: moment(x.extrinsics[0].method.args.now).fromNow() 
          }));
      })
      .catch((e) => {
          console.log(e);
      });
  },

  fetchStat() {
    return ApiService.getStats()
      .then((response) => {
          const statData = response.data.result;
          this.overviews = [
            {
              icon: 'users',
              title: 'Organizations',
              link: '/organizations',
              value: statData.organizations
            },
            {
              icon: 'user',
              title: 'Accounts',
              link: '/accounts',
              value: statData.accounts
            },
            {
              icon: 'box',
              title: 'Products',
              link: '/',
              value: statData.products
            },
            {
              icon: 'calendar-check',
              title: 'Events',
              link: '/events',
              value: statData.events
            },
            {
              icon: 'certificate',
              title: 'Certificates',
              link: '/',
              value: statData.certificates
            },
            {
              icon: 'nodes',
              title: 'Nodes',
              link: 'https://telemetry.nuchain.network',
              value: statData.nodes.length
            },
            {
              icon: 'blocks',
              title: 'Validators',
              link: 'https://dashboard.nuchain.network/?rpc=wss%3A%2F%2Fid.node.nuchain.network#/staking',
              value: statData.validators.length
            },
            {
              icon: 'runtime',
              title: 'Runtime Version',
              link: '/',
              value: statData.runtimeVersion
            }
          ];
      })
      .catch((e) => {
          console.log(e);
      });
  }
}

export default {
  components,
  data,
  created,
  mounted,
  methods
}