import { Nuchain, WsProvider } from "nuchain-api";

import Dashboard from '~/layouts/dashboard/index.vue'
import Icon from '~/components/Icon/index.vue'
import Identicon from '~/components/Identicon/index.vue'
import ApiService from "~/modules/arascan";

Object.assign(String.prototype, {
  shorty() {
      return this.slice(0, 5) + '...' + this.slice(-5);
  }
});

const components = {
  Dashboard,
  AIcon: Icon,
  Identicon
}

const data = function() {
  return {
    isAvailable: false,
    org: {
      name: "",
      address: "",
      pic: "",
      description: "",
      email: "",
      website: "",
      balance: "_ ARA",
      admin: { _id: "" },
      members: []
    }
  }
}

const mounted = function() {
  ApiService.setBaseUrl(this.$config.apiUrl);
  this.fetchOrganization(this.$route.params.id);
  this.fetchBalance(this.$route.params.id);
}

const methods = {
  fetchOrganization(addr) {
    return ApiService.getOrganization(addr)
      .then((response) => {
          const organization = response.data.result;
          this.org = {
            name: organization.name,
            address: organization.id,
            pic: "~/assets/images/image-avatar-org.svg",
            description: organization.description,
            email: organization.email,
            website: organization.website,
            balance: "_ ARA",
            admin: organization.admin,
            members: organization.members
          };

          this.isAvailable = true;
      })
      .catch((e) => {
          console.log(e);
      });
  },

  fetchBalance(addr) {
    Nuchain.connectApi({provider: new WsProvider(this.$config.nuchainSocketUrl)})
      .then((api) => {
        api.query.system.account(addr)
          .then((result) => {
            this.org.balance = `${(result.data.free / 10000000000).toFixed(4)} ARA`
          });
      })
      .catch((e) => {
        console.log(e);
      });
  },

  copyToClipboard() {
    if (!navigator.clipboard) {
      return;
    }

    navigator.clipboard.writeText(this.org.address).then(() => {
      let clip = document.querySelector(".tooltip");
      let tailIcon = document.querySelector("#icon-clipboard");
      clip.classList.add('tooltip-visible');
      tailIcon.classList.add('arascan-icon');
      tailIcon.classList.remove('arascan-icon--gray');
      setTimeout(function(){
        clip.classList.remove('tooltip-visible');
        tailIcon.classList.remove('arascan-icon');
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