import Vue from 'vue';
import Vuex from 'vuex';
import modules from './modules';

Vue.use(Vuex)

const state = {
    customerId: null,
    salesRecordId: null,
    callCenterMode: false,

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
    init : context => {
        _readUrlParams(context);

        context.dispatch('customer/init').then();
        context.dispatch('misc/init').then();
    },
};

function _readUrlParams(context) {
    const params = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop),
    });

    context.state.customerId = params['recid'] || null;
    context.state.salesRecordId = params['sales_record_id'] || null;
    context.state.callCenterMode = (!!params['callcenter'] && params['callcenter'] === 'T');
}

const store = new Vuex.Store({
  state,
  mutations,
  actions,
  getters,
  modules,
});

export default store;