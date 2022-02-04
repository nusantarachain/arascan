import moment from "moment";

import Dashboard from '~/layouts/dashboard/index.vue'
import Icon from '~/components/Icon/index.vue'
import Input from '~/components/Input/index.vue'
import ApiService from "~/modules/arascan";

Object.assign(String.prototype, {
  shorty() {
      return this.slice(0, 5) + '...' + this.slice(-5);
  }
});

const components = {
  Dashboard,
  AIcon: Icon,
  AInput: Input
}

const data = function() {
  return {
    events: [],
    search: ''
  }
}

const created = function() {
  ApiService.setBaseUrl(this.$config.apiUrl);
  this.fetchEvents();
}

const methods = {
  fetchEvents() {
    return ApiService.getEvents({ limit: 50 })
      .then((response) => {
          const events = response.data.entries;
          console.log("🚀 ~ file: script.js ~ line 37 ~ .then ~ events", events)
          this.events = events.map(x => ({
              block: `#${x.block}`,
              event: `${x.section}.${x.method}`,
              params: this.extrinsicsContent(x.section, x.method, x.data),
              time: moment(x.ts).fromNow(),
              link: `/blocks/${x.block}`
          }));
      })
      .catch((e) => {
          console.log(e);
      });
  },

  donothing() {
    //
  },

  searchEvents(e) {
    if (e.keyCode === 13) {
      return ApiService.getEvents({ search: this.search, limit: 50 })
        .then((response) => {
          const events = response.data.entries;
          this.events = events.map(x => ({
              block: `#${x.block}`,
              event: `${x.section}.${x.method}`,
              params: this.extrinsicsContent(x.section, x.method, x.data),
              time: moment(x.ts).fromNow(),
              link: `/blocks/${x.block}`
          }));
        })
        .catch((e) => {
            console.log(e);
        });
    }
  },

  extrinsicsContent(section, method, data) {
    switch(section) {
      case 'staking':
        if (method === 'SolutionStored') {
          return data[0];
        }
        break;
      case 'system':
        if (method === 'NewAccount') {
          return `Address: ${data[0]}`;
        } else if (method === 'ExtrinsicFailed') {
          return '-';
        }
        break;
      case 'balances':
        if (method === 'Endowed') {
          return `Transfer to organization ${data[0].shorty()} amount ${data[1] / 10000000000} ARA`;
        } else if (method === 'Transfer') {
          return `Transfer from ${data[0].shorty()} to ${data[1].shorty()} amount ${data[2] / 10000000000} ARA`;
        } else if (method === 'Reserved') {
          return `Account ${data[0].shorty()} amount ${data[1] / 10000000000} ARA`;
        }
        break;
      case 'treasury':
        if (method === 'Deposit') {
          return '-';
        }
        break;
      case 'organization':
        if (method === 'OrganizationUpdated') {
          return `Org: ${data[0]}`;
        } else if (method === 'MemberAdded') {
          const org = data.shift();
          return `Org: ${org}, Members: ${data.join(', ')}`;
        } else if (method === 'OrganizationAdded') {
          return `Org: ${data[0]}, Owner: ${data[1]}`;
        }
        break;
      default:
        return '-';
    } 
  }

}

export default {
  components,
  data,
  created,
  methods
}