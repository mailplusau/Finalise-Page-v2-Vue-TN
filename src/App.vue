<template>
    <div id="app" class="container">
        <CustomerDetails />

        <LPOInfo />

        <LPOPhoto />

        <div class="row justify-content-center align-items-stretch mt-3">
            <CustomerAddresses />

            <CustomerContacts />
        </div>

        <CustomerInvoices />

        <ExtraFeatures />

        <ServiceChanges />

        <ActivityNotes />

        <CommencementDetails />

        <CallCenter />

        <GlobalNoticeModal />
    </div>
</template>

<script>
import GlobalNoticeModal from "@/components/GlobalNoticeModal";
import CustomerDetails from "@/views/customer/Main";
import LPOInfo from "@/views/lpo-info/Main";
import LPOPhoto from "@/views/lpo-info/Photos.vue";
import CustomerAddresses from "@/views/addresses/Main";
import CustomerContacts from "@/views/contacts/Main";
import CustomerInvoices from "@/views/invoices/Main";
import ExtraFeatures from "@/views/extras/Main";
import CallCenter from "@/views/call-center/Main";
import CommencementDetails from "@/views/comm-reg/Main";
import ServiceChanges from "@/views/service-changes/Main";
import ActivityNotes from '@/views/extras/ActivityNotes.vue';

export default {
    name: 'App',
    components: {
        ActivityNotes,
        GlobalNoticeModal,
        CustomerDetails,
        LPOInfo, LPOPhoto,
        CustomerAddresses,
        CustomerContacts,
        CustomerInvoices,
        ExtraFeatures,
        CallCenter,
        CommencementDetails,
        ServiceChanges,
    },
    beforeCreate() {
        this.$store.dispatch('init');
    },
    mounted() {
        this.registerCustomValidationRules();
    },
    methods: {
        registerCustomValidationRules() {
            this.$validator.extend('aus_phone', {
                getMessage(field) {
                    return `the ${field} field must be a valid Australian phone number.`;
                },
                validate(value) {
                    let australiaPhoneFormat = /^(\+\d{2}[ -]{0,1}){0,1}(((\({0,1}[ -]{0,1})0{0,1}\){0,1}[2|3|7|8]{1}\){0,1}[ -]*(\d{4}[ -]{0,1}\d{4}))|(1[ -]{0,1}(300|800|900|902)[ -]{0,1}((\d{6})|(\d{3}[ -]{0,1}\d{3})))|(13[ -]{0,1}([\d -]{5})|((\({0,1}[ -]{0,1})0{0,1}\){0,1}4{1}[\d -]{8,10})))$/;
                    return australiaPhoneFormat.test(value);
                }
            });
            this.$validator.extend('aus_abn', {
                getMessage(field) {
                    return `the ${field} field must be a valid Australian ABN number.`;
                },
                validate(value) {

                    if (!value || value.length !== 11) {
                        return false;
                    }
                    let weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19],
                        checksum = value.split('').map(Number).reduce(
                            function(total, digit, index) {
                                if (!index) {
                                    digit--;
                                }
                                return total + (digit * weights[index]);
                            },
                            0
                        );

                    return !(!checksum || checksum % 89 !== 0);

                }
            });
        },
    }
}
</script>

<style>
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
}

.custom-select {
    position: relative;
    flex: 1 1 auto;
    width: 1%;
    min-width: 0;
    font-size: 13px;
}

.pac-container {
    z-index: 1100 !important;
}

body.modal-open {
    overflow: hidden !important;
}

.mp-header {
    color: #387080;
}

.unsaved-header {
    /*text-decoration: underline;*/
    color: red !important;
}

.unsaved-header:after {
    content:" •";
}

.mp-text {
    color: #103d39
}

/* Styles to give NetSuite the MailPlus color */
div#body {
    background-color: #cfe0ce !important;
}

ul#NS_MENU_ID0, ul#NS_MENU_ID0 > .ns-menuitem > a {
    background-color: #cfe0ce !important;
}

ul.pagination.b-pagination, ul.nav.nav-tabs {
    display: flex !important;
    padding-left: 0 !important;
    list-style: none !important;
    margin: 0 !important;
}

.custom-file {
    display: inline-block;
    margin-bottom: 0;
}
.custom-file-input {
    z-index: 2;
    margin: 0;
    overflow: hidden;
    opacity: 0;
}
.custom-file, .custom-file-input {
    position: relative;
    flex: 1 1;
    width: 100%;
    height: calc(1.5em + 0.75rem + 2px);
}
.custom-file-label {
    white-space: nowrap;
    overflow-x: hidden;
}
.custom-control-label:before, .custom-file-label, .custom-select {
    transition: background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out;
}
.custom-file-label, .custom-file-label:after {
    position: absolute;
    top: 0;
    right: 0;
    padding: 1.1rem 0.75rem;
    line-height: 0.5;
    color: #495057;
}
.custom-file-label {
    left: 0;
    z-index: 1;
    height: calc(1.5em + 0.75rem + 2px);
    overflow: hidden;
    font-weight: 400;
    background-color: #fff;
    border: 1px solid #ced4da;
    border-radius: 0.25rem;
}

span.rounded-circle.btn-outline-primary {
    border-radius: 10%!important;
    border: 2px dashed #095c7b !important;
}
</style>
