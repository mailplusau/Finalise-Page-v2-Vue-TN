<template>
    <b-tab title="Current Services">
        <b-row>
            <div class="col-12 mb-4">
                <h2>Franchisee Entered Service Details</h2>
            </div>
            <div class="col-6 mb-4">
                <b-input-group prepend="AMPO Price">
                    <b-form-input v-model="form.custentity_ampo_service_price" type="number" step="0.01"
                                  :disabled="formDisabled || busy"></b-form-input>
                </b-input-group>
            </div>
            <div class="col-6 mb-4">
                <b-input-group prepend="AMPO Time">
                    <b-form-select v-model="form.custentity_ampo_service_time" :options="serviceTimeOptions"
                                   :disabled="formDisabled || busy"></b-form-select>
                </b-input-group>
            </div>
            <div class="col-6 mb-4">
                <b-input-group prepend="PMPO Price">
                    <b-form-input v-model="form.custentity_pmpo_service_price" type="number" step="0.01"
                                  :disabled="formDisabled || busy"></b-form-input>
                </b-input-group>
            </div>
            <div class="col-6 mb-4">
                <b-input-group prepend="PMPO Time">
                    <b-form-select v-model="form.custentity_pmpo_service_time" :options="serviceTimeOptions"
                                   :disabled="formDisabled || busy"></b-form-select>
                </b-input-group>
            </div>
            <div class="col-12 mb-4">
                <div class="col-12">
                    <b-button @click="editForm" v-if="formDisabled" size="sm" :disabled="busy" variant="outline-primary">Edit Service Details</b-button>
                    <template v-else>
                        <b-button @click="resetForm" size="sm" class="mx-2" :disabled="busy">Reset</b-button>
                        <b-button @click="cancelEditing" size="sm" class="mx-2" :disabled="busy" variant="outline-danger">Cancel</b-button>
                        <b-button @click="saveForm" size="sm" class="mx-2" :disabled="busy" variant="outline-success">Save</b-button>
                    </template>
                </div>
            </div>


            <div class="col-12 mb-4">
                <h2>Current Service Performed</h2>

                <b-table :items="servicePerformed" :fields="serviceColumns" head-row-variant="light" striped show-empty>
                    <template v-slot:empty>
                        No Service Performed
                    </template>

                    <template v-slot:table-busy>
                        <div class="text-center text-danger my-2">
                            <b-spinner class="align-middle mx-2"></b-spinner>
                            <strong>Loading...</strong>
                        </div>
                    </template>

                    <template v-slot:cell(name)="{item}">
                        <b-input-group>
                            <b-form-select v-model="item.custrecord_service" :options="serviceTypes" size="sm" disabled></b-form-select>
                        </b-input-group>
                    </template>

                    <template v-slot:cell(desc)="{item}">
                        <input type="text" class="form-control-sm text-center" v-model="item.custrecord_service_description" disabled>
                    </template>

                    <template v-slot:cell(price)="{item}">
                        <input type="text" class="form-control-sm text-center" v-model="item.custrecord_service_price" disabled>
                    </template>

                    <template v-slot:cell(mon)="{item}">
                        <b-icon :icon="item.custrecord_service_day_mon ? 'check-lg' : 'x-lg'"
                                :variant="item.custrecord_service_day_mon ? 'success' : 'danger'"></b-icon>
                    </template>

                    <template v-slot:cell(tue)="{item}">
                        <b-icon :icon="item.custrecord_service_day_tue ? 'check-lg' : 'x-lg'"
                                :variant="item.custrecord_service_day_tue ? 'success' : 'danger'"></b-icon>
                    </template>

                    <template v-slot:cell(wed)="{item}">
                        <b-icon :icon="item.custrecord_service_day_wed ? 'check-lg' : 'x-lg'"
                                :variant="item.custrecord_service_day_wed ? 'success' : 'danger'"></b-icon>
                    </template>

                    <template v-slot:cell(thu)="{item}">
                        <b-icon :icon="item.custrecord_service_day_thu ? 'check-lg' : 'x-lg'"
                                :variant="item.custrecord_service_day_thu ? 'success' : 'danger'"></b-icon>
                    </template>

                    <template v-slot:cell(fri)="{item}">
                        <b-icon :icon="item.custrecord_service_day_fri ? 'check-lg' : 'x-lg'"
                                :variant="item.custrecord_service_day_fri ? 'success' : 'danger'"></b-icon>
                    </template>

                    <template v-slot:cell(adhoc)="{item}">
                        <b-icon :icon="item.custrecord_service_day_adhoc ? 'check-lg' : 'x-lg'"
                                :variant="item.custrecord_service_day_adhoc ? 'success' : 'danger'"></b-icon>
                    </template>
                </b-table>
            </div>
        </b-row>
    </b-tab>
</template>

<script>
export default {
    name: "CurrentServicesTab",
    data: () => ({
        serviceColumns: [
            {key: 'name', label: 'Name'},
            {key: 'desc', label: 'Description'},
            {key: 'price', label: 'Price'},
            {key: 'mon', label: 'Monday'},
            {key: 'tue', label: 'Tuesday'},
            {key: 'wed', label: 'Wednesday'},
            {key: 'thu', label: 'Thursday'},
            {key: 'fri', label: 'Friday'},
            {key: 'adhoc', label: 'Adhoc'},
        ],
    }),
    methods: {
        editForm() {
            this.$store.commit('extra-info/disableCurrentServicesForm', false);
        },
        resetForm() {
            this.$store.commit('extra-info/resetCurrentServicesForm');
        },
        cancelEditing() {
            this.$store.commit('extra-info/disableCurrentServicesForm');
            this.$store.commit('extra-info/resetCurrentServicesForm');
        },
        saveForm() {
            this.$store.commit('extra-info/disableCurrentServicesForm');
            this.$store.dispatch('extra-info/saveServiceDetails');
        },
    },
    computed: {
        form() {
            return this.$store.getters['extra-info/currentServices'].form;
        },
        formDisabled() {
            return this.$store.getters['extra-info/currentServices'].formDisabled;
        },
        busy() {
            return this.$store.getters['extra-info/currentServices'].busy;
        },
        serviceTimeOptions() {
            return this.$store.getters['extra-info/currentServices'].serviceTimeOptions;
        },
        serviceTypes() {
            return this.$store.getters['extra-info/currentServices'].serviceTypes;
        },
        servicePerformed() {
            return this.$store.getters['extra-info/currentServices'].servicePerformed;
        },
    }
}
</script>

<style scoped>

</style>