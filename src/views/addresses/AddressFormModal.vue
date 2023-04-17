<template>
    <b-modal id="modal-address" centered v-model="addressModal" size="lg" static @hide="handleAddressModalHide">
        <template v-slot:modal-header>
            <h1 class="text-center">{{$store.getters['addresses/modalTitle']}}</h1>
        </template>
        <div class="row">
            <div class="col-12 mb-3 text-start">
                <span v-show="(!$store.getters['addresses/billingAddressAdded'] || $store.getters['addresses/billingAddressAdded'] === addressSublistForm.internalid) && !addressSublistForm.defaultbilling" class="address-warning">
                    At least 1 Billing Address required. Either make this a Billing Address or add one before submitting.<br>
                </span>
                <span v-show="(!$store.getters['addresses/shippingAddressAdded'] || $store.getters['addresses/shippingAddressAdded'] === addressSublistForm.internalid) && !addressSublistForm.defaultshipping" class="address-warning">
                        At least 1 Shipping Address required. Either make this a Shipping Address or add one before submitting.<br>
                    </span>
                <span v-show="$store.getters['addresses/billingAddressAdded'] && $store.getters['addresses/billingAddressAdded'] !== addressSublistForm.internalid && addressSublistForm.defaultbilling" class="text-danger">
                        Warning! Another default billing address is already set. This will replace the former address as the new default billing address.<br>
                    </span>
                <span v-show="$store.getters['addresses/shippingAddressAdded'] && $store.getters['addresses/shippingAddressAdded'] !== addressSublistForm.internalid && addressSublistForm.defaultshipping" class="text-danger">
                        Warning! Another default shipping address is already set. This will replace the former address as the new default shipping address.<br>
                    </span>
            </div>
            <div class="col-12 mb-3">
                <b-input-group prepend="Addressee (Company Name)">
                    <b-form-input v-model="addressForm.addressee" v-validate="'required|min:5|max:83'" data-vv-name="company_name"
                                  :class="errors.has('company_name') ? 'is-invalid' : ''" :disabled="addressFormBusy"></b-form-input>

                    <b-form-invalid-feedback :state="!errors.has('company_name')">{{ errors.first('company_name') }}</b-form-invalid-feedback>
                </b-input-group>
            </div>
            <div class="col-5 mb-3">
                <b-input-group prepend="Address Type">
                    <b-form-select v-model="addressType" :options="$store.getters['addresses/types']" :disabled="addressFormBusy"></b-form-select>
                </b-input-group>
            </div>
            <div class="col-7 mb-3">
                <b-input-group :prepend="addressType === 'street' ? 'Suite/Level/Unit' : 'Postal Box'">
                    <b-form-input v-validate="addressType === 'postal' ? 'required' : ''" data-vv-name="address_1"
                                  :class="errors.has('address_1') ? 'is-invalid' : ''"
                                  v-model="addressForm.addr1" :disabled="addressFormBusy"></b-form-input>

                    <b-form-invalid-feedback :state="!errors.has('address_1')">{{ errors.first('address_1') }}</b-form-invalid-feedback>
                </b-input-group>
            </div>
            <div class="col-12 mb-3" v-if="addressType === 'street'">
                <b-input-group prepend="Street No. & Name">
                    <GoogleAutocomplete v-validate="'required|min:3'" data-vv-name="address2" :class="errors.has('address2') || !isAddressValid ? 'is-invalid' : ''"
                                        v-model="addressForm.addr2" :disabled="addressFormBusy" id="address2" @placeChanged="handlePlaceChanged"/>

                    <b-form-invalid-feedback :state="!errors.has('address2') || isAddressValid">
                        {{ !isAddressValid ? 'Please fill in address using autocomplete' : errors.first('address2') }}
                    </b-form-invalid-feedback>
                </b-input-group>
            </div>
            <div class="col-3 mb-3" v-if="addressType === 'postal'">
                <b-input-group prepend="State">
                    <b-form-select v-model="postalState" :options="$store.getters['misc/states']" :disabled="addressFormBusy"></b-form-select>
                </b-input-group>
            </div>
            <div class="col-9 mb-3" v-if="addressType === 'postal'">
                <b-input-group prepend="Postal Location">
                    <b-form-select v-model="addressForm.custrecord_address_ncl" :options="$store.getters['addresses/postalLocations']" :disabled="addressFormBusy"></b-form-select>
                </b-input-group>
            </div>
            <div class="col-4 mb-3">
                <b-input-group prepend="City">
                    <b-form-input v-validate="'required'" data-vv-name="suburb" :class="errors.has('suburb') ? 'is-invalid' : ''"
                                  v-model="addressForm.city" placeholder="to be autofilled" disabled></b-form-input>

                    <b-form-invalid-feedback :state="!errors.has('suburb')">{{ errors.first('suburb') }}</b-form-invalid-feedback>
                </b-input-group>
            </div>
            <div class="col-4 mb-3" v-if="addressType === 'street'">
                <b-input-group prepend="State">
                    <b-form-input v-validate="'required'" data-vv-name="state" :class="errors.has('state') ? 'is-invalid' : ''"
                                  v-model="addressForm.state" placeholder="to be autofilled" disabled></b-form-input>

                    <b-form-invalid-feedback :state="!errors.has('state')">{{ errors.first('state') }}</b-form-invalid-feedback>
                </b-input-group>
            </div>
            <div :class="(addressType === 'street' ? 'col-4' : 'col-8') + ' mb-3'">
                <b-input-group :prepend="'Postcode' + (addressType === 'postal' ? '/Mailing code' : '')">
                    <b-form-input v-validate="'required'" data-vv-name="post_code" :class="errors.has('post_code') ? 'is-invalid' : ''"
                                  v-model="addressForm.zip" :placeholder="addressType === 'street' ? 'to be autofilled' : ''" :disabled="addressType === 'street'"></b-form-input>

                    <b-form-invalid-feedback :state="!errors.has('post_code')">{{ errors.first('post_code') }}</b-form-invalid-feedback>
                </b-input-group>
            </div>
            <div class="col-6 mb-3">
                <b-input-group prepend="Lat">
                    <b-form-input v-validate="'required'" data-vv-name="latitude" :class="errors.has('latitude') ? 'is-invalid' : ''"
                                  v-model="addressForm.custrecord_address_lat" placeholder="to be autofilled" disabled></b-form-input>

                    <b-form-invalid-feedback :state="!errors.has('latitude')">{{ errors.first('latitude') }}</b-form-invalid-feedback>
                </b-input-group>
            </div>
            <div class="col-6 mb-3">
                <b-input-group prepend="Lng">
                    <b-form-input v-validate="'required'" data-vv-name="longitude" :class="errors.has('longitude') ? 'is-invalid' : ''"
                                  v-model="addressForm.custrecord_address_lon" placeholder="to be autofilled" disabled></b-form-input>

                    <b-form-invalid-feedback :state="!errors.has('longitude')">{{ errors.first('longitude') }}</b-form-invalid-feedback>
                </b-input-group>
            </div>
            <div class="col-4" v-show="!addressFormBusy">
                <CheckboxInputGroup label="Default Shipping" v-model="addressSublistForm.defaultshipping" />
            </div>
            <div class="col-4" v-show="!addressFormBusy">
                <CheckboxInputGroup label="Default Billing" v-model="addressSublistForm.defaultbilling" />
            </div>
            <div class="col-4" v-show="!addressFormBusy">
                <CheckboxInputGroup label="Postal Address" v-model="addressSublistForm.isresidential" />
            </div>
        </div>

        <template v-slot:modal-footer>
            <b-button size="sm" :disabled="addressFormBusy" @click="addressModal = false">Cancel</b-button>
            <b-button size="sm" variant="success" :disabled="addressFormBusy || !isAddressValid"
                      @click="saveAddressForm">
                {{addressFormBusy ? 'Please wait' : 'Save'}}
                <b-spinner type="grow" v-show="addressFormBusy" style="width:1rem;height:0.1rem"></b-spinner>
            </b-button>
        </template>
    </b-modal>
</template>

<script>
import GoogleAutocomplete from "../../components/GoogleAutocomplete";
import CheckboxInputGroup from "../../components/CheckboxInputGroup";

export default {
    name: "AddressFormModal",
    components: {CheckboxInputGroup, GoogleAutocomplete},
    methods: {
        saveAddressForm() {
            this.$validator.validateAll().then((result) => {
                if (result) {
                    // eslint-disable-next-line
                    console.log('Form Submitted!');
                    this.$store.dispatch('addresses/saveAddressForm');
                    return;
                }

                console.log('Correct them errors!');
            });
        },
        handleAddressModalHide(event) {
            if(this.addressFormBusy) event.preventDefault();
        },
        handlePlaceChanged(place) {
            this.$store.commit('addresses/handleAddressFormChange', place);
        },
    },
    computed: {
        isAddressValid() {
            return this.addressForm.city && this.addressForm.state && this.addressForm.zip;
        },
        addressForm() {
            return this.$store.getters['addresses/form'];
        },
        addressSublistForm() {
            return this.$store.getters['addresses/sublistForm'];
        },
        loading() {
            return this.$store.getters['addresses/loading'];
        },
        addressFormBusy() {
            return this.$store.getters['addresses/formBusy'];
        },
        addressModal: {
            get() {
                return this.$store.getters['addresses/modal'];
            },
            set(val) {
                this.$store.commit('addresses/setModal', val);
            }
        },
        addressType: {
            get() {
                return this.$store.getters['addresses/type'];
            },
            set(val) {
                this.$store.commit('addresses/setType', val);
            }
        },
        postalState: {
            get() {
                return this.$store.getters['addresses/postalState'];
            },
            set(val) {
                this.$store.commit('addresses/setPostalState', val);
            }
        },
    },
    watch: {
        postalState(val) {
            this.$store.dispatch('addresses/handlePostalStateChanged', val);
        },
        'addressForm.custrecord_address_ncl': function (val) {
            this.$store.dispatch('addresses/handlePostalLocationChanged', val);
        }
    }
}
</script>

<style scoped>

</style>