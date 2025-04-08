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
import Message from 'vue-xe2-plugin/dist-node/components/xe2/utility/Message';
import { FileHandleType, Player, SceneObject, getOpenFileHandle, getSaveFileHandle, getTextFromFile, requestWriteAccess, saveFile } from "xbsj-xe2/dist-node/xe2-base-objects";
import { ESImageryLayer, ES3DTileset, ESTerrainLayer, ESWidget, ESCar, ESApertureEffect, ESTextLabel, ESImageLabel, ESGeoLineString, ESCameraVisibleRange, ESViewShed, ESGeoRectangle, ESLocalCircle, ESGeoPolygon, ESPath, ESGltfModel, ESPolygonFence, ESHuman, ESAlarm, ESGeoJson, ESKml, ESCzml, ESGeoVector, ESObjectWithLocation, ESLabel, ESLocalVector, ESLocalVector2D, ESSceneObject, ESVisualObject } from 'esobjs-xe2-plugin/dist-node/esobjs-xe2-plugin-main'
import { CzmKml, CzmGeoJson } from "xbsj-xe2/dist-node/xe2-cesium-objects";
import { convertToGeoJSON,openAndReadFile,styleKML,styleGeoJson } from "../../../../scripts/ReadWriteKmlGeojson";

const props = withDefaults(defineProps<{
    projectManager: ProjectManager,
    isMinToolView: boolean,

}>(), {});
const { projectManager, isMinToolView } = props
const { sceneTree } = projectManager;

const d = createVueDisposer(onBeforeUnmount)
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
let viewer: CzmViewer


const createSceneObject = async (modelType: string, modelTitle: string, x?: number, y?: number) => {
    let position: [number, number, number] | undefined;
    if (x && y) {
        const result = await viewer.pickPosition([x, y]);
        if (!result) return
        position = result
    }
    const { lastSelectedItem } = sceneTree
    let treeItem: SceneTreeItem | undefined
    if (lastSelectedItem) {
        if (lastSelectedItem.type === 'Folder') {
            treeItem = sceneTree.createSceneObjectTreeItem(modelType, undefined, lastSelectedItem, 'Inner')
        } else {
            treeItem = sceneTree.createSceneObjectTreeItem(modelType, undefined, lastSelectedItem, 'After')
        }
    } else {
        treeItem = sceneTree.createSceneObjectTreeItem(modelType)
    }
    if (!treeItem) return
    const sceneObject = treeItem.sceneObject as modelType
    sceneObject.name = modelTitle
    if (modelType === "ESGeoDivTextPoi") {
        sceneObject.textEditingInteraction = true;
    }
    sceneObject.editing = true;
    sceneTree.uiTree.clearAllSelectedItems()
    treeItem.uiTreeObject.selected = true
}

async function importKmlObject(modelType: string, modelTitle: string, x?: number, y?: number) {
    try {
        Message.info('打开Kml、GeoJson..');
        const { content, fileType } = await openAndReadFile();
        const data = fileType === 'CzmGeoJson' ? JSON.parse(content) : content;
        const treeItemType = fileType === 'CzmGeoJson' ? CzmGeoJson : CzmKml;
        const geoStyle = fileType === 'CzmGeoJson' ? styleGeoJson : styleKML;
        const position = sceneTree.lastSelectedItem?.type === 'Folder' ? 'Inner' : 'After';

        let treeItem = sceneTree.lastSelectedItem ?
            sceneTree.createSceneObjectTreeItem(treeItemType, undefined, sceneTree.lastSelectedItem, position) :
            sceneTree.createSceneObjectTreeItem(treeItemType);

        if (!treeItem) return;

        let sceneObject = treeItem.sceneObject as CzmGeoJson | CzmKml;
        sceneObject.name = modelTitle;
        sceneObject.data = data;
        sceneObject.loadFuncStr = geoStyle;
        sceneTree.uiTree.clearAllSelectedItems();
        treeItem.uiTreeObject.selected = true;

        Message.success('打开成功！');
    } catch (error) {
        Message.error(`打开失败！ error: ${error}`);
    }
}

async function exportGeoJsonObject(modelType: string, modelTitle: string, x?: number, y?: number) {
    const geoJsonResult = convertToGeoJSON(projectManager.json); // 假设这是你的转换函数
    const name = projectManager.asset.name + '.geojson'; // 文件名
    const jsonString = JSON.stringify(geoJsonResult, null, 2); // GeoJSON对象转换为字符串

    if (window.showSaveFilePicker) {
        try {
            const options = {
                types: [{
                    description: 'GeoJSON Files',
                    accept: {'application/json': ['.geojson']},
                }],
            };

            const fileHandle = await window.showSaveFilePicker(options);
            const writable = await fileHandle.createWritable();
            await writable.write(jsonString);
            await writable.close();
            Message.success('文件已经下载成功！');
        } catch (error) {
            Message.success('文件下载失败！');
        }
    } else {
        // File System Access API 不支持，使用传统的下载方式
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();

        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        Message.error(`文件已经下载！请在下载目录中查看`);

    }
}

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
        icon: require("../../img/biaoji2.png"),
        title: '图标',
        type: "ESImageLabel",
        func: (type: string, title: string) => {
            changemodelMessage(type, title)
        },
        clickFunc: (type: string, title: string) => {
            createSceneObject(type, title)
        }
    },
    {
        icon: require("../../img/wenzi.png"),
        title: '文字',
        type: "ESGeoDivTextPoi",
        func: (type: string, title: string) => {
            changemodelMessage(type, title)
        },
        clickFunc: (type: string, title: string) => {
            createSceneObject(type, title)
        }
    },
    {
        icon: require("../../img/xianduan.png"),
        title: '线段',
        type: "GeoPolyline",
        func: (type: string, title: string) => {
            changemodelMessage(type, title)
        },
        clickFunc: (type: string, title: string) => {
            createSceneObject(type, title)
        }
    }, {
        icon: require("../../img/duobianxing2.png"),
        title: '多边形',
        type: "GeoPolygon",
        func: (type: string, title: string) => {
            changemodelMessage(type, title)
        },
        clickFunc: (type: string, title: string) => {
            createSceneObject(type, title)
        }
    }, {
        icon: require("../../img/huayuan.png"),
        title: '圆形',
        type: "ESLocalCircle",
        func: (type: string, title: string) => {
            changemodelMessage(type, title)
        },
        clickFunc: (type: string, title: string) => {
            createSceneObject(type, title)
        }
    },
    {
        icon: require("../../img/chizi2.png"),
        title: '测量距离',
        type: "GeoDistanceMeasurement",
        func: (type: string, title: string) => {
            changemodelMessage(type, title)
        },
        clickFunc: (type: string, title: string) => {
            createSceneObject(type, title)
        }
    },
    {
        icon: require("../../img/mianji.png"),
        title: '测量面积',
        type: "GeoAreaMeasurement",
        func: (type: string, title: string) => {
            changemodelMessage(type, title)
        },
        clickFunc: (type: string, title: string) => {
            createSceneObject(type, title)
        }
    },
    {
        icon: require("../../img/daoru.png"),
        title: '导入KML或者GeoJson',
        type: "",
        func: (type: string, title: string) => {
            changemodelMessage(type, title)
        },
        clickFunc: (type: string, title: string) => {
            importKmlObject(type, title)
        }
    },
    {
        icon: require("../../img/daochu.png"),
        title: '导出GeoJson',
        type: "GeoAreaMeasurement",
        func: (type: string, title: string) => {
            changemodelMessage(type, title)
        },
        clickFunc: (type: string, title: string) => {
            exportGeoJsonObject(type, title)
        }
    }
]
</script>
<style>
.create_panel {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    border-right: 2px solid #2c3e50;
    border-left: 2px solid #2c3e50;
    border-radius: 3px;
}

.create_model {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    border-left: 2px solid #2c3e50;
    border-right: 0px solid #2c3e50;
    border-radius: 3px;
}

.panel_box {
    cursor: pointer;
    border-radius: 3px;
    transition: background 0.3s;
}

.modedl_box {
    cursor: pointer;
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
