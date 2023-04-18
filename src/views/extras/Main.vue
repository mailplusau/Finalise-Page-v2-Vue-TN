<template>
    <b-card border-variant="primary" bg-variant="transparent" class="my-3" style="padding: 0">
        <b-tabs content-class="mt-3" fill>
            <CurrentServicesTab />
            <MPExProductsTab />
            <SalesNotesTab />
            <SurveyInfoTab />
        </b-tabs>
    </b-card>
</template>

<script>
import CurrentServicesTab from "@/views/extras/CurrentServicesTab";
import MPExProductsTab from "@/views/extras/MPExProductsTab";
import SalesNotesTab from "@/views/extras/SalesNotesTab";
import SurveyInfoTab from "@/views/extras/SurveyInfoTab";
export default {
    name: "Main",
    components: {SurveyInfoTab, SalesNotesTab, MPExProductsTab, CurrentServicesTab}
}
</script>

<style scoped>

</style>