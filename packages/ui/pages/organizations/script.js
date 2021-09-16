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
    organizations: [],
    search: ''
  }
}

const created = function() {
  ApiService.setBaseUrl(this.$config.apiUrl);
  this.fetchOrganizations();
}

const methods = {
  fetchOrganizations() {
    return ApiService.getOrganizations({ limit: 20 })
      .then((response) => {
          const organizations = response.data.entries;
          this.organizations = organizations.map(x => ({
              name: x.name,
              desc: x.description,
              address: x._id.shorty(),
              link: `/organizations/${x._id}`
          }));
      })
      .catch((e) => {
          console.log(e);
      });
  },

  donothing() {
    //
  },

  searchOrganizations(e) {
    console.log(e.keyCode);
    if (e.keyCode === 13) {
      return ApiService.getOrganizations({ search: this.search })
        .then((response) => {
            const organizations = response.data.entries;
            this.organizations = organizations.map(x => ({
                name: x.name,
                desc: x.description,
                address: x._id.shorty(),
                link: `/organizations/${x._id}`
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