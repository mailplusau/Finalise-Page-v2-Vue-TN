<template>
    <FileDropZone v-model="formFile.file" :disabled="false" class="mb-4" v-if="!$store.getters['callCenterMode']">
        <template v-slot:default="{files, openFileDialog, removeAllFiles, isDisabled}">
            <b-card border-variant="primary" class="my-3" bg-variant="transparent">
                <div class="row justify-content-center" >
                    <div class="col-12 mb-4">
                        <h1 class="text-center mp-header">Commencement Details</h1>
                    </div>

                    <div class="col-6 mb-4">
                        <b-input-group prepend="Date - Commencement">
                            <b-form-datepicker v-model="form.custrecord_comm_date" v-validate="'required'" data-vv-name="commencement_date" value-as-date
                                               :class="errors.has('commencement_date') ? 'is-invalid' : ''" :disabled="false"></b-form-datepicker>

                            <b-form-invalid-feedback :state="!errors.has('commencement_date')">{{ errors.first('commencement_date') }}</b-form-invalid-feedback>
                        </b-input-group>
                    </div>
                    <div class="col-6 mb-4">
                        <b-input-group prepend="Date - Signup">
                            <b-form-datepicker v-model="form.custrecord_comm_date_signup" v-validate="'required'" data-vv-name="signup_date" value-as-date
                                               :class="errors.has('signup_date') ? 'is-invalid' : ''" :disabled="formDisabled || busy"></b-form-datepicker>

                            <b-form-invalid-feedback :state="!errors.has('signup_date')">{{ errors.first('signup_date') }}</b-form-invalid-feedback>
                        </b-input-group>
                    </div>
                    <div class="col-6 mb-4">
                        <b-input-group prepend="Commencement Type">
                            <b-form-select v-model="form.custrecord_sale_type" v-validate="'required'" data-vv-name="commencement_type"
                                           :class="errors.has('commencement_type') ? 'is-invalid' : ''" :options="$store.getters['misc/commencementTypeOptions']"
                                           :disabled="formDisabled || busy"></b-form-select>

                            <b-form-invalid-feedback :state="!errors.has('commencement_type')">{{ errors.first('commencement_type') }}</b-form-invalid-feedback>
                        </b-input-group>
                    </div>
                    <div class="col-6 mb-4">
                        <b-input-group prepend="Inbound/Outbound">
                            <b-form-select v-model="form.custrecord_in_out" v-validate="'required'" data-vv-name="inbound_outbound"
                                           :class="errors.has('inbound_outbound') ? 'is-invalid' : ''" :options="$store.getters['misc/inOutOptions']"
                                           :disabled="formDisabled || busy"></b-form-select>

                            <b-form-invalid-feedback :state="!errors.has('inbound_outbound')">{{ errors.first('inbound_outbound') }}</b-form-invalid-feedback>
                        </b-input-group>
                    </div>
                    <div class="col-6 mb-4">
                        <b-input-group prepend="Date of Entry">
                            <b-form-datepicker v-model="form.custrecord_date_entry" v-validate="'required'" data-vv-name="date_of_entry" value-as-date
                                               :class="errors.has('date_of_entry') ? 'is-invalid' : ''" readonly></b-form-datepicker>

                            <b-form-invalid-feedback :state="!errors.has('date_of_entry')">{{ errors.first('date_of_entry') }}</b-form-invalid-feedback>
                        </b-input-group>
                    </div>
                    <div class="col-6 mb-4">
                        <b-input-group prepend="Commencement Form">
                            <b-form-input :value="files[0] ? files[0].name : (form.custrecord_scand_form ? 'File Cabinet ID #' + form.custrecord_scand_form : '')"
                                          @click="openFileDialog" v-validate="'required'" data-vv-name="commencement_form"
                                          placeholder="Choose a file or drop it here..."
                                          :class="errors.has('commencement_form') ? 'is-invalid' : ''" readonly :disabled="isDisabled"></b-form-input>

                            <b-input-group-append>
                                <b-button v-if="files[0]" variant="outline-danger" @click="removeAllFiles" title="Cancel file upload"><b-icon icon="trash"></b-icon></b-button>
                                <b-button v-if="files[0] || form.custrecord_scand_form" @click="modalOpen = true"
                                          variant="outline-success" title="View this file"><b-icon icon="eye"></b-icon></b-button>
                            </b-input-group-append>

                            <b-form-invalid-feedback :state="!errors.has('commencement_form')">{{ errors.first('commencement_form') }}</b-form-invalid-feedback>
                        </b-input-group>
                    </div>

                    <div class="col-12 mb-4">
                        <b-button v-if="serviceChanges.length" size="lg" variant="success" @click="save">
                            Finalise Customer
                        </b-button>
                        <b-button v-else size="sm" variant="success" @click="save" :disabled="formDisabled || busy">
                            Save Commencement Register & Create Service Change <b-icon icon="box-arrow-up-right" scale=".6"></b-icon>
                        </b-button>
                    </div>
                </div>
            </b-card>


            <b-modal size="lg" centered v-model="modalOpen" hide-footer>
                <template v-slot:modal-header>
                    <h5 class="text-center">Preview</h5>
                    <b-button size="sm" @click="modalOpen = false">Close</b-button>
                </template>

                <iframe v-if="formFileUrl" style="width: 100%; height: 80vh;" :src="formFileUrl"></iframe>
                <p v-else>File Not Found</p>
            </b-modal>
        </template>
    </FileDropZone>
</template>

<script>
import FileDropZone from "@/components/FileDropZone";
export default {
    name: "Main",
    components: {FileDropZone},
    data: () => ({
        file: null,
        modalOpen: false,
    }),
    methods: {
        getFile(file) {
            if (file)
                return URL.createObjectURL(file);

            if (this.form.custrecord_scand_form)
                return this.form.custrecord_scand_form;

            return null;
        },
        save() {
            this.$validator.validateAll().then((result) => {
                if (result) {
                    console.log('Form Submitted!');
                    this.$store.dispatch('comm-reg/save');
                } else console.log('Correct them errors!');
            });
        }
    },
    computed: {
        serviceChanges() {
            return this.$store.getters['service-changes/all'];
        },
        form() {
            return this.$store.getters['comm-reg/form'];
        },
        texts() {
            return this.$store.getters['comm-reg/texts'];
        },
        formDisabled() {
            return this.$store.getters['comm-reg/disabled'];
        },
        busy() {
            return this.$store.getters['comm-reg/busy'];
        },
        formFile() {
            return this.$store.getters['comm-reg/formFile'];
        },
        formFileUrl() {
            return this.$store.getters['comm-reg/formFileUrl'];
        }
    },
    watch: {
        'formFile.file' : function () {
            this.$store.dispatch('comm-reg/generateFormFileURL');
        }
    }
}
</script>

<style scoped>

</style>