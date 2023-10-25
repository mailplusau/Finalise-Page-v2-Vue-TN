<template>
    <b-card border-variant="primary" class="my-3" bg-variant="transparent" v-if="$store.getters['callCenterMode']">
        <div class="row justify-content-center" v-if="$store.getters['lpo-info/isLPO'] && $store.getters['lpo-info/isLastSalesActivityWithin90Days']">
            <div class="col-12 mb-4">
                <h1 class="text-center mp-header">Call Center</h1>
            </div>


            <div class="col-6 mb-3 d-grid">
                <b-button variant="info" @click="bauConversionModal = true">
                    Convert to Business As Usual
                </b-button>
            </div>
            <div class="col-6 mb-3 d-grid" v-if="$store.getters['customer/status'] !== 67">
                <b-button variant="success" @click="open('call-center/followUp', 'Follow-up')">
                    Follow-up
                </b-button>
            </div>
        </div>

        <div class="row justify-content-center" v-else-if="$store.getters['lpo-info/isLPO'] && !$store.getters['lpo-info/isLastSalesActivityWithin90Days'] && $store.getters['customer/status'] === 67">

            <div class="col-12 mb-4">
                <h1 class="text-center mp-header">Call Center</h1>
            </div>

            <div class="col-6 mb-3 d-grid">
                <b-button variant="success" @click="open('call-center/approveLPOLead', 'LPO Approve')">
                    LPO Approve
                </b-button>
            </div>
        </div>
        <div class="row justify-content-center" v-else>
            <div class="col-12 mb-4">
                <h1 class="text-center mp-header">Call Center</h1>
            </div>

            <div class="col-3">
                <div class="col-12 mb-3 d-grid">
                    <b-button variant="info" @click="open('call-center/redirectToNetSuiteCustomerPage', 'Return to Customer\'s Page')">
                        <b-icon icon="arrow-left-circle"></b-icon> Customer's Page
                    </b-button>
                </div>
                <div class="col-12 mb-3 d-grid">
                    <b-button variant="primary" @click="open('call-center/setAppointment', 'Set Appointment')">
                        Set Appointment
                    </b-button>
                </div>
                <div class="col-12 mb-3 d-grid">
                    <b-button variant="warning" @click="open('call-center/reassignToRep', 'Assign To Rep')">
                        Assign To Rep
                    </b-button>
                </div>
            </div>

            <div class="col-3">
                <div class="col-12 mb-3 d-grid">
                    <b-button variant="warning" @click="open('call-center/handleNoAnswerOnPhone', 'No Answer - Phone Call')">
                        No Answer - Phone Call
                    </b-button>
                </div>
                <div class="col-12 mb-3 d-grid">
                    <b-button variant="warning" @click="open('call-center/handleNoResponseEmail', 'No Response - Email')">
                        No Response - Email
                    </b-button>
                </div>
                <div class="col-12 mb-3 d-grid">
                    <b-button variant="warning" @click="open('call-center/handleOffPeak', 'Parking Lot')">
                        Parking Lot
                    </b-button>
                </div>
            </div>

            <div class="col-3">
                <template v-if="$store.getters['customer/status'] !== 13">
                    <div class="col-12 mb-3 d-grid" v-if="$store.getters['customer/status'] !== 32">
                        <b-button variant="success" @click="open('call-center/setCustomerAsFreeTrial', 'Free Trial')">
                            Free Trial
                        </b-button>
                    </div>
                    <div class="col-12 mb-3 d-grid">
                        <b-button variant="success" @click="open('call-center/sendEmailSigned', 'Signed')">
                            Signed
                        </b-button>
                    </div>
                    <div class="col-12 mb-3 d-grid">
                        <b-button variant="success" @click="open('call-center/sendEmailQuote', 'Quote')">
                            Quote
                        </b-button>
                    </div>
                </template>
                <template v-else-if="$store.getters['customer/status'] === 13 && $store.getters['customer/saved'] === 1">
                    <div class="col-12 mb-3 d-grid">
                        <b-button variant="success" @click="open('call-center/notifyITTeam', 'Notify IT Team', false)">
                            Notify IT Team
                        </b-button>
                    </div>
                    <div class="col-12 mb-3 d-grid">
                        <b-button variant="success" @click="open('call-center/sendEmailQuoteSavedCustomer', 'Quote (win-back)')">
                            Quote (win-back)
                        </b-button>
                    </div>
                </template>
                <template v-else>
                    <div class="col-12 mb-3 d-grid">
                        <b-button variant="success" @click="open('call-center/sendEmailQuote', 'Send Email')">
                            Send Email
                        </b-button>
                    </div>
                    <div class="col-12 mb-3 d-grid">
                        <b-button variant="success" @click="open('call-center/handleNoSale', 'No sales / No contact')">
                            No sales / No contact
                        </b-button>
                    </div>
                </template>

                <div class="col-12 mb-3 d-grid">
                    <b-button variant="success" @click="open('call-center/followUp', 'Follow-up')">
                        Follow-up
                    </b-button>
                </div>
            </div>

            <div class="col-3">
                <div class="col-12 mb-3 d-grid">
                    <b-button variant="danger" @click="open('call-center/handleNoAnswerEmail', 'Lost - No Response')">
                        Lost - No Response
                    </b-button>
                </div>
                <div class="col-12 mb-3 d-grid">
                    <b-button variant="danger" @click="open('call-center/handleNotEstablished', 'Not Established')">
                        Not Established
                    </b-button>
                </div>
                <div class="col-12 mb-3 d-grid">
                    <b-button variant="danger" @click="open('call-center/handleNoSale', 'Lost')">
                        Lost
                    </b-button>
                </div>
            </div>



            <div class="col-6 mb-3 d-grid" v-if="$store.getters['lpo-info/isLPO']">
                <b-button variant="info" @click="bauConversionModal = true">
                    Convert to Business As Usual
                </b-button>
            </div>
            <div class="col-6 mb-3 d-grid" v-else>
                <b-button variant="info" @click="lpoConversionModal = true">
                    Convert to LPO Campaign
                </b-button>
            </div>

        </div>


        <b-modal centered v-model="modalOpen">
            <template v-slot:modal-header>
                <h5 class="text-center">{{title}}</h5>
            </template>

            <b-row class="justify-content-center">
                <b-col cols="12" class="text-center mb-3" v-if="showSalesNote">
                    <b-form-group
                        class="text-start"
                        label="Sales Notes:"
                        description=""
                    >
                        <b-form-textarea v-model="salesNotes" rows="3" no-resize></b-form-textarea>
                    </b-form-group>
                </b-col>
                <b-col cols="12" class="text-center text-danger">
                    <b-icon icon="exclamation-triangle"></b-icon> Make sure that all important data are saved before proceeding.
                </b-col>
            </b-row>

            <template v-slot:modal-footer>
                <b-button size="sm" @click="modalOpen = false">Cancel</b-button>
                <b-button variant="danger" size="sm" @click="dispatchAction">Proceed</b-button>
            </template>
        </b-modal>


        <b-modal centered v-model="lpoConversionModal">
            <template v-slot:modal-header>
                <h5 class="text-center">Convert to LPO Campaign</h5>
            </template>

            <b-row class="justify-content-center">
                <b-col cols="12" class="text-center text-danger">
                    <b-icon icon="exclamation-triangle"></b-icon>
                    This option will close the current sales record and create a new one under the LPO campaign. Do you wish to proceed?
                </b-col>
            </b-row>

            <template v-slot:modal-footer>
                <b-button size="sm" @click="lpoConversionModal = false">Cancel</b-button>
                <b-button variant="danger" size="sm" @click="convertToLPO">Proceed</b-button>
            </template>
        </b-modal>


        <b-modal centered v-model="bauConversionModal">
            <template v-slot:modal-header>
                <h5 class="text-center">Convert to Business As Usual</h5>
            </template>

            <b-row class="justify-content-center">
                <b-col cols="12" class="text-center text-danger">
                    <b-icon icon="exclamation-triangle"></b-icon>
                    This option will close the current sales record and create a new one under the usual sales workflow. Do you wish to proceed?
                </b-col>
            </b-row>

            <template v-slot:modal-footer>
                <b-button size="sm" @click="bauConversionModal = false">Cancel</b-button>
                <b-button variant="danger" size="sm" @click="convertToBAU">Proceed</b-button>
            </template>
        </b-modal>

    </b-card>
</template>

<script>
export default {
    name: "Main",
    data: () => ({
        action: null,
        title: '',
        showSalesNote: false,
        lpoConversionModal: false,
        bauConversionModal: false,
    }),
    methods: {
        async open(action, title, showSalesNote = true) {
            if(!await this.$store.dispatch('checkForUnsavedChanges')) return;

            this.action = action;
            this.title = title;
            this.showSalesNote = showSalesNote;
        },
        dispatchAction() {
            if (this.action) this.$store.dispatch(this.action);
            this.action = null;
        },
        async convertToLPO() {
            this.lpoConversionModal = false;
            if(!await this.$store.dispatch('checkForUnsavedChanges')) return;

            await this.$store.dispatch('lpo-info/convertToLPO');
        },
        async convertToBAU() {
            this.bauConversionModal = false;
            if(!await this.$store.dispatch('checkForUnsavedChanges')) return;

            await this.$store.dispatch('lpo-info/convertToBAU');
        }
    },
    computed: {
        modalOpen: {
            get() {
                return !!this.action;
            },
            set(val) {
                if (!val) this.action = null;
            }
        },
        salesNotes: {
            get() {
                return this.$store.getters['call-center/salesNote'];
            },
            set(val) {
                this.$store.commit('call-center/setSalesNote', val);
            }
        }
    }
}
</script>

<style scoped>

</style>