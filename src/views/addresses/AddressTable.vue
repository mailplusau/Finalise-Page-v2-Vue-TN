<template>
    <div class="row">
        <div class="col-12">
            <b-table :items="addresses" :fields="fields" striped responsive="sm" head-row-variant="light" hover :busy="$store.getters['addresses/loading']" show-empty>
                <template v-slot:empty>
                    No Address To Show
                </template>
                <template v-slot:table-busy>
                    <div class="text-center text-danger my-2">
                        <b-spinner class="align-middle mx-2"></b-spinner>
                        <strong>Loading...</strong>
                    </div>
                </template>
                <template v-slot:head(address)="{label}">
                    <div class="text-start">{{label}}</div>
                </template>

                <template v-slot:cell(address)="{item}">
                    <p class="text-start">{{item.addr1 + ' ' + item.addr2 + ', ' + item.city + ' ' + item.state + ' ' + item.zip}}</p>
                </template>

                <template v-slot:cell(shipping)="{item}">
                    <b-icon :icon="item.defaultshipping ? 'check-lg' : 'x-lg'" :variant="item.defaultshipping ? 'success' : 'danger'"></b-icon>
                </template>

                <template v-slot:cell(billing)="{item}">
                    <b-icon :icon="item.defaultbilling ? 'check-lg' : 'x-lg'" :variant="item.defaultbilling ? 'success' : 'danger'"></b-icon>
                </template>

                <template v-slot:cell(geocoded)="{item}">
                    {{ item.custrecord_address_lat && item.custrecord_address_lon ? 'Yes' : 'No'}}
                </template>

                <template v-slot:cell(actions)="{item, detailsShowing, toggleDetails}">
                    <div class="text-end">

                        <b-button size="sm" variant="link" @click="$store.dispatch('addresses/openAddressModal', item.internalid)">
                            <b-icon icon="pencil"></b-icon>
                        </b-button>

                        <b-button size="sm" variant="link" @click="internalIdToDelete = item.internalid">
                            <b-icon icon="trash" variant="danger"></b-icon>
                        </b-button>

                        <b-button size="sm" variant="link" @click="toggleDetails">
                            <b-icon :icon="detailsShowing ? 'chevron-contract' : 'chevron-expand'"></b-icon>
                        </b-button>
                    </div>
                </template>

                <template v-slot:row-details="{item, toggleDetails}">
                    <b-card class="text-start">
                        <b-row class="mb-2 justify-content-between">
                            <b-col cols="auto">
                                Full Address: {{item.addr1 + ' ' + item.addr2 + ', ' + item.city + ' ' + item.state + ' ' + item.zip + ' ' + item.country}}
                            </b-col>
                            <b-col cols="auto">
                                <b-button size="sm" @click="toggleDetails">Hide Details</b-button>
                            </b-col>
                            <b-col cols="12">
                                Label: {{item.label}}
                            </b-col>
                            <b-col cols="12">
                                Addressee: {{item.addressee}}
                            </b-col>
                            <b-col cols="12">
                                Internal ID: {{item.internalid}}
                            </b-col>
                            <b-col cols="12">
                                Lat: {{item.custrecord_address_lat}}
                            </b-col>
                            <b-col cols="12">
                                Lng: {{item.custrecord_address_lon}}
                            </b-col>
                            <b-col cols="12">
                                NCL ID: {{item.custrecord_address_ncl}}
                            </b-col>
                        </b-row>

                    </b-card>
                </template>

                <template v-slot:custom-foot>
                    <b-tr style="background-color: #9ed79b">
                        <b-td :colspan="fields.length">
                            <p class="text-danger" v-show="!!addressMissingWarningText && !$store.getters['addresses/formBusy']"
                               v-html="addressMissingWarningText"></p>

                            <b-button variant="outline-primary" size="sm"
                                      @click="$store.dispatch('addresses/openAddressModal')"
                                      :disabled="$store.getters['addresses/formBusy'] || $store.getters['addresses/loading']">
                                Add Address
                            </b-button>
                        </b-td>
                    </b-tr>
                </template>
            </b-table>

        </div>

        <AddressDeletionModal v-model="internalIdToDelete" />
    </div>
</template>

<script>
import AddressDeletionModal from "./AddressDeletionModal";

export default {
    name: "AddressTable",
    components: {AddressDeletionModal},
    data: () => ({
        fields: [
            {key: 'address', label: 'Address'},
            {key: 'shipping', label: 'Default Shipping'},
            {key: 'billing', label: 'Default Billing'},
            {key: 'geocoded', label: 'Geocoded'},
            {key: 'actions', label: ''},
        ],
        internalIdToDelete: null,
    }),
    computed: {
        addresses() {
            return this.$store.getters['addresses/all'];
        },
        addressMissingWarningText() {
            let str = '';
            let control = 0;

            if (!this.$store.getters['addresses/shippingAddressAdded']) {
                str += '<b>1 default shipping</b>';
                control++;
            }

            if (!this.$store.getters['addresses/billingAddressAdded']) {
                str += (control ? ' and ' : '') + '<b>1 default billing</b>';
                control++;
            }

            if (control) str += ' address required!';

            return str;
        },
    }
}
</script>

<style scoped>

</style>