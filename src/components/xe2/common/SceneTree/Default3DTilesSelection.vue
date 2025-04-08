<template>
    <Window :title="'3dtiles加载'" :show="props.show" @cancel="cancel" @ok="ok" :width="800" :height="550">
        <div class="tiles_box">
            <div class="tiles_btn">
                <div>若要打开本地3dtiles文件，请点击按钮选择指定文件所在目录：</div>
                <button class="open" @click="openLocalDir">打开本地目录</button>
            </div>
            <div class="tiles_item">
                <div class="tiles_box">
                    <JsonEditor ref="jsonEditor" @load-iframe="loadIframe()"></JsonEditor>
                </div>
            </div>
        </div>
    </Window>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { defaultLocalFileServer } from "xbsj-xe2/dist-node/xe2-utils";
import { SceneTree } from "xbsj-xe2/dist-node/xe2";
import JsonEditor from "../../common/JsonEditor.vue";
import Window from "../../common/Window.vue";
import { SceneTreeItem } from 'xbsj-xe2/dist-node/xe2';


const props = withDefaults(defineProps<{
    sceneTree: SceneTree;
    show: boolean;
}>(), {
    show: false,
});

const emits = defineEmits(["update:show"]);
const { sceneTree } = props;

const defaultTilesJson = {
    "name": "3DTiles模型",
    "type": "Czm3DTiles",
    'url': ""
}

let tilesJson = ref(JSON.parse(JSON.stringify(defaultTilesJson)))

const jsonEditor = ref<{ loadJson(str: string): any; getJson(): Promise<string> }>();

const cancel = () => {
    tilesJson.value = JSON.parse(JSON.stringify(defaultTilesJson))
    emits('update:show', false)
}

const ok = async () => {
    if (!jsonEditor.value) return;
    const jsonStr = await jsonEditor.value.getJson()
    const sceneObjectJson = JSON.parse(jsonStr)
    let treeItem: SceneTreeItem | undefined
    treeItem = sceneTree.createSceneObjectTreeItemFromJson(sceneObjectJson)
    cancel()
    if (!treeItem) return;
    treeItem.uiTreeObject.selected = true
}

const openLocalDir = async () => {
    const rootDirId = await defaultLocalFileServer.getRootDirId('3dtiles');
    if (rootDirId === undefined) {
        console.warn('openLocalDir failed!');
        return;
    }
    const url = `https://${rootDirId}/tileset.json`;

    // @ts-ignore
    tilesJson.value.url = url
}

const loadJsonEditor = () => {
    if (jsonEditor.value) {
        const str = JSON.stringify(tilesJson.value, undefined, '    ')
        jsonEditor.value.loadJson(str)
    }
}

// Iframe加载完成设置json
const loadIframe = () => { loadJsonEditor() }

watch(tilesJson, () => {
    loadJsonEditor()
}, { deep: true })


</script>

<style scoped>


.tiles_btn {
    display: flex;
    align-items: center;
    margin: 10px;
    padding-left: 20px;
    font-size: 14px;
    color: #918e8e;
}

.open {
    width: 110px;
    height: 30px;
    line-height: 30px;
    text-align: center;
    font-size: 14px;
    border-radius: 5px;
    color: #fff;
    cursor: pointer;
    background-color: #383838;
    border: none;
}

.open:hover {
    background-color: #1e1e1e;
}

.tiles_item {
    padding-left: 20px;
    padding-right: 20px;
    height: 100%;
    width: calc(100% - 50px);
}

.tiles_box {
    width: 100%;
    height: calc(100% - 10px);
    display: flex;
    flex-flow: column;
    overflow: hidden;
    border-radius: 15px;
}
</style>
