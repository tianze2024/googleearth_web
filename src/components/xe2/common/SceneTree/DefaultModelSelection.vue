<template>
    <Window :title="'模型加载'" :show="props.show" @cancel="cancel" @ok="ok" :width="800" :height="550">
        <div class="model_box">
            <div class="model_btn">
                <div>若要打开本地gltf/glb文件，请点击按钮选择指定文件所在目录：</div>
                <button class="open" @click="openLocalDir">打开本地目录</button>
            </div>
            <div class="model_item">
                <div class="model_box">
                    <JsonEditor ref="jsonEditor" class="mm" @load-iframe="loadIframe()"></JsonEditor>
                </div>
            </div>
        </div>
    </Window>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { defaultGetLocalFilePath } from "xbsj-xe2/dist-node/xe2-utils";
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

const defaultModelJson = {
    "name": "飞机Glb模型",
    "type": "CzmModelPrimitive",
    "url": "${xe2-assets-script-dir}/xe2-assets/scene-manager/glbs/Cesium_Air.glb"
}

let modelJson = ref(JSON.parse(JSON.stringify(defaultModelJson)))

const jsonEditor = ref<{ loadJson(str: string): any; getJson(): Promise<string> }>();

const cancel = () => {
    modelJson.value = JSON.parse(JSON.stringify(defaultModelJson)) 
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
    // @ts-ignore
    treeItem.sceneObject.positionEditing = true
}

const openLocalDir = async () => {
    const url = await defaultGetLocalFilePath(['gltf', 'glb'], 'gltf');
    // @ts-ignore
    modelJson.value.url = url
}

const loadJsonEditor = () => {
    if (jsonEditor.value) {
        const str = JSON.stringify(modelJson.value, undefined, '    ')
        jsonEditor.value.loadJson(str)
    }
}

// Iframe加载完成设置json
const loadIframe = () => { loadJsonEditor() }

watch(modelJson, () => {
    loadJsonEditor()
}, { deep: true })

</script>

<style scoped>
.model_box {
    width: 100%;
    height: calc(100% - 10px);
    display: flex;
    flex-flow: column;
    overflow: hidden;
    border-radius: 15px;
}

.model_btn {
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

.model_item {
    padding-left: 20px;
    padding-right: 20px;
    height: 100%;
    width: calc(100% - 50px);
    
}
</style>
