<template lang="pug">
  span {{ value }} ARA
</template>

<script>
export default {
  props: {
    'value': {type: String, required: true}
  }
}
</script>