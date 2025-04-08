<template>
    <div class="create_model">
        <div v-for="item in modelList" class="modedl_box" :class="isMinToolView ? 'min_panel' : 'panel'" :key="item.title"
            :title="item.title" draggable="true" id="modedbox" @dragstart="item.func(item.type, item.title)"
            @dragend="changemodelundefined" @click="item.clickFunc(item.type, item.title)">
            <div :class="isMinToolView ? 'min_icon_box' : 'icon_box'" class="img_box">
                <img :class="isMinToolView ? 'min_sign' : 'sign'" :src="item.icon" />
            </div>
            <div class="sign_title" v-show="!isMinToolView">{{ item.title }}</div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { createVueDisposer, toReadonlyVueRef } from 'vue-xe2-plugin/dist-node/components/xe2/tools';
import { ProjectManager, SceneTreeItem } from 'xbsj-xe2/dist-node/xe2';
import { CzmModelPrimitive, CzmViewer } from "xbsj-xe2/dist-node/xe2-cesium-objects";
const props = withDefaults(defineProps<{
    projectManager: ProjectManager,
    isMinToolView: boolean,
}>(), {});
const { projectManager, isMinToolView } = props
const { sceneTree } = projectManager;
const d = createVueDisposer(onBeforeUnmount)
// const isMinToolRef = toReadonlyVueRef<boolean>(d, [projectManager, "isMinToolView"])
const x = ref<number>()
const y = ref<number>()
const modelType = ref<string>()
const modelTitle = ref<string>()
const changemodelMessage = (type: string, title: string) => {
    modelType.value = type
    modelTitle.value = title
}
const changemodelundefined = () => {
    modelType.value = undefined
    modelTitle.value = undefined
    x.value = undefined
    y.value = undefined
}
const createSceneObject = async (modelType: string, modelTitle: string, x?: number, y?: number) => {
    let position: [number, number, number] | undefined;
    if (x && y) {
        const result = await viewer.pickPosition([x, y]);
        if (!result) return
        position = result
    }
    console.log(position)
    const { lastSelectedItem } = sceneTree
    let treeItem: SceneTreeItem | undefined
    if (lastSelectedItem) {
        if (lastSelectedItem.type === 'Folder') {
            treeItem = sceneTree.createSceneObjectTreeItem(CzmModelPrimitive, undefined, lastSelectedItem, 'Inner')
        } else {
            treeItem = sceneTree.createSceneObjectTreeItem(CzmModelPrimitive, undefined, lastSelectedItem, 'After')
        }
    } else {
        treeItem = sceneTree.createSceneObjectTreeItem(CzmModelPrimitive)
    }
    if (!treeItem) return
    const sceneObject = treeItem.sceneObject as CzmModelPrimitive
    sceneObject.name = modelTitle
    sceneObject.url = '${xe2-assets-script-dir}/xe2-assets/scene-manager/glbs/' + `${modelType}`;
    if (x && y) {
        sceneObject.position = position
        sceneObject.positionEditing = true
    } else {
        sceneObject.positionEditing = true
    }
    sceneTree.uiTree.clearAllSelectedItems()
    treeItem.uiTreeObject.selected = true
}
let viewer: CzmViewer
onMounted(() => {
    const update = () => {
        const setviewers = projectManager.viewersManager.viewers
        const viewers = [...setviewers]
        viewer = viewers[0] as CzmViewer
        if (!viewer) return
        //@ts-ignore
        if (viewer.__dropFlag) return
        viewer.dispose(viewer.interaction.dragOverEvent.disposableOn(e => e.preventDefault()))
        viewer.dispose(viewer.interaction.dropEvent.disposableOn((e) => {
            e.preventDefault()
            x.value = e.offsetX
            y.value = e.offsetY
            console.log(x.value, y.value)
            if (modelType.value && modelTitle.value && x.value && y.value) {
                createSceneObject(modelType.value, modelTitle.value, x.value, y.value)
            }
        }))
        //@ts-ignore
        viewer.__dropFlag = true
    }
    const dispose = projectManager.viewersManager.viewersChanged.disposableOn(update)
    onBeforeUnmount(dispose)
});
const modelList = [
    {
        icon: require("../../img/adult.png"),
        title: '人物',
        type: 'Cesium_Man.glb',
        func: (type: string, title: string) => {
            changemodelMessage(type, title)
        },
        clickFunc: (type: string, title: string) => {
            createSceneObject(type, title)
        }
    },
    {
        icon: require("../../img/balloon.png"),
        title: '气球',
        type: 'CesiumBalloon.glb',
        func: (type: string, title: string) => {
            changemodelMessage(type, title)
        },
        clickFunc: (type: string, title: string) => {
            createSceneObject(type, title)
        }
    },
    {
        icon: require("../../img/UAV.png"),
        title: '无人机',
        type: 'CesiumDrone.glb',
        func: (type: string, title: string) => {
            changemodelMessage(type, title)
        },
        clickFunc: (type: string, title: string) => {
            createSceneObject(type, title)
        }
    },
    {
        icon: require("../../img/aircraft.png"),
        title: '飞机',
        type: 'Cesium_Air.glb',
        func: (type: string, title: string) => {
            changemodelMessage(type, title)
        },
        clickFunc: (type: string, title: string) => {
            createSceneObject(type, title)
        }
    },
    {
        icon: require("../../img/satellite.png"),
        title: '卫星',
        type: 'WeiXing.glb',
        func: (type: string, title: string) => {
            changemodelMessage(type, title)
        },
        clickFunc: (type: string, title: string) => {
            createSceneObject(type, title)
        }
    },
    {
        icon: require("../../img/missile.png"),
        title: '导弹',
        type: 'DaoDan.glb',
        func: (type: string, title: string) => {
            changemodelMessage(type, title)
        },
        clickFunc: (type: string, title: string) => {
            createSceneObject(type, title)
        }
    },
    {
        icon: require("../../img/goodsTrain.png"),
        title: '货车',
        type: 'CesiumMilkTruck.glb',
        func: (type: string, title: string) => {
            changemodelMessage(type, title)
        },
        clickFunc: (type: string, title: string) => {
            createSceneObject(type, title)
        }
    },
    {
        icon: require("../../img/tank.png"),
        title: '坦克',
        type: 'TanKe.glb',
        func: (type: string, title: string) => {
            changemodelMessage(type, title)
        },
        clickFunc: (type: string, title: string) => {
            createSceneObject(type, title)
        }
    },
]
</script>
<style>
.create_model {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    border-right: 2px solid #2c3e50;
    border-radius: 3px;
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
    width: 25px;
    height: 25px;
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
    width: 15px;
    height: 15px;
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