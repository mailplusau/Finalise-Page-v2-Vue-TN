<template>
    <b-tab>
        <template v-slot:title>
            <span :class="formDisabled ? '' : 'unsaved-header'">Sales Notes</span>
        </template>
        <b-row>
            <b-col cols="12" class="mb-3">
                <b-form-group
                    class="text-start"
                    label="Pricing Notes:"
                    description=""
                >
                    <b-form-textarea v-model="form.custentity_customer_pricing_notes" rows="3" no-resize :disabled="formDisabled || busy" ref="pricingNoteTextarea"></b-form-textarea>
                </b-form-group>
            </b-col>
            <b-col cols="12" class="mb-4">
                <b-button @click="editForm" v-if="formDisabled" size="sm" :disabled="busy" variant="outline-primary">Edit Pricing Notes</b-button>
                <template v-else>
                    <b-button @click="resetForm" size="sm" class="mx-2" :disabled="busy">Reset</b-button>
                    <b-button @click="cancelEditing" size="sm" class="mx-2" :disabled="busy" variant="outline-danger">Cancel</b-button>
                    <b-button @click="saveForm" size="sm" class="mx-2" :disabled="busy" variant="outline-success">Save</b-button>
                </template>
            </b-col>



            <div class="col-12 mb-4">
                <h2>Activity Notes</h2>

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
        </b-row>
    </b-tab>
</template>

<script>
export default {
    name: "SalesNotesTab",
    data: () => ({
        salesActivitiesColumns: [
            {key: 'createddate', label: 'Created Date'},
            {key: 'completeddate', label: 'Completed Date'},
            {key: 'custevent_organiser_text', label: 'Organiser'},
            {key: 'title', label: 'Title'},
            {key: 'message', label: 'Message'},
        ]
    }),
    methods: {
        editForm() {
            this.$store.commit('extra-info/disableSalesNotesForm', false);
        },
        resetForm() {
            this.$store.commit('extra-info/resetSalesNotesForm');
        },
        cancelEditing() {
            this.$store.commit('extra-info/disableSalesNotesForm');
            this.$store.commit('extra-info/resetSalesNotesForm');
        },
        saveForm() {
            this.$store.commit('extra-info/disableSalesNotesForm');
            this.$store.dispatch('extra-info/savePricingNote');
        },
    },
    computed: {
        form() {
            return this.$store.getters['extra-info/salesNotes'].form;
        },
        formDisabled() {
            return this.$store.getters['extra-info/salesNotes'].formDisabled;
        },
        busy() {
            return this.$store.getters['extra-info/salesNotes'].busy;
        },
        salesActivities() {
            return this.$store.getters['extra-info/salesNotes'].salesActivities;
        },
    }
}
</script>

<style scoped>

</style>