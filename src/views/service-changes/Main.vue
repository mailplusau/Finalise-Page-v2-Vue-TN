<template>
    <b-card border-variant="primary" bg-variant="transparent" class="mt-3" v-if="!$store.getters['callCenterMode']">
        <div class="row justify-content-center" >
            <div class="col-12">
                <h1 class="text-center mp-header">Service Changes</h1>
            </div>

            <b-table :items="serviceChanges" :fields="serviceChangeColumns" head-row-variant="light" striped show-empty>
                <template v-slot:empty>
                    No Service Change Found
                </template>

                <template v-slot:table-busy>
                    <div class="text-center text-danger my-2">
                        <b-spinner class="align-middle mx-2"></b-spinner>
                        <strong>Loading...</strong>
                    </div>
                </template>
            </b-table>

            <b-col cols="12">
                <b-button v-if="$store.getters['comm-reg/id']" variant="primary" @click="goToServiceChangePage" :disabled="busy" size="sm">
                    Create & Update Service Changes <b-icon icon="box-arrow-up-right" scale=".6"></b-icon>
                </b-button>
                <b-button v-else variant="outline-primary" size="sm" disabled>
                    Please create a Commencement Register first
                </b-button>
            </b-col>
        </div>
    </b-card>
</template>

<script>
export default {
    name: "Main",
    data: () => ({
        serviceChangeColumns: [
            {key: 'serviceText', label: 'Service Name'},
            {key: 'serviceDescription', label: 'Description'},
            {key: 'dateEffective', label: 'Effective Date'},
            {key: 'oldServicePrice', label: 'Old Price'},
            {key: 'newServiceChangePrice', label: 'New Price'},
            {key: 'serviceChangeFreqText', label: 'Frequency'},
        ]
    }),
    methods: {
        goToServiceChangePage() {
            this.$store.dispatch('service-changes/goToServiceChangePage')
        }
    },
    computed: {
        serviceChanges() {
            return this.$store.getters['service-changes/all'];
        },
        busy() {
            return this.$store.getters['service-changes/busy'];
        }
    }
}
</script>

<style scoped>

</style>