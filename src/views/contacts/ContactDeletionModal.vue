<template>

    <b-modal id="modal-contact-deletion" centered v-model="modalOpen" @hide="handleModalHide">
        <template v-slot:modal-header>
            <h5 class="text-center">Deleting contact with internal Id {{value}}</h5>
        </template>

        <b-row v-if="contactFormBusy">
            <b-col cols="12">
                <h5 class="text-danger text-center">
                    Deleting contact record...
                </h5>
            </b-col>
        </b-row>

        <b-row class="justify-content-between" v-else>
            <b-col cols="auto">
                Full Name: {{contact.salutation + ' ' + contact.firstname + ', ' + contact.lastname}}
            </b-col>
            <b-col cols="12">
                Role: {{contact.contactrole}}
            </b-col>
            <b-col cols="12">
                Title/Position: {{contact.title}}
            </b-col>
            <b-col cols="12">
                Internal ID: {{contact.internalid}}
            </b-col>
            <b-col cols="12">
                Phone: {{contact.phone}}
            </b-col>
            <b-col cols="12">
                Email: {{contact.email}}
            </b-col>
            <b-col cols="12">
                <h6 class="text-danger text-center mt-3">
                    Please confirm that you really want to delete this contact. This action cannot be undone.
                </h6>
            </b-col>
        </b-row>

        <template v-slot:modal-footer>
            <b-button size="sm" :disabled="contactFormBusy" @click="modalOpen = false">Cancel</b-button>
            <b-button size="sm" variant="danger" :disabled="contactFormBusy"
                      @click="deleteContact">
                {{contactFormBusy ? 'Please wait' : 'Delete this'}}
                <b-spinner type="grow" v-show="contactFormBusy" style="width:1rem;height:0.1rem"></b-spinner>
            </b-button>
        </template>
    </b-modal>

</template>

<script>
export default {
    name: "ContactDeletionModal",
    props: ['value'],
    methods: {
        handleModalHide(event) {
            if(this.contactFormBusy) event.preventDefault();
        },
        deleteContact() {
            console.log(this.value);
            this.$store.dispatch('contacts/deleteContact', this.value).then(() => {
                this.modalOpen = false;
            })
        }
    },
    computed: {
        modalOpen: {
            get() {
                return !!this.value;
            },
            set(val) {
                if (!val) this.$emit('input', null);
            }
        },
        contactFormBusy() {
            return this.$store.getters['contacts/formBusy'];
        },
        contact() {
            let index = this.$store.getters['contacts/all'].findIndex(item => item.internalid === this.value);
            return index >= 0 ? this.$store.getters['contacts/all'][index] : {};
        }
    }
}
</script>

<style scoped>

</style>