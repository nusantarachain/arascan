import moment from "moment";

import Dashboard from '~/layouts/dashboard/index.vue';
import Icon from '~/components/Icon/index.vue';
import Tabs from '~/components/Tabs/index.vue';
import Identicon from '~/components/Identicon/index.vue'

import ApiService from "~/modules/arascan";

const components = {
  Dashboard,
  AIcon: Icon,
  Tabs,
  Identicon
}

const data = function() {
  return {
    isAvailable: false,
    account: {
      address: '',
      balance: { free: 0 }
    },
    currentTab: 1,
    tabs: [
      {
        title: 'Activities',
        count: 0
      },
      {
        title: 'Comments',
        count: 0
      }
    ],
    extrinsics: []
  }
}

const mounted = function() {
  ApiService.setBaseUrl(this.$config.apiUrl);
  this.fetchAccount(this.$route.params.id);
  this.fetchActivities(this.$route.params.id);
}

const methods = {
  fetchAccount(addr) {
    return ApiService.getAccount(addr)
      .then((response) => {
          const account = response.data.result;
          this.account = {
            address: account._id,
            balance: account.balance,
            identity: account.identity
          }
          this.isAvailable = true;
      })
      .catch((e) => {
          console.log(e);
      });
  },

  fetchActivities(addr) {
    return ApiService.getTransfers(addr, { limit: 50 })
      .then((response) => {
          const activities = response.data.entries;
          let countindex = 1;
          let extrinsics = [];
          activities.forEach((act, index) => {
            countindex = index + 1;
            extrinsics.push({
              id: `${act.block}-${act.extrinsic_index}`,
              hash: '-',
              time: moment(act.ts).fromNow(),
              result: true,
              action: 'balances(transfer)',
              from: act.src,
              to: act.dst,
              amount: `${act.amount / 10000000000} ARA`,
              expand: false
            });
          });

          this.extrinsics = extrinsics;
          this.tabs = [
            {
              title: 'Activities',
              count: countindex
            },
            {
              title: 'Comments',
              count: 0
            }
          ];
      })
      .catch((e) => {
          console.log(e);
      });
  },

  copyToClipboard() {
    if (!navigator.clipboard) {
      return;
    }

    navigator.clipboard.writeText(this.account.address).then(() => {
      let clip = document.querySelector(".tooltip");
      let tailIcon = document.querySelector("#icon-clipboard");
      clip.classList.add('tooltip-visible');
      tailIcon.classList.remove('arascan-icon--gray');
      setTimeout(function(){
        clip.classList.remove('tooltip-visible');
        tailIcon.classList.add('arascan-icon--gray');
      }, 1000);
    }, () => {
      console.log("failed");
    });
  }

}

export default {
  components,
  data,
  mounted,
  methods
}