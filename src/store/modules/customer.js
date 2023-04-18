import getNSModules from '../../utils/ns-modules';
import http from "@/utils/http";

// const financeRole = [1001, 1031, 1023];
// const dataSysCoordinatorRole = [1032];
// const mpAdminRole = [1006];
// const adminRole = [3];

const state = {
    busy: true,
    details: {
        companyname: '',
        vatregnumber: '',
        email: '',
        altphone: '',
        phone: '',
        custentity_email_service: '',
        custentity_industry_category: '',
        leadsource: '',
        partner: '',
        entitystatus: '',
        custentity_old_zee: '',
        custentity_old_customer: '',
        custentity_new_zee: '',
        custentity_new_customer: '',

        custentity_mp_toll_salesrep: '', // Account Manager ID

        custentity_service_fuel_surcharge: 1, // 1: yes, 2: no, 3: not included
        custentity_service_fuel_surcharge_percen: 9.5, // 9.5% is default

        custentity_maap_bankacctno: null,
        custentity_maap_bankacctno_parent: null,
    },
    detailForm: {},
    detailFormValid: false,
    detailFormDisabled: true,

    accountManagers: [
        {value: 668711, text: 'Lee Russell'},
        {value: 696160, text: 'Kerina Helliwell'},
        {value: 690145, text: 'David Gdanski'},
        {value: 668712, text: 'Belinda Urbani'},
    ],
};

let getters = {
    busy : state => state.busy,
    details : state => state.details,
    detailForm : state => state.detailForm,
    detailFormValid : state => state.detailFormValid,
    detailFormDisabled : state => state.detailFormDisabled,
    accountManagers : state => state.accountManagers,

    yesNoOptions : state => state.yesNoOptions,
};

const mutations = {
    setBusy : (state, busy = true) => { state.busy = busy; },

    resetDetailForm : state => { state.detailForm = {...state.details}; },
    disableDetailForm : (state, disabled = true) => { state.detailFormDisabled = disabled; },
}

let actions = {
    init : context => {
        if (!context.rootGetters['customerId']) return;

        context.dispatch('getDetails').then();

        context.commit('setBusy', false);
    },
    getDetails : async (context) => {
        if (context.rootGetters['customerId']) {
            try {
                let fieldIds = [];
                for (let fieldId in context.state.details) fieldIds.push(fieldId);

                let data = await http.get('getCustomerDetails', {
                    customerId: context.rootGetters['customerId'],
                    fieldIds,
                });

                for (let fieldId in context.state.details) context.state.details[fieldId] = data[fieldId];

                _updateFormTitleAndHeader(context)

                context.commit('disableDetailForm');
            } catch (e) {console.error(e);}
        }

        context.commit('resetDetailForm');
    },
    handleOldCustomerIdChanged : async (context) => {
        if (!context.state.detailForm.custentity_old_customer) return;

        let NS_MODULES = await getNSModules();

        let result = NS_MODULES.search.lookupFields({
            type: NS_MODULES.search.Type.CUSTOMER,
            id: context.state.detailForm.custentity_old_customer,
            columns: ['partner']
        });

        context.state.detailForm.custentity_old_zee = result.partner ? result.partner[0].value : '';
    },
    saveCustomer : async context => {
        context.commit('setBusy');
        context.commit('disableDetailForm');
        context.commit('displayBusyGlobalModal',
            {title: 'Saving Data', message: 'Saving Customer\'s Details. Please Wait...', open: true}, {root: true});

        // Prepare data for submission
        let fieldIds = [];
        for (let fieldId in context.state.details) fieldIds.push(fieldId);
        context.state.details = {...context.state.detailForm};

        try {
            let data = await http.post('saveCustomerDetails', {
                customerId: context.rootGetters['customerId'],
                customerData: {...context.state.details},
                fieldIds,
            });

            for (let fieldId in context.state.details) context.state.details[fieldId] = data[fieldId];

            context.commit('resetDetailForm');
        } catch (e) { console.error(e); }

        context.commit('setBusy', false);
        context.commit('displayBusyGlobalModal', {open: false}, {root: true});
    },
};

function _updateFormTitleAndHeader(context) {
    let title, header;

    header = context.rootGetters['callCenterMode'] ? 'Call Center: ' : 'Finalise X Sale: ';

    header += context.rootGetters['customerId'] + ' ' + context.state.details.companyname;

    title = header + ' - NetSuite Australia (Mail Plus Pty Ltd)';

    document.querySelector('h1.uir-record-type').innerHTML = header;
    document.title = title;
}

export default {
    state,
    getters,
    actions,
    mutations
};