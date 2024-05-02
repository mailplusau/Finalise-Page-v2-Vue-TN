import http from "@/utils/http";

const state = {
    data: {
        internalid: null,
        custrecord_sales_campaign: null,
    },
    busy: true,
};

const getters = {
    data : state => state.data,

    isMpPremium : state => [71, 72].includes(parseInt(state.data.custrecord_sales_campaign)),
};

const mutations = {};

const actions = {
    init : async context => {
        if (!context.rootGetters['salesRecordId']) return;

        let fieldIds = [];
        for (let fieldId in context.state.data) fieldIds.push(fieldId);

        context.state.data = await http.get('getSalesRecord', {
            salesRecordId: context.rootGetters['salesRecordId'], fieldIds
        });

        context.state.busy = false;
    },
};




export default {
    state,
    getters,
    actions,
    mutations
};