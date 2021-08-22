import SVGIcon from 'vue-svgicon'

const components = {
  SVGIcon
}

const props = {
  type: {
    type: String,
    required: true
  },
  fill: {
    type: String
  },
  color: {
    type: String
  },
  alt: {
    type: String,
    required: true
  },
  size: {
    type: String
  },
  original: {
    type: Boolean
  }
}

const data = function() {
  return {
    iconPath: './src'
  }
}

const mounted = function() {
  require(`${this.iconPath}/icon-${this.type}.js`)
}

/* eslint-disable */
const computed = {
  iconClass: function () {
    const icClass = [];
    if(this.size) {
      icClass.push(`sertiva-icon--${this.size}`)
    }

    if(this.fill) {
      icClass.push(`sertiva-icon--${this.fill}`)
    }

    return icClass;
  },
  name: function () {
    return `icon-${this.type}`
  }
}

const watch = {
  type: function(newIcon) {
    require(`${this.iconPath}/icon-${newIcon}.js`)
  }
}
/* eslint-enable */

export default {
  components,
  props,
  data,
  mounted,
  computed,
  watch
}
