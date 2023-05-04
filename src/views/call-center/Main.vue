<template>
    <b-card border-variant="primary" class="my-3" bg-variant="transparent" v-if="$store.getters['callCenterMode']">
        <div class="row justify-content-center" >
            <div class="col-12 mb-4">
                <h1 class="text-center mp-header">Call Center</h1>
            </div>


            <div class="col-3 mb-3 d-grid">
                <b-button variant="info" @click="open('call-center/redirectToNetSuiteCustomerPage', 'Return to Customer\'s Page')">
                    <b-icon icon="arrow-left-circle"></b-icon> Customer's Page
                </b-button>
            </div>
            <div class="col-3 mb-3 d-grid">
                <b-button variant="warning" @click="open('call-center/handleNoAnswerOnPhone', 'No Answer - Phone Call')">
                    No Answer - Phone Call
                </b-button>
            </div>
            <div class="col-3 mb-3 d-grid" v-if="$store.getters['customer/status'] !== 13">
                <b-button variant="success" @click="open('call-center/sendEmailSigned', 'Signed')">
                    Signed
                </b-button>
            </div>
            <div class="col-3 mb-3 d-grid" v-else-if="$store.getters['customer/status'] === 13 && $store.getters['customer/saved'] === 1">
                <b-button variant="success" @click="open('call-center/notifyITTeam', 'Notify IT Team', false)">
                    Notify IT Team
                </b-button>
            </div>
            <div class="col-3 mb-3 d-grid" v-else>
                <b-button variant="success" @click="open('call-center/sendEmailQuote', 'Send Email')">
                    Send Email
                </b-button>
            </div>
            <div class="col-3 mb-3 d-grid">
                <b-button variant="danger" @click="open('call-center/handleNoAnswerEmail', 'Lost - No Response')">
                    Lost - No Response
                </b-button>
            </div>


            <div class="col-3 mb-3 d-grid">
                <b-button variant="primary" @click="open('call-center/setAppointment', 'Set Appointment')">
                    Set Appointment
                </b-button>
            </div>
            <div class="col-3 mb-3 d-grid">
                <b-button variant="warning" @click="open('call-center/handleNoResponseEmail', 'No Response - Email')">
                    No Response - Email
                </b-button>
            </div>
            <div class="col-3 mb-3 d-grid" v-if="$store.getters['customer/status'] !== 13">
                <b-button variant="success" @click="open('call-center/sendEmailQuote', 'Quote')">
                    Quote
                </b-button>
            </div>
            <div class="col-3 mb-3 d-grid" v-else-if="$store.getters['customer/status'] === 13 && $store.getters['customer/saved'] === 1">
                <b-button variant="success" @click="open('call-center/sendEmailQuoteSavedCustomer', 'Quote (win-back)')">
                    Quote (win-back)
                </b-button>
            </div>
            <div class="col-3 mb-3 d-grid" v-else>
                <b-button variant="success" @click="open('call-center/handleNoSale', 'No sales / No contact')">
                    No sales / No contact
                </b-button>
            </div>
            <div class="col-3 mb-3 d-grid">
                <b-button variant="danger" @click="open('call-center/handleNotEstablished', 'Not Established')">
                    Not Established
                </b-button>
            </div>


            <div class="col-3 mb-3 d-grid">
                <b-button variant="warning" @click="open('call-center/reassignToRep', 'Assign To Rep')">
                    Assign To Rep
                </b-button>
            </div>
            <div class="col-3 mb-3 d-grid">
                <b-button variant="warning" @click="open('call-center/handleOffPeak', 'Parking Lot')">
                    Parking Lot
                </b-button>
            </div>
            <div class="col-3 mb-3 d-grid">
                <b-button variant="success" @click="open('call-center/followUp', 'Follow-up')">
                    Follow-up
                </b-button>
            </div>
            <div class="col-3 mb-3 d-grid">
                <b-button variant="danger" @click="open('call-center/handleNoSale', 'Lost')">
                    Lost
                </b-button>
            </div>

        </div>


        <b-modal id="call-center-notice" centered v-model="modalOpen">
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

    </b-card>
</template>

<script>
export default {
    name: "Main",
    data: () => ({
        action: null,
        title: '',
        showSalesNote: false,
    }),
    methods: {
        async open(action, title, showSalesNote = true) {
            if(!await this.$store.dispatch('checkForUnsavedChanges')) return;

            this.action = action;
            this.title = title;
            this.showSalesNote = showSalesNote;
        },
        handleModalHide() {

        },
        dispatchAction() {
            if (this.action) this.$store.dispatch(this.action);
            this.action = null;
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