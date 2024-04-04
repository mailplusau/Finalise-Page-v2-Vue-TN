<template>
    <b-card border-variant="primary" bg-variant="transparent" class="mt-3" v-if="$store.getters['callCenterMode']">
        <div class="row justify-content-center" >
            <div class="col-12">
                <h1 class="text-center mp-header">Activity Notes</h1>
            </div>

            <b-table :items="salesActivities" :fields="salesActivitiesColumns" head-row-variant="light" striped show-empty>
                <template v-slot:empty>
                    No Sales Activity Recorded
                </template>

                <template v-slot:table-busy>
                    <div class="text-center text-danger my-2">
                        <b-spinner class="align-middle mx-2"></b-spinner>
                        <strong>Loading...</strong>
                    </div>
                </template>
            </b-table>
        </div>
    </b-card>
</template>

<script>
export default {
    name: "ActivityNotes",
    data: () => ({
        salesActivitiesColumns: [
            {key: 'createddate', label: 'Created Date'},
            {key: 'completeddate', label: 'Completed Date'},
            {key: 'custevent_organiser_text', label: 'Organiser'},
            {key: 'title', label: 'Title'},
            {key: 'message', label: 'Message'},
        ]
    }),
    computed: {
        salesActivities() {
            return this.$store.getters['extra-info/salesNotes'].salesActivities;
        },
    }
};
</script>

<style scoped>

</style>