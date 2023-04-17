<template>

    <b-modal id="modal-address-deletion" centered v-model="modalOpen" @hide="handleAddressModalHide">
        <template v-slot:modal-header>
            <h5 class="text-center">Deleting address with internal Id {{value}}</h5>
        </template>

        <b-row v-if="addressFormBusy">
            <b-col cols="12">
                <h5 class="text-danger text-center">
                    Deleting address record...
                </h5>
            </b-col>
        </b-row>

        <b-row class="justify-content-between" v-else>
            <b-col cols="auto">
                Full Address: {{address.addr1 + ' ' + address.addr2 + ', ' + address.city + ' ' + address.state + ' ' + address.zip + ' ' + address.country}}
            </b-col>
            <b-col cols="12">
                Label: {{address.label}}
            </b-col>
            <b-col cols="12">
                Addressee: {{address.addressee}}
            </b-col>
            <b-col cols="12">
                Internal ID: {{address.internalid}}
            </b-col>
            <b-col cols="12">
                Lat: {{address.custrecord_address_lat}}
            </b-col>
            <b-col cols="12">
                Lng: {{address.custrecord_address_lon}}
            </b-col>
            <b-col cols="12">
                NCL ID: {{address.custrecord_address_ncl}}
            </b-col>
            <b-col cols="12">
                <h6 class="text-danger text-center mt-3">
                    Please confirm that you really want to delete this address. This action cannot be undone.
                </h6>
            </b-col>
        </b-row>

        <template v-slot:modal-footer>
            <b-button size="sm" :disabled="addressFormBusy" @click="modalOpen = false">Cancel</b-button>
            <b-button size="sm" variant="danger" :disabled="addressFormBusy"
                      @click="deleteAddress">
                {{addressFormBusy ? 'Please wait' : 'Delete this'}}
                <b-spinner type="grow" v-show="addressFormBusy" style="width:1rem;height:0.1rem"></b-spinner>
            </b-button>
        </template>
    </b-modal>

</template>

<script>
export default {
    name: "AddressDeletionModal",
    props: ['value'],
    data: () => ({

    }),
    methods: {
        handleAddressModalHide(event) {
            if(this.addressFormBusy) event.preventDefault();
        },
        deleteAddress() {
            console.log(this.value);
            this.$store.dispatch('addresses/removeAddress', this.value).then(() => {
                console.log('finish deleting');
                this.modalOpen = false;
            });
        }
    },
    computed: {
        addressFormBusy() {
            return this.$store.getters['addresses/formBusy'];
        },
        modalOpen: {
            get() {
                return !!this.value;
            },
            set(val) {
                if (!val) this.$emit('input', null);
            }
        },
        address() {
            let index = this.$store.getters['addresses/all'].findIndex(item => item.internalid === this.value);
            return index >= 0 ? this.$store.getters['addresses/all'][index] : {};
        }
    }
}
</script>

<style scoped>

</style>