import Dashboard from '~/layouts/dashboard/index.vue'
import Icon from '~/components/Icon/index.vue'
import Tabs from '~/components/Tabs/index.vue'

const components = {
  Dashboard,
  AIcon: Icon,
  Tabs
}

const data = function() {
  return {
    currentTab: 1,
    tabs: [
      {
        title: 'Extrinsics',
        count: 3
      },
      {
        title: 'Comments',
        count: 0
      }
    ],
    extrinsics: [
      {
        id: '53411-1',
        hash: '',
        time: '3 mins ago',
        result: true,
        action: 'balances.transfer',
        from: '5EXAEQ2n9dfRZ2GvMkYrJ...',
        to: '5EXAEQ2n9dfRZ2GvMkYrJ...',
        amount: '100 ARA',
        expand: false
      },
      {
        id: '53411-2',
        hash: '',
        time: '4 mins ago',
        result: true,
        action: 'balances.transfer',
        from: '5EXAEQ2n9dfRZ2GvMkYrJ...',
        to: '5EXAEQ2n9dfRZ2GvMkYrJ...',
        amount: '100 ARA',
        expand: false
      },
      {
        id: '53411-1',
        hash: '',
        time: '3 mins ago',
        result: true,
        action: 'balances.transfer',
        from: '5EXAEQ2n9dfRZ2GvMkYrJ...',
        to: '5EXAEQ2n9dfRZ2GvMkYrJ...',
        amount: '100 ARA',
        expand: false
      },
      {
        id: '53411-2',
        hash: '',
        time: '4 mins ago',
        result: true,
        action: 'balances.transfer',
        from: '5EXAEQ2n9dfRZ2GvMkYrJ...',
        to: '5EXAEQ2n9dfRZ2GvMkYrJ...',
        amount: '100 ARA',
        expand: false
      }
    ]
  }
}

export default {
  components,
  data
}