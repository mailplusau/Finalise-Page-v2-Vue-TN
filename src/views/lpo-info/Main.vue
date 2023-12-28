<template>
    <b-card border-variant="primary" bg-variant="transparent" class="mt-3"
            v-if="$store.getters['lpo-info/isLPO'] && $store.getters['callCenterMode']">
        <div class="row justify-content-center" >
            <div class="col-12">
                <h1 class="text-center mp-header">LPO Validation</h1>
            </div>

            <div class="col-6 mb-4">
                <b-input-group prepend="Parent LPO">
                    <b-form-select :options="$store.getters['lpo-info/parentLpoOptions']" v-model="form.custentity_lpo_parent_account"
                                   v-validate="'required'" data-vv-name="parent_lpo"
                                   :class="errors.has('parent_lpo') ? 'is-invalid' : ''"
                                   :disabled="formDisabled"></b-form-select>

                    <b-form-invalid-feedback :state="!errors.has('parent_lpo')">{{ errors.first('parent_lpo') }}</b-form-invalid-feedback>
                </b-input-group>
            </div>

            <div class="col-6 mb-4">
                <b-input-group prepend="Invoice Payment Method">
                    <b-form-select :options="$store.getters['lpo-info/invoiceMethodOptions']"
                                   v-model="form.custentity_invoice_method"
                                   :disabled="formDisabled"
                                   v-validate="'required'" data-vv-name="invoice_method"
                                   :class="errors.has('invoice_method') ? 'is-invalid' : ''"
                                   @change="$store.commit('lpo-info/handleInvoiceMethodChanged')"></b-form-select>

                    <b-form-invalid-feedback :state="!errors.has('invoice_method')">{{ errors.first('invoice_method') }}</b-form-invalid-feedback>
                </b-input-group>
            </div>

            <div class="col-6 mb-4">
                <b-input-group prepend="MyPost Business Number">
                    <b-form-input v-model="form.custentity_mypost_business_number" v-validate="''" data-vv-name="mypost_business_number"
                                  :class="errors.has('mypost_business_number') ? 'is-invalid' : ''" :disabled="formDisabled"></b-form-input>

                    <b-form-invalid-feedback :state="!errors.has('company_name')">{{ errors.first('mypost_business_number') }}</b-form-invalid-feedback>
                </b-input-group>
            </div>

            <div class="col-6 mb-4">
                <b-input-group prepend="Profile Assigned">
                    <b-form-select :options="$store.getters['lpo-info/lpoProfileOptions']"
                                   v-model="form.custentity_lpo_profile_assigned"
                                   :disabled="formDisabled"
                                   v-validate="''" data-vv-name="profile_assigned"
                                   :class="errors.has('profile_assigned') ? 'is-invalid' : ''"></b-form-select>

                    <b-form-invalid-feedback :state="!errors.has('profile_assigned')">{{ errors.first('profile_assigned') }}</b-form-invalid-feedback>
                </b-input-group>
            </div>

            <div class="col-6 mb-4">
                <b-input-group prepend="Account Type">
                    <b-form-select :options="$store.getters['lpo-info/lpoAccountTypes']"
                                   v-model="form.custentity_lpo_account_type_linked"
                                   :disabled="formDisabled"
                                   v-validate="''" data-vv-name="lpo_account_type"
                                   :class="errors.has('lpo_account_type') ? 'is-invalid' : ''"></b-form-select>

                    <b-form-invalid-feedback :state="!errors.has('lpo_account_type')">{{ errors.first('lpo_account_type') }}</b-form-invalid-feedback>
                </b-input-group>
            </div>

            <div class="col-6 mb-4">
                <b-input-group prepend="Lead Priority">
                    <b-form-select :options="$store.getters['lpo-info/leadPriorityOptions']"
                                   v-model="form.custentity_lpo_lead_priority"
                                   :disabled="formDisabled"
                                   v-validate="''" data-vv-name="lead_priority"
                                   :class="errors.has('lead_priority') ? 'is-invalid' : ''"></b-form-select>

                    <b-form-invalid-feedback :state="!errors.has('lead_priority')">{{ errors.first('lead_priority') }}</b-form-invalid-feedback>
                </b-input-group>
            </div>

            <div class="col-6 mb-4">
                <b-input-group prepend="Previous Carrier">
                    <b-form-select :options="$store.getters['misc/carrierList']"
                                   v-model="form.custentity_previous_carrier"
                                   :disabled="formDisabled" multiple
                                   v-validate="''" data-vv-name="previous_carrier"
                                   :class="errors.has('previous_carrier') ? 'is-invalid' : ''"></b-form-select>

                    <b-form-invalid-feedback :state="!errors.has('previous_carrier')">{{ errors.first('previous_carrier') }}</b-form-invalid-feedback>
                </b-input-group>
            </div>

            <div class="col-6 mb-4">
                <b-input-group prepend="Account Status">
                    <b-form-select :options="$store.getters['misc/lpoAccountStatus']"
                                   v-model="form.custentity_lpo_account_status"
                                   :disabled="formDisabled"
                                   v-validate="''" data-vv-name="account_status"
                                   :class="errors.has('account_status') ? 'is-invalid' : ''"></b-form-select>

                    <b-form-invalid-feedback :state="!errors.has('account_status')">{{ errors.first('account_status') }}</b-form-invalid-feedback>
                </b-input-group>
            </div>

            <div class="col-12 mb-4">
                <b-input-group prepend="Date of Last Sale Activity">
                    <b-form-datepicker v-model="form.custentity_lpo_date_last_sales_activity" value-as-date
                                       :disabled="formDisabled"
                                       v-validate="''" data-vv-name="date_last_sales_activity"
                                       :class="errors.has('date_last_sales_activity') ? 'is-invalid' : ''"
                    ></b-form-datepicker>

                    <b-form-invalid-feedback :state="!errors.has('date_last_sales_activity')">{{ errors.first('date_last_sales_activity') }}</b-form-invalid-feedback>
                </b-input-group>
            </div>
            <div class="col-12 mb-4">
                <p class="textarea-label">LPO Note:</p>
                <b-form-group
                    class="text-start"
                    description=""
                >
                    <b-form-textarea v-model="form.custentity_lpo_notes" rows="3" no-resize :disabled="formDisabled"></b-form-textarea>
                </b-form-group>
            </div>

            <div class="col-12">
                <b-button @click="editForm" v-if="formDisabled" size="sm" :disabled="busy" variant="outline-primary">Edit LPO Information</b-button>
                <template v-else>
                    <b-button @click="resetForm" size="sm" class="mx-2" :disabled="busy">Reset</b-button>
                    <b-button @click="cancelEditing" size="sm" class="mx-2" :disabled="busy" variant="outline-danger">Cancel</b-button>
                    <b-button @click="saveForm" size="sm" class="mx-2" :disabled="busy" variant="outline-success">Save</b-button>
                </template>
            </div>
        </div>
    </b-card>
</template>

<script>
export default {
    name: "Main",
    data: () => ({

    }),
    methods: {
        editForm() {
            this.$store.commit('lpo-info/disableForm', false);
        },
        resetForm() {
            this.$store.commit('lpo-info/resetForm');
            this.$validator.reset();
        },
        cancelEditing() {
            this.$store.commit('lpo-info/resetForm');
            this.$store.commit('lpo-info/disableForm');
            this.$validator.reset();
        },
        saveForm() {
            this.$validator.validateAll().then((result) => {
                if (result) {
                    console.log('Form Submitted!');
                    this.$store.dispatch('lpo-info/saveLPOInfo');
                } else console.log('Correct them errors!');
            });
        }
    },
    computed: {
        form() {
            return this.$store.getters['lpo-info/form'].data;
        },
        busy() {
            return this.$store.getters['lpo-info/form'].busy;
        },
        formDisabled() {
            return this.$store.getters['lpo-info/form'].disabled;
        },
    }
};
</script>

<style scoped>
.textarea-label {
    text-align: left;
    font-size: 1rem;
    margin: 0;
}
</style>