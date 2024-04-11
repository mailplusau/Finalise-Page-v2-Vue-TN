<template>
    <div class="row mb-2">
        <div class="col-12">
            <b-table :items="contacts" :fields="fields" striped responsive="sm" head-row-variant="light" hover :busy="loading" show-empty>
                <template v-slot:empty>
                    No Contact To Show
                </template>
                <template v-slot:table-busy>
                    <div class="text-center text-danger my-2">
                        <b-spinner class="align-middle mx-2"></b-spinner>
                        <strong>Loading...</strong>
                    </div>
                </template>

                <template v-slot:head(contact)="{label}">
                    <div class="text-start">{{label}}</div>
                </template>

                <template v-slot:cell(contact)="{item}">
                    <p class="text-start">
                        <span>{{item.salutation}} {{item.firstname}} {{item.lastname}}</span><br>
                        <span>{{item.title}}</span><br>
                        <span>{{item.phone}}</span><br>
                        <span>{{item.email}}</span>
                    </p>
                </template>

                <template v-slot:cell(role)="{item}">
                    {{ getRoleText(item.contactrole) }}
                </template>

                <template v-slot:cell(admin)="{item}">
                    <b-icon :icon="parseInt(item.custentity_connect_admin) === 1 ? 'check-lg' : 'x-lg'"
                            :variant="parseInt(item.custentity_connect_admin) === 1 ? 'success' : 'danger'"></b-icon>
                </template>

                <template v-slot:cell(user)="{item}">
                    <b-icon :icon="parseInt(item.custentity_connect_user) === 1 ? 'check-lg' : 'x-lg'"
                            :variant="parseInt(item.custentity_connect_user) === 1 ? 'success' : 'danger'"></b-icon>
                </template>

                <template v-slot:cell(emailSent)="{item}">
                    <b-icon v-if="item.createPasswordEmailSent" icon="check-lg" variant="success"></b-icon>
                    <b-icon v-else icon="x-square" variant="danger" style="cursor: pointer;" scale="1.5"
                            title="Re-send Create Portal Password Email" v-b-tooltip.hover
                            @click="$store.dispatch('contacts/resendCreatePortalPasswordEmail', item.internalid)"></b-icon>
                </template>

                <template v-slot:cell(portal)="{item}">
                    <b-icon v-if="item.accountActivated" icon="check-lg" variant="success"></b-icon>
                    <b-icon v-else icon="x-lg" variant="danger"></b-icon>
                </template>

                <template v-slot:cell(actions)="{item, detailsShowing, toggleDetails}">
                    <div class="text-end">

                        <b-button size="sm" variant="link" @click="$store.dispatch('contacts/openContactModal', item.internalid)">
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
                                Full Name: {{item.salutation + ' ' + item.firstname + ', ' + item.lastname}}
                            </b-col>
                            <b-col cols="auto">
                                <b-button size="sm" @click="toggleDetails">Hide Details</b-button>
                            </b-col>
                            <b-col cols="12">
                                Role: {{item.contactrole}}
                            </b-col>
                            <b-col cols="12">
                                Title/Position: {{item.title}}
                            </b-col>
                            <b-col cols="12">
                                Internal ID: {{item.internalid}}
                            </b-col>
                            <b-col cols="12">
                                Phone: {{item.phone}}
                            </b-col>
                            <b-col cols="12">
                                Email: {{item.email}}
                            </b-col>
                        </b-row>

                    </b-card>
                </template>

                <template v-slot:custom-foot>
                    <b-tr style="background-color: #9ed79b">
                        <b-td :colspan="fields.length">
                            <b-button variant="outline-primary" size="sm" @click="$store.dispatch('contacts/openContactModal')"
                                      :disabled="$store.getters['contacts/formBusy'] || loading">Add Contact</b-button>
                        </b-td>
                    </b-tr>
                </template>
            </b-table>

        </div>

        <ContactDeletionModal v-model="internalIdToDelete" />
    </div>
</template>

<script>
import ContactDeletionModal from "./ContactDeletionModal";
export default {
    name: "ContactTable",
    components: {ContactDeletionModal},
    data: () => ({
        fields: [
            {key: 'contact', label: 'Contact'},
            {key: 'role', label: 'Role'},
            {key: 'admin', label: 'Portal Admin'},
            {key: 'user', label: 'Portal User'},
            {key: 'emailSent', label: 'Create Password Email Sent'},
            {key: 'portal', label: 'Portal Activated'},
            {key: 'actions', label: ''},
        ],
        internalIdToDelete: null,
    }),
    methods: {
        getRoleText(roleId) {
            let index = this.$store.getters['misc/roles'].findIndex(item => item.value === roleId);
            return index >= 0 ? this.$store.getters['misc/roles'][index].text : '';
        }
    },
    computed: {
        contacts() {
            return this.$store.getters['contacts/all'];
        },
        loading() {
            return this.$store.getters['contacts/loading'];
        },
    }
}
</script>

<style scoped>

</style>