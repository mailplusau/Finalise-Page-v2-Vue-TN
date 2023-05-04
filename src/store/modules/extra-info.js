import http from "@/utils/http";
import {ACTION_CHECK_FOR_UNSAVED_CHANGES} from "@/utils/utils";

const state = {
    currentServices: {
        serviceRecord: {
            internalid: null, // Service Record's Internal ID
            custrecord_service: null, // Service Type ID
            custrecord_service_price: '0.00', // Service Price
            custrecord_service_description: '', // Service Description
            custrecord_service_customer: null, // Customer's Internal ID

            custrecord_service_day_mon: false,
            custrecord_service_day_tue: false,
            custrecord_service_day_wed: false,
            custrecord_service_day_thu: false,
            custrecord_service_day_fri: false,
            custrecord_service_day_adhoc: false,
        },
        data: {
            custentity_ampo_service_price: '',
            custentity_ampo_service_time: '',
            custentity_pmpo_service_price: '',
            custentity_pmpo_service_time: '',
        },
        form: {},
        serviceTimeOptions: [],
        busy: true,
        formDisabled: true,
        servicePerformed: [],
        serviceTypes: [],
    },
    mpProducts: {
        data: {
            custentity_portal_training_required: false, //
            custentity_mpex_customer: false, // is MPEX Customer
            custentity_form_mpex_usage_per_week: null, // MPEX Weekly Usage
            custentity_mpex_invoicing_cycle: '', // MPEX Invoicing Cycle
        },
        form: {},
        busy: true,
        formDisabled: true,
        productPricing: [],
    },
    salesNotes: {
        data: {
            custentity_customer_pricing_notes: ''
        },
        form: {},
        busy: true,
        formDisabled: true,
        salesActivities: []
    },
    surveyInfo: {
        data: {
            custentity_services_of_interest: '',
            custentity_category_multisite_link: '',
            custentity_category_multisite: false, // true or false
        },
        form: {},
        busy: true,
        formDisabled: true,
    }
};

const getters = {
    currentServices : state => state.currentServices,
    mpProducts : state => state.mpProducts,
    salesNotes : state => state.salesNotes,
    surveyInfo : state => state.surveyInfo,
};

const mutations = {
    resetCurrentServicesForm : state => { state.currentServices.form = {...state.currentServices.data}; },
    disableCurrentServicesForm : (state, disabled = true) => { state.currentServices.formDisabled = disabled; },

    resetMpProductsForm : state => { state.mpProducts.form = {...state.mpProducts.data}; },
    disabledMpProductsForm : (state, disabled = true) => { state.mpProducts.formDisabled = disabled; },

    resetSalesNotesForm : state => { state.salesNotes.form = {...state.salesNotes.data}; },
    disableSalesNotesForm : (state, disabled = true) => { state.salesNotes.formDisabled = disabled; },

    resetSurveyInfoForm : state => { state.surveyInfo.form = {...state.surveyInfo.data}; },
    disableSurveyInfosForm : (state, disabled = true) => { state.surveyInfo.formDisabled = disabled; },
};

const actions = {
    init : context => {
        if (!context.rootGetters['customerId']) return;

        context.dispatch('initCurrentServicesTab').then();
        context.dispatch('initMPProductsTab').then();
        context.dispatch('initSalesNotesTab').then();
        context.dispatch('initSurveyInfoTab').then();
    },
    initCurrentServicesTab : async context => {
        try {
            let fieldIds = [];
            for (let fieldId in context.state.currentServices.data) fieldIds.push(fieldId);

            let data = await http.get('getCustomerDetails', {
                customerId: context.rootGetters['customerId'],
                fieldIds,
            });

            for (let fieldId in context.state.currentServices.data)
                context.state.currentServices.data[fieldId] = data[fieldId];

            let options = await http.get('getSelectOptions', {
                id: null, type: 'customlist_service_time_range', valueColumnName: 'internalId', textColumnName: 'name'
            });

            context.state.currentServices.serviceTimeOptions = [...options];

            fieldIds.splice(0);
            for (let fieldId in context.state.currentServices.serviceRecord) fieldIds.push(fieldId);

            let services = await http.get('getAssignedServices', {
                customerId: context.rootGetters['customerId'],
                fieldIds,
            });

            context.state.currentServices.servicePerformed = [...services];

            let serviceTypes = await http.get('getServiceTypes');

            context.state.currentServices.serviceTypes = [...serviceTypes];

            context.commit('resetCurrentServicesForm');

            context.state.currentServices.busy = false;
        } catch (e) {console.error(e);}
    },
    saveServiceDetails : async context => {
        context.state.currentServices.busy = true;

        let fieldIds = [];
        for (let fieldId in context.state.currentServices.data) fieldIds.push(fieldId);

        try {
            let data = await http.post('saveCustomerDetails', {
                customerId: context.rootGetters['customerId'],
                customerData: {...context.state.currentServices.form},
                fieldIds,
            });

            for (let fieldId in context.state.currentServices.data) context.state.currentServices.data[fieldId] = data[fieldId];

            context.commit('resetCurrentServicesForm');
        } catch (e) { console.error(e); }

        context.state.currentServices.busy = false;
    },
    initMPProductsTab : async context => {
        try {
            let fieldIds = [];
            for (let fieldId in context.state.mpProducts.data) fieldIds.push(fieldId);

            let data = await http.get('getCustomerDetails', {
                customerId: context.rootGetters['customerId'],
                fieldIds,
            });

            for (let fieldId in context.state.mpProducts.data)
                context.state.mpProducts.data[fieldId] = data[fieldId];

            context.commit('resetMpProductsForm');

            let productPricing = await http.get('getProductPricing', {
                customerId: context.rootGetters['customerId'],
            });

            context.state.mpProducts.productPricing = [...productPricing];

            context.state.mpProducts.busy = false;
        } catch (e) {console.error(e);}
    },
    saveMpExProductsDetails : async context => {
        context.state.mpProducts.busy = true;

        let fieldIds = [];
        for (let fieldId in context.state.mpProducts.data) fieldIds.push(fieldId);

        try {
            let data = await http.post('saveCustomerDetails', {
                customerId: context.rootGetters['customerId'],
                customerData: {...context.state.mpProducts.form},
                fieldIds,
            });

            for (let fieldId in context.state.mpProducts.data) context.state.mpProducts.data[fieldId] = data[fieldId];

            context.commit('resetMpProductsForm');
        } catch (e) { console.error(e); }

        context.state.mpProducts.busy = false;
    },
    initSalesNotesTab : async context => {
        try {
            let fieldIds = [];
            for (let fieldId in context.state.salesNotes.data) fieldIds.push(fieldId);

            let data = await http.get('getCustomerDetails', {
                customerId: context.rootGetters['customerId'],
                fieldIds,
            });

            for (let fieldId in context.state.salesNotes.data)
                context.state.salesNotes.data[fieldId] = data[fieldId];

            context.commit('resetSalesNotesForm');

            let salesActivities = await http.get('getSalesCampaignActivities', {
                customerId: context.rootGetters['customerId'],
            });

            context.state.salesNotes.salesActivities = [...salesActivities];

            context.state.salesNotes.busy = false;
        } catch (e) {console.error(e);}
    },
    savePricingNote : async context => {
        context.state.salesNotes.busy = true;

        let fieldIds = [];
        for (let fieldId in context.state.salesNotes.data) fieldIds.push(fieldId);

        try {
            let data = await http.post('saveCustomerDetails', {
                customerId: context.rootGetters['customerId'],
                customerData: {...context.state.salesNotes.form},
                fieldIds,
            });

            for (let fieldId in context.state.salesNotes.data) context.state.salesNotes.data[fieldId] = data[fieldId];

            context.commit('resetSalesNotesForm');
        } catch (e) { console.error(e); }

        context.state.salesNotes.busy = false;
    },
    initSurveyInfoTab : async context => {
        try {
            let fieldIds = [];
            for (let fieldId in context.state.surveyInfo.data) fieldIds.push(fieldId);

            let data = await http.get('getCustomerDetails', {
                customerId: context.rootGetters['customerId'],
                fieldIds,
            });

            for (let fieldId in context.state.surveyInfo.data)
                context.state.surveyInfo.data[fieldId] = data[fieldId];

            context.commit('resetSurveyInfoForm');

            context.state.surveyInfo.busy = false;
        } catch (e) {console.error(e);}
    },
    saveSurveyInfo : async context => {
        context.state.surveyInfo.busy = true;

        let fieldIds = [];
        for (let fieldId in context.state.surveyInfo.data) fieldIds.push(fieldId);

        try {
            let data = await http.post('saveCustomerDetails', {
                customerId: context.rootGetters['customerId'],
                customerData: {...context.state.surveyInfo.form},
                fieldIds,
            });

            for (let fieldId in context.state.surveyInfo.data) context.state.surveyInfo.data[fieldId] = data[fieldId];
        } catch (e) { console.error(e); }

        context.commit('resetSurveyInfoForm');

        context.state.surveyInfo.busy = false;
    }
};

actions[ACTION_CHECK_FOR_UNSAVED_CHANGES] = context => {
    let unsavedChanges = []

    if (!context.state.currentServices.busy && !context.state.currentServices.formDisabled)
        unsavedChanges.push('Current Services Tab');

    if (!context.state.mpProducts.busy && !context.state.mpProducts.formDisabled)
        unsavedChanges.push('MP Product Tab');

    if (!context.state.salesNotes.busy && !context.state.salesNotes.formDisabled)
        unsavedChanges.push('Sales Notes Tab');

    if (!context.state.surveyInfo.busy && !context.state.surveyInfo.formDisabled)
        unsavedChanges.push('Survey Information Tab');

    return unsavedChanges;
}

export default {
    state,
    getters,
    actions,
    mutations
};