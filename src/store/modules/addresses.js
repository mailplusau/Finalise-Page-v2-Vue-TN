import http from "@/utils/http";

let _loadPostalLocationsRunning = false;

const state = {
    addresses: [],
    addressSelectedId: null,
    addressModal: false,
    addressModalTitle: '',
    addressFormBusy: false,
    addressLoading: true,
    addressForm: {
        addr1: '',
        addr2: '',
        city: '',
        state: '',
        zip: '',
        country: 'AU',
        addressee: '', // company name
        custrecord_address_lat: '',
        custrecord_address_lon: '',
        custrecord_address_ncl: '',
    },
    addressSublistForm: {
        internalid: '',
        label: '',
        defaultshipping: false,
        defaultbilling: false,
        isresidential: false,
    },
    addressFormValid: false,
    addressFormDisabled: true,
    addressType: 'street',
    addressTypes: {
        street: 'Street Address',
        postal: 'Postal Address'
    },

    postalState: 0,
    postalLocations: [],
    postalLocationForm: {
        name: '',
        internalid: '',
        custrecord_ap_lodgement_addr1: '',
        custrecord_ap_lodgement_addr2: '',
        custrecord_ap_lodgement_lat: '',
        custrecord_ap_lodgement_long: '',
        custrecord_ap_lodgement_postcode: '',
        custrecord_ap_lodgement_site_phone: '',
        custrecord_ap_lodgement_site_state: '', // getText for this one
        custrecord_ap_lodgement_suburb: '',
        custrecord_ap_lodgement_supply: false,
        custrecord_ncl_monthly_fee: '',
        custrecord_ncl_site_access_code: '',
        custrecord_noncust_location_type: '', // getText for this one too
    },
    shippingAddressAdded: null,
    billingAddressAdded: null,
}

const getters = {
    all : state => state.addresses,
    loading : state => state.addressLoading,
    modal : state => state.addressModal,
    selectedId : state => state.addressSelectedId,
    modalTitle : state => state.addressModalTitle,
    form : state => state.addressForm,
    sublistForm : state => state.addressSublistForm,
    formBusy : state => state.addressFormBusy,
    shippingAddressAdded : state => state.shippingAddressAdded,
    billingAddressAdded : state => state.billingAddressAdded,
    type : state => state.addressType,
    types : state => {
        let arr = [];
        for (const addressTypesKey in state.addressTypes) {
            arr.push({value: addressTypesKey, text: state.addressTypes[addressTypesKey]})
        }
        return arr;
    },
    postalState : state => state.postalState,
    postalLocations : state => state.postalLocations.map(item => ({value: item.internalid, text: item.name})),
    defaultShippingStateId : (state, getters, rootState, rootGetters) => {
        if (!state.shippingAddressAdded) return null;

        let addressIndex = state.addresses.findIndex(item => item.internalid === state.shippingAddressAdded);

        if (addressIndex < 0) return null;

        let stateIndex = rootGetters['misc/states'].findIndex(item => item.text === state.addresses[addressIndex].state);

        return stateIndex >= 0 ? rootGetters['misc/states'][stateIndex].value : null;
    }
}

const mutations = {
    setModal : (state, open = true) => { state.addressModal = open; },
    handleAddressFormChange : (state, googlePlace) => {
        state.addressForm.custrecord_address_lat = googlePlace.geometry.location.lat();
        state.addressForm.custrecord_address_lon = googlePlace.geometry.location.lng();

        let address2 = "";

        for (let addressComponent of googlePlace.address_components) {

            if (addressComponent.types[0] === 'street_number' || addressComponent.types[0] === 'route') {
                address2 += addressComponent['short_name'] + " ";
                state.addressForm.addr2 = address2;
            }
            if (addressComponent.types[0] === 'postal_code') {
                state.addressForm.zip = addressComponent['short_name'];
            }
            if (addressComponent.types[0] === 'administrative_area_level_1') {
                state.addressForm.state = addressComponent['short_name'];
            }
            if (addressComponent.types[0] === 'locality') {
                state.addressForm.city = addressComponent['short_name'];
            }
        }
    },
    setType : (state, type) => {
        // make sure this does not get triggered twice because it will soft-reset the pre-filled data by openAddressModal
        if (state.addressTypes[type] && type !== state.addressType) {
            state.addressType = type;

            // Also do a soft reset of address form
            for (let fieldId in state.addressForm) {
                if (fieldId === 'country') {
                    state.addressForm[fieldId] = 'AU';
                } else if (fieldId !== 'addressee') // Don't reset addressee
                    state.addressForm[fieldId] = '';
            }
        }
    },
    setPostalState : (state, stateIndex) => { state.postalState = stateIndex; }
}

const actions = {
    init : async context => {
        if (!context.rootGetters['customerId']) {
            context.state.addressLoading = false;
            return;
        }

        await _loadAddresses(context);

        _checkBillingAndShippingAddress(context)

        context.state.addressLoading = false;
    },
    openAddressModal : (context, addressId) => {
        context.state.addressModalTitle = 'Add a new address'

        if (addressId) {
            context.state.addressModalTitle = 'Editing address #' + addressId;
            context.state.addressFormBusy = true;

            let index = context.state.addresses.findIndex(item => parseInt(item.internalid) === parseInt(addressId));

            let shouldWait = false;
            if (context.state.addresses[index].custrecord_address_ncl) {
                let i = context.rootGetters['misc/states'].findIndex(item => item.text === context.state.addresses[index].state);
                context.commit('setType', 'postal');
                context.state.postalState = i >= 0 ? context.rootGetters['misc/states'][i].value : 0;
                shouldWait = true;
            } else {
                context.commit('setType', 'street');
                shouldWait = false;
            }

            let tempFunc = () => {
                for (let fieldId in context.state.addressForm) {
                    context.state.addressForm[fieldId] = context.state.addresses[index][fieldId];
                }

                for (let fieldId in context.state.addressSublistForm) {
                    context.state.addressSublistForm[fieldId] = context.state.addresses[index][fieldId];
                }
                context.state.addressFormBusy = false;
            }

            // we have to put this block of code in setInterval and wait for handlePostalStateChanged
            // to populate postalLocations array. Otherwise, we will run into issues with race condition
            if (shouldWait) {
                let timer = setInterval(() => {
                    if (!_loadPostalLocationsRunning) {
                        tempFunc();
                        clearInterval(timer);
                    }
                }, 250);
            } else tempFunc();

        } else _resetAddressForm(context);

        context.state.addressModal = true;
    },
    closeAddressModal : context => { context.state.addressModal = false; },
    saveAddressForm : async context => {
        context.state.addressFormBusy = true;
        _setAddressLabel(context.state.addressSublistForm) // Set address label for current address in the form

        if (context.rootGetters['customerId']) { // Existing customer, we just add new or edit existing address

            try {
                await http.post('saveAddress', {
                    customerId: context.rootGetters['customerId'],
                    currentDefaultShipping: context.state.shippingAddressAdded,
                    currentDefaultBilling: context.state.billingAddressAdded,
                    addressForm: context.state.addressForm,
                    addressSublistForm: context.state.addressSublistForm,
                });

                await _loadAddresses(context);

                _checkBillingAndShippingAddress(context);
            } catch (e) { console.error(e); }

        }

        context.state.addressFormBusy = false;
        context.state.addressModal = false;
    },
    removeAddress : async (context, addressInternalId) => {
        context.state.addressFormBusy = true;

        if (context.rootGetters['customerId']) {

            try {
                await http.post('deleteAddress', {
                    customerId: context.rootGetters['customerId'],
                    addressInternalId
                });

                await _loadAddresses(context);

                _checkBillingAndShippingAddress(context);
            } catch (e) { console.error(e); }
        }

        context.state.addressFormBusy = false;
    },
    handlePostalStateChanged : async (context, stateIndex) => {
        context.state.addressFormBusy = true;
        _loadPostalLocationsRunning = true;

        await _loadPostalLocations(context, stateIndex);

        context.state.addressFormBusy = false;
        _loadPostalLocationsRunning = false;
    },
    handlePostalLocationChanged : (context, postalLocationInternalId) => {
        let index = context.state.postalLocations.findIndex(item => item.internalid === postalLocationInternalId);

        if (index < 0) return;

        let postalLocation = context.state.postalLocations[index];
        context.state.addressForm.state = postalLocation.custrecord_ap_lodgement_site_state;
        context.state.addressForm.city = postalLocation.custrecord_ap_lodgement_suburb;
        context.state.addressForm.zip = postalLocation.custrecord_ap_lodgement_postcode;
        context.state.addressForm.custrecord_address_lat = postalLocation.custrecord_ap_lodgement_lat;
        context.state.addressForm.custrecord_address_lon = postalLocation.custrecord_ap_lodgement_long;
        context.state.addressForm.custrecord_address_ncl = postalLocation.internalid;
    },
}

function _resetAddressForm(context) {
    console.log('resetting address form')
    for (let fieldId in context.state.addressForm) {
        context.state.addressForm[fieldId] = '';
    }

    context.state.addressForm.addressee = context.rootGetters['customer/detailForm'].companyname || '';
    context.state.addressForm.country = 'AU';

    context.state.addressSublistForm.label = '';
    context.state.addressSublistForm.internalid = null;
    context.state.addressSublistForm.defaultshipping = false;
    context.state.addressSublistForm.defaultbilling = false;
    context.state.addressSublistForm.isresidential = false;
}

async function _loadAddresses(context) {
    console.log('loading addresses...');

    let data = await http.get('getCustomerAddresses', {
        customerId: context.rootGetters['customerId']
    });

    context.state.addresses = [...data];
}

async function _loadPostalLocations(context, stateIndex) {
    console.log('fetching NCL locations');

    if (context.rootGetters['misc/states'].findIndex(item => item.value === stateIndex) < 0) {
        console.error('state index ' + stateIndex + ' is invalid');
        return;
    }

    let data = await http.get('getPostalLocationOptions', { stateIndex });

    context.state.postalLocations = [...data];
}

function _checkBillingAndShippingAddress(context) {
    let shippingAddresses = context.state.addresses.filter(item => item.defaultshipping === true);
    context.state.shippingAddressAdded = shippingAddresses.length ? shippingAddresses[0].internalid : null;

    let billingAddresses = context.state.addresses.filter(item => item.defaultbilling === true);
    context.state.billingAddressAdded = billingAddresses.length ? billingAddresses[0].internalid : null;
}

function _setAddressLabel(addressObject) {
    if (addressObject.defaultshipping) {
        addressObject.label = 'Site Address';
    } else if (addressObject.defaultbilling) {
        addressObject.label = 'Billing Address';
    } else if (addressObject.isresidential) {
        addressObject.label = 'Postal Address';
    } else {
        addressObject.label = 'Alternative Sender';
    }
}


export default {
    state,
    getters,
    actions,
    mutations
};