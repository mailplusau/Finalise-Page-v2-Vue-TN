import http from "@/utils/http";

const state = {
    // For customer's contacts
    contacts: [],
    contactSelectedId: null,
    contactModal: false,
    contactModalTitle: 'Add New Contact',
    contactFormBusy: false,
    contactLoading: true,
    contactForm: {
        internalid: null,
        salutation: '',
        firstname: '',
        lastname: '',
        phone: '',
        email: '',
        contactrole: '',
        title: '',
        company: null, // internal id of customer record
        entityid: '',
        custentity_connect_admin: '',
        custentity_connect_user: '',
    },

    hasRoleWithPortalAdminAccess: false,
}

const getters = {
    all : state => state.contacts,
    modal : state => state.contactModal,
    formBusy : state => state.contactFormBusy,
    loading : state => state.contactLoading,
    modalTitle : state => state.contactModalTitle,
    form : state => state.contactForm,
    hasRoleWithPortalAdminAccess : state => state.hasRoleWithPortalAdminAccess,
}

const mutations = {
    setModal : (state, open = true) => { state.contactModal = open; },
}

const actions = {
    init : async context => {
        if (!context.rootGetters['customerId']) {
            context.state.contactLoading = false;
            return;
        }

        await _loadContacts(context);

        _checkForAdminPortalRoles(context);

        context.state.contactLoading = false;
    },
    openContactModal : (context, contactId) => {
        context.state.contactModalTitle = 'Add a new contact';

        if (contactId) {
            context.state.contactModalTitle = 'Editing contact #' + contactId;

            let index = context.state.contacts.findIndex(item => parseInt(item.internalid) === parseInt(contactId));

            for (let fieldId in context.state.contactForm) {
                context.state.contactForm[fieldId] = context.state.contacts[index][fieldId];
            }
        } else _resetContactForm(context);

        context.state.contactModal = true;
    },
    closeContactModal : context => { context.state.contactModal = false; },
    saveContactForm : async context => {
        context.state.contactFormBusy = true;

        context.state.contactForm.entityid = context.state.contactForm.firstname + ' ' + context.state.contactForm.lastname;

        if (context.rootGetters['customerId']) {
            try {
                context.state.contactForm.company = context.rootGetters['customerId'];

                await http.post('saveContact', {
                    contactData: context.state.contactForm,
                });

                await _loadContacts(context);

                _checkForAdminPortalRoles(context);
            } catch (e) { console.error(e); }
        }

        context.state.contactFormBusy = false;

        context.state.contactModal = false;
    },
    deleteContact : async (context, internalId) => {
        context.state.contactFormBusy = true;

        try {
            await http.post('setContactAsInactive', {
                contactInternalId: internalId,
            });

            await _loadContacts(context);

            _checkForAdminPortalRoles(context);
        } catch (e) { console.error(e); }

        context.state.contactFormBusy = false;
    },
}

/** -- Fields in customsearch_salesp_contacts saved search --
Internal ID internalid
Customer Internal ID internalid
Customer Name companyname
Mr./Mrs... salutation
First Name firstname
Last Name lastname
Name entityid
Phone phone
Email email
Job Title title
Role contactrole
Formula (Text) formulatext
Portal Admin custentity_connect_admin
Portal User custentity_connect_user
MPEX Contact custentity_mpex_contact
 **/
async function _loadContacts(context) {
    if (!context.rootGetters['customerId']) return;

    let data = await http.get('getCustomerContacts', {
        customerId: context.rootGetters['customerId']
    });

    context.state.contacts = [...data];
}

function _checkForAdminPortalRoles(context) {
    context.state.hasRoleWithPortalAdminAccess = false;

    for (let contact of context.state.contacts) {
        if (parseInt(contact.custentity_connect_admin) === 1) {
            context.state.hasRoleWithPortalAdminAccess = true;
            break;
        }
    }
}

function _resetContactForm(context) {
    for (let fieldId in context.state.contactForm) {
        context.state.contactForm[fieldId] = '';
    }

    context.state.contactForm.company = context.rootGetters['customerId'] || null;
    context.state.contactForm.internalid = null;
}

export default {
    state,
    getters,
    actions,
    mutations
};