<template>
    <Window :title="'地形服务管理'" :show="props.show" @cancel="cancel" @ok="ok" :width="850" :height="550">
        <div class="terrain_box">
            <div class="terrain_list">
                <!-- <div class="terrain_header">地形列表</div> -->
                <div class="terrain__box">
                    <div class="lists_item" v-for="(item, index) in defaultTerrainJsons" :key="index"
                        :title="item.sceneObjectJson.name" @click="selected(item, index)" @dblclick="createTerrain(item)">
                        <img class="lists_item_ico" :class="(selectedIndex === index) ? 'actived_img' : ''"
                            :src="assetDir + item.thumbnail" />
                        <div class="lists_item_name" :class="(selectedIndex === index) ? 'actived' : ''">{{
                            item.sceneObjectJson.name
                        }}
                        </div>
                    </div>
                </div>
            </div>
            <div class="terrain_item">
                <div class="terrain_header">地形json</div>
                <div class="terrain__box">
                    <JsonEditor ref="jsonEditor"></JsonEditor>
                </div>
            </div>
        </div>
    </Window>
</template>

<script setup lang="ts">
import { ref, shallowRef, watch } from "vue";
import { SceneObject } from "xbsj-xe2/dist-node/xe2-base-objects";
import { SceneTree } from "xbsj-xe2/dist-node/xe2";
import { JsonValue } from "xbsj-xe2/dist-node/xe2-base-utils";
import Window from "../../common/Window.vue";
import JsonEditor from "../../common/JsonEditor.vue";
import { getAssetsDir } from "../../tools";

const props = withDefaults(defineProps<{
    sceneTree: SceneTree;
    show: boolean;
}>(), {
    show: false,
});

const assetDir = getAssetsDir();

const emits = defineEmits(["update:show"]);
const { sceneTree } = props;
const selectedIndex = ref<number>(-1)

const jsonEditor = ref<{ loadJson(str: string): any; getJson(): Promise<string> }>();

type TerrainJsonType = {
    thumbnail: string,
    sceneObjectJson: JsonValue & { [k: string]: any; type: string; }
}

const defaultTerrainJsons = shallowRef<TerrainJsonType[]>([])

const selected = (item: TerrainJsonType, index: number) => {
    selectedIndex.value = index;
    if (!jsonEditor.value) return
    const str = JSON.stringify(item.sceneObjectJson, undefined, '    ')
    jsonEditor.value.loadJson(str)
}

const cancel = () => {
    selectedIndex.value = -1
    emits('update:show', false)
}

const ok = () => {
    if (!jsonEditor.value) return
    const jsonStr: Promise<string> = jsonEditor.value.getJson()
    console.log('jsonStr', jsonStr);
    jsonStr.then((str: string) => {
        const sceneObjectJson = JSON.parse(str)
        // console.log('sceneObjectJson', sceneObjectJson);
        sceneTree.addNewTreeItem(undefined, 'InnerOrAfter', true, SceneObject.createFromJson(sceneObjectJson))
        cancel()
    })
}
const createTerrain = (item: TerrainJsonType) => {
    if (!jsonEditor.value) return
    const str = JSON.stringify(item.sceneObjectJson, undefined, '    ')
    jsonEditor.value.loadJson(str)
    const jsonStr: Promise<string> = jsonEditor.value.getJson()
    console.log('jsonStr', jsonStr);
    jsonStr.then((str: string) => {
        const sceneObjectJson = JSON.parse(str)
        // console.log('sceneObjectJson', sceneObjectJson);
        sceneTree.addNewTreeItem(undefined, 'InnerOrAfter', true, SceneObject.createFromJson(sceneObjectJson))
        cancel()
    })
}

const getAListOfImagery = () => {
    fetch(assetDir + '/base-scene/terrain.json').then(response => response.json()).then((data) => {
        if (data) {
            defaultTerrainJsons.value = data.data
        }
    })
}

watch(() => props.show, show => {
    if (show) {
        getAListOfImagery()
    }
});

</script>

<style scoped>
.terrain_box {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    overflow: hidden;
}

.terrain_header {
    width: 100%;
    height: 30px;
    text-align: center;
    line-height: 30px;
    font-weight: 700;
}

.terrain__box {
    width: 100%;
    height: calc(100% - 30px);
    overflow-y: auto;
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;
}

.terrain__box::-webkit-scrollbar {
    width: 5px;
}

.terrain__box::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 10px;
}

.terrain__box::-webkit-scrollbar-thumb:hover {
    background: #555;
}

.terrain_item {
    display: none;
    width: calc(100% - 300px);
    height: 100%;
}

.terrain_list {
    width: 100%;
    height: 100%;
    margin-top: 10px;
    margin-left: 20px;
    margin-right: 20px;
}

.lists_item_ico {
    border: 2px solid #292b2f00;
    width: 80px;
    height: 80px;
    border-radius: 20px;
    background-color: #383838;
}

.lists_item_name {
    width: 80px;
    height: 24px;
    margin: 0px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 12px;
    text-align: center;

}


.lists_item {
    margin: 10px;
    cursor: pointer;
    width: 80px;
    height: 100px;
}

.lists_item:hover img {
    border: 2px solid #49ec12;
}

.actived {
    color: #49ec12 !important;
}

.actived_img {
    border: 2px solid #49ec12 !important;
}
</style>
