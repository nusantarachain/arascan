<template lang="pug">
    NuxtLink.link(:to="link") {{ orgId }}
</template>


<script>
export default {
    props: {
        'orgId': {type: String, required: true}
    },
    data(){
        return {
            link: `${this.$config.baseUrl}/${this.orgId}`
        }
    }
}
</script>

