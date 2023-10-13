<template>
    <b-card border-variant="primary" bg-variant="transparent" class="mt-3"
            v-if="$store.getters['lpo-info/isLPO'] && $store.getters['callCenterMode']">
        <div class="col-12 mt-3">
            <h1 class="text-center mp-header">Photos of the business</h1>
        </div>
        <b-col cols="12">
            <div class="row">
                <div class="col-12" v-if="$store.getters['customer/photos'].busy">
                    <h2 class="text-center">Retrieving photos...</h2>
                </div>
                <div class="col-12" v-else-if="!$store.getters['customer/photos'].data.length">
                    <h2 class="text-center">No photo found</h2>
                </div>
                <div v-for="image in $store.getters['customer/photos'].data" :key="image.id" class="col-lg-4 col-md-6 col-12">
                    <a :href="image.url" target="_blank">
                        <b-img :src="image.url" :alt="image.name" fluid></b-img>
                    </a>
                </div>
            </div>
        </b-col>
    </b-card>
</template>

<script>
export default {
    name: "Photos"
};
</script>

<style scoped>

</style>