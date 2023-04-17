<template>
    <div class="col-lg-6 col-12">
        <h1 class="text-center mp-header">Contacts</h1>

        <ContactTable />

        <b-modal id="modal-contact" centered v-model="contactModal" size="lg" static @hide="handleContactModalHide">
            <template v-slot:modal-header>
                <h1 class="text-center">{{$store.getters['contacts/modalTitle']}}</h1>
            </template>

            <div class="row">
                <div class="col-12 mb-3 text-start" v-show="!!msg">
                    <p v-html="msg" class="text-success"></p>
                </div>
                <div class="col-6 mb-3">
                    <b-input-group prepend="First name">
                        <b-form-input v-model="contactForm.firstname" v-validate="'required'" data-vv-name="firstname"
                                      :class="errors.has('firstname') ? 'is-invalid' : ''" :disabled="contactFormBusy"></b-form-input>

                        <b-form-invalid-feedback :state="!errors.has('firstname')">{{ errors.first('firstname') }}</b-form-invalid-feedback>
                    </b-input-group>
                </div>
                <div class="col-6 mb-3">
                    <b-input-group prepend="Last name">
                        <b-form-input v-model="contactForm.lastname" v-validate="'required'" data-vv-name="lastname"
                                      :class="errors.has('lastname') ? 'is-invalid' : ''" :disabled="contactFormBusy"></b-form-input>

                        <b-form-invalid-feedback :state="!errors.has('lastname')">{{ errors.first('lastname') }}</b-form-invalid-feedback>
                    </b-input-group>
                </div>
                <div class="col-6 mb-3">
                    <b-input-group prepend="Email">
                        <b-form-input v-model="contactForm.email" v-validate="'required|email'" data-vv-name="email" @keydown.space.prevent
                                      :class="errors.has('email') ? 'is-invalid' : ''" :disabled="contactFormBusy"></b-form-input>

                        <b-form-invalid-feedback :state="!errors.has('email')">{{ errors.first('email') }}</b-form-invalid-feedback>
                    </b-input-group>
                </div>
                <div class="col-6 mb-3">
                    <b-input-group prepend="Phone Number">
                        <b-form-input v-model="contactForm.phone" v-validate="'required|digits:10|aus_phone'" data-vv-name="phone" @keydown.space.prevent
                                      :class="errors.has('phone') ? 'is-invalid' : ''" :disabled="contactFormBusy"></b-form-input>

                        <b-form-invalid-feedback :state="!errors.has('phone')">{{ errors.first('phone') }}</b-form-invalid-feedback>
                    </b-input-group>
                </div>
                <div class="col-6 mb-3">
                    <b-input-group prepend="Title/Position">
                        <b-form-input v-model="contactForm.title" v-validate="''" data-vv-name="title" placeholder="(optional)"
                                      :class="errors.has('title') ? 'is-invalid' : ''" :disabled="contactFormBusy"></b-form-input>

                        <b-form-invalid-feedback :state="!errors.has('title')">{{ errors.first('title') }}</b-form-invalid-feedback>
                    </b-input-group>
                </div>
                <div class="col-6 mb-3">
                    <b-input-group prepend="Role">
                        <b-form-select v-model="contactForm.contactrole" v-validate="'required'" data-vv-name="role"
                                       :class="errors.has('role') ? 'is-invalid' : ''" :options="$store.getters['misc/roles']" :disabled="contactFormBusy"></b-form-select>

                        <b-form-invalid-feedback :state="!errors.has('role')">{{ errors.first('role') }}</b-form-invalid-feedback>
                    </b-input-group>
                </div>
                <div class="col-6 mb-3">
                    <b-input-group prepend="Portal Admin">
                        <b-form-select v-model="contactForm.custentity_connect_admin" v-validate="''" data-vv-name="connect_admin"
                                       :class="errors.has('connect_admin') ? 'is-invalid' : ''" :options="yesNoUnsure" :disabled="contactFormBusy"></b-form-select>

                        <b-form-invalid-feedback :state="!errors.has('connect_admin')">{{ errors.first('connect_admin') }}</b-form-invalid-feedback>
                    </b-input-group>
                </div>
                <div class="col-6 mb-3">
                    <b-input-group prepend="Portal User">
                        <b-form-select v-model="contactForm.custentity_connect_user" v-validate="''" data-vv-name="connect_user"
                                       :class="errors.has('connect_user') ? 'is-invalid' : ''" :options="yesNoUnsure" :disabled="contactFormBusy"></b-form-select>

                        <b-form-invalid-feedback :state="!errors.has('connect_user')">{{ errors.first('connect_user') }}</b-form-invalid-feedback>
                    </b-input-group>
                </div>
            </div>

            <template v-slot:modal-footer>
                <b-button size="sm" :disabled="contactFormBusy" @click="contactModal = false">Cancel</b-button>
                <b-button size="sm" variant="success" :disabled="contactFormBusy" @click="saveContactForm">
                    {{contactFormBusy ? 'Saving' : 'Save'}}
                    <b-spinner type="grow" v-show="contactFormBusy" style="width:1rem;height:0.1rem"></b-spinner>
                </b-button>
            </template>
        </b-modal>
    </div>
</template>

<script>
import ContactTable from "./ContactTable";
export default {
    name: "Main",
    components: {ContactTable},
    data: () => ({
        yesNoUnsure: [
            {value: '2', text: 'No'},
            {value: '1', text: 'Yes'}
        ],
        msg: '',
    }),
    methods: {
        handleContactModalHide(event) {
            if(this.contactFormBusy) event.preventDefault();
        },
        saveContactForm() {
            this.$validator.validateAll().then((result) => {
                if (result) {
                    // eslint-disable-next-line
                    console.log('Form Submitted!');
                    this.$store.dispatch('contacts/saveContactForm');
                    return;
                }

                console.log('Correct them errors!');
            });
        }
    },
    computed: {
        contactForm() {
            return this.$store.getters['contacts/form'];
        },
        contactFormBusy() {
            return this.$store.getters['contacts/formBusy'];
        },
        loading() {
            return this.$store.getters['contacts/loading'];
        },
        contactModal: {
            get() {
                return this.$store.getters['contacts/modal'];
            },
            set(val) {
                this.$store.commit('contacts/setModal', val);
                this.msg = '';
            }
        },
    },
    watch: {
        'contactForm.contactrole': function (val) {
            let p1, p2 = '';
            if ([5, 6, 8].includes(parseInt(val))) { // if role is Mail/Parcel Operator, MPEX contact or Product Contact
                if (this.contactForm.custentity_connect_user !== 1) {
                    this.contactForm.custentity_connect_user = 1; // then set Portal User to Yes (1)
                    // this.msg += 'This role will be set as Portal User';
                    p1 = 'Portal User';
                }

                // and if there's no contact set as Portal Admin (1), set this to Yes as well
                if (!this.$store.getters['contacts/hasRoleWithPortalAdminAccess']) {
                    this.contactForm.custentity_connect_admin = 1;
                    p2 = 'Portal Admin (since there is no other role with Portal Admin access)';
                }

                this.msg = (p1 || p2 ? 'This role will be set as ' : '') +
                    (p1 || '') +
                    (p1 && p2 ? ' as well as ' : '') + (p2 || '') +
                    (p1 || p2 ? '. Click Save to accept this change.' : '');
            }
        }
    }
}
</script>

<style scoped>

</style>