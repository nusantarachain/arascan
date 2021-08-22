import Dashboard from '~/layouts/dashboard/index.vue'
import Icon from '~/components/Icon/index.vue'
import Input from '~/components/Input/index.vue'

const components = {
  Dashboard,
  AIcon: Icon,
  AInput: Input
}

const data = function() {
  return {
    organizations: [
      {
        name: 'Rantai Nusantara Fondation',
        desc: 'Nibh accumsan cursus placerat etiam blandit volutpat nisi imperdiet arcu',
        address: '5ERAm...gHK6E1'
      },
      {
        name: 'Universitas Amikom Yogyakarta',
        desc: 'Sit nisl egestas est erat libero, nisl feugiat.',
        address: '5ERAm...gHK6E1'
      },
      {
        name: 'Mercusuar Buana Sejahtera',
        desc: 'Amet donec sollicitudin facilisi ultrices eleifend mattis nullam.',
        address: '5ERAm...gHK6E1'
      },
      {
        name: 'Fastikom UNSIQ',
        desc: 'Feugiat praesent netus tempor tristique in odio ut odio convallis.',
        address: '5ERAm...gHK6E1'
      },
      {
        name: 'Yayasan SAKA',
        desc: 'Ut justo et, sit non risus diam urna, adipiscing.',
        address: '5ERAm...gHK6E1'
      },
      {
        name: 'Rantai Nusantara Fondation',
        desc: 'Mi est maecenas eu etiam sed tellus, massa auctor.',
        address: '5ERAm...gHK6E1'
      },
      {
        name: 'Rantai Nusantara Fondation',
        desc: 'Neque augue cras tellus euismod sit elementum, tellus eu.',
        address: '5ERAm...gHK6E1'
      }
    ]
  }
}

export default {
  components,
  data
}