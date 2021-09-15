const props = {
  type: {
    type: String
  },
  error: {
    type: Boolean,
    default: false
  }
}

const computed = {
  arascanInputClass() {
    const classes = []

    if (this.type) {
      classes.push(`input--${this.type}`)
    }

    if (this.error) {
      classes.push(`input--error`)
    }

    return classes
  }
}

export default {
  props,
  computed
}
