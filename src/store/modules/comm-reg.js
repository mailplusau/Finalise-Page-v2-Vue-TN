import http from "@/utils/http";

const state = {
    data: {
        internalid: null,
        custrecord_date_entry: new Date(),
        custrecord_comm_date: '',
        custrecord_comm_date_signup: '',
        custrecord_sale_type: '',
        custrecord_in_out: '',
        custrecord_scand_form: '',
        custrecord_customer: null,
        custrecord_salesrep: null,
        custrecord_franchisee: null,
        custrecord_trial_status: '',
        custrecord_commreg_sales_record: null,
        custrecord_wkly_svcs: '5',
        custrecord_state: '',
        custrecord_finalised_by: '',
        custrecord_finalised_on: '',
    },
    formFileUrl: null,
    texts: {},
    form: {},
    formFile: {
        file: null,
        size: 0,
    },
    scannedForm: null,
    busy: true,
    disabled: true,
};

const getters = {
    texts : state => state.texts,
    form : state => state.form,
    busy : state => state.busy,
    disabled : state => state.disabled,
    formFile : state => state.formFile,
    id : state => state.data.internalid,
    formFileUrl : state => state.formFileUrl,
};

const mutations = {
    resetForm : state => {
        state.form = {...state.data};
        state.form.custrecord_date_entry = _parseDateStringIntoObject(state.form.custrecord_date_entry);
        state.form.custrecord_comm_date = _parseDateStringIntoObject(state.form.custrecord_comm_date);
        state.form.custrecord_comm_date_signup = _parseDateStringIntoObject(state.form.custrecord_comm_date_signup);
    },
};

const actions = {
    init : async context => {
        if (!context.rootGetters['customerId'] || !context.rootGetters['salesRecordId'] || context.rootGetters['callCenterMode'])
            return;

        try {
            let fieldIds = [];
            for (let fieldId in context.state.data) fieldIds.push(fieldId);

            let commRegs = await http.get('getCommencementRegister', {
                customerId: context.rootGetters['customerId'],
                salesRecordId: context.rootGetters['salesRecordId'],
                fieldIds
            });

            if (commRegs.length === 1) { // only take the first and only register (??)
                for (let fieldId in context.state.data) {
                    context.state.data[fieldId] = commRegs[0][fieldId];
                    context.state.texts[fieldId] = commRegs[0][fieldId + '_text'];
                }
            }

            await context.dispatch('generateFormFileURL');

            context.commit('resetForm');

            context.state.busy = false;
            context.state.disabled = false;
        } catch (e) { console.error(e); }
    },
    save : async context => {
        if (!context.rootGetters['customerId'] || !context.rootGetters['salesRecordId'] || context.rootGetters['callCenterMode'])
            return;

        if(!await context.dispatch('checkForUnsavedChanges', null, {root: true})) return;

        context.state.busy = true;
        context.state.disabled = true;
        context.commit('displayBusyGlobalModal',
            {title: 'Processing...', message: 'Saving Commencement Register. Please Wait...', open: true}, {root: true});

        try {
            context.state.form.custrecord_customer = context.state.form.custrecord_customer || context.rootGetters['customerId'];
            context.state.form.custrecord_franchisee = context.state.form.custrecord_franchisee || context.rootGetters['customer/details'].partner;
            context.state.form.custrecord_commreg_sales_record = context.state.form.custrecord_commreg_sales_record || context.rootGetters['salesRecordId'];
            context.state.form.custrecord_trial_status = context.state.form.custrecord_trial_status || 9;
            context.state.form.custrecord_state = context.rootGetters['addresses/defaultShippingStateId'];
            context.state.form.custrecord_finalised_by = context.rootGetters['userId'];
            context.state.form.custrecord_finalised_on = new Date();

            let serviceChanges = context.rootGetters['service-changes/all'];
            let fileName = context.state.formFile.file?.name;
            let fileContent = await _readFile(context.state.formFile.file);

            await http.post('saveCommencementRegister', {
                userId: context.rootGetters['userId'],
                customerId: context.rootGetters['customerId'],
                salesRecordId: context.rootGetters['salesRecordId'],
                commRegData: context.state.form,
                servicesChanged: serviceChanges.length > 0,
                localUTCOffset: new Date().getTimezoneOffset(),
                fileContent,
                fileName,
            });

            if (serviceChanges.length <= 0) context.dispatch('service-changes/goToServiceChangePage', null, {root: true}).then();
            else context.dispatch('goToNetSuiteCustomerPage', null, {root: true}).then();
        } catch (e) { console.error(e); }

        context.state.busy = false;
        context.state.disabled = false;
    },
    generateFormFileURL : async context => {
        if (context.state.formFile.file)
            context.state.formFileUrl = URL.createObjectURL(context.state.formFile.file)
        else if (context.state.data.custrecord_scand_form) {
            try {
                let {fileURL} = await http.get('getFileURLById', {
                    fileId: context.state.data.custrecord_scand_form
                });
                context.state.formFileUrl = fileURL;
            } catch (e) { console.error(e); }
        } else
            context.state.formFileUrl = null;

    }
};

// File module in SuiteScript 2.0 only take base64 encoded string when uploading binary files such as pdf.
// So here we convert the file to DataURL string and take the 2nd part of the string which is file's content in base64.
function _readFile(fileObject) {
    return new Promise((resolve, reject) => {
        if (!fileObject) resolve(null);

        let reader = new FileReader();

        reader.onload = (event) => {
            try {
                resolve(event.target.result.split(',')[1]);
            } catch (e) {reject(e);}
        }
        reader.readAsDataURL(fileObject);
    });
}

// Assuming that the input string is DD/MM/YYYY
// Converting it to ISO format (YYYY-MM-DD)
function _parseDateStringIntoObject(dateString) {
    // If dateString is not a string then we return itself without any modification
    return Object.prototype.toString.call(dateString) === '[object String]' ?
        new Date(dateString.split('/').reverse().join('-')) : dateString;
}

export default {
    state,
    getters,
    actions,
    mutations
};