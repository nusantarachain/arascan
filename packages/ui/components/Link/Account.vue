<template lang="pug">
    NuxtLink.link.address(:to="`/accounts/${id}`") {{ id }}
</template>


<script>
export default {
    props: {
        'id': {type: String, required: true}
    }
}
</script>

