<template>
    <b-card border-variant="primary" bg-variant="transparent" class="my-3" style="padding: 0">
        <b-tabs content-class="mt-3" fill>
            <CurrentServicesTab />
            <b-tab title="MP Products"></b-tab>
            <b-tab title="Sales Notes"></b-tab>
            <b-tab title="Survey Information"></b-tab>
        </b-tabs>
    </b-card>
</template>

<script>
import CurrentServicesTab from "@/views/extras/CurrentServicesTab";
export default {
    name: "Main",
    components: {CurrentServicesTab}
}
</script>

<style scoped>

</style>