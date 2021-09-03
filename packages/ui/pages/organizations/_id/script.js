import Dashboard from '~/layouts/dashboard/index.vue'
import Icon from '~/components/Icon/index.vue'
import ApiService from "~/modules/arascan";
import { Nuchain, WsProvider } from "nuchain-api";

Object.assign(String.prototype, {
  shorty() {
      return this.slice(0, 5) + '...' + this.slice(-5);
  }
});

const components = {
  Dashboard,
  AIcon: Icon
}

const data = function() {
  return {
    org: {
      name: "",
      address: "",
      pic: "",
      description: "",
      email: "",
      website: "",
      balance: "0 ARA",
      admin: { _id: "" },
      members: []
    }
  }
}

const created = function() {
  Nuchain.connectApi({provider: new WsProvider(process.env.NUCHAIN_WS_SOCKET_URL)})
    .then((api) => {
      return api.query.organization.members(this.$route.params.id)
        .then((result) => {
          console.log(result.toJSON());
        });
    })
    .catch((e) => {
      console.log(e);
    });

  this.fetchOrganization(this.$route.params.id);
}

const methods = {
  fetchOrganization(addr) {
    return ApiService.getOrganization(addr)
      .then((response) => {
          const organization = response.data.result;
          console.log(organization);
          this.org = {
            name: organization.name,
            address: organization.id,
            pic: "~/assets/images/image-avatar-org.svg",
            description: organization.description,
            email: organization.email,
            website: organization.website,
            balance: "0 ARA",
            admin: organization.admin,
            members: organization.members
          }
      })
      .catch((e) => {
          console.log(e);
      });
  },
}

export default {
  components,
  data,
  created,
  methods
}