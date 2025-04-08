
<script setup lang='ts'>
import { AppProjectManager } from "@/scripts/AppProjectManager";
import { onBeforeUnmount } from "vue";
import StreeHisToolbar from "vue-xe2-plugin/dist-node/components/xe2/common/Toolbars/StreeHisToolbar.vue";
import { createVueDisposer, toVR } from 'vue-xe2-plugin/dist-node/components/xe2/tools';

const props = withDefaults(defineProps<{
    appProjectManager: AppProjectManager,
}>(), {});

const { appProjectManager } = props;
const { xe2ProjectManager: p, sceneObjectTypeGetting: typeGetting } = appProjectManager;
const d = createVueDisposer(onBeforeUnmount)
const showStreeHisToolbarRef = toVR<boolean>(d, [appProjectManager, "showStreeHisToolbar"])

</script>

<template>
    <div class="tool_panels">

        <StreeHisToolbar v-show="showStreeHisToolbarRef" :projectManager="p" :isMinToolView="true">
        </StreeHisToolbar>


    </div>
</template>

<style scoped>
.tool_panels {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: flex-start;
    align-items: center;
}

.searchToolbar {
    width: 310px;
    margin-left: 10px;
    margin-right: 10px;
}
</style>
