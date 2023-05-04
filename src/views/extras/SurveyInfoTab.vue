<template>
    <b-tab>
        <template v-slot:title>
            <span :class="formDisabled ? '' : 'unsaved-header'">Survey Information</span>
        </template>
        <b-row>
            <div class="col-6 mb-4">
                <b-input-group prepend="Services of Interest">
                    <b-form-select v-model="form.custentity_services_of_interest" :options="servicesOfInterestOptions"
                                   :disabled="formDisabled || busy"></b-form-select>
                </b-input-group>
            </div>
            <div class="col-6 mb-4">
                <b-input-group prepend="Multisite?">
                    <b-form-select v-model="form.custentity_category_multisite" :options="yesNo"
                                   :disabled="formDisabled || busy"></b-form-select>
                </b-input-group>
            </div>
            <div class="col-12 mb-4">
                <b-input-group prepend="Multisite Web Link">
                    <b-form-input v-model="form.custentity_category_multisite_link" v-validate="'url'" data-vv-name="multisite_link"
                                  :class="errors.has('multisite_link') ? 'is-invalid' : ''" :disabled="formDisabled || busy"></b-form-input>

                    <b-form-invalid-feedback :state="!errors.has('multisite_link')">{{ errors.first('multisite_link') }}</b-form-invalid-feedback>
                </b-input-group>
            </div>
            <div class="col-12 mb-4">
                <div class="col-12">
                    <b-button @click="editForm" v-if="formDisabled" size="sm" :disabled="busy" variant="outline-primary">Edit Survey Information</b-button>
                    <template v-else>
                        <b-button @click="resetForm" size="sm" class="mx-2" :disabled="busy">Reset</b-button>
                        <b-button @click="cancelEditing" size="sm" class="mx-2" :disabled="busy" variant="outline-danger">Cancel</b-button>
                        <b-button @click="saveForm" size="sm" class="mx-2" :disabled="busy" variant="outline-success">Save</b-button>
                    </template>
                </div>
            </div>
        </b-row>
    </b-tab>
</template>

<script>
export default {
    name: "SurveyInfoTab",
    data: () => ({
        yesNo: [
            {value: true, text: 'Yes'},
            {value: false, text: 'No'},
        ]
    }),
    methods: {
        editForm() {
            this.$store.commit('extra-info/disableSurveyInfosForm', false);
        },
        resetForm() {
            this.$store.commit('extra-info/resetSurveyInfoForm');
        },
        cancelEditing() {
            this.$store.commit('extra-info/disableSurveyInfosForm');
            this.$store.commit('extra-info/resetSurveyInfoForm');
        },
        saveForm() {
            this.$validator.validateAll().then((result) => {
                if (result) {
                    // eslint-disable-next-line
                    console.log('Form Submitted!');
                    this.$store.commit('extra-info/disableSurveyInfosForm');
                    this.$store.dispatch('extra-info/saveSurveyInfo');
                    return;
                }

                console.log('Correct them errors!');
            });
        },
    },
    computed: {
        form() {
            return this.$store.getters['extra-info/surveyInfo'].form;
        },
        formDisabled() {
            return this.$store.getters['extra-info/surveyInfo'].formDisabled;
        },
        busy() {
            return this.$store.getters['extra-info/surveyInfo'].busy;
        },
        servicesOfInterestOptions() {
            return this.$store.getters['misc/servicesOfInterestOptions'];
        }
    }
}
</script>

<style scoped>

</style>