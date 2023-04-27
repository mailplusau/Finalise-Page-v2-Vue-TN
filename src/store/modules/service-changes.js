import http from "@/utils/http";

const baseURL = 'https://' + process.env.VUE_APP_NS_REALM + '.app.netsuite.com';

const state = {
    data: [],
    busy: true,
};

const getters = {
    all : state => state.data,
    busy : state => state.busy,
};

const mutations = {};

const actions = {
    init : async context => {
        if (!context.rootGetters['customerId'] || !context.rootGetters['comm-reg/id']) return;

        try {
            let data = await http.get('getServiceChanges', {
                customerId: context.rootGetters['customerId'],
                commRegId: context.rootGetters['comm-reg/id']
            });

            state.data = [...data]
        } catch (e) {console.error(e);}

        context.state.busy = false;
    },
    goToServiceChangePage : context => {
        let params = {
            custid: context.rootGetters['customerId'],
            salesrecordid: context.rootGetters['salesRecordId'],
            salesrep: 'T',
            commreg: context.rootGetters['comm-reg/id'],
            customid: 'customscript_sl_finalise_page_tn_v2_vue',
            customdeploy: 'customdeploy_sl_finalise_page_tn_v2_vue'
        }
        params = JSON.stringify(params);
        let upload_url = baseURL + window['nlapiResolveURL']('SUITELET',
                'customscript_sl_create_service_change',
                'customdeploy_sl_create_service_change') + '&custparam_params=' +
            params;
        window.open(upload_url, "_self",
            "height=750,width=650,modal=yes,alwaysRaised=yes");
    }
};

export default {
    state,
    getters,
    actions,
    mutations
};