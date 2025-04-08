<template>
    <div class="xe2-streetool">
        <MainToolBar :appProjectManager="appProjectManager"></MainToolBar>
    </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount } from "vue";
import { createVueDisposer, toVR } from 'vue-xe2-plugin/dist-node/components/xe2/tools';
import { AppProjectManager } from "../scripts/AppProjectManager";
import MainToolBar from "./MainToolBar.vue";

const props = withDefaults(defineProps<{
    appProjectManager: AppProjectManager;
}>(), {
});
const { appProjectManager } = props;

const d = createVueDisposer(onBeforeUnmount);

const showMainToolBarRef = toVR<boolean>(d, [appProjectManager, "showMainToolBar"])

</script>

<style scoped>
.xe2-streetool {
    width: 100%;
    height: auto;
    outline: none;
    background-color: #292b2f;
}
</style>