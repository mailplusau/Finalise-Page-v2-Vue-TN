import http from "@/utils/http";

const baseURL = 'https://' + process.env.VUE_APP_NS_REALM + '.app.netsuite.com';

const state = {
    salesNote: '',
};

const getters = {
    salesNote : state => state.salesNote
};

const mutations = {
    setSalesNote : (state, note = '') => { state.salesNote = note; },
};

const actions = {
    redirectToNetSuiteCustomerPage : async context => {
        if (!context.rootGetters['customerId']) return;

        context.commit('displayBusyGlobalModal',
            {title: 'Redirecting...', message: 'Redirecting to Customer Page. Please Wait...', open: true}, {root: true});

        window.location.href = baseURL + '/app/common/entity/custjob.nl?id=' + context.rootGetters['customerId'];
    },
    handleNoAnswerOnPhone : async context => {
        context.commit('displayBusyGlobalModal',
            {title: 'Processing...', message: 'Processing outcome [No Answer - Phone Call]. Please Wait...', open: true}, {root: true});

        if (await _sendCallCenterOutcome(context, 'NO_ANSWER_PHONE'))
            context.dispatch('redirectToNetSuiteCustomerPage').then();
    },
    sendEmailSigned : async context => {
        if (!_areAddressesGeocoded(context)) return; // check for non-geocoded address, throw error if any

        context.commit('displayBusyGlobalModal',
            {title: 'Redirecting...', message: 'Redirecting to Email Module. Please Wait...', open: true}, {root: true});

        await _createSalesNote(context);

        // Change customer status to CUSTOMER-To Be Finalised
        await context.dispatch('customer/changeStatus', 66, {root: true});

        _goToSendEmailModule(context, {closedwon: 'T', savecustomer: 'F'});
    },
    sendEmailQuote : async context => {
        if (!_areAddressesGeocoded(context)) return; // check for non-geocoded address, throw error if any

        context.commit('displayBusyGlobalModal',
            {title: 'Redirecting...', message: 'Redirecting to Email Module. Please Wait...', open: true}, {root: true});

        await _createSalesNote(context);

        _goToSendEmailModule(context, {oppwithvalue: 'T', savecustomer: 'F'});
    },
    handleNoAnswerEmail : async context => {
        context.commit('displayBusyGlobalModal',
            {title: 'Processing...', message: 'Processing Sales Outcome. Please Wait...', open: true}, {root: true});

        if (await _sendCallCenterOutcome(context, 'NO_ANSWER_EMAIL'))
            context.dispatch('redirectToNetSuiteCustomerPage').then();
    },
    setAppointment : async context => {
        context.commit('displayBusyGlobalModal',
            {title: 'Redirecting...', message: 'Redirecting to Email Module. Please Wait...', open: true}, {root: true});

        await _createSalesNote(context);

        _goToSendEmailModule(context, {callback: 'T'});
    },
    handleNoResponseEmail : async context => {
        context.commit('displayBusyGlobalModal',
            {title: 'Processing...', message: 'Processing Sales Outcome. Please Wait...', open: true}, {root: true});

        if (await _sendCallCenterOutcome(context, 'NO_RESPONSE_EMAIL'))
            context.dispatch('redirectToNetSuiteCustomerPage').then();
    },
    sendEmailQuoteSavedCustomer : async context => {
        context.commit('displayBusyGlobalModal',
            {title: 'Redirecting...', message: 'Redirecting to Email Module. Please Wait...', open: true}, {root: true});

        await _createSalesNote(context);

        _goToSendEmailModule(context, {oppwithvalue: 'T', savecustomer: 'T'});
    },
    handleNoSale : async context => {
        context.commit('displayBusyGlobalModal',
            {title: 'Redirecting...', message: 'Redirecting to Email Module. Please Wait...', open: true}, {root: true});

        await _createSalesNote(context);

        _goToSendEmailModule(context, {nosale: 'T'});
    },
    handleNotEstablished : async context => {
        context.commit('displayBusyGlobalModal',
            {title: 'Processing...', message: 'Processing Sales Outcome. Please Wait...', open: true}, {root: true});

        if (await _sendCallCenterOutcome(context, 'NOT_ESTABLISHED'))
            context.dispatch('redirectToNetSuiteCustomerPage').then();
    },
    reassignToRep : async context => {
        context.commit('displayBusyGlobalModal',
            {title: 'Redirecting...', message: 'Redirecting to Sales Campaign. Please Wait...', open: true}, {root: true});

        await _createSalesNote(context);

        let url = baseURL + window['nlapiResolveURL']('suitelet',
                'customscript_sl_sales_campaign_popup',
                'customdeploy_sl_sales_campaign_popup') + '&sales_record_id=' +
            parseInt(context.rootGetters['salesRecordId']) + '&recid=' + parseInt(context.rootGetters['customerId']);

        window.open(url, "_self",
            "height=300,width=300,modal=yes,alwaysRaised=yes,location=0,toolbar=0");
    },
    handleOffPeak : async context => {
        context.commit('displayBusyGlobalModal',
            {title: 'Redirecting...', message: 'Redirecting to Customer Page. Please Wait...', open: true}, {root: true});

        await _createSalesNote(context);

        // Change customer status to SUSPECT-Off Peak Pipeline
        await context.dispatch('customer/changeStatus', 62, {root: true});

        context.dispatch('redirectToNetSuiteCustomerPage').then();
    },
    followUp : async context => {
        context.commit('displayBusyGlobalModal',
            {title: 'Processing...', message: 'Processing Sales Outcome. Please Wait...', open: true}, {root: true});

        if (await _sendCallCenterOutcome(context, 'FOLLOW_UP'))
            context.dispatch('redirectToNetSuiteCustomerPage').then();
    },
    notifyITTeam : async context => {
        context.commit('displayBusyGlobalModal',
            {title: 'Notifying IT Team...', message: 'Sending email. Please Wait...', open: true}, {root: true});

        try {
            await http.post('notifyITTeam', {
                customerId: context.rootGetters['customerId'],
                salesRecordId: context.rootGetters['salesRecordId'],
            });

            _goToSendEmailModule(context, {closedwon: 'T', savecustomer: 'T'});
        } catch (e) { console.error(e); }

        context.commit('displayBusyGlobalModal', {open: false}, {root: true});
    }
};

function _goToSendEmailModule(context, extraParams) {
    let params = {
        custid: parseInt(context.rootGetters['customerId']),
        sales_record_id: parseInt(context.rootGetters['salesRecordId']),
        id: 'customscript_sl_finalise_page_tn_v2_vue',
        deploy: 'customdeploy_sl_finalise_page_tn_v2_vue',

        ...extraParams,
    };

    params = JSON.stringify(params);

    let upload_url = baseURL + window['nlapiResolveURL']('suitelet',
        'customscript_sl_send_email_module', 'customdeploy_sl_send_email_module') + '&params=' + params;

    window.open(upload_url, "_self",
        "height=750,width=650,modal=yes,alwaysRaised=yes");
}

async function _createSalesNote(context) {
    if (!context.state.salesNote) return;

    try {
        await http.post('createSalesNote', {
            userId: context.rootGetters['userId'],
            salesNote: context.state.salesNote,
            customerId: context.rootGetters['customerId'],
            salesRecordId: context.rootGetters['salesRecordId'],
        });

        context.state.salesNote = '';
    } catch (e) { console.error(e); }
}

async function _sendCallCenterOutcome(context, outcome) {
    try {
        await http.post('handleCallCenterOutcomes', {
            salesNote: context.state.salesNote,
            customerId: context.rootGetters['customerId'],
            salesRecordId: context.rootGetters['salesRecordId'],
            userId: context.rootGetters['userId'],
            localUTCOffset: new Date().getTimezoneOffset(),
            outcome
        });

        context.state.salesNote = '';
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
}

function _areAddressesGeocoded(context) {
    let index = context.rootGetters['addresses/all']
        .findIndex(item => (!item.custrecord_address_lat || !item.custrecord_address_lon));

    if (index >= 0)
        context.commit('displayErrorGlobalModal', {
            title: 'Geocode missing',
            message: 'One of the addresses is not geocoded. Please geocode the address using the autofill first then try again.'
        }, {root: true});

    return index < 0;
}

export default {
    state,
    getters,
    actions,
    mutations
};