
<script setup lang='ts'>
import { AppProjectManager } from "@/scripts/AppProjectManager";
import { onBeforeUnmount } from "vue";
import FavoritesToolbar from "vue-xe2-plugin/dist-node/components/xe2/common/Toolbars/FavoritesToolbar.vue";
import ModelCreatingToolbar from "vue-xe2-plugin/dist-node/components/xe2/common/Toolbars/ModelCreatingToolbar.vue";
import MappingToolbar from "vue-xe2-plugin/dist-node/components/xe2/common/Toolbars/MappingToolbar.vue";
import SceneCreatingToolbar from "vue-xe2-plugin/dist-node/components/xe2/common/Toolbars/SceneCreatingToolbar.vue";
import SearchToolbar from "vue-xe2-plugin/dist-node/components/xe2/common/Toolbars/SearchToolbar.vue";
import MapLayerToolbar from "vue-xe2-plugin/dist-node/components/xe2/common/Toolbars/MapLayerToolbar.vue";

import { createVueDisposer, toVR } from 'vue-xe2-plugin/dist-node/components/xe2/tools';

const props = withDefaults(defineProps<{
    appProjectManager: AppProjectManager,
}>(), {});

const { appProjectManager } = props;
const { xe2ProjectManager: p, sceneObjectTypeGetting: typeGetting } = appProjectManager;
const d = createVueDisposer(onBeforeUnmount)
const showFavoritesToolbarRef = toVR<boolean>(d, [appProjectManager, "showFavoritesToolbar"])
const showSceneCreatingToolbarRef = toVR<boolean>(d, [appProjectManager, "showSceneCreatingToolbar"])
const showModelCreatingToolbarRef = toVR<boolean>(d, [appProjectManager, "showModelCreatingToolbar"])
const showMappingToolbarRef = toVR<boolean>(d, [appProjectManager, "showMappingToolbar"])
const showSearchToolbarRef = toVR<boolean>(d, [appProjectManager, "showSearchToolbar"])
const showMapLayerToolbarRef = toVR<boolean>(d, [appProjectManager, "showMapLayerToolbar"])
</script>

<template>
    <div class="tool_panels">
        <SearchToolbar class="searchToolbar" v-show="showSearchToolbarRef" :projectManager="p" :isMinToolView="true">
        </SearchToolbar>
        <MappingToolbar v-show="showMappingToolbarRef" :projectManager="p" :isMinToolView="true">
        </MappingToolbar>
        <MapLayerToolbar v-show="showMapLayerToolbarRef" :projectManager="p" :isMinToolView="true">
        </MapLayerToolbar>
        <FavoritesToolbar v-show="showFavoritesToolbarRef" :projectManager="p" :isMinToolView="true"></FavoritesToolbar>
        <SceneCreatingToolbar v-show="showSceneCreatingToolbarRef" :projectManager="p" :isMinToolView="true"
            :getSceneObjectTypeFunc="() => typeGetting.start()"></SceneCreatingToolbar>
        <ModelCreatingToolbar v-show="showModelCreatingToolbarRef" :projectManager="p" :isMinToolView="true">
        </ModelCreatingToolbar>

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
    width: 290px;
    margin-left: 10px;
    margin-right: 10px;
}
</style>
