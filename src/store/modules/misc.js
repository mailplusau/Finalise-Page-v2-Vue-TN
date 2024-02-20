import http from "@/utils/http";

const state = {
    industries: [],
    leadSources: [],
    franchisees: [],
    roles: [],
    statuses: [
        {value: 6, text: 'SUSPECT - New'},
        {value: 57, text: 'SUSPECT - Hot Lead'},
        {value: 13, text: 'CUSTOMER - Signed'},
    ],
    states: [
        {value: 1, text: 'NSW'},
        {value: 2, text: 'QLD'},
        {value: 3, text: 'VIC'},
        {value: 4, text: 'SA'},
        {value: 5, text: 'TAS'},
        {value: 6, text: 'ACT'},
        {value: 7, text: 'WA'},
        {value: 8, text: 'NT'},
        {value: 9, text: 'NZ'},
    ],
    invoiceCycles: [],
    yesNoOptions: [],
    mpExWeeklyUsageOptions: [],
    servicesOfInterestOptions: [],
    commencementTypeOptions: [],
    inOutOptions: [],
    accountManagers: [
        {value: 668711, text: 'Lee Russell'},
        {value: 696160, text: 'Kerina Helliwell'},
        // {value: 690145, text: 'David Gdanski'},
        {value: 668712, text: 'Belinda Urbani'},
    ],
    carrierList: [],
    lpoAccountStatus: [
        {value: 1, text: 'Active'},
        {value: 2, text: 'Inactive'},
    ],
    parkingLotReasons: [],
};

const getters = {
    industries : state => state.industries,
    leadSources : state => state.leadSources,
    franchisees : state => state.franchisees.filter(item => item.text.toLowerCase().substring(0, 4) !== 'old '), // filter out franchisees with name starting with 'old'
    roles : state => state.roles,
    statuses : state => state.statuses,
    states : state => state.states,
    carrierList : state => state.carrierList,
    lpoAccountStatus : state => state.lpoAccountStatus,

    invoiceCycles : state => state.invoiceCycles,
    yesNoOptions : state => state.yesNoOptions,
    mpExWeeklyUsageOptions : state => state.mpExWeeklyUsageOptions,
    servicesOfInterestOptions : state => state.servicesOfInterestOptions,
    commencementTypeOptions : state => state.commencementTypeOptions,
    inOutOptions : state => state.inOutOptions,
    accountManagers : state => state.accountManagers,
    parkingLotReasons : state => state.parkingLotReasons,
};

const mutations = {};

const actions = {
    init : context => {
        if (!context.rootGetters['customerId']) return;

        context.dispatch('getIndustries').then();
        context.dispatch('getLeadSources').then();
        context.dispatch('getFranchisees').then();
        context.dispatch('getRoles').then();
        context.dispatch('getInvoiceCycles').then();
        context.dispatch('getYesNoOptions').then();
        context.dispatch('getMPExWeeklyUsageOptions').then();
        context.dispatch('getServicesOfInterestOptions').then();
        context.dispatch('getCommencementTypeOptions').then();
        context.dispatch('getInOutOptions').then();
        context.dispatch('getCarrierList').then();
        context.dispatch('getParkingLotReasons').then();
    },
    getIndustries : async (context) => {
        await _fetchDataForHtmlSelect(context, context.state.industries,
            null, 'customlist_industry_category', 'internalId', 'name');
    },
    getLeadSources : async (context) => {
        await _fetchDataForHtmlSelect(context, context.state.leadSources,
            'customsearch_lead_source', 'campaign', 'internalId', 'title');
    },
    getFranchisees : async (context) => {
        await _fetchDataForHtmlSelect(context, context.state.franchisees,
            'customsearch_salesp_franchisee', 'partner', 'internalId', 'companyname');
    },
    getRoles : async context => {
        await _fetchDataForHtmlSelect(context, context.state.roles,
            'customsearch_salesp_contact_roles', 'contactrole', 'internalId', 'name');
    },
    getInvoiceCycles : async context => {
        await _fetchDataForHtmlSelect(context, context.state.invoiceCycles,
            null, 'customlist_invoicing_cyle', 'internalId', 'name');
    },
    getYesNoOptions : async context => {
        await _fetchDataForHtmlSelect(context, context.state.yesNoOptions,
            null, 'customlist107_2', 'internalId', 'name');
    },
    getMPExWeeklyUsageOptions : async context => {
        await _fetchDataForHtmlSelect(context, context.state.mpExWeeklyUsageOptions,
            null, 'customlist_form_mpex_usage_per_week', 'internalId', 'name');
    },
    getServicesOfInterestOptions : async context => {
        await _fetchDataForHtmlSelect(context, context.state.servicesOfInterestOptions,
            null, 'customlist1081', 'internalId', 'name');
    },
    getCommencementTypeOptions : async context => {
        await _fetchDataForHtmlSelect(context, context.state.commencementTypeOptions,
            null, 'customlist_sale_type', 'internalId', 'name');
    },
    getInOutOptions : async context => {
        await _fetchDataForHtmlSelect(context, context.state.inOutOptions,
            null, 'customlist_in_outbound', 'internalId', 'name');
    },
    getCarrierList : async context => {
        await _fetchDataForHtmlSelect(context, context.state.carrierList,
            null, 'customlist_carrier', 'internalId', 'name');
    },
    getParkingLotReasons : async context => {
        await _fetchDataForHtmlSelect(context, context.state.parkingLotReasons,
            null, 'customlist_parking_lot_reasons', 'internalId', 'name');
    },
};

async function _fetchDataForHtmlSelect(context, stateObject, id, type, valueColumnName, textColumnName) {
    stateObject.splice(0);

    let data = await http.get('getSelectOptions', {
        id, type, valueColumnName, textColumnName
    });

    data.forEach(item => { stateObject.push(item); });
}

export default {
    state,
    getters,
    actions,
    mutations
};