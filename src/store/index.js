import Vue from 'vue';
import Vuex from 'vuex';
import modules from './modules';
import http from "@/utils/http";

Vue.use(Vuex)

const state = {
    customerId: null,
    salesRecordId: null,
    callCenterMode: false,
    userId: null,
    userRole: null,

    globalModal: {
        open: false,
        title: '',
        body: '',
        busy: false,
        persistent: true,
        isError: false
    },
};

const getters = {
    customerId : state => state.customerId,
    salesRecordId : state => state.salesRecordId,
    callCenterMode : state => state.callCenterMode,
    userId : state => state.userId,
    userRole : state => state.userRole,

    globalModal : state => state.globalModal,
};

const mutations = {
    setGlobalModal :  (state, open = true) => { state.globalModal.open = open; },
    displayErrorGlobalModal : (state, {title, message}) => {
        state.globalModal.title = title;
        state.globalModal.body = message;
        state.globalModal.busy = false;
        state.globalModal.open = true;
        state.globalModal.persistent = true;
        state.globalModal.isError = true;
    },
    displayBusyGlobalModal : (state, {title, message, open}) => {
        state.globalModal.title = title;
        state.globalModal.body = message;
        state.globalModal.busy = open;
        state.globalModal.open = open;
        state.globalModal.persistent = false;
        state.globalModal.isError = false;
    }
};

const actions = {
    init : async context => {
        await _readAndVerifyUrlParams(context);

        context.dispatch('customer/init').then();
        context.dispatch('addresses/init').then();
        context.dispatch('contacts/init').then();
        context.dispatch('invoices/init').then();
        context.dispatch('extra-info/init').then();
        context.dispatch('misc/init').then();
        context.dispatch('comm-reg/init').then();
    },
    handleException : (context, {title, message}) => {
        context.commit('displayErrorGlobalModal', {
            title, message
        })
    }
};

async function _readAndVerifyUrlParams(context) {
    const params = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop),
    });

    try {
        let {customerId, salesRecordId, userId, userRole} = await http.post('verifyParameters', {
            customerId: params['recid'] || null,
            salesRecordId: params['sales_record_id'] || null,
        });

        context.state.userId = userId;
        context.state.userRole = userRole;
        context.state.customerId = customerId;
        context.state.salesRecordId = salesRecordId;
        context.state.callCenterMode = (!!params['callcenter'] && params['callcenter'] === 'T');
    } catch (e) { console.error(e); }
}

const store = new Vuex.Store({
  state,
  mutations,
  actions,
  getters,
  modules,
});

export default store;