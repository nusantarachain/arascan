import Icon from '~/components/Icon/index.vue'
import Input from '~/components/Input/index.vue'
import { isHex } from '@polkadot/util'

import ApiService from "~/modules/arascan";

const components = {
  AIcon: Icon,
  AInput: Input
}

const data = function() {
  return {
    search: '',
    searchError: '',
  }
}

const methods = {

  donothing() {
    //
  },

  searchAll(e) {
    if (e.keyCode === 13) {
      if (this.search.indexOf('5') === 0) {
        ApiService.getOrganization(this.search)
          .then((response) => {
            if (response.data.result) {
              this.$router.push({ path: `/organizations/${this.search}` }, () => { location.reload(); });
            } else {
              ApiService.getAccount(this.search)
                .then((response) => {
                  if (response.data.result) {
                    this.$router.push({ path: `/accounts/${this.search}` }, () => { location.reload(); });
                  } else {
                    this.searchNotFound("Block / hash / account / organization not found!");
                  }
                })
                .catch((e) => {
                  console.log(e);
                });
            }
          })
          .catch((e) => {
            console.log(e);
          });
      } else if (this.search.indexOf('#') === 0) {
        this.search = this.search.slice(1);
        ApiService.getBlock(this.search)
          .then((response) => {
            if (response.data.result) {
              this.$router.push({ path: `/blocks/${this.search}` }, () => { location.reload(); });
            } else {
              this.searchNotFound("Block / hash / account / organization not found!");
            }
          })
          .catch((e) => {
            console.log(e);
          });
      } else if(isHex(this.search)) {
        ApiService.getBlock(this.search)
          .then((response) => {
            if (response.data.result) {
              this.$router.push({ path: `/blocks/${response.data.result._id}` }, () => { location.reload(); });
            } else {
              this.searchNotFound("Block / hash / account / organization not found!");
            }
          })
          .catch((e) => {
            console.log(e);
          });
      } else {
        this.searchNotFound("Block / hash / account / organization not found!");
      }
    }
  },

  searchNotFound(message) {
    this.search = message;
    this.searchError = "error";
    setTimeout(() => {
      this.search = '';
      this.searchError = '';
    }, 2000);
  }

}

export default {
  components,
  data,
  methods
}
