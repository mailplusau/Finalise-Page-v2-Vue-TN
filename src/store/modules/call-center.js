import http from "@/utils/http";

const baseURL = 'https://' + process.env.VUE_APP_NS_REALM + '.app.netsuite.com';

const state = {
    salesNote: '',
    parkingLotReason: null,
};

const getters = {
    salesNote : state => state.salesNote,
    parkingLotReason : state => state.parkingLotReason
};

const mutations = {
    setSalesNote : (state, note = '') => { state.salesNote = note; },
    setParkingLotReason : (state, reason = 16) => { state.parkingLotReason = reason; },
};

const actions = {
    redirectToNetSuiteCustomerPage : async context => {
        if (!context.rootGetters['customerId']) return;

        context.commit('displayBusyGlobalModal',
            {title: 'Redirecting...', message: 'Redirecting to Customer Page. Please Wait...', open: true}, {root: true});

        await _createSalesNote(context);

        window.location.href = baseURL + '/app/common/entity/custjob.nl?id=' + context.rootGetters['customerId'];
    },
    handleContactMade : async context => {
        context.commit('displayBusyGlobalModal',
            {title: 'Processing...', message: 'Processing Sales Outcome. Please Wait...', open: true}, {root: true});

        await _createSalesNote(context);

        // Change customer status to SUSPECT-In Contact (69)
        await context.dispatch('customer/changeStatus', 69, {root: true});

        context.dispatch('redirectToNetSuiteCustomerPage').then();
    },
    handleQualifiedProspect : async context => {
        context.commit('displayBusyGlobalModal',
            {title: 'Processing...', message: 'Processing Sales Outcome. Please Wait...', open: true}, {root: true});

        await _createSalesNote(context);

        // Change customer status to PROSPECT-Opportunity (58)
        await context.dispatch('customer/changeStatus', 58, {root: true});

        context.dispatch('redirectToNetSuiteCustomerPage').then();
    },
    handleNoAnswerOnPhone : async context => {
        context.commit('displayBusyGlobalModal',
            {title: 'Processing...', message: 'Processing outcome [No Answer - Phone Call]. Please Wait...', open: true}, {root: true});

        await _createSalesNote(context);

        if (await _sendCallCenterOutcome(context, 'NO_ANSWER_PHONE'))
            context.dispatch('redirectToNetSuiteCustomerPage').then();
    },
    setCustomerAsFreeTrial : async context => {
        // check for non-geocoded address, empty email or empty ABN, throw error if any
        if (!_areAddressesGeocoded(context) || !_checkEmailsNotEmptyOrDefaulted(context) || !_checkABNNotEmpty(context)) return;

        context.commit('displayBusyGlobalModal',
            {title: 'Processing...', message: 'Setting Customer as Free Trial. Please Wait...', open: true}, {root: true});

        await _createSalesNote(context);

        // Change customer status to CUSTOMER-Free Trial
        // await context.dispatch('customer/changeStatus', 32, {root: true}); // REMOVE FOR NOW

        _goToSendEmailModule(context, {freetrial: 'T', savecustomer: 'F'}, true);
    },
    approveLPOLead : async context => {
        context.commit('displayBusyGlobalModal',
            {title: 'Processing...', message: 'Setting Lead as Qualified. Please Wait...', open: true}, {root: true});

        await _createSalesNote(context);

        // Change customer status to SUSPECT-Qualified
        await context.dispatch('customer/changeStatus', 42, {root: true});

        window.location.href = baseURL + '/app/common/entity/custjob.nl?id=' + context.rootGetters['customerId'];
    },
    sendEmailSigned : async context => {
        // check for non-geocoded address, empty email or empty ABN, throw error if any
        if (!_areAddressesGeocoded(context) || !_checkEmailsNotEmptyOrDefaulted(context) || !_checkABNNotEmpty(context)) return;

        context.commit('displayBusyGlobalModal',
            {title: 'Redirecting...', message: 'Redirecting to Email Module. Please Wait...', open: true}, {root: true});

        await _createSalesNote(context);

        // Change customer status to CUSTOMER-To Be Finalised
        // await context.dispatch('customer/changeStatus', 66, {root: true}); // REMOVE FOR NOW

        _goToSendEmailModule(context, {closedwon: 'T', savecustomer: 'F'}, true);
    },
    sendEmailQuote : async context => {
        // check for non-geocoded address, empty email or empty ABN, throw error if any
        if (!_areAddressesGeocoded(context) || !_checkEmailsNotEmptyOrDefaulted(context) || !_checkABNNotEmpty(context)) return;

        context.commit('displayBusyGlobalModal',
            {title: 'Redirecting...', message: 'Redirecting to Email Module. Please Wait...', open: true}, {root: true});

        await _createSalesNote(context);

        _goToSendEmailModule(context, {oppwithvalue: 'T', savecustomer: 'F'}, true);
    },
    handleNoAnswerEmail : async context => {
        context.commit('displayBusyGlobalModal',
            {title: 'Processing...', message: 'Processing Sales Outcome. Please Wait...', open: true}, {root: true});

        await _createSalesNote(context);

        if (await _sendCallCenterOutcome(context, 'NO_ANSWER_EMAIL'))
            context.dispatch('redirectToNetSuiteCustomerPage').then();
    },
    setAppointment : async context => {
        context.commit('displayBusyGlobalModal',
            {title: 'Redirecting...', message: 'Redirecting to Email Module. Please Wait...', open: true}, {root: true});

        await _createSalesNote(context);

        _goToSendEmailModule(context, {callback: 'T'}, true);
    },
    handleNoResponseEmail : async context => {
        context.commit('displayBusyGlobalModal',
            {title: 'Processing...', message: 'Processing Sales Outcome. Please Wait...', open: true}, {root: true});

        await _createSalesNote(context);

        if (await _sendCallCenterOutcome(context, 'NO_RESPONSE_EMAIL'))
            context.dispatch('redirectToNetSuiteCustomerPage').then();
    },
    sendEmailQuoteSavedCustomer : async context => {
        context.commit('displayBusyGlobalModal',
            {title: 'Redirecting...', message: 'Redirecting to Email Module. Please Wait...', open: true}, {root: true});

        await _createSalesNote(context);

        _goToSendEmailModule(context, {oppwithvalue: 'T', savecustomer: 'T'}, true);
    },
    handleNoSale : async context => {
        context.commit('displayBusyGlobalModal',
            {title: 'Redirecting...', message: 'Redirecting to Email Module. Please Wait...', open: true}, {root: true});

        await _createSalesNote(context);

        _goToSendEmailModule(context, {nosale: 'T'}, true);
    },
    handleNotEstablished : async context => {
        context.commit('displayBusyGlobalModal',
            {title: 'Processing...', message: 'Processing Sales Outcome. Please Wait...', open: true}, {root: true});

        await _createSalesNote(context);

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

        if (context.rootGetters['user/role'] === 1064) // if user is Lead Qualification
            // Change customer status to PROSPECT-Qualified (70)
            await context.dispatch('customer/changeStatus', 70, {root: true});
        else
            // Change customer status to SUSPECT-Reassign (40)
            await context.dispatch('customer/changeStatus', 40, {root: true});

        window.open(url, "_self",
            "height=300,width=300,modal=yes,alwaysRaised=yes,location=0,toolbar=0");
    },
    handleOffPeak : async context => {
        context.commit('displayBusyGlobalModal',
            {title: 'Redirecting...', message: 'Redirecting to Customer Page. Please Wait...', open: true}, {root: true});

        await _createSalesNote(context);

        // Change customer status to SUSPECT-Parking Lot
        await context.dispatch('customer/changeStatus', 62, {root: true});
        await context.dispatch('customer/saveParkingLotReason', context.state.parkingLotReason, {root: true})

        context.dispatch('redirectToNetSuiteCustomerPage').then();
    },
    followUp : async context => {
        context.commit('displayBusyGlobalModal',
            {title: 'Processing...', message: 'Processing Sales Outcome. Please Wait...', open: true}, {root: true});

        await _createSalesNote(context);

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

            _goToSendEmailModule(context, {closedwon: 'T', savecustomer: 'T'}, true);
        } catch (e) { console.error(e); }

        context.commit('displayBusyGlobalModal', {open: false}, {root: true});
    },
    sendNormalEmail : async context => {
        context.commit('displayBusyGlobalModal',
            {title: 'Redirecting...', message: 'Redirecting to Send Email module. Please Wait...', open: true}, {root: true});

        await _createSalesNote(context);

        _goToSendEmailModule(context, {sendEmail: 'T'}, true);
    }
};

function _goToSendEmailModule(context, extraParams, useNewModule = false) {
    let params = {
        custid: parseInt(context.rootGetters['customerId']),
        sales_record_id: parseInt(context.rootGetters['salesRecordId']),
        id: 'customscript_sl_finalise_page_tn_v2_vue',
        deploy: 'customdeploy_sl_finalise_page_tn_v2_vue',

        ...extraParams,
    };

    params = JSON.stringify(params);
    let upload_url = useNewModule /**&& [409635, 1732844].includes(context.rootGetters['user/id']) **/ ?
        (baseURL + window['nlapiResolveURL']('suitelet',
            'customscript_sl_email_sender_tn_v2_vue', 'customdeploy_sl_email_sender_tn_v2_vue') + '&params=' + params) :
        (baseURL + window['nlapiResolveURL']('suitelet',
            'customscript_sl_send_email_module', 'customdeploy_sl_send_email_module') + '&params=' + params);

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
    if (!context.rootGetters['addresses/all'].length) {
        context.commit('displayErrorGlobalModal', {
            title: 'Empty Address',
            message: 'Customer has no address. Please add at least 1 address for this customer.'
        }, {root: true});

        return false;
    }
    let index = context.rootGetters['addresses/all']
        .findIndex(item => (!item.custrecord_address_lat || !item.custrecord_address_lon));

    if (index >= 0)
        context.commit('displayErrorGlobalModal', {
            title: 'Geocode missing',
            message: 'One of the addresses is not geocoded. Please geocode the address using the autofill first then try again.'
        }, {root: true});

    return index < 0;
}

function _checkEmailsNotEmptyOrDefaulted(context) {
    let valuesToCheck = [null, '', 'abc@abc.com'];

    if (valuesToCheck.includes(context.rootGetters['customer/details'].custentity_email_service)) {
        context.commit('displayErrorGlobalModal', {
            title: 'Customer Record has invalid email addresses',
            message: 'Please check day-to-day email of the customer. Make sure they are valid.'
        }, {root: true});
        return false;
    }

    let index = context.rootGetters['contacts/all'].findIndex(item => valuesToCheck.indexOf(item.email) >= 0);

    if (index >= 0) {
        context.commit('displayErrorGlobalModal', {
            title: 'Contact has invalid email addresses',
            message: 'Please check the contact\'s email address. Make sure they are valid.'
        }, {root: true});
        return false;
    }

    return true;
}

function _checkABNNotEmpty(context) {
    if (!context.rootGetters['customer/details'].vatregnumber) {
        context.commit('displayErrorGlobalModal', {
            title: 'Customer Record has invalid ABN field',
            message: 'Please check the ABN field of the customer. Make sure they are not empty or invalid.'
        }, {root: true});
        return false;
    }
    return true;
}

export default {
    state,
    getters,
    actions,
    mutations
};