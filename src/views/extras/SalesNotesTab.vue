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

        </b-row>
    </b-tab>
</template>

<script>
export default {
    name: "SalesNotesTab",
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
    }
}
</script>

<style scoped>

</style>