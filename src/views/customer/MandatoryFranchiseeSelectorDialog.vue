<template>
    <b-modal centered v-model="modalOpen" @hide="handleModalHide">
        <template v-slot:modal-header>
            <span class="text-danger">Please assign a correct franchisee to the lead</span>
        </template>

        <b-row class="justify-content-center">
            <b-col cols="12" class="text-center">
                <b-input-group prepend="Franchisee">
                    <b-form-select v-model="detailForm.partner" v-validate="'required'" data-vv-name="franchisee"
                                   :options="$store.getters['misc/franchisees']"></b-form-select>

                    <b-form-invalid-feedback :state="!errors.has('franchisee')">{{ errors.first('franchisee') }}</b-form-invalid-feedback>
                </b-input-group>
            </b-col>
            <b-col cols="12" class="text-center">
                <a href="https://www.google.com/maps/d/u/0/viewer?mid=1W9mX1KtLJGmCk8brHRkl0OkyVWJEN7s&ll=-32.326468625954625%2C139.23892807495866&z=5" target="_blank">
                    Check Franchisee Territory
                </a>
            </b-col>
        </b-row>

        <template v-slot:modal-footer>
            <b-button size="sm" @click="saveForm" variant="success" :disabled="busy">Assign</b-button>
        </template>
    </b-modal>
</template>

<script>
export default {
    name: "MandatoryFranchiseeSelectorDialog",
    methods: {
        handleModalHide(event) {
            if(this.$store.getters['customer/franchiseeSelector'].required) event.preventDefault();
        },
        saveForm() {
            this.$validator.validateAll().then((result) => {
                if (result && (this.showOldCustomerFields ? !this.oldCustomerIdInvalid : true)) {
                    console.log('Form Submitted!');
                    this.$store.dispatch('customer/saveCustomer');
                } else console.log('Correct them errors!');
            });
        }

    },
    computed: {
        detailForm() {
            return this.$store.getters['customer/detailForm'];
        },
        busy() {
            return this.$store.getters['customer/franchiseeSelector'].busy;
        },
        modalOpen: {
            get() {
                return this.$store.getters['customer/franchiseeSelector'].open
            },
            set(val) {
                this.$store.getters['customer/franchiseeSelector'].open = val;
            }
        }
    }
};
</script>

<style scoped>

</style>