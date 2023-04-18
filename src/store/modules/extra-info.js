import http from "@/utils/http";

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
    }
};

const getters = {
    currentServices : state => state.currentServices,
};

const mutations = {
    resetCurrentServicesForm : state => { state.currentServices.form = {...state.currentServices.data}; },
    disableCurrentServicesForm : (state, disabled = true) => { state.currentServices.formDisabled = disabled; },
};

const actions = {
    init : context => {
        if (!context.rootGetters['customerId']) return;

        context.dispatch('initCurrentServicesTab').then(() => {console.log(context.state.currentServices)});
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
    }
};

export default {
    state,
    getters,
    actions,
    mutations
};