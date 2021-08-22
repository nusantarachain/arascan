import Icon from '~/components/Icon/index.vue'

const components = {
  AIcon: Icon
}

const props = {
  icon: {
    type: String,
    default: 'block',
    required: true
  },
  title: {
    type: String,
    default: 'Title',
    required: true
  },
  value: {
    type: [String, Number],
    default: 'value',
    required: true
  }
}

export default {
  components,
  props
}