import http from "@/utils/http";

const state = {
    data: [],
    busy: true,
};

const getters = {
    all : state => state.data,
};

const mutations = {};

const actions = {
    init : async context => {
        if (!context.rootGetters['customerId']) return;

        try {
            let data = await http.get('getCustomerInvoices', {
                customerId: context.rootGetters['customerId'],
            });

            state.data = data.map(item => ({
                ...item,
                link: _getInvoiceURL(item.internalid)
            }))
        } catch (e) {console.error(e);}

        context.state.busy = false;
    },
};

function _getInvoiceURL(invoice_id) {
    let baseURL = 'https://1048144.app.netsuite.com';
    let compid = '1048144';
    return baseURL + '/app/accounting/transactions/custinvc.nl?id=' + invoice_id +
        '&compid=' + compid + '&cf=116&whence=';
}

export default {
    state,
    getters,
    actions,
    mutations
};