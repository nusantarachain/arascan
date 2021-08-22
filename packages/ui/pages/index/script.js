import Dashboard from '~/layouts/dashboard/index.vue'
import WidgedBlock from '~/components/WidgetBlock/index.vue'
import WidgedList from '~/components/WidgetList/index.vue'
import Icon from '~/components/Icon/index.vue'
import LineChart from '~/components/LineChart/index.js'

const components = {
  Dashboard,
  WidgedBlock,
  WidgedList,
  AIcon: Icon,
  LineChart
}

const data = function() {
  return {
    overviews: [
      {
        icon: 'users',
        title: 'Organizations',
        value: 30
      },
      {
        icon: 'user',
        title: 'Accounts',
        value: 246
      },
      {
        icon: 'box',
        title: 'Products',
        value: 3.000
      },
      {
        icon: 'calendar-check',
        title: 'Events',
        value: 18.958
      },
      {
        icon: 'certificate',
        title: 'Certificates',
        value: 4.597
      },
      {
        icon: 'nodes',
        title: 'Nodes',
        value: 1.085
      },
      {
        icon: 'blocks',
        title: 'Validators',
        value: 49
      },
      {
        icon: 'runtime',
        title: 'Runtime Version',
        value: 7
      }
    ],
    chartData: {
      labels: ['2020', '', '', '2021', '', '', ''],
      datasets: [
        {
          label: 'Blocks',
          borderWidth: 2,
          borderColor: '#219436',
          backgroundColor: '#EEF9F2',
          pointColor: '#219436',
          pointStrokeColor: '#219436',
          pointHighlightFill: '#219436',
          pointHighlightStroke: '#219436',
          data: [100, 350, 330, 250, 270, 270, 220]
        }
      ]
    },
    blocks: [
      {
        icon: 'block',
        title: 'Best',
        value: '2.594.043'
      },
      {
        icon: 'block',
        title: 'Finalized',
        value: '2.454.655'
      }
    ],
    recentEvents: [
      {
        id: Math.random().toString(36).substring(2,7),
        title: '#2307643',
        subtitle: 'Transfer',
        time: '3s ago'
      },
      {
        id: Math.random().toString(36).substring(2,7),
        title: '#2307643',
        subtitle: 'Product Tracked',
        time: '3s ago'
      }
    ],
    latestBlocks: [
      {
        id: Math.random().toString(36).substring(2,7),
        title: '#2307643',
        extrinsil: '3 Extrinsil',
        event: '5 Events',
        time: '3s ago'
      },
      {
        id: Math.random().toString(36).substring(2,7),
        title: '#2307643',
        extrinsil: '3 Extrinsil',
        event: '5 Events',
        time: '3s ago'
      },
      {
        id: Math.random().toString(36).substring(2,7),
        title: '#2307643',
        extrinsil: '3 Extrinsil',
        event: '5 Events',
        time: '3s ago'
      },
      {
        id: Math.random().toString(36).substring(2,7),
        title: '#2307643',
        extrinsil: '3 Extrinsil',
        event: '5 Events',
        time: '3s ago'
      }
    ]
  }
}

const methods = {
  addEvents() {
    this.recentEvents.unshift({
      id: Math.random().toString(36).substring(2,7),
      title: Math.random().toString(36).substring(2,7),
      subtitle: Math.random().toString(36).substring(2,7),
      time: `${Math.floor(Math.random() * 10)}s ago`
    })
  },
  addBlocks() {
    this.latestBlocks.unshift({
      id: Math.random().toString(36).substring(2,7),
      title: Math.random().toString(36).substring(2,7),
      extrinsil: `${Math.floor(Math.random() * 10)} Extrinsil`,
      event: `${Math.floor(Math.random() * 10)} Events`,
      time: `${Math.floor(Math.random() * 10)}s ago`
    })
  }
}

export default {
  components,
  data,
  methods
}