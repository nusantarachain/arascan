import Icon from '~/components/Icon/index.vue'

const components = {
  AIcon: Icon
}

const props = {
  title: {
    type: String,
    default: 'Title',
    required: true
  }
}

export default {
  components,
  props
}