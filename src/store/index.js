import Vue from 'vue';
import Vuex from 'vuex';
import modules from './modules';
import http from "@/utils/http";
import {ACTION_CHECK_FOR_UNSAVED_CHANGES} from "@/utils/utils";

const baseURL = 'https://' + process.env.VUE_APP_NS_REALM + '.app.netsuite.com';

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
    },
    displayInfoGlobalModal : (state, {title, message}) => {
        state.globalModal.title = title;
        state.globalModal.body = message;
        state.globalModal.busy = false;
        state.globalModal.open = true;
        state.globalModal.persistent = false;
        state.globalModal.isError = false;
    }
};

const actions = {
    init : async context => {
        await _readAndVerifyUrlParams(context);

        context.dispatch('user/init').then();
        context.dispatch('customer/init').then();
        context.dispatch('sales-record/init').then();
        context.dispatch('lpo-info/init').then();
        context.dispatch('addresses/init').then();
        context.dispatch('contacts/init').then();
        context.dispatch('invoices/init').then();
        context.dispatch('extra-info/init').then();
        context.dispatch('misc/init').then();
        context.dispatch('comm-reg/init').then(() => {
            context.dispatch('service-changes/init');
        });
    },
    handleException : (context, {title, message}) => {
        context.commit('displayErrorGlobalModal', {
            title, message
        })
    },
    goToNetSuiteCustomerPage : context => {
        window.location.href = baseURL + '/app/common/entity/custjob.nl?id=' + context.state.customerId;
    },
    checkForUnsavedChanges : async context => {
        let unsavedChanges = [];

        // looping through modules and check for ACTION_CHECK_FOR_UNSAVED_CHANGES, if it exists, call it
        for (let module in modules) {
            if (Object.hasOwnProperty.call(modules, module) && modules[module].actions[ACTION_CHECK_FOR_UNSAVED_CHANGES]) {
                let res = await context.dispatch(module + '/' + ACTION_CHECK_FOR_UNSAVED_CHANGES);
                unsavedChanges = Array.isArray(res) ? [...unsavedChanges, ...res] : (res ? [...unsavedChanges, res] : unsavedChanges);
            }
        }

        if (unsavedChanges.length) {
            unsavedChanges.unshift('Please check the following sections for unsaved changes:')
            context.commit('displayErrorGlobalModal', {
                title: 'There are unsaved changes',
                message: unsavedChanges.join('<br>')
            });

            return false;
        }

        return true;
    }
};

async function _readAndVerifyUrlParams(context) {
    const params = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop),
    });

    let paramCustomerId, paramSalesRecordId = null;

    try {
        paramCustomerId = params['recid'] || null;
        paramSalesRecordId = params['sales_record_id'] || null;

        if (params['custparam_params']) {
            let weirdParams = JSON.parse(params['custparam_params']);

            paramCustomerId = weirdParams['custid'] || null;
            paramSalesRecordId = weirdParams['sales_record_id'] || null;
        }

        if (!paramCustomerId) {
            context.commit('displayErrorGlobalModal', {title: 'Missing parameters', message: 'Customer ID is missing.'});
            return;
        }

        let {customerId, salesRecordId, userId, userRole} = await http.post('verifyParameters', {
            customerId: parseInt(paramCustomerId), salesRecordId: paramSalesRecordId ? parseInt(paramSalesRecordId + '') : null
        });

        context.state.userId = userId;
        context.state.userRole = userRole;
        context.state.callCenterMode = (!!params['callcenter'] && params['callcenter'] === 'T');

        if (!context.state.callCenterMode && ![3, 1032].includes(parseInt(context.state.userRole))) {
            context.commit('displayErrorGlobalModal', {title: 'Access denied', message: 'You have don\'t have the necessary role to access this page.'});
            return;
        }

        context.state.customerId = customerId;
        context.state.salesRecordId = salesRecordId;
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