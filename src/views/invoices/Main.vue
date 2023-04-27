<template>
    <b-card border-variant="primary" bg-variant="transparent">
        <div class="row justify-content-center" >
            <div class="col-12">
                <h1 class="text-center mp-header">Last 3 Invoices</h1>
            </div>

            <b-table :items="invoices" :fields="invoiceColumns" head-row-variant="light" striped show-empty :busy="busy">
                <template v-slot:empty>
                    No Invoice Found
                </template>

                <template v-slot:cell(tranid)="{item}">
                    <a target="_blank" :href="item.link">{{item.tranid}}</a>
                </template>

                <template v-slot:table-busy>
                    <div class="text-center text-danger my-2">
                        <b-spinner class="align-middle mx-2"></b-spinner>
                        <strong>Loading...</strong>
                    </div>
                </template>
            </b-table>
        </div>
    </b-card>
</template>

<script>
export default {
    name: "Main",
    data: () => ({
        invoiceColumns: [
            {key: 'trandate', label: 'Date'},
            {key: 'tranid', label: 'Number'},
            {key: 'total', label: 'Total'},
            {key: 'status_text', label: 'Status'},
        ]
    }),
    methods: {

    },
    computed: {
        invoices() {
            return this.$store.getters['invoices/all'].slice(-3);
        },
        busy() {
            return this.$store.getters['invoices/busy'];
        }
    }
}
</script>

<style scoped>

</style>