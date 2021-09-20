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
    accounts: [{address:"su"}],
    search: ''
  }
}

const created = function() {
  ApiService.setBaseUrl(this.$config.apiUrl);
  this.fetchAccounts();
}

const methods = {
  fetchAccounts() {
    return ApiService.getAccounts({ limit: 10 })
      .then((response) => {
        const accounts = response.data.entries;
        this.accounts = accounts.map(x => ({
            name: x.identity != undefined ? x.identity.display : x._id,
            balance: x.balance.free / 10000000000,
            address: x._id,
            link: `/accounts/${x._id}`
        }));
      })
      .catch((e) => {
          console.log(e);
      });
  },

  donothing() {
    //
  },

  searchAccounts(e) {
    if (e.keyCode === 13) {
      return ApiService.getAccounts({ search: this.search, limit: 10 })
        .then((response) => {
          const accounts = response.data.entries;
          this.accounts = accounts.map(x => ({
              name: x.identity != undefined ? x.identity.display : x._id,
              balance: x.balance.free,
              address: x._id,
              link: `/accounts/${x._id}`
          }));
        })
        .catch((e) => {
            console.log(e);
        });
    }
  }

}

export default {
  components,
  data,
  created,
  methods
}