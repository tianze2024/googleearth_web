<template>
    <div class="create_panel">
        <div v-for="item in list" class="panel_box" :class="isMinToolView ? 'min_panel' : 'panel'" :key="item.title"
            :title="item.title" @click.stop="item.func()">
            <div :class="isMinToolView ? 'min_icon_box' : 'icon_box'" class="img_box">
                <img :class="isMinToolView ? 'min_sign' : 'sign'" :src="item.icon" />
            </div>
            <div class="sign_title" v-show="!isMinToolView">{{ item.title }}</div>
        </div>
        
        <DefaultImageriesSelection v-model:show="showDefaultImageriesSelection" :sceneTree="sceneTree">
        </DefaultImageriesSelection>
        <DefaultTerrainsSelection v-model:show="showDefaultTerrainsSelection" :sceneTree="sceneTree">
        </DefaultTerrainsSelection>

        <DefaultModelSelection v-model:show="showDefaultModelSelection" :sceneTree="sceneTree">
        </DefaultModelSelection>

        <Default3DTilesSelection v-model:show="showDefault3DTilesSelection" :sceneTree="sceneTree">
        </Default3DTilesSelection>

        <JsonStringProp :jsonStr="importJsonStr" :isShow="importJsonStr !== ''" @getJsonStr="getJsonStr"
            @changeShow="importJsonStr = ''">
        </JsonStringProp>
    </div>
</template>

<script setup lang='ts'>
import { onBeforeUnmount, onMounted,ref } from 'vue';
import { createVueDisposer, getAssetsDir,toVR } from 'vue-xe2-plugin/dist-node/components/xe2/tools';
import { ProjectManager, SceneTreeItem } from 'xbsj-xe2/dist-node/xe2';

import JsonStringProp from '../PropTree/commons/JsonStringProps.vue';
import DefaultImageriesSelection from '../SceneTree/DefaultImageriesSelection.vue';
import DefaultTerrainsSelection from '../SceneTree/DefaultTerrainsSelection.vue';
import DefaultModelSelection from '../SceneTree/DefaultModelSelection.vue';
import Default3DTilesSelection from '../SceneTree/Default3DTilesSelection.vue';


const props = withDefaults(defineProps<{
    projectManager: ProjectManager,
    isMinToolView: boolean,
    getSceneObjectTypeFunc: () => Promise<string>;
}>(), {});

const { projectManager, isMinToolView, getSceneObjectTypeFunc } = props

const { sceneTree } = projectManager;
const d = createVueDisposer(onBeforeUnmount)
const showSceneObjectsCreator = ref(false)
const showDefaultImageriesSelection = ref(false)
const showDefaultTerrainsSelection = ref(false)
let showDefaultModelSelection = ref(false)
let showDefault3DTilesSelection = ref(false)

const x = ref()
const y = ref()
onMounted(() => {
    setDefaultScene('cesium');
});
const list = [
{
    icon: require("../../img/tuceng.png"),
    title: '影像加载',

    func: () => {
        showDefaultImageriesSelection.value = true
    }
},
{
    icon: require("../../img/terrain.png"),
    title: '地形加载',

    func: () => {
        showDefaultTerrainsSelection.value = true
    }
},
{
    icon: require("../../img/selectmodel.png"),
    title: '模型加载',

    func: () => {
        console.log('模型加载成功');
        showDefaultModelSelection.value = true
        
    }
},
{
    icon: require("../../img/3dtileset.png"),
    title: '3DTileset加载',

    func: () => {
        console.log('3DTileset加载成功');
        showDefault3DTilesSelection.value = true
    }
}
]


const setDefaultScene = (str: string) => {
    const url = getAssetsDir() + `/base-scene/${str}-scene.json`
    fetch(url).then(response => response.json()).then((data) => {
        if (data) {
            projectManager.json = data
        }
    });
}
const addNewTreeItem = (flag: boolean) => {
    if (flag) {
        let groupscenetreeitem: SceneTreeItem | undefined
        const { lastSelectedItem } = sceneTree
        if (lastSelectedItem) {
            if (lastSelectedItem.type === 'Folder') {
                groupscenetreeitem = sceneTree.createGroupTreeItem(undefined, undefined, lastSelectedItem, 'Inner')
            } else {
                groupscenetreeitem = sceneTree.createGroupTreeItem(undefined, undefined, lastSelectedItem, 'After')
            }
        } else {
            groupscenetreeitem = sceneTree.createGroupTreeItem(undefined, undefined, undefined, undefined)
        }
        // const groupscenetreeitem = sceneTree.createGroupTreeItem(undefined, undefined, treeItem, location)
        if (!groupscenetreeitem) return
        groupscenetreeitem.name = `未命名组节点_${groupscenetreeitem.id.substring(0, 4)}`;
        groupscenetreeitem.nameEditing = true
    } else {
        createSceneObject();
    }
}

const importJsonStr = ref('')
const getJsonStr = (str: string) => {
    if (str === '' || str === '{}') return
    projectManager.createSceneObjectTreeItemFromJson(JSON.parse(str));
}
const CreateObjectByType = (type: string) => {
    let lastTreeItem: SceneTreeItem | undefined
    const { lastSelectedItem } = sceneTree
    if (lastSelectedItem) {
        if (lastSelectedItem.type === 'Folder') {
            lastTreeItem = sceneTree.createSceneObjectTreeItem(type, undefined, sceneTree.lastSelectedItem, 'Inner')
        } else {
            lastTreeItem = sceneTree.createSceneObjectTreeItem(type, undefined, sceneTree.lastSelectedItem, 'After')
        }
    } else {
        lastTreeItem = sceneTree.createSceneObjectTreeItem(type, undefined, undefined, undefined)
    }
    // const lastTreeItem = sceneTree.createSceneObjectTreeItem(type, undefined, sceneTree.lastSelectedItem, 'InnerOrAfter')
    if (!lastTreeItem) return
    if (!lastTreeItem.sceneObject) return
    lastTreeItem.name = `${type}_${lastTreeItem.sceneObject.id.substring(0, 4)}`;
    const { sceneObject } = lastTreeItem
    if (!sceneObject) return
    sceneTree.uiTree.clearAllSelectedItems()
    lastTreeItem.uiTreeObject.selected = true
    // projectManager.propUiTreeManager.sceneObject = sceneObject;
    const { initSceneObjectOnCreatingFunc: f } = projectManager;
    f && f(sceneObject);
}

const createSceneObject = async () => {
    const type = await getSceneObjectTypeFunc()
    if (!type) {
        return;
    }
    CreateObjectByType(type);
}

</script>


<style scoped>
.create_panel {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    border-right: 0px solid #2c3e50;
    border-left: 2px solid #2c3e50;
    border-radius: 3px;
}

.create_model {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    border-right: 2px solid #2c3e50;
    border-radius: 3px;
}

.panel_box {
    cursor: pointer;
    border-radius: 3px;
    transition: background 0.3s;
}

.modedl_box {

    border-radius: 3px;
    transition: background 0.3s;
}

.min_panel:hover {
    background-color: #383838;
}

.panel:hover .sign_title {
    color: #2ea11b;
}


.min_icon_box {
    width: 40px;
    height: 40px;
}

.img_box {

    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;

}

.icon_box {
    width: 60px;
    height: 40px;
    margin: 0 5px;
}


.sign {
    width: 30px;
    height: 30px;
}

.min_sign {
    width: 24px;
    height: 24px;
}

.sign_title {
    width: 60px;
    margin: 0 5px;
    font-size: 12px;
    color: #fff;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>
