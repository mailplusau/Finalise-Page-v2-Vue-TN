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
};

const getters = {
    industries : state => state.industries,
    leadSources : state => state.leadSources,
    franchisees : state => state.franchisees.filter(item => item.text.toLowerCase().substring(0, 4) !== 'old '), // filter out franchisees with name starting with 'old'
    roles : state => state.roles,
    statuses : state => state.statuses,
    states : state => state.states,
    invoiceCycles : state => state.invoiceCycles,
    yesNoOptions : state => state.yesNoOptions,
    mpExWeeklyUsageOptions : state => state.mpExWeeklyUsageOptions,
};

const mutations = {};

const actions = {
    init : context => {
        context.dispatch('getIndustries').then();
        context.dispatch('getLeadSources').then();
        context.dispatch('getFranchisees').then();
        context.dispatch('getRoles').then();
        context.dispatch('getInvoiceCycles').then();
        context.dispatch('getYesNoOptions').then();
        context.dispatch('getMPExWeeklyUsageOptions').then();
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