import getNSModules from '../../utils/ns-modules';
import {ACTION_CHECK_FOR_UNSAVED_CHANGES} from "@/utils/utils";
import http from "@/utils/http";

// const financeRole = [1001, 1031, 1023];
// const dataSysCoordinatorRole = [1032];
// const mpAdminRole = [1006];
// const adminRole = [3];

const state = {
    busy: true,
    details: {
        entityid: '',
        companyname: '',
        vatregnumber: '',
        custentity_website_page_url: '', // Website
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

        custentity_cancel_ongoing: '',

        custentity_terms_conditions_agree_date: '', // t&c agreement date
        custentity_terms_conditions_agree: '', // 1: yes, 2: no
        custentity_mp_toll_zeevisit_memo: '', // franchisee visit date
        custentity_mp_toll_zeevisit: false,
    },
    texts: {},
    detailForm: {},
    detailFormValid: false,
    detailFormDisabled: true,

    accountManagers: [
        {value: 668711, text: 'Lee Russell'},
        {value: 696160, text: 'Kerina Helliwell'},
        {value: 690145, text: 'David Gdanski'},
        {value: 668712, text: 'Belinda Urbani'},
    ],

    photos: {
        data: [],
        busy: false,
    },
    franchiseeSelector: {
        open: false,
        required: true,
        busy: false,
    }
};

let getters = {
    busy : state => state.busy,
    details : state => state.details,
    texts : state => state.texts,
    detailForm : state => state.detailForm,
    detailFormValid : state => state.detailFormValid,
    detailFormDisabled : state => state.detailFormDisabled,
    accountManagers : state => state.accountManagers,
    photos : state => state.photos,
    franchiseeSelector : state => state.franchiseeSelector,

    status : state => parseInt(state.details.entitystatus),
    saved : state => parseInt(state.details.custentity_cancel_ongoing),

    yesNoOptions : state => state.yesNoOptions,
};

const mutations = {
    setBusy : (state, busy = true) => { state.busy = busy; },

    resetDetailForm : state => { state.detailForm = {...state.details}; },
    disableDetailForm : (state, disabled = true) => { state.detailFormDisabled = disabled; },

    updateStatus : (state, {id, text}) => {
        state.details.entitystatus = id;
        state.texts.entitystatus = text;
    }
}

let actions = {
    init : context => {
        if (!context.rootGetters['customerId']) return;

        context.dispatch('getDetails').then();
        context.dispatch('getPhotos').then();
    },
    getPhotos : async context => {
        context.state.photos.busy = true;

        try {
            context.state.photos.data = await http.get('getPhotosOfBusiness', {
                customerId: context.rootGetters['customerId'],
            });
        } catch (e) {console.log(e);}

        context.state.photos.busy = false;
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

                for (let fieldId in context.state.details) {
                    if (fieldId === 'partner' && parseInt(data[fieldId]) === 435) {
                        context.state.details[fieldId] = null;
                        context.state.texts[fieldId] = '';
                        continue;
                    }
                    context.state.details[fieldId] = data[fieldId];
                    context.state.texts[fieldId] = data[fieldId + '_text'];
                }

                _updateFormTitleAndHeader(context);

                context.state.franchiseeSelector.required = !context.state.details.partner;
                context.state.franchiseeSelector.open = !context.state.details.partner;

                context.commit('disableDetailForm');

                context.commit('setBusy', false);
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

        try {
            _addTimezoneOffset(context.state.detailForm.custentity_terms_conditions_agree_date);
            _addTimezoneOffset(context.state.detailForm.custentity_mp_toll_zeevisit_memo);

            let data = await http.post('saveCustomerDetails', {
                customerId: context.rootGetters['customerId'],
                customerData: context.state.detailForm,
                fieldIds,
            });

            for (let fieldId in context.state.details) {
                context.state.details[fieldId] = data[fieldId];
                context.state.texts[fieldId] = data[fieldId + '_text'];
            }

            context.state.franchiseeSelector.required = !context.state.details.partner;
            context.state.franchiseeSelector.open = !context.state.details.partner;

            context.commit('resetDetailForm');
        } catch (e) { console.error(e); }

        context.commit('setBusy', false);
        context.commit('displayBusyGlobalModal', {open: false}, {root: true});
    },
    setAsOutOfTerritory : async context => {
        context.commit('displayBusyGlobalModal',
            {title: 'Process', message: 'Setting Customer As [Out of Territory]. Please Wait...', open: true}, {root: true});

        await http.post('setAsOutOfTerritory', {
            customerId: context.rootGetters['customerId'],
            salesRecordId: context.rootGetters['salesRecordId'],
        });

        context.commit('displayBusyGlobalModal',
            {title: 'Complete', message: 'Customer Is Set As [Out of Territory]. Redirecting To Their Record Page. Please Wait...', open: true}, {root: true});

        await context.dispatch('goToNetSuiteCustomerPage', null, {root: true});
    },
    changeStatus : async (context, statusId) => {
        try {
            let data = await http.post('saveCustomerDetails', {
                customerId: context.rootGetters['customerId'],
                customerData: {entitystatus: statusId},
                fieldIds: ['entitystatus'],
            });

            context.state.details['entitystatus'] = data['entitystatus'];
            context.state.texts['entitystatus'] = data['entitystatus_text'];

            context.commit('resetDetailForm');
        } catch (e) { console.error(e); }
    },
    saveParkingLotReason : async (context, reasonId) => {
        await http.post('saveCustomerDetails', {
            customerId: context.rootGetters['customerId'],
            customerData: {custentity_lead_parking_lot_reasons: reasonId},
            fieldIds: ['custentity_lead_parking_lot_reasons'],
        });
    }
};

actions[ACTION_CHECK_FOR_UNSAVED_CHANGES] = context => {
    let unsavedChanges = [];

    if (!context.state.busy && !context.state.detailFormDisabled) unsavedChanges.push('Customer\'s Details: Please save your changes');

    if (!context.state.detailForm.custentity_mp_toll_salesrep) unsavedChanges.push('Customer\'s Details: [Account Manager] field is required');

    return unsavedChanges;
}

function _updateFormTitleAndHeader(context) {
    let title, header;

    header = context.rootGetters['callCenterMode'] ? 'Call Center: ' : 'Finalise X Sale: ';

    header += context.state.details.entityid + ' ' + context.state.details.companyname;

    title = header + ' - NetSuite Australia (Mail Plus Pty Ltd)';

    document.querySelector('h1.uir-record-type').innerHTML = header;
    document.title = title;
}

function _addTimezoneOffset(dateObj) {
    if (Object.prototype.toString.call(dateObj) === '[object Date]')
        dateObj.setTime(dateObj.getTime() + ((new Date()).getTimezoneOffset()/-60)*60*60*1000);

    return dateObj;
}

export default {
    state,
    getters,
    actions,
    mutations
};