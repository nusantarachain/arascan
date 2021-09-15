import Icon from '~/components/Icon/index.vue'

const components = {
  AIcon: Icon
}

const props = {
  title: {
    type: String,
    default: 'Title',
    required: true
  },
  link: {
    type: String,
    default: '/',
    required: false
  }
}

export default {
  components,
  props
}