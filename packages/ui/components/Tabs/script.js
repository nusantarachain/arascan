const props = {
  tabs: {
    type: Array,
    required: true,
    default() {
      return []
    }
  },
  value: {
    type: [String, Number],
    required: true
  }
}

const methods = {
  gotoTab(tab) {
    this.$emit('input', tab)
  }
}

export default {
  props,
  methods
}