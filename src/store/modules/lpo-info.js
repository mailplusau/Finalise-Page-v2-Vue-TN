import http from "@/utils/http";
import {ACTION_CHECK_FOR_UNSAVED_CHANGES} from '@/utils/utils';

const state = {
    salesRecord: {
        internalid: null,
        custrecord_sales_campaign: null,
    },
    customer: {
        parent: null, // Parent Customer
        companyname: '',
        custentity_invoice_method: null, // Email (2) or LPO (10)
        custentity_invoice_by_email: true, // Invoice By Email
        custentity18: true, // Exclude From Batch Printing
        custentity_exclude_debtor: false, // Exclude From Debtor Campaign
        custentity_fin_consolidated: false, // Consolidated Invoices

        entitystatus: null,

        custentity_previous_carrier: null, // Account Type
        custentity_lpo_account_status: null, // Account Status
        custentity_lpo_date_last_sales_activity: null, // Last sales activity date
        custentity_lpo_notes: '', // Note

        custentity_mypost_business_number: '', //
        custentity_lpo_profile_assigned: '', //
        custentity_lpo_lead_priority: '',
        custentity_lpo_account_type_linked: '',
    },
    franchisees: [],

    form: {
        data: {},
        busy: false,
        disabled: true,
    },
    invoiceMethodOptions: [
        {value: '2', text: 'Customer'},
        {value: '10', text: 'LPO'},
    ],
    lpoProfileOptions: [
        {value: '1', text: 'LPO'},
        {value: '2', text: 'Corporate'},
        {value: '3', text: 'Not Linked'},
    ],
    lpoAccountTypes: [
        {value: '1', text: 'MyPost'},
        {value: '2', text: 'eParcel'},
        {value: '3', text: 'Charge Account'},
    ],
    leadPriorityOptions: [
        {value: '1', text: 'High'},
        {value: '2', text: 'Medium'},
        {value: '3', text: 'Low'},
    ],
};

state.form.data = {...state.customer};

const getters = {
    form : state => state.form,
    franchisees : state => state.franchisees,
    invoiceMethodOptions : state => state.invoiceMethodOptions,
    customerInvoiceMethod : state => parseInt(state.customer.custentity_invoice_method),
    lpoProfileOptions : state => state.lpoProfileOptions,
    lpoAccountTypes : state => state.lpoAccountTypes,
    leadPriorityOptions : state => state.leadPriorityOptions,

    isLPO : (state, getters, rootState, rootGetters) => {
        let index = state.franchisees
            .findIndex(item => parseInt(item.custentity_lpo_linked_franchisees) === parseInt(rootGetters['customer/details'].partner))

        // Franchisee is linked to LPO and campaign in sales record set as LPO (69)
        return index >= 0 && parseInt(state.salesRecord.custrecord_sales_campaign) === 69;
    },
    isLastSalesActivityWithin90Days : state => { // check if last sales activity is set within the last 90 days
        if (!state.customer.custentity_lpo_date_last_sales_activity) return false;

        let lastSales = new Date(state.customer.custentity_lpo_date_last_sales_activity).getTime();
        let today = new Date().getTime();

        return (today - lastSales) < 90 * 24 * 60 * 60 * 1000;
    },
    parentLpoOptions : (state, getters, rootState, rootGetters) => {
        return state.franchisees
            .filter(item => parseInt(item.custentity_lpo_linked_franchisees) === parseInt(rootGetters['customer/details'].partner))
            .map(item => ({value: item.internalid, text: item.entityid + ' ' + item.companyname}));
    }
};

const mutations = {
    resetForm : state => { state.form.data = {...state.customer}; },
    disableForm : (state, disabled = true) => { state.form.disabled = disabled; },

    handleInvoiceMethodChanged : state => {
        if (parseInt(state.form.data.custentity_invoice_method) === 2) {
            state.form.data.custentity_invoice_by_email = true;
            state.form.data.custentity18 = true;
            state.form.data.custentity_exclude_debtor = false;
            state.form.data.custentity_fin_consolidated = false;
        } else if (parseInt(state.form.data.custentity_invoice_method) === 10) {
            state.form.data.custentity_invoice_by_email = true;
            state.form.data.custentity18 = true;
            state.form.data.custentity_exclude_debtor = true;
            state.form.data.custentity_fin_consolidated = true;
        }
    }
};

const actions = {
    init : async context => {
        if (!context.rootGetters['customerId'] || !context.rootGetters['salesRecordId'])
            return;

        await _getFranchisees(context);
        await _checkLPOCampaign(context);
        await _getCustomerDetails(context);
    },
    saveLPOInfo : async context => {
        context.commit('displayBusyGlobalModal',
            {title: 'Saving Data', message: 'Saving Customer\'s LPO Information. Please Wait...', open: true}, {root: true});

        await _saveCustomerDetails(context);

        context.state.form.disabled = true;

        context.commit('displayBusyGlobalModal', {open: false}, {root: true});
    },
    convertToLPO : async context => {
        context.commit('displayBusyGlobalModal',
            {title: 'Processing', message: 'Converting to LPO Campaign. Please Wait...', open: true}, {root: true});

        await http.post('convertLeadToLPO', {
            customerId: context.rootGetters['customerId'],
            salesRecordId: context.rootGetters['salesRecordId'],
        });

        context.commit('displayBusyGlobalModal',
            {title: 'Redirecting', message: 'Conversion complete. Redirecting to NetSuite. Please Wait...', open: true}, {root: true});

        context.dispatch('goToNetSuiteCustomerPage', null, {root: true}).then();
    },
    convertToBAU : async context => {
        context.commit('displayBusyGlobalModal',
            {title: 'Processing', message: 'Converting to Business As Usual. Please Wait...', open: true}, {root: true});

        await http.post('convertLeadToBAU', {
            customerId: context.rootGetters['customerId'],
            salesRecordId: context.rootGetters['salesRecordId'],
        });

        context.commit('displayBusyGlobalModal',
            {title: 'Redirecting', message: 'Conversion complete. Redirecting to NetSuite. Please Wait...', open: true}, {root: true});

        context.dispatch('goToNetSuiteCustomerPage', null, {root: true}).then();
    },
};

actions[ACTION_CHECK_FOR_UNSAVED_CHANGES] = context => {
    let unsavedChanges = [];
    let fieldsToCheck = ['custentity_lpo_account_status'];

    if (!context.getters['isLPO']) return unsavedChanges;

    if (!context.state.form.busy && !context.state.form.disabled) unsavedChanges.push('LPO Information');
    else {
        for (let fieldId of fieldsToCheck)
            if (!context.state.customer[fieldId]) {
                context.state.form.disabled = false;
                unsavedChanges.push('LPO Information: One or more required fields are empty.');
                break;
            }
    }

    let index = context.getters['parentLpoOptions'].findIndex(item => parseInt(item.value) === parseInt(context.state.customer.parent));
    if (index < 0) unsavedChanges.push('LPO Information: [Parent LPO] field is required');

    return unsavedChanges;
}

async function _checkLPOCampaign(context) {
    let fieldIds = [];
    for (let fieldId in context.state.salesRecord) fieldIds.push(fieldId);

    context.state.salesRecord = await http.get('getSalesRecord', {
        salesRecordId: context.rootGetters['salesRecordId'], fieldIds
    });
}

async function _getFranchisees(context) {
    context.state.franchisees = await http.get('getFranchiseesOfLPOProject');
}

async function _getCustomerDetails(context) {
    let fieldIds = [];
    for (let fieldId in context.state.customer) fieldIds.push(fieldId);

    let data = await http.get('getCustomerDetails', {
        customerId: context.rootGetters['customerId'],
        fieldIds,
    });

    for (let fieldId in context.state.customer)
        context.state.customer[fieldId] = data[fieldId];

    let index = context.getters['parentLpoOptions'].findIndex(item => parseInt(item.value) === parseInt(context.state.customer.parent));
    if (index < 0) {
        context.state.customer.parent = null;
        context.state.form.disabled = false;
    }

    context.commit('resetForm');

    if (index < 0 && context.getters['parentLpoOptions'].length === 1)
        context.state.form.data.parent = context.getters['parentLpoOptions'][0].value;
}

async function _saveCustomerDetails(context) {
    let fieldIds = [];
    for (let fieldId in context.state.customer) fieldIds.push(fieldId);

    let customerData = JSON.parse(JSON.stringify(context.state.form.data));

    // if Account Status is set and lead's status is SUSPECT-New or SUSPECT-Hot lead
    if (customerData['custentity_lpo_account_status'] && [6, 57].includes(parseInt(customerData['entitystatus'])))
        customerData['entitystatus'] = 42; // SUSPECT-Qualified

    // if LPO pays the invoices and company name does not have prefix yet, we prefix company name with LPO
    // else if LPO doesn't pay invoices and lead source is not LPO - Transition (281559), we strip the prefix
    if (parseInt(customerData['custentity_invoice_method']) === 10 && !/^(LPO - )/gi.test(customerData['companyname']))
        customerData['companyname'] = 'LPO - ' + customerData['companyname'];
    else if (parseInt(customerData['custentity_invoice_method']) !== 10 && parseInt(context.rootState['customer'].details.leadsource) !== 281559)
        customerData['companyname'] = customerData['companyname'].replace(/^(LPO - )/gi, '');

    let data = await http.post('saveCustomerDetails', {
        customerId: context.rootGetters['customerId'],
        customerData,
        fieldIds,
    });

    for (let fieldId in context.state.customer) context.state.customer[fieldId] = data[fieldId];

    await context.dispatch('customer/getDetails', null, {root: true});

    context.commit('resetForm');
}

export default {
    state,
    getters,
    actions,
    mutations
};