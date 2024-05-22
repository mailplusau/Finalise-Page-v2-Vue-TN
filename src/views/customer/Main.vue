<template>
    <b-card border-variant="primary" bg-variant="transparent">
        <div class="row justify-content-center" >
            <div class="col-12">
                <h1 :class="'text-center mp-header' + (!formDisabled ? ' unsaved-header' : '')">Details</h1>
            </div>

            <div class="col-8 mb-4">
                <b-input-group prepend="Company Name">
                    <b-form-input v-model="detailForm.companyname" v-validate="'required|min:5'" data-vv-name="company_name"
                                  :class="errors.has('company_name') ? 'is-invalid' : ''" :disabled="formDisabled"></b-form-input>

                    <b-form-invalid-feedback :state="!errors.has('company_name')">{{ errors.first('company_name') }}</b-form-invalid-feedback>
                </b-input-group>
            </div>
            <div class="col-4 mb-4">
                <b-input-group prepend="ABN">
                    <b-form-input v-model="detailForm.vatregnumber" v-validate="'required|aus_abn|min:9'" data-vv-name="abn"
                                  :class="errors.has('abn') ? 'is-invalid' : ''" :disabled="formDisabled"></b-form-input>

                    <b-form-invalid-feedback :state="!errors.has('abn')">{{ errors.first('abn') }}</b-form-invalid-feedback>
                </b-input-group>
            </div>
            <div class="col-7 mb-4">
                <b-input-group prepend="Account (main) email">
                    <b-form-input v-model="detailForm.email" v-validate="'email'" data-vv-name="email" @keydown.space.prevent
                                  :class="errors.has('email') ? 'is-invalid' : ''" :disabled="formDisabled"></b-form-input>

                    <b-form-invalid-feedback :state="!errors.has('email')">{{ errors.first('email') }}</b-form-invalid-feedback>
                </b-input-group>
            </div>
            <div class="col-5 mb-4">
                <b-input-group prepend="Account (main) phone">
                    <b-form-input v-model="detailForm.altphone" v-validate="'digits:10|aus_phone'" data-vv-name="phone" @keydown.space.prevent
                                  :class="errors.has('phone') ? 'is-invalid' : ''" :disabled="formDisabled"></b-form-input>

                    <b-form-invalid-feedback :state="!errors.has('phone')">{{ errors.first('phone') }}</b-form-invalid-feedback>
                </b-input-group>
            </div>
            <div class="col-7 mb-4">
                <b-input-group prepend="Day-to-day email">
                    <b-form-input v-model="detailForm.custentity_email_service" v-validate="'required|email'" data-vv-name="alt_email" @keydown.space.prevent
                                  :class="errors.has('alt_email') ? 'is-invalid' : ''" :disabled="formDisabled"></b-form-input>

                    <b-form-invalid-feedback :state="!errors.has('alt_email')">{{ errors.first('alt_email') }}</b-form-invalid-feedback>
                </b-input-group>
            </div>
            <div class="col-5 mb-4">
                <b-input-group prepend="Day-to-day phone">
                    <b-form-input v-model="detailForm.phone" v-validate="'required|digits:10|aus_phone'" data-vv-name="alt_phone" @keydown.space.prevent
                                  :class="errors.has('alt_phone') ? 'is-invalid' : ''" :disabled="formDisabled"></b-form-input>

                    <b-form-invalid-feedback :state="!errors.has('alt_phone')">{{ errors.first('alt_phone') }}</b-form-invalid-feedback>
                </b-input-group>
            </div>
            <div class="col-12 mb-4">
                <b-input-group prepend="Website">
                    <b-form-input v-model="detailForm.custentity_website_page_url" v-validate="''" data-vv-name="website"
                                  :class="errors.has('website') ? 'is-invalid' : ''" :disabled="formDisabled"></b-form-input>

                    <b-form-invalid-feedback :state="!errors.has('website')">{{ errors.first('website') }}</b-form-invalid-feedback>
                </b-input-group>
            </div>
            <div class="col-6 mb-4">
                <b-input-group prepend="Franchisee">
                    <b-form-select v-model="detailForm.partner" v-validate="'required'" data-vv-name="franchisee"
                                   :options="$store.getters['misc/franchisees']" :disabled="formDisabled"></b-form-select>

                    <b-form-invalid-feedback :state="!errors.has('franchisee')">{{ errors.first('franchisee') }}</b-form-invalid-feedback>
                </b-input-group>
            </div>
            <div class="col-6 mb-4">
                <b-input-group prepend="Lead source">
                    <b-form-select v-model="detailForm.leadsource" v-validate="'required'" data-vv-name="lead_source"
                                   :options="$store.getters['misc/leadSources']" :disabled="formDisabled"></b-form-select>

                    <b-form-invalid-feedback :state="!errors.has('lead_source')">{{ errors.first('lead_source') }}</b-form-invalid-feedback>
                </b-input-group>
            </div>

            <div class="col-6 mb-4" v-show="showOldCustomerFields">
                <b-input-group prepend="Old Franchisee">
                    <b-form-select v-model="detailForm.custentity_old_zee"
                                   :options="$store.getters['misc/franchisees']" disabled></b-form-select>

                    <b-form-invalid-feedback :state="!oldCustomerIdInvalid">
                        Please input the valid and correct ID for Old Customer ID field.
                    </b-form-invalid-feedback>
                </b-input-group>
            </div>
            <div class="col-6 mb-4" v-show="showOldCustomerFields">
                <b-input-group prepend="Old Customer ID">
                    <b-form-input v-model="detailForm.custentity_old_customer" v-validate="showOldCustomerFields ? 'required|numeric' : ''" data-vv-name="old_customer_id"
                                  :class="errors.has('old_customer_id') ? 'is-invalid' : ''" :disabled="formDisabled || oldCustomerIdFieldDisabled"></b-form-input>

                    <b-form-invalid-feedback :state="!errors.has('old_customer_id') || !oldCustomerIdInvalid">
                        {{ errors.first('old_customer_id') }}
                        {{oldCustomerIdInvalid ? 'Old Customer ID is invalid.' : ''}}
                    </b-form-invalid-feedback>
                </b-input-group>
            </div>
            <div class="col-6 mb-4">
                <b-input-group prepend="Industry">
                    <b-form-select v-model="detailForm.custentity_industry_category" v-validate="'required'" data-vv-name="industry"
                                   :options="$store.getters['misc/industries']" :disabled="formDisabled"></b-form-select>

                    <b-form-invalid-feedback :state="!errors.has('industry')">{{ errors.first('industry') }}</b-form-invalid-feedback>
                </b-input-group>
            </div>
            <div class="col-6 mb-4">
                <b-input-group prepend="Status">
                    <b-form-input v-model="detailTexts.entitystatus" disabled></b-form-input>
                </b-input-group>
            </div>
            <div class="col-12 mb-4">
                <b-input-group prepend="Account Manager">
                    <b-form-select v-model="detailForm.custentity_mp_toll_salesrep" v-validate="hasInternalId ? 'required' : ''" data-vv-name="account_manager"
                                   :options="$store.getters['misc/accountManagers']" :disabled="formDisabled"></b-form-select>

                    <b-form-invalid-feedback :state="!errors.has('account_manager')">{{ errors.first('account_manager') }}</b-form-invalid-feedback>
                </b-input-group>
            </div>

            <div class="col-6 mb-4">
                <b-input-group prepend="T&C Agreement - Date">
                    <b-form-datepicker v-model="tcAgreementDate" :disabled="formDisabled" value-as-date></b-form-datepicker>

                    <b-input-group-append>
                        <b-button v-if="tcAgreementDate && !formDisabled" variant="outline-danger" @click="tcAgreementDate = null" title="Clear date"
                                  :disabled="formDisabled"><b-icon icon="trash"></b-icon></b-button>
                    </b-input-group-append>
                </b-input-group>
            </div>
            <div class="col-6 mb-4">
                <b-input-group prepend="Franchisee Visit - Date">
                    <b-form-datepicker v-model="franchiseeVisitDate" :disabled="formDisabled" value-as-date></b-form-datepicker>

                    <b-input-group-append>
                        <b-button v-if="franchiseeVisitDate && !formDisabled" variant="outline-danger" @click="franchiseeVisitDate = null" title="Clear date"
                                  :disabled="formDisabled"><b-icon icon="trash"></b-icon></b-button>
                    </b-input-group-append>
                </b-input-group>
            </div>

            <div class="col-12" v-if="hasInternalId">
                <b-button @click="editForm" v-if="formDisabled" size="sm" :disabled="busy" variant="outline-primary">Edit Customer's Details</b-button>
                <template v-else>
                    <b-button @click="resetForm" size="sm" class="mx-2" :disabled="busy">Reset</b-button>
                    <b-button @click="cancelEditing" size="sm" class="mx-2" :disabled="busy" variant="outline-danger">Cancel</b-button>
                    <b-button @click="saveForm" size="sm" class="mx-2" :disabled="busy" variant="outline-success">Save</b-button>
                </template>
            </div>
        </div>

        <MandatoryFranchiseeSelectorDialog />
    </b-card>
</template>

<script>
import {debounce} from '@/utils/utils';
import MandatoryFranchiseeSelectorDialog from '@/views/customer/MandatoryFranchiseeSelectorDialog.vue';

export default {
    name: "Main",
    components: {MandatoryFranchiseeSelectorDialog},
    data: () => ({
        oldCustomerIdFieldDisabled: false,
        showOldCustomerFields: false,
        oldCustomerIdInvalid: false,
    }),
    created() {
        this.debouncedHandleOldCustomerIdChanged = debounce(async (newValue, oldValue) => {
            if (!await this.$validator.validateAll(['old_customer_id'])) return;

            this.oldCustomerIdFieldDisabled = true;
            await this.$store.dispatch('customer/handleOldCustomerIdChanged');
            if (!this.detailForm.custentity_old_zee) this.oldCustomerIdInvalid = true;
            this.oldCustomerIdFieldDisabled = false;
        }, 2000);
    },
    methods: {
        async checkForm() {
            return await this.$validator.validateAll() && (this.showOldCustomerFields ? !this.oldCustomerIdInvalid : true);
        },
        editForm() {
            this.$store.commit('customer/disableDetailForm', false);
        },
        resetForm() {
            this.$store.commit('customer/resetDetailForm');
            this.$validator.reset();
        },
        cancelEditing() {
            this.$store.commit('customer/resetDetailForm');
            this.$store.commit('customer/disableDetailForm');
            this.$validator.reset();
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
        detailTexts() {
            return this.$store.getters['customer/texts'];
        },
        formDisabled() {
            return (this.$store.getters['customer/detailFormDisabled'] || this.$store.getters['customer/busy']);
        },
        hasInternalId() {
            return !!this.$store.getters['customerId'];
        },
        busy() {
            return this.$store.getters['customer/busy'];
        },
        tcAgreementDate: {
            get() {
                return this.detailForm.custentity_terms_conditions_agree_date;
            },
            set(val) {
                this.detailForm.custentity_terms_conditions_agree_date = val;
                this.detailForm.custentity_terms_conditions_agree = val ? 1 : 2;
            }
        },
        franchiseeVisitDate: {
            get() {
                return this.detailForm.custentity_mp_toll_zeevisit_memo;
            },
            set(val) {
                this.detailForm.custentity_mp_toll_zeevisit_memo = val;
                this.detailForm.custentity_mp_toll_zeevisit = !!val;
            }
        }
    },
    watch: {
        'detailForm.custentity_old_customer': function (...args) {
            this.oldCustomerIdInvalid = false;
            this.debouncedHandleOldCustomerIdChanged(...args);
        },
        'detailForm.leadsource': function (newValue) {
            // show these fields when lead source is Change of Entity or Relocation
            if (parseInt(newValue) === 202599 || parseInt(newValue) === 217602)
                this.showOldCustomerFields = true;
            // else if lead source is LPO - Transition (281559) and is in LPO mode, we update company name
            else if (parseInt(newValue) === 281559 && !/^(LPO - )/gi.test(this.detailForm.companyname) && this.$store.getters['lpo-info/isLPO']) {
                this.detailForm.companyname = 'LPO - ' + this.detailForm.companyname;
                this.editForm();
            } else { // otherwise hide the fields and reset them
                this.showOldCustomerFields = false;
                this.detailForm.custentity_old_customer = '';
                this.detailForm.custentity_old_zee = '';

                // We check the old value to make sure this change wasn't cause by the page initialization
                // we only want to catch changes caused by the user.
                if (parseInt(newValue) !== 281559 && this.$store.getters['lpo-info/customerInvoiceMethod'] !== 10) {
                    this.detailForm.companyname = this.detailForm.companyname.replace(/^(LPO - )/gi, '');
                    if (this.detailForm.companyname !== this.$store.getters['customer/details'].companyname) this.editForm();
                }
            }
        },
    }
}
</script>

<style scoped>

</style>