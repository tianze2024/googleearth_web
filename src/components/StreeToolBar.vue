<template>
    <div class="xe2-tool">
        <StreeMainToolBar :appProjectManager="appProjectManager"></StreeMainToolBar>
    </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount } from "vue";
import { createVueDisposer, toVR } from 'vue-xe2-plugin/dist-node/components/xe2/tools';
import { AppProjectManager } from "../scripts/AppProjectManager";
import StreeMainToolBar from "./StreeMainToolBar.vue";

const props = withDefaults(defineProps<{
    appProjectManager: AppProjectManager;
}>(), {
});
const { appProjectManager } = props;

const d = createVueDisposer(onBeforeUnmount);

const showStreeMainToolBarRef = toVR<boolean>(d, [appProjectManager, "showStreeMainToolBar"])

</script>

<style scoped>
.xe2-tool {
    width: 100%;
    height: auto;
    outline: none;
    background-color: #292b2f00;
}
</style>