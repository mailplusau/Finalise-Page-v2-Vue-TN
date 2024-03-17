<template>
    <b-tab>
        <template v-slot:title>
            <span :class="formDisabled ? '' : 'unsaved-header'">MP Products</span>
        </template>
        <b-row>
            <div class="col-12 mb-4">
                <h2>MPEX Settings</h2>
            </div>
            <div class="col-6 mb-4">
                <b-input-group prepend="Is MPEX Customer?">
                    <b-form-select v-model="form.custentity_mpex_customer" :options="yesNoOptions"
                                   :disabled="formDisabled || busy"></b-form-select>
                </b-input-group>
            </div>
            <div class="col-6 mb-4">
                <b-input-group prepend="Shipping Portal Required?">
                    <b-form-select v-model="form.custentity_portal_training_required" :options="yesNoOptions"
                                   :disabled="formDisabled || busy"></b-form-select>
                </b-input-group>
            </div>
            <div class="col-6 mb-4">
                <b-input-group prepend="Weekly Usage">
                    <b-form-select v-model="form.custentity_form_mpex_usage_per_week" :options="mpExWeeklyUsageOptions"
                                   :disabled="formDisabled || busy"></b-form-select>
                </b-input-group>
            </div>
            <div class="col-6 mb-4">
                <b-input-group prepend="Invoice Cycle">
                    <b-form-select v-model="form.custentity_mpex_invoicing_cycle" :options="invoiceCycles"
                                   :disabled="formDisabled || busy"></b-form-select>
                </b-input-group>
            </div>
            <div class="col-12 mb-4">
                <div class="col-12">
                    <b-button @click="editForm" v-if="formDisabled" size="sm" :disabled="busy" variant="outline-primary">Edit MPEX Settings</b-button>
                    <template v-else>
                        <b-button @click="resetForm" size="sm" class="mx-2" :disabled="busy">Reset</b-button>
                        <b-button @click="cancelEditing" size="sm" class="mx-2" :disabled="busy" variant="outline-danger">Cancel</b-button>
                        <b-button @click="saveForm" size="sm" class="mx-2" :disabled="busy" variant="outline-success">Save</b-button>
                    </template>
                </div>
            </div>


            <div class="col-12 mb-4">
                <h2>Pricing Structure</h2>

                <b-table :items="productPricing" :fields="productPricingColumns" head-row-variant="light" striped show-empty></b-table>
            </div>
            <b-col cols="12" class="mb-4">
<!--                <b-button variant="primary" @click="goToProductPricing" :disabled="busy" size="sm">-->
<!--                    Add/Edit Product Pricing <b-icon icon="box-arrow-up-right" scale=".6"></b-icon>-->
<!--                </b-button>-->
            </b-col>
        </b-row>
    </b-tab>
</template>

<script>
export default {
    name: "MPExProductsTab",
    data: () => ({
        productPricingColumns: [
            {key: 'custrecord_prod_pricing_delivery_speeds_text', label: 'Delivery Speeds'},
            {key: 'custrecord_prod_pricing_pricing_plan_text', label: 'Pricing Plan'},
            {key: 'custrecord_prod_pricing_b4_text', label: 'B4'},
            {key: 'custrecord_prod_pricing_250g_text', label: '250G'},
            {key: 'custrecord_prod_pricing_500g_text', label: '500G'},
            {key: 'custrecord_prod_pricing_1kg_text', label: '1KG'},
            {key: 'custrecord_prod_pricing_3kg_text', label: '3KG'},
            {key: 'custrecord_prod_pricing_5kg_text', label: '5KG'},
            {key: 'custrecord_prod_pricing_10kg_text', label: '10KG'},
            {key: 'custrecord_prod_pricing_20kg_text', label: '20KG'},
            {key: 'custrecord_prod_pricing_25kg_text', label: '25KG'},
        ],
    }),
    methods: {
        goToProductPricing() {
            let url = window['nlapiResolveURL']('SUITELET', 'customscript_sl2_prod_pricing_page', 'customdeploy1');
            url += '&customerid=' + parseInt(this.$store.getters['customerId']);

            window.open(url, "_self",
                "height=750,width=650,modal=yes,alwaysRaised=yes");
        },
        editForm() {
            this.$store.commit('extra-info/disabledMpProductsForm', false);
        },
        resetForm() {
            this.$store.commit('extra-info/resetMpProductsForm');
        },
        cancelEditing() {
            this.$store.commit('extra-info/disabledMpProductsForm');
            this.$store.commit('extra-info/resetMpProductsForm');
        },
        saveForm() {
            this.$store.commit('extra-info/disabledMpProductsForm');
            this.$store.dispatch('extra-info/saveMpExProductsDetails');
        },
    },
    computed: {
        form() {
            return this.$store.getters['extra-info/mpProducts'].form;
        },
        formDisabled() {
            return this.$store.getters['extra-info/mpProducts'].formDisabled;
        },
        busy() {
            return this.$store.getters['extra-info/mpProducts'].busy;
        },
        yesNoOptions() {
            return this.$store.getters['misc/yesNoOptions'];
        },
        invoiceCycles() {
            return this.$store.getters['misc/invoiceCycles'];
        },
        mpExWeeklyUsageOptions() {
            return this.$store.getters['misc/mpExWeeklyUsageOptions'];
        },
        productPricing() {
            return this.$store.getters['extra-info/mpProducts'].productPricing;
        }
    }
}
</script>

<style scoped>

</style>