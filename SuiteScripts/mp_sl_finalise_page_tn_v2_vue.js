/**
 * @author Tim Nguyen
 * @description NetSuite Experimentation - Finalise Page v2 with Vue 2
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @created 13/04/2023
 */

// This should be the same file as the one built by webpack. Make sure this matches the filename in package.json
let htmlTemplateFile = 'mp_cl_finalise_page_tn_v2_vue.html';
const clientScriptFilename = 'mp_cl_finalise_page_tn_v2_vue.js';

let NS_MODULES = {};


define(['N/ui/serverWidget', 'N/render', 'N/search', 'N/file', 'N/log', 'N/record', 'N/email', 'N/runtime', 'N/https', 'N/task'],
    (serverWidget, render, search, file, log, record, email, runtime, https, task) => {
    NS_MODULES = {serverWidget, render, search, file, log, record, email, runtime, https, task};
    
    const onRequest = ({request, response}) => {
        if (request.method === "GET") {

            if (!_handleGETRequests(request.parameters['requestData'], response)){
                // Render the page using either inline form or standalone page
                // _getStandalonePage(response)
                _getInlineForm(response)
            }

        } else if (request.method === "POST") { // Request method should be POST (?)
            _handlePOSTRequests(JSON.parse(request.body), response);
            // _writeResponseJson(response, {test: 'test response from post', params: request.parameters, body: request.body});
        } else {
            log.debug({
                title: "request method type",
                details: `method : ${request.method}`,
            });
        }

    }

    return {onRequest};
});

// Render the page within a form element of NetSuite. This can cause conflict with NetSuite's stylesheets.
function _getInlineForm(response) {
    let {serverWidget, render, file} = NS_MODULES;
    
    // Create a NetSuite form
    let form = serverWidget.createForm({ title: "Finalise Page" });

    // Then create form field in which we will render our html template
    let htmlField = form.addField({
        id: "custpage_html",
        label: "html",
        type: serverWidget.FieldType.INLINEHTML,
    });
    
    const pageRenderer = render.create();
    const htmlFileData = _getHtmlTemplate(htmlTemplateFile);
    const htmlFile = file.load({ id: htmlFileData[htmlTemplateFile].id });
    pageRenderer.templateContent = htmlFile.getContents();
    htmlField.defaultValue = pageRenderer.renderAsString();

    // Retrieve client script ID using its file name.
    form.clientScriptFileId = _getHtmlTemplate(clientScriptFilename)[clientScriptFilename].id;

    response.writePage(form);
}

// Render the htmlTemplateFile as a standalone page without any of NetSuite's baggage. However, this also means no
// NetSuite module will be exposed to the Vue app. Thus, an api approach using Axios and structuring this Suitelet as
// a http request handler will be necessary. For reference:
// https://medium.com/@vladimir.aca/how-to-vuetify-your-suitelet-on-netsuite-part-2-axios-http-3e8e731ac07c
function _getStandalonePage(response) {
    let {render, file} = NS_MODULES;

    // Create renderer to render our html template
    const pageRenderer = render.create();

    // Get the id and url of our html template file
    const htmlFileData = _getHtmlTemplate(htmlTemplateFile);

    // Load the  html file and store it in htmlFile
    const htmlFile = file.load({
        id: htmlFileData[htmlTemplateFile].id
    });

    // Load the content of the html file into the renderer
    pageRenderer.templateContent = htmlFile.getContents();

    response.write(pageRenderer.renderAsString());
}

// Search for the ID and URL of a given file name inside the NetSuite file cabinet
function _getHtmlTemplate(htmlPageName) {
    let {search} = NS_MODULES;

    const htmlPageData = {};

    search.create({
        type: 'file',
        filters: ['name', 'is', htmlPageName],
        columns: ['name', 'url']
    }).run().each(resultSet => {
        htmlPageData[resultSet.getValue({ name: 'name' })] = {
            url: resultSet.getValue({ name: 'url' }),
            id: resultSet.id
        };
        return true;
    });

    return htmlPageData;
}


function _handleGETRequests(request, response) {
    if (!request) return false;

    let {log} = NS_MODULES;

    try {
        let {operation, requestParams} = JSON.parse(request);

        if (!operation) throw 'No operation specified.';

        if (!getOperations[operation]) throw `Operation [${operation}] is not supported.`;

        getOperations[operation](response, requestParams);
    } catch (e) {
        log.debug({title: "_handleGETRequests", details: `error: ${e}`});
        _writeResponseJson(response, {error: `${e}`})
    }

    return true;
}

function _handlePOSTRequests({operation, requestParams}, response) {
    let {log} = NS_MODULES;

    try {
        if (!operation) throw 'No operation specified.';

        // _writeResponseJson(response, {source: '_handlePOSTRequests', operation, requestParams});
        postOperations[operation](response, requestParams);
    } catch (e) {
        log.debug({title: "_handlePOSTRequests", details: `error: ${e}`});
        _writeResponseJson(response, {error: `${e}`})
    }
}

function _writeResponseJson(response, body) {
    response.write({ output: JSON.stringify(body) });
    response.addHeader({
        name: 'Content-Type',
        value: 'application/json; charset=utf-8'
    });
}

const getOperations = {
    'getCustomerDetails': function (response, {customerId, fieldIds}) {
        if (!customerId) return _writeResponseJson(response, {error: `Invalid Customer ID: ${customerId}`});
        
        _writeResponseJson(response, sharedFunctions.getCustomerData(customerId, fieldIds));
    },
    'getCustomerAddresses' : function (response, {customerId}) {
        let {record} = NS_MODULES;
        let data = [];
        let fieldIds = ['addr1', 'addr2', 'city', 'state', 'zip', 'country', 'addressee', 'custrecord_address_lat', 'custrecord_address_lon', 'custrecord_address_ncl'];
        let sublistFieldIds = ['internalid', 'label', 'defaultshipping', 'defaultbilling', 'isresidential'];

        if (!customerId) return _writeResponseJson(response, {error: `Invalid Customer ID: ${customerId}`});

        let customerRecord = record.load({
            type: record.Type.CUSTOMER,
            id: customerId,
            isDynamic: true
        });

        let lineCount = customerRecord.getLineCount({sublistId: 'addressbook'});

        for (let line = 0; line < lineCount; line++) {
            customerRecord.selectLine({sublistId: 'addressbook', line});
            let entry = {};

            for (let fieldId of sublistFieldIds) {
                entry[fieldId] = customerRecord.getCurrentSublistValue({sublistId: 'addressbook', fieldId})
            }

            let addressSubrecord = customerRecord.getCurrentSublistSubrecord({sublistId: 'addressbook', fieldId: 'addressbookaddress'});
            for (let fieldId of fieldIds) {
                entry[fieldId] = addressSubrecord.getValue({ fieldId })
            }

            data.push(entry);
        }

        _writeResponseJson(response, data);
    },
    'getCustomerContacts' : function (response, {customerId}) {
        if (!customerId) return _writeResponseJson(response, {error: `Invalid Customer ID: ${customerId}`});

        _writeResponseJson(response, sharedFunctions.getCustomerContacts(customerId));
    },
    'getCustomerInvoices' : function (response, {customerId}) {
        let {search} = NS_MODULES;
        let data = [];
        let columns = ['internalid', 'tranid', 'total', 'trandate', 'status']

        search.create({
            type: 'invoice',
            filters: [
                {name: 'entity', operator: 'is', values: customerId},
                {name: 'mainline', operator: 'is', values: true},
                {name: 'memorized', operator: 'is', values: false},
                {name: 'custbody_inv_type', operator: 'is', values: '@NONE@'},
                {name: 'voided', operator: 'is', values: false},
            ],
            columns: columns.map(item => ({name: item, sort: item === 'trandate' ? search.Sort.ASC : search.Sort.NONE}))
        }).run().each(function (result) {
            let tmp = {};

            for (let fieldId of columns) {
                tmp[fieldId] = result.getValue(fieldId);
                tmp[fieldId + '_text'] = result.getText(fieldId);
            }

            data.push(tmp);

            return true;
        });

        _writeResponseJson(response, data);
    },
    'getAssignedServices' : function (response, {customerId, fieldIds}) {
        let {search} = NS_MODULES;
        let data = [];

        let serviceSearch = search.load({
            id: 'customsearch_salesp_services',
            type: 'customrecord_service'
        });

        serviceSearch.filters.push(search.createFilter({
            name: 'custrecord_service_customer',
            operator: search.Operator.ANYOF,
            values: customerId
        }));

        serviceSearch.run().each(function (item) {
            let tmp = {};

            for (let fieldId of fieldIds)
                tmp[fieldId] = item.getValue(fieldId);

            data.push(tmp);

            return true;
        });

        _writeResponseJson(response, data);
    },
    'getServiceTypes' : function (response) {
        let {search} = NS_MODULES;
        let data = [];

        let serviceTypeSearch = search.create({
            type: 'customrecord_service_type',
            columns: [
                {name: 'internalid'},
                {name: 'custrecord_service_type_ns_item_array'},
                {name: 'name'}
            ]
        });
        serviceTypeSearch.filters.push(search.createFilter({
            name: 'custrecord_service_type_category',
            operator: search.Operator.ANYOF,
            values: [1] // NO IDEA WHAT THIS IS
        }));

        let searchResult = serviceTypeSearch.run();

        searchResult.each(item => {
            data.push({value: item.getValue('internalid'), text: item.getValue('name')})

            return true;
        });

        _writeResponseJson(response, data);
    },
    'getSelectOptions' : function (response, {id, type, valueColumnName, textColumnName}) {
        let {search} = NS_MODULES;
        let data = [];

        search.create({
            id, type,
            columns: [{name: valueColumnName}, {name: textColumnName}]
        }).run().each(result => {
            data.push({value: result.getValue(valueColumnName), text: result.getValue(textColumnName)});
            return true;
        });

        _writeResponseJson(response, data);
    },
    'getPostalLocationOptions' : function (response, {stateIndex}) {
        let {search} = NS_MODULES;
        let data = [];
        let postalLocationForm = [
            'name',
            'internalid',
            'custrecord_ap_lodgement_addr1',
            'custrecord_ap_lodgement_addr2',
            'custrecord_ap_lodgement_lat',
            'custrecord_ap_lodgement_long',
            'custrecord_ap_lodgement_postcode',
            'custrecord_ap_lodgement_site_phone',
            'custrecord_ap_lodgement_site_state', // getText for this one
            'custrecord_ap_lodgement_suburb',
            'custrecord_ap_lodgement_supply',
            'custrecord_ncl_monthly_fee',
            'custrecord_ncl_site_access_code',
            'custrecord_noncust_location_type', // getText for this one too
        ];

        let NCLSearch = search.load({
            type: 'customrecord_ap_lodgment_location',
            id: 'customsearch_smc_noncust_location'
        });

        //NCL Type: AusPost(1), Toll(2), StarTrack(7)
        NCLSearch.filters.push(search.createFilter({
            name: 'custrecord_noncust_location_type',
            operator: search.Operator.ANYOF,
            values: [1, 2, 7]
        }))

        NCLSearch.filters.push(search.createFilter({
            name: 'custrecord_ap_lodgement_site_state',
            operator: search.Operator.IS,
            values: stateIndex, // NSW
        }))

        let results = NCLSearch.run();
        
        let temp = 0;
        while (temp < 5) {
            let subset = results.getRange({start: temp * 1000, end: temp * 1000 + 1000});
            for (let postalLocation of subset) { // we can also use getAllValues() on one of these to see all available fields
                let entry = {};
                for (let fieldId of postalLocationForm) {
                    if (['custrecord_noncust_location_type', 'custrecord_ap_lodgement_site_state'].includes(fieldId)) {
                        entry[fieldId] = postalLocation.getText({name: fieldId});
                    } else entry[fieldId] = postalLocation.getValue({name: fieldId});
                }
                data.push(entry);
            }
            if (subset.length < 1000) break;
            temp++;
        }

        _writeResponseJson(response, data);
    },
    'getProductPricing' : function (response, {customerId}) {
        let {search} = NS_MODULES;
        let data = [];
        let fieldIds = [
            'custrecord_prod_pricing_delivery_speeds',
            'custrecord_prod_pricing_pricing_plan',
            'custrecord_prod_pricing_def_prod_type',
            'custrecord_prod_pricing_b4',
            'custrecord_prod_pricing_250g',
            'custrecord_prod_pricing_500g',
            'custrecord_prod_pricing_1kg',
            'custrecord_prod_pricing_3kg',
            'custrecord_prod_pricing_5kg',
            'custrecord_prod_pricing_10kg',
            'custrecord_prod_pricing_20kg',
            'custrecord_prod_pricing_25kg',
            'custrecord_sycn_complete',
        ]

        let searchProductPricing = search.load({
            id: 'customsearch_prod_pricing_customer_level',
            type: 'customrecord_product_pricing'
        });

        searchProductPricing.filters.push(search.createFilter({
            name: 'custrecord_prod_pricing_customer',
            join: null,
            operator: 'anyof',
            values: customerId,
        }));

        searchProductPricing.run().each(item => {
            let tmp = {};

            for (let fieldId of fieldIds) {
                tmp[fieldId] = item.getValue({name: fieldId});
                tmp[fieldId + '_text'] = item.getText({name: fieldId});
            }

            data.push(tmp);

            return true;
        })

        _writeResponseJson(response, data);
    },
    'getServiceChanges' : function (response, {customerId, commRegId}) {
        if (!customerId) return _writeResponseJson(response, {error: `Invalid Customer ID: ${customerId}`});

        _writeResponseJson(response, sharedFunctions.getServiceChangeRecords(customerId, commRegId));
    },
    'getSalesCampaignActivities' : function (response, {customerId}) {
        let {search} = NS_MODULES;
        let data = [];
        let columns = ['createddate', 'completeddate', 'type', 'assigned', 'title', 'message', 'custevent_organiser']

        search.create({
            id: 'customsearch_salescamp_activity',
            type: 'activity',
            filters: [
                {
                    name: 'company',
                    operator: search.Operator.ANYOF,
                    values: customerId
                }
            ],
            columns: columns.map(item => ({name: item}))
        }).run().each(result => {
            let tmp = {};

            for (let fieldId of columns) {
                tmp[fieldId] = result.getValue(fieldId);
                tmp[fieldId + '_text'] = result.getText(fieldId);
            }

            data.push(tmp);

            return true;
        });

        _writeResponseJson(response, data);
    },
    'getCommencementRegister' : function (response, {customerId, salesRecordId, fieldIds}) {
        let {search} = NS_MODULES;
        let data = [];

        search.create({
            type: 'customrecord_commencement_register',
            filters: [
                {name: 'custrecord_customer', operator: search.Operator.IS, values: parseInt(customerId)},
                {name: 'custrecord_commreg_sales_record', operator: search.Operator.IS, values: parseInt(salesRecordId)},
                {name: 'custrecord_trial_status', operator: search.Operator.ANYOF, values: [9, 10]},
            ],
            columns: fieldIds.map(item => ({name: item}))
        }).run().each(result => {
            let tmp = {};

            for (let fieldId of fieldIds) {
                tmp[fieldId] = result.getValue(fieldId);
                tmp[fieldId + '_text'] = result.getText(fieldId);
            }

            data.push(tmp);

            return true;
        });

        _writeResponseJson(response, data);
    },
}

const postOperations = {
    'verifyParameters' : function (response, {customerId, salesRecordId}) {
        let {record, runtime} = NS_MODULES;
        let salesRecord = record.load({type: 'customrecord_sales', id: salesRecordId, isDynamic: true});

        if (parseInt(salesRecord.getValue({fieldId: 'custrecord_sales_customer'})) === parseInt(customerId))
            _writeResponseJson(response, {
                customerId: parseInt(customerId),
                salesRecordId: parseInt(salesRecordId),
                userId: runtime['getCurrentUser']().id,
                userRole: runtime['getCurrentUser']().role,
            });
        else _writeResponseJson(response, {error: `IDs mismatched. Sales record #${salesRecordId} does not belong to customer #${customerId}.`});
    },
    'saveCustomerDetails' : function (response, {customerId, customerData, fieldIds}) {
        let {record} = NS_MODULES;

        let customerRecord = record.load({
            type: record.Type.CUSTOMER,
            id: customerId,
            isDynamic: true
        });

        for (let fieldId in customerData)
            customerRecord.setValue({fieldId, value: customerData[fieldId]});

        customerRecord.save({ignoreMandatoryFields: true});

        if (customerData['custentity_old_customer']) { // update record of old customer if custentity_old_customer is specified
            let oldCustomerRecord = record.load({
                type: record.Type.CUSTOMER,
                id: customerData['custentity_old_customer'],
            });

            oldCustomerRecord.setValue({fieldId: 'custentity_new_customer', value: customerId});
            oldCustomerRecord.setValue({fieldId: 'custentity_new_zee', value: customerData['partner']});

            oldCustomerRecord.save({ignoreMandatoryFields: true});
        }

        _writeResponseJson(response, sharedFunctions.getCustomerData(customerId, fieldIds));
    },
    'saveAddress' : function (response, {customerId, currentDefaultShipping, currentDefaultBilling, addressForm, addressSublistForm}) {
        let {record} = NS_MODULES;
        let addressData = {...addressForm, ...addressSublistForm};
        
        _updateDefaultShippingAndBillingAddress(customerId, currentDefaultShipping, currentDefaultBilling, addressSublistForm);

        let customerRecord = record.load({
            type: record.Type.CUSTOMER,
            id: customerId,
            isDynamic: true
        });
        
        // Select an existing or create a new line the customerRecord's sublist
        if (addressData.internalid) { // Edit existing address
            let line = customerRecord.findSublistLineWithValue({sublistId: 'addressbook', fieldId: 'internalid', value: addressData.internalid});
            customerRecord.selectLine({sublistId: 'addressbook', line});
        } else { // Save new address
            customerRecord.selectNewLine({sublistId: 'addressbook'});
        }

        // Fill the sublist's fields using property names of addressSublistForm as reference
        for (let fieldId in addressSublistForm) {
            if (fieldId === 'internalid') continue; // we skip over internalid, not sure if this is necessary
            customerRecord.setCurrentSublistValue({sublistId: 'addressbook', fieldId, value: addressData[fieldId]});
        }

        // Load the addressbookaddress subrecord of the currently selected sublist line
        let addressSubrecord = customerRecord.getCurrentSublistSubrecord({sublistId: 'addressbook', fieldId: 'addressbookaddress'});

        // Fill the subrecord's fields using property names of addressForm as reference
        for (let fieldId in addressForm)
            addressSubrecord.setValue({fieldId, value: addressData[fieldId]});

        // Commit the line
        customerRecord.commitLine({sublistId: 'addressbook'});

        // Save customer record
        customerRecord.save({ignoreMandatoryFields: true});

        _writeResponseJson(response, 'Address Saved!');
    },
    'deleteAddress' : function (response, {customerId, addressInternalId}) {
        let {record} = NS_MODULES;

        let customerRecord = record.load({
            type: record.Type.CUSTOMER,
            id: customerId,
        });
        let line = customerRecord.findSublistLineWithValue({sublistId: 'addressbook', fieldId: 'internalid', value: addressInternalId});

        customerRecord.removeLine({sublistId: 'addressbook', line});

        customerRecord.save({ignoreMandatoryFields: true});

        _writeResponseJson(response, 'Address Deleted!');
    },
    'saveContact' : function (response, {contactData}) {
        if (!contactData) return _writeResponseJson(response, {error: `Missing params [contactData]: ${contactData}`});

        let {record} = NS_MODULES;
        let contactRecord;

        if (contactData.internalid) {
            contactRecord = record.load({
                type: record.Type.CONTACT,
                id: contactData.internalid,
                isDynamic: true
            });
        } else contactRecord = record.create({ type: record.Type.CONTACT });

        for (let fieldId in contactData)
            contactRecord.setValue({fieldId, value: contactData[fieldId]});

        contactRecord.save({ignoreMandatoryFields: true});

        _writeResponseJson(response, 'Contact Saved!');
    },
    'setContactAsInactive' : function (response, {contactInternalId}) {
        if (!contactInternalId) return _writeResponseJson(response, {error: `Missing params [contactInternalId]: ${contactInternalId}`});

        let {record} = NS_MODULES;
        
        let contactRecord = record.load({
            type: record.Type.CONTACT,
            id: contactInternalId,
        });

        contactRecord.setValue({fieldId: 'isinactive', value: true});

        contactRecord.save({ignoreMandatoryFields: true});

        _writeResponseJson(response, 'Contact Delete!');
    },
    'createSalesNote' : function (response, {userId, customerId, salesRecordId, salesNote}) {
        if (salesNote) {
            let {record} = NS_MODULES;
            let customerRecord = record.load({type: record.Type.CUSTOMER, id: customerId, isDynamic: true});
            let phoneCallRecord = record.create({ type: record.Type['PHONE_CALL'], isDynamic: true });
            let salesRecord = record.load({type: 'customrecord_sales', id: salesRecordId, isDynamic: true});
            let salesCampaignId = salesRecord.getValue({fieldId: 'custrecord_sales_campaign'});
            let salesCampaignRecord = record.load({type: 'customrecord_salescampaign', id: salesCampaignId, isDynamic: true});

            phoneCallRecord.setValue({fieldId: 'assigned', value: customerRecord.getValue({fieldId: 'partner'})});
            phoneCallRecord.setValue({fieldId: 'custevent_organiser', value: userId});
            phoneCallRecord.setValue({fieldId: 'startdate', value: new Date});
            phoneCallRecord.setValue({fieldId: 'company', value: customerId});
            phoneCallRecord.setValue({fieldId: 'status', value: 'COMPLETE'});
            phoneCallRecord.setValue({fieldId: 'custevent_call_outcome', value: 16});
            phoneCallRecord.setValue({fieldId: 'title', value: salesCampaignRecord.getValue({fieldId: 'name'}) + ' - Call Notes'});
            phoneCallRecord.setValue({fieldId: 'message', value: salesNote});

            phoneCallRecord.save({ignoreMandatoryFields: true});

            _writeResponseJson(response, `Sales Note saved`);
        } else _writeResponseJson(response, {error: `No Sales Note was submitted`});
    },
    'handleCallCenterOutcomes' : function (response, {userId, customerId, salesRecordId, salesNote, outcome}) {
        if (!handleCallCenterOutcomes[outcome])
            _writeResponseJson(response, {error: `Outcome [${outcome}] is not recognised.`});
        else {
            let {record} = NS_MODULES;
            let customerRecord = record.load({type: record.Type.CUSTOMER, id: customerId, isDynamic: true});
            let salesRecord = record.load({type: 'customrecord_sales', id: salesRecordId, isDynamic: true});
            let salesCampaignId = salesRecord.getValue({fieldId: 'custrecord_sales_campaign'});
            let salesCampaignRecord = record.load({type: 'customrecord_salescampaign', id: salesCampaignId, isDynamic: true});

            let phoneCallRecord = record.create({ type: record.Type['PHONE_CALL'], isDynamic: true });
            phoneCallRecord.setValue({fieldId: 'assigned', value: customerRecord.getValue({fieldId: 'partner'})});
            phoneCallRecord.setValue({fieldId: 'custevent_organiser', value: userId});
            phoneCallRecord.setValue({fieldId: 'startdate', value: new Date()});
            phoneCallRecord.setValue({fieldId: 'company', value: customerId});
            phoneCallRecord.setText({fieldId: 'status', text: 'Completed'});
            phoneCallRecord.setValue({fieldId: 'custevent_call_type', value: 2});

            handleCallCenterOutcomes[outcome]({userId, customerRecord, salesRecord, salesCampaignRecord, phoneCallRecord, salesNote});

            customerRecord.save({ignoreMandatoryFields: true});
            phoneCallRecord.save({ignoreMandatoryFields: true});
            salesRecord.save({ignoreMandatoryFields: true});

            _writeResponseJson(response, `Call center outcome [${outcome}] has been handled.`);
        }
    },
    'notifyITTeam' : function (response, {customerId, salesRecordId}) {
        let {record, search, email} = NS_MODULES;

        let customerRecord = record.load({type: record.Type.CUSTOMER, id: customerId});
        let entityId = customerRecord.getValue({fieldId: 'entityid'});
        let companyName = customerRecord.getValue({fieldId: 'companyname'});
        let commRegColumns = [
            'internalId',
            'custrecord_date_entry',
            'custrecord_sale_type',
            'custrecord_franchisee',
            'custrecord_comm_date',
            'custrecord_in_out',
            'custrecord_customer',
            'custrecord_trial_status',
            'custrecord_comm_date_signup',
        ];
        let commRegId;

        if (salesRecordId) { // Search for Commencement Register
            search.create({
                type: 'customrecord_commencement_register',
                filters: [
                    {name: 'custrecord_customer', operator: search.Operator.IS, values: parseInt(customerId)},
                    {name: 'custrecord_commreg_sales_record', operator: search.Operator.IS, values: parseInt(salesRecordId)},
                    {name: 'custrecord_trial_status', operator: search.Operator.ANYOF, values: [9, 10, 2]},
                ],
                columns: commRegColumns.map(item => ({name: item}))
            }).run().each(result => {
                if (!commRegId) commRegId = result.getValue('internalid');

                if (parseInt(result.getValue('custrecord_trial_status')) === 9)
                    commRegId = result.getValue('internalid');

                return true;
            });
        }

        let serviceChangeCount = 0;
        let emailBody = 'Customer Internal ID: ' + customerId + '</br>'
        emailBody += 'Customer Entity ID: ' + entityId + '</br>'
        emailBody += 'Customer Name: ' + companyName + '</br>'

        if (commRegId) {
            search.create({
                id: 'customsearch_salesp_service_chg',
                type: 'customrecord_servicechg',
                filters: [
                    {name: 'custrecord_service_customer', join: 'CUSTRECORD_SERVICECHG_SERVICE', operator: search.Operator.IS, values: parseInt(customerId)},
                    {name: 'custrecord_servicechg_comm_reg', operator: search.Operator.IS, values: parseInt(commRegId)},
                    {name: 'custrecord_servicechg_status', operator: search.Operator.ANYOF, values: [1, 2, 4]},
                ],
                columns: [
                    {name: 'custrecord_servicechg_service'},
                    {name: 'custrecord_service_price', join: "CUSTRECORD_SERVICECHG_SERVICE"},
                    {name: 'custrecord_servicechg_new_price'},
                    {name: 'custrecord_servicechg_date_effective'},
                    {name: 'custrecord_servicechg_type'},
                    {name: 'custrecord_servicechg_new_freq'},
                ]
            }).run().each(result => {
                serviceChangeCount++;

                let serviceText = result.getText('custrecord_servicechg_service');
                let oldServicePrice = result.getValue({name: "custrecord_service_price", join: "CUSTRECORD_SERVICECHG_SERVICE"});
                let newServiceChangePrice = result.getValue('custrecord_servicechg_new_price');
                let dateEffective = result.getValue('custrecord_servicechg_date_effective');
                let serviceChangeTypeText = result.getValue('custrecord_servicechg_type');
                let serviceChangeFreqText = result.getText('custrecord_servicechg_new_freq');

                emailBody += 'Service Name: ' + serviceText + '</br>';
                emailBody += 'Service Change Type: ' + serviceChangeTypeText + '</br>';
                emailBody += 'Date Effective: ' + dateEffective + '</br>';
                emailBody += 'Old Price: ' + oldServicePrice + '</br>';
                emailBody += 'New Price: ' + newServiceChangePrice + '</br>';
                emailBody += 'Frequency: ' + serviceChangeFreqText + '</br>';

                return true;
            });
        }

        if (serviceChangeCount > 0)
            email.send({
                author: 668712,
                subject: 'Cancel Customer - ' + entityId + ' ' + companyName,
                body: emailBody,
                recipients: ['tim.nguyen@mailplus.com.au']
            });

        _writeResponseJson(response, {commRegId, serviceChangeCount});
    },
    'saveCommencementRegister' : function (response, {userId, customerId, salesRecordId, commRegData, servicesChanged, fileContent, fileName}) {
        let {log, file, record, search} = NS_MODULES;
        let customerRecord = record.load({type: record.Type.CUSTOMER, id: customerId});
        let salesRecord = record.load({type: 'customrecord_sales', id: salesRecordId});
        let partnerId = parseInt(customerRecord.getValue({fieldId: 'partner'}));
        let partnerRecord = record.load({type: 'partner', id: partnerId});

        // Save the uploaded pdf file and get its ID only when fileContent and fileName are present
        if (fileContent && fileName) {
            let formFileId = null;
            let fileExtension = fileName.split('.').pop().toLowerCase();

            if (fileExtension === 'pdf') {
                let dateStr = new Date().toLocaleDateString('en-AU');
                let entityId = customerRecord.getValue({fieldId: 'entityid'});

                formFileId = file.create({
                    name: `${dateStr}_${entityId}.${fileExtension}`,
                    fileType: file.Type['PDF'],
                    contents: fileContent,
                    folder: 1212243,
                }).save();

                commRegData['custrecord_scand_form'] = formFileId;
            } else log.debug({title: "saveCommencementRegister", details: `fileExtension: ${fileExtension}`});
        }

        // Save the commencement register record
        let commRegRecord = commRegData.internalid ?
            record.load({type: 'customrecord_commencement_register', id: commRegData.internalid}) :
            record.create({type: 'customrecord_commencement_register'});

        commRegData['custrecord_date_entry'] = _parseIsoDatetime(commRegData['custrecord_date_entry']);
        commRegData['custrecord_comm_date'] = _parseIsoDatetime(commRegData['custrecord_comm_date']);
        commRegData['custrecord_comm_date_signup'] = _parseIsoDatetime(commRegData['custrecord_comm_date_signup']);
        commRegData['custrecord_finalised_on'] = _parseIsoDatetime(commRegData['custrecord_finalised_on']);

        for (let fieldId in commRegData)
            commRegRecord.setValue({fieldId, value: commRegData[fieldId]});

        let commRegId = commRegRecord.save({ignoreMandatoryFields: true});

        // Modify service change records
        search.create({
            id: 'customsearch_salesp_service_chg',
            type: 'customrecord_servicechg',
            filters: [
                {name: 'custrecord_service_customer', join: 'CUSTRECORD_SERVICECHG_SERVICE', operator: search.Operator.IS, values: parseInt(customerId)},
                {name: 'custrecord_servicechg_comm_reg', operator: search.Operator.IS, values: commRegId},
                {name: 'custrecord_servicechg_status', operator: search.Operator.NONEOF, values: [2, 3]},
            ],
            columns: [{name: 'internalid'}]
        }).run().each(result => {

            let serviceChangeRecord = record.load({type: 'customrecord_servicechg', id: result.getValue('internalid')});

            serviceChangeRecord.setValue({fieldId: 'custrecord_servicechg_status', value: 1});

            serviceChangeRecord.save({ignoreMandatoryFields: true});

            return true;
        });

        // Modify sales record
        salesRecord.setValue({fieldId: 'custrecord_sales_outcome', value: 2});
        salesRecord.setValue({fieldId: 'custrecord_sales_completed', value: true});
        salesRecord.setValue({fieldId: 'custrecord_sales_inuse', value: false});
        salesRecord.setValue({fieldId: 'custrecord_sales_commreg', value: commRegId});
        salesRecord.setValue({fieldId: 'custrecord_sales_completedate', value: new Date()});
        salesRecord.save({ignoreMandatoryFields: true});

        // Modify customer record
        customerRecord.setValue({fieldId: 'entitystatus', value: 13});
        customerRecord.setValue({fieldId: 'custentity_date_prospect_opportunity', value: new Date()});
        customerRecord.setValue({fieldId: 'custentity_cust_closed_won', value: true});
        customerRecord.setValue({fieldId: 'custentity_mpex_surcharge_rate', value: '31.16'});
        customerRecord.setValue({fieldId: 'custentity_sendle_fuel_surcharge', value: '6.95'});
        customerRecord.setValue({fieldId: 'custentity_mpex_surcharge', value: 1});
        if (parseInt(partnerRecord.getValue({fieldId: 'custentity_service_fuel_surcharge_apply'})) === 1) {
            customerRecord.setValue({fieldId: 'custentity_service_fuel_surcharge', value: 1});
            customerRecord.setValue({
                fieldId: 'custentity_service_fuel_surcharge_percen',
                value: (partnerId === 218 || partnerId === 469) ? '5.3' : '9.5'
            });
        }
        customerRecord.save({ignoreMandatoryFields: true});

        if (servicesChanged)
            _sendEmailsAfterSavingCommencementRegister(userId, customerId, commRegId);

        // End
        _writeResponseJson(response, {commRegId});
    },
};


const sharedFunctions = {
    getCustomerData(customerId, fieldIds) {
        let {record} = NS_MODULES;
        let data = {};

        let customerRecord = record.load({
            type: record.Type.CUSTOMER,
            id: customerId,
        });

        for (let fieldId of fieldIds)
            data[fieldId] = customerRecord.getValue({ fieldId });

        return data;
    },
    getCustomerContacts(customerId) {
        let {search} = NS_MODULES;
        let contactForm = [
            'internalid',
            'salutation',
            'firstname',
            'lastname',
            'phone',
            'email',
            'contactrole',
            'title',
            'company',
            'entityid',
            'custentity_connect_admin',
            'custentity_connect_user',
        ];
        let data = [];

        let contactSearch = search.load({
            id: 'customsearch_salesp_contacts',
            type: 'contact'
        });

        contactSearch.filters.push(search.createFilter({
            name: 'internalid',
            join: 'CUSTOMER',
            operator: search.Operator.ANYOF,
            values: customerId
        }));

        contactSearch.filters.push(search.createFilter({
            name: 'isinactive',
            operator: search.Operator.IS,
            values: false
        }));

        let result = contactSearch.run();

        result.each((item) => {
            let contactEntry = {};

            for (let fieldId of contactForm) {
                contactEntry[fieldId] = item.getValue({ name: fieldId });
            }

            data.push(contactEntry);

            return true;
        });

        return data;
    },
    getServiceChangeRecords(customerId, commRegId) {
        let {search} = NS_MODULES;
        let serviceChangeRecords = [];

        let searchObj = search.load({id: 'customsearch_salesp_service_chg', type: 'customrecord_servicechg'});
        searchObj.filters.push(search.createFilter({
            name: 'custrecord_service_customer',
            join: 'CUSTRECORD_SERVICECHG_SERVICE',
            operator: 'anyof',
            values: customerId,
        }));
        searchObj.filters.push(search.createFilter({
            name: 'custrecord_servicechg_comm_reg',
            join: null,
            operator: 'anyof',
            values: commRegId,
        }));
        searchObj.filters.push(search.createFilter({
            name: 'custrecord_servicechg_status',
            join: null,
            operator: 'noneof',
            values: [2, 3],
        }));
        searchObj.run().each(result => {
            serviceChangeRecords.push({
                serviceId: result.getValue({name: 'custrecord_servicechg_service'}),
                serviceText: result.getText({name: 'custrecord_servicechg_service'}),
                serviceDescription: result.getValue({name: 'custrecord_service_description', join: 'CUSTRECORD_SERVICECHG_SERVICE'}),
                serviceTypeID: result.getValue({name: 'custrecord_service', join: 'CUSTRECORD_SERVICECHG_SERVICE'}),
                oldServicePrice: result.getValue({name: 'custrecord_service_price', join: 'CUSTRECORD_SERVICECHG_SERVICE'}),
                nsItem: result.getValue({name: 'custrecord_service_ns_item', join: 'CUSTRECORD_SERVICECHG_SERVICE'}),
                newServiceChangePrice: result.getValue({name: 'custrecord_servicechg_new_price'}),
                dateEffective: result.getValue({name: 'custrecord_servicechg_date_effective'}),
                commRegId: result.getValue({name: 'custrecord_servicechg_comm_reg'}),
                serviceChangeTypeText: result.getText({name: 'custrecord_servicechg_type'}),
                serviceChangeFreqText: result.getText({name: 'custrecord_servicechg_new_freq'}),
            });

            return true;
        })

        return serviceChangeRecords;
    }
};

const handleCallCenterOutcomes = {
    'NO_SALE': ({userId, customerRecord, salesRecord, phoneCallRecord, salesCampaignRecord, salesNote}) => {
        if (parseInt(salesCampaignRecord.getValue({fieldId: 'custrecord_salescampaign_recordtype'})) !== 65) {
            customerRecord.setValue({fieldId: 'entitystatus', value: 21});
        }

        phoneCallRecord.setValue({
            fieldId: 'title',
            value: salesCampaignRecord.getValue({fieldId: 'name'}) + ' - No Sale'
        });
        phoneCallRecord.setValue({fieldId: 'message', value: salesNote});
        phoneCallRecord.setValue({fieldId: 'custevent_call_outcome', value: 16});

        salesRecord.setValue({fieldId: 'custrecord_sales_completed', value: true});
        salesRecord.setValue({fieldId: 'custrecord_sales_inuse', value: false});
        salesRecord.setValue({fieldId: 'custrecord_sales_completedate', value: new Date()});
        salesRecord.setValue({fieldId: 'custrecord_sales_assigned', value: userId});
        salesRecord.setValue({fieldId: 'custrecord_sales_outcome', value: 10});
        salesRecord.setValue({fieldId: 'custrecord_sales_nosalereason', value: ''});
        salesRecord.setValue({fieldId: 'custrecord_sales_callbackdate', value: ''});
        salesRecord.setValue({fieldId: 'custrecord_sales_callbacktime', value: ''});
        salesRecord.setValue({fieldId: 'custrecord_sales_lastcalldate', value: new Date()});
    },
    'NO_RESPONSE_EMAIL': ({userId, customerRecord, salesRecord, phoneCallRecord, salesCampaignRecord, salesNote}) => {
        let salesCampaignType = parseInt(salesCampaignRecord.getValue({fieldId: 'custrecord_salescampaign_recordtype'}));
        let today = new Date();

        if (salesCampaignType === 55)
            customerRecord.setValue({fieldId: 'entitystatus', value: 20});
        else if  (salesCampaignType !== 65)
            customerRecord.setValue({fieldId: 'entitystatus', value: 35});

        phoneCallRecord.setValue({
            fieldId: 'title',
            value: salesCampaignType === 55 ? 'Prospecting Call - GPO - No Answer' : salesCampaignRecord.getValue({fieldId: 'name'}) + ' - No Response - Email'
        });
        phoneCallRecord.setValue({fieldId: 'message', value: salesNote});
        phoneCallRecord.setValue({fieldId: 'custevent_call_outcome', value: 6});

        if (!salesRecord.getValue({fieldId: 'custrecord_sales_day0call'}))
            salesRecord.setValue({fieldId: 'custrecord_sales_day0call', value: today});
        else if (!salesRecord.getValue({fieldId: 'custrecord_sales_day14call'}))
            salesRecord.setValue({fieldId: 'custrecord_sales_day14call', value: today});
        else if (!salesRecord.getValue({fieldId: 'custrecord_sales_day25call'}))
            salesRecord.setValue({fieldId: 'custrecord_sales_day25call', value: today});

        let fiveDaysFromNow = new Date();
        fiveDaysFromNow.setDate(today.getDate() + 5);
        salesRecord.setValue({fieldId: 'custrecord_sales_completed', value: false});
        salesRecord.setValue({fieldId: 'custrecord_sales_inuse', value: false});
        salesRecord.setValue({fieldId: 'custrecord_sales_assigned', value: userId});
        salesRecord.setValue({fieldId: 'custrecord_sales_outcome', value: 7});
        salesRecord.setValue({fieldId: 'custrecord_sales_callbackdate', value: fiveDaysFromNow});
        salesRecord.setValue({fieldId: 'custrecord_sales_callbacktime', value: '10:00 AM'});
        salesRecord.setValue({
            fieldId: 'custrecord_sales_attempt',
            value: parseInt(salesRecord.getValue({fieldId: 'custrecord_sales_attempt'})) + 1
        });
    },
    'NOT_ESTABLISHED': ({userId, customerRecord, salesRecord, phoneCallRecord, salesCampaignRecord, salesNote}) => {
        let today = new Date();

        customerRecord.setValue({fieldId: 'entitystatus', value: 59});
        customerRecord.setValue({fieldId: 'custentity13', value: today});
        customerRecord.setValue({fieldId: 'custentity_service_cancellation_reason', value: 55});

        phoneCallRecord.setValue({fieldId: 'message', value: salesNote});
        phoneCallRecord.setValue({fieldId: 'custevent_call_outcome', value: 3});
        phoneCallRecord.setValue({
            fieldId: 'title',
            value: salesCampaignRecord.getValue({fieldId: 'name'}) + ' - Not Established Business'
        });

        salesRecord.setValue({fieldId: 'custrecord_sales_completed', value: true});
        salesRecord.setValue({fieldId: 'custrecord_sales_inuse', value: false});
        salesRecord.setValue({fieldId: 'custrecord_sales_completedate', value: today});
        salesRecord.setValue({fieldId: 'custrecord_sales_assigned', value: userId});
        salesRecord.setValue({fieldId: 'custrecord_sales_outcome', value: 10});
        salesRecord.setValue({fieldId: 'custrecord_sales_callbackdate', value: ''});
        salesRecord.setValue({fieldId: 'custrecord_sales_callbacktime', value: ''});
        salesRecord.setValue({fieldId: 'custrecord_sales_lastcalldate', value: today});
    },
    'FOLLOW_UP': ({userId, customerRecord, salesRecord, phoneCallRecord, salesCampaignRecord, salesNote}) => {
        let today = new Date();

        customerRecord.setValue({fieldId: 'entitystatus', value: 18});
        customerRecord.setValue({fieldId: 'salesrep', value: userId});

        phoneCallRecord.setValue({fieldId: 'message', value: salesNote});
        phoneCallRecord.setValue({fieldId: 'custevent_call_outcome', value: 25});
        phoneCallRecord.setValue({
            fieldId: 'title',
            value: salesCampaignRecord.getValue({fieldId: 'name'}) + ' - Prospect Opportunity'
        });

        salesRecord.setValue({fieldId: 'custrecord_sales_completed', value: false});
        salesRecord.setValue({fieldId: 'custrecord_sales_inuse', value: false});
        salesRecord.setValue({fieldId: 'custrecord_sales_assigned', value: userId});
        salesRecord.setValue({fieldId: 'custrecord_sales_outcome', value: 21});
        salesRecord.setValue({fieldId: 'custrecord_sales_callbackdate', value: ''});
        salesRecord.setValue({fieldId: 'custrecord_sales_callbacktime', value: ''});
        salesRecord.setValue({fieldId: 'custrecord_sales_lastcalldate', value: today});
    },
};

function _updateDefaultShippingAndBillingAddress(customerId, currentDefaultShipping, currentDefaultBilling, addressSublistForm) {
    let {record} = NS_MODULES;
    let addressToUpdate, fieldIdToUpdate;

    let customerRecord = record.load({
        type: record.Type.CUSTOMER,
        id: customerId,
        isDynamic: true
    });

    let update = () => {
        let line = customerRecord.findSublistLineWithValue({sublistId: 'addressbook', fieldId: 'internalid', value: addressToUpdate});
        customerRecord.selectLine({sublistId: 'addressbook', line});
        customerRecord.setCurrentSublistValue({sublistId: 'addressbook', fieldId: fieldIdToUpdate, value: false});

        if (customerRecord.getCurrentSublistValue({sublistId: 'addressbook', fieldId: 'defaultshipping'})) {
            customerRecord.setCurrentSublistValue({sublistId: 'addressbook', fieldId: 'label', value: 'Site Address'});
        } else if (customerRecord.getCurrentSublistValue({sublistId: 'addressbook', fieldId: 'defaultbilling'})) {
            customerRecord.setCurrentSublistValue({sublistId: 'addressbook', fieldId: 'label', value: 'Billing Address'});
        } else if (customerRecord.getCurrentSublistValue({sublistId: 'addressbook', fieldId: 'isresidential'})) {
            customerRecord.setCurrentSublistValue({sublistId: 'addressbook', fieldId: 'label', value: 'Postal Address'});
        } else {
            customerRecord.setCurrentSublistValue({sublistId: 'addressbook', fieldId: 'label', value: 'Other Address'});
        }

        customerRecord.commitLine({sublistId: 'addressbook'});
    }

    if (addressSublistForm.defaultshipping && currentDefaultShipping !== addressSublistForm.internalid && currentDefaultShipping !== null) {
        addressToUpdate = currentDefaultShipping;
        fieldIdToUpdate = 'defaultshipping';
        update();
    }

    if (addressSublistForm.defaultbilling && currentDefaultBilling !== addressSublistForm.internalid && currentDefaultBilling !== null) {
        addressToUpdate = currentDefaultBilling;
        fieldIdToUpdate = 'defaultbilling';
        update();
    }

    customerRecord.save({ignoreMandatoryFields: true});
}

function _sendEmailsAfterSavingCommencementRegister(userId, customerId, commRegId) {
    let {https, email, record, task} = NS_MODULES;
    let customerRecord = record.load({type: record.Type.CUSTOMER, id: customerId});
    let entityId = customerRecord.getValue({fieldId: 'entityid'});
    let companyName = customerRecord.getValue({fieldId: 'companyname'});
    let partnerId = customerRecord.getValue({fieldId: 'partner'});
    let partnerText = customerRecord.getText({fieldId: 'partner'});
    let leadSourceId = customerRecord.getValue({fieldId: 'leadsource'});
    let leadSourceText = customerRecord.getText({fieldId: 'leadsource'});
    let dayToDayEmail = customerRecord.getValue({fieldId: 'custentity_email_service'});
    let customerContacts = sharedFunctions.getCustomerContacts(customerId).filter(item => item.custentity_connect_user);

    let email_subject = '';
    let email_body = ' New Customer NS ID: ' + customerId +
        '</br> New Customer: ' + entityId + ' ' + companyName +
        '</br> New Customer Franchisee NS ID: ' + partnerId +
        '</br> New Customer Franchisee Name: ' + partnerText + '';
    if (parseInt(leadSourceId) === 246306) {
        email_subject = 'Shopify Customer Finalised on NetSuite';
        email_body += '</br> Email: ' + dayToDayEmail;
        email_body += '</br> Lead Source: ' + leadSourceText;
    } else {
        email_subject = 'New Customer Finalised on NetSuite';
    }

    if (customerContacts.length) { // contact with connect_user set to true
        let contact = customerContacts[0]; // taking only the first contact with connect_user (???)
        email_body += '</br></br> Customer Portal Access - User Details';
        email_body += '</br>First Name: ' + contact['firstname'];
        email_body += '</br>Last Name: ' + contact['lastname'];
        email_body += '</br>Email: ' + contact['email'];
        email_body += '</br>Phone: ' + contact['phone'];

        customerRecord.setValue({fieldId: 'custentity_portal_access', value: 1});
        customerRecord.setValue({fieldId: 'custentity_portal_how_to_guides', value: 2});
        customerRecord.save({ignoreMandatoryFields: true});

        let userJSON = '{';
        userJSON += '"customer_ns_id" : "' + customerId + '",'
        userJSON += '"first_name" : "' + contact['lastname'] + '",'
        userJSON += '"last_name" : "' + contact['lastname'] + '",'
        userJSON += '"email" : "' + contact['email'] + '",'
        userJSON += '"phone" : "' + contact['phone'] + '"'
        userJSON += '}';

        let headers = {};
        headers['Content-Type'] = 'application/json';
        headers['Accept'] = 'application/json';
        headers['x-api-key'] = 'XAZkNK8dVs463EtP7WXWhcUQ0z8Xce47XklzpcBj';

        https.post({
            url: 'https://mpns.protechly.com/new_staff',
            body: userJSON,
            headers
        });

        let taskRecord = record.create({type: 'task'});
        taskRecord.setValue({fieldId: 'title', value: 'Shipping Portal - Send Invite'});
        taskRecord.setValue({fieldId: 'assigned', value: 1706027});
        taskRecord.setValue({fieldId: 'company', value: customerId});
        taskRecord.setValue({fieldId: 'sendemail', value: true});
        taskRecord.setValue({fieldId: 'message', value: ''});
        taskRecord.setText({fieldId: 'status', text: 'Not Started'});
        taskRecord.save({ignoreMandatoryFields: true});

        email.sendBulk({
            author: userId,
            body: email_body,
            subject: 'New Customer Finalised - Portal Access Required',
            recipients: ['laura.busse@mailplus.com.au'],
            cc: ['popie.popie@mailplus.com.au',
                'ankith.ravindran@mailplus.com.au',
                'fiona.harrison@mailplus.com.au'
            ],
            relatedRecords: {
                'entity': customerId
            },
            isInternalOnly: true
        });
    }

    email.sendBulk({
        author: userId,
        body: email_body,
        subject: email_subject,
        recipients: ['popie.popie@mailplus.com.au'],
        cc: [
            'ankith.ravindran@mailplus.com.au',
            'fiona.harrison@mailplus.com.au'
        ],
        relatedRecords: {
            'entity': customerId
        },
        isInternalOnly: true
    });

    let customerJSON = '{';
    customerJSON += '"ns_id" : "' + customerId + '"'
    customerJSON += '}';

    let headers = {};
    headers['Content-Type'] = 'application/json';
    headers['Accept'] = 'application/json';
    headers['x-api-key'] = 'XAZkNK8dVs463EtP7WXWhcUQ0z8Xce47XklzpcBj';

    https.post({
        url: 'https://mpns.protechly.com/new_customer',
        body: customerJSON,
        headers
    });

    /**
     * Description - Schedule Script to create / edit / delete the financial tab items with the new details
     */
    let params3 = _prepareScheduledScriptParams(customerId, commRegId);
    let scriptTask = task.create({
        taskType: task.TaskType['SCHEDULED_SCRIPT'],
        scriptId: 'customscript_sc_smc_item_pricing_update',
        deploymentId: 'customdeploy1',
        params: params3
    });
    let scriptTaskId = scriptTask.submit();
    let status = task.checkStatus(scriptTaskId);
    return status === 'QUEUED';
}

function _prepareScheduledScriptParams(customerId, commRegId) {
    let {record} = NS_MODULES;
    let customerRecord = record.load({type: record.Type.CUSTOMER, id: customerId});
    let pricing_notes_services = customerRecord.getValue({fieldId: 'custentity_customer_pricing_notes'});
    let initial_size_of_financial = customerRecord.getLineCount({sublistId: 'itempricing'});


    let financialTabItemArray = [];

    for (let line = 1; line <= customerRecord.getLineCount({sublistId: 'itempricing'}); line++) {
        customerRecord.selectLine({sublistId: 'itempricing', line});
        financialTabItemArray[financialTabItemArray.length] = customerRecord.getCurrentSublistValue({
            sublistId: 'itempricing',
            fieldId: 'item'
        });
    }

    let serviceChangeRecords = sharedFunctions.getServiceChangeRecords(customerId, commRegId);

    let item_price_array = [];
    let financial_tab_item_array = [];
    let financial_tab_price_array = [];
    let count_array = [];
    
    for (let [index, serviceChangeRecord] of serviceChangeRecords.entries()) {
        let {nsItem, serviceTypeId, newServiceChangePrice, serviceDescription, serviceChangeFreqText} = serviceChangeRecord;

        let nsTypeRec = record.load({type: 'serviceitem', id: nsItem});
        let serviceText = nsTypeRec.getValue({fieldId: 'itemid'});

        if (index === 0) {
            pricing_notes_services += '\n' +
                serviceText + ' - @$' + newServiceChangePrice + ' - ' + serviceChangeFreqText + '\n';
        } else {
            pricing_notes_services += '\n' + serviceText + ' - @$' + newServiceChangePrice + ' - ' +
                serviceChangeFreqText + '\n';
        }


        serviceDescription = serviceDescription ? serviceDescription.replace(/\s+/g, '-').toLowerCase() : 0;

        if (item_price_array[serviceTypeId] === undefined) {
            item_price_array[serviceTypeId] = [];
            item_price_array[serviceTypeId][0] = newServiceChangePrice + '_' + serviceDescription;
        } else {
            let size = item_price_array[serviceTypeId].length;
            item_price_array[serviceTypeId][size] = newServiceChangePrice + '_' + serviceDescription;
        }
    }

    customerRecord.setValue({fieldId: 'custentity_customer_pricing_notes', value: pricing_notes_services});
    customerRecord.save({ignoreMandatoryFields: true});

    for (let serviceChangeRecord of serviceChangeRecords) {
        let {nsItem, serviceTypeId, newServiceChangePrice} = serviceChangeRecord;

        let serviceTypeRec = record.load({type: 'customrecord_service_type', id: serviceTypeId});

        if (count_array[serviceTypeId] === undefined) {
            count_array[serviceTypeId] = -1;
        }

        let size = item_price_array[serviceTypeId].length;

        //if the size is 1, directly create in the financial tab
        if (size === 1) {
            initial_size_of_financial++;
            financial_tab_item_array[initial_size_of_financial] = nsItem;
            financial_tab_price_array[initial_size_of_financial] = newServiceChangePrice;
        } else {
            //if the size is more than 1, go through the NS array in the service type record and create the ns iitems in the financial tab respectively
            let ns_array_items = serviceTypeRec.getValue({fieldId: 'custrecord_service_type_ns_item_array'});
            if (ns_array_items) {

                let ns_items = ns_array_items.split(",")

                if (count_array[serviceTypeId] < ns_items.length) {
                    initial_size_of_financial++;
                    if (count_array[serviceTypeId] === -1) {
                        financial_tab_item_array[initial_size_of_financial] = serviceTypeRec.getValue({fieldId: 'custrecord_service_type_ns_item'});
                        financial_tab_price_array[initial_size_of_financial] = newServiceChangePrice;

                        count_array[serviceTypeId] = count_array[serviceTypeId] + 1;

                    } else {

                        financial_tab_item_array[initial_size_of_financial] = ns_items[count_array[serviceTypeId]];
                        financial_tab_price_array[initial_size_of_financial] = newServiceChangePrice;

                        count_array[serviceTypeId] = count_array[serviceTypeId] + 1;
                    }
                }
            } else if (count_array[serviceTypeId] === -1) {

                initial_size_of_financial++;
                financial_tab_item_array[initial_size_of_financial] = serviceTypeRec.getValue({fieldId: 'custrecord_service_type_ns_item'});
                financial_tab_price_array[initial_size_of_financial] = newServiceChangePrice;
                count_array[serviceTypeId] = count_array[serviceTypeId] + 1;
            }
        }
    }

    return {
        custscriptcustomer_id: parseInt(customerId),
        custscriptids: financialTabItemArray.toString(),
        custscriptlinked_service_ids: null,
        custscriptfinancial_tab_array: financial_tab_item_array.toString(),
        custscriptfinancial_tab_price_array: financial_tab_price_array.toString()
    };
}

function _parseIsoDatetime(dateString) {
    let dt = dateString.split(/[: T-]/).map(parseFloat);
    return new Date(dt[0], dt[1] - 1, dt[2], dt[3] || 0, dt[4] || 0, dt[5] || 0, 0);
}