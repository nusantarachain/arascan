<template lang="pug">
    NuxtLink.link(:to="`/organizations/${orgId}`") {{ orgId }}
</template>


<script>
export default {
    props: {
        'orgId': {type: String, required: true}
    }
}
</script>

