<template>
    <div class="xe2-header">
        <MenuBarCommands :appProjectManager="appProjectManager">
        </MenuBarCommands>
    </div>
</template>

<script setup lang="ts">
import MenuBarCommands from "./MenuBarCommands.vue";
import { onBeforeUnmount } from 'vue';
import { AppProjectManager } from '../scripts/AppProjectManager';
import { createVueDisposer, toVR } from 'vue-xe2-plugin/dist-node/components/xe2/tools';

const props = withDefaults(defineProps<{
    appProjectManager: AppProjectManager;
}>(), {
});
const { appProjectManager } = props;
const d = createVueDisposer(onBeforeUnmount);

const showHeaderViewRef = toVR<boolean>(d, [appProjectManager, "showHeaderView"])

</script>

<style scoped>
.xe2-header {
    width: 100%;
    height: 30px;
    background: #292b2f;
}

</style>