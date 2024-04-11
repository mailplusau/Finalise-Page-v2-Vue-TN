<template>
    <div class="col-lg-5 col-12">

        <h1 class="text-center mp-header">Addresses</h1>

        <AddressTable />

        <AddressFormModal />

    </div>
</template>

<script>
import AddressTable from "./AddressTable";
import AddressFormModal from "./AddressFormModal";

export default {
    name: "Main",
    components: {AddressFormModal, AddressTable},
}
</script>

<style scoped>
    .address-warning {
        color: #103d39;
        font-weight: bold;
    }
</style>