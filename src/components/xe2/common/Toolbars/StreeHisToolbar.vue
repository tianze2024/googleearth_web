<template>
    <div class="create_stree_model">
        <div v-for="item in modelList" class="modedl_stree_box" :class="isMinToolView ? 'min_panel' : 'panel'"
            :key="item.title" :title="item.title" draggable="true" id="modedbox"
            @dragstart="item.func(item.type, item.title)" @dragend="changemodelundefined"
            @click="item.clickFunc(item.type, item.title)">
            <div :class="isMinToolView ? 'min_icon_box' : 'icon_box'" class="img_box">
                <img :class="isMinToolView ? 'min_stree_sign' : 'sign'" :src="item.icon" />
            </div>
            <div class="sign_title" v-show="!isMinToolView">{{ item.title }}</div>
        </div>
        <div class="modedl_stree_box">
            <div :class="isMinToolView ? 'min_icon_box' : 'icon_box'" class="img_box"> <img
                    :class="isMinToolView ? 'min_stree_sign' : 'sign'" ref="compassRef" src="../../img/compass.png" />
            </div>
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
import { ESObjectsManager, ESImageryLayer, ES3DTileset, ESTerrainLayer, ESWidget, ESCar, ESApertureEffect, ESTextLabel, ESImageLabel, ESGeoLineString, ESCameraVisibleRange, ESViewShed, ESGeoRectangle, ESLocalCircle, ESGeoPolygon, ESPath, ESGltfModel, ESPolygonFence, ESHuman, ESAlarm, ESGeoJson, ESKml, ESCzml, ESGeoVector, ESObjectWithLocation, ESLabel, ESLocalVector, ESLocalVector2D, ESSceneObject, ESVisualObject } from 'esobjs-xe2-plugin/dist-node/esobjs-xe2-plugin-main'
import { CzmGeHistoryImagery, CzmArcgisHistoryImagery, CzmTerrain, CzmImagery, CzmKml, CzmGeoJson } from "xbsj-xe2/dist-node/xe2-cesium-objects";

const props = withDefaults(defineProps<{
    projectManager: ProjectManager,
    isMinToolView: boolean,

}>(), {});
const { projectManager, isMinToolView } = props
const { sceneTree } = projectManager;

const d = createVueDisposer(onBeforeUnmount)
const isListeningForClick = ref(false); // 新增：控制是否监听点击事件
const isModelSceneObject = ref(false); // 新增：控制是否是模型场景状态对象
const compassRef = ref(null);
const x = ref<number>()
const y = ref<number>()
const modelType = ref<string>()
const modelTitle = ref<string>()
let BaiduStreeJsonOBJ: SceneObject;
let GoogleStreeJsonOBJ: SceneObject;

let GeHisOBJ: SceneTreeItem;
let ArcgisHisOBJ: SceneTreeItem;
let CzmTerrainOBJ: SceneTreeItem;
let ModelOBJ: SceneTreeItem;


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

async function createStreeSceneObject(modelType: string, modelTitle: string, x?: number, y?: number) {
    if (!isListeningForClick.value) {
        isListeningForClick.value = true; // 启动监听
        Message.info('双击蓝色区域')
        BaiduStreeJsonOBJ = projectManager.createSceneObjectFromJson(BaiduStreeJson) as SceneObject
        GoogleStreeJsonOBJ = projectManager.createSceneObjectFromJson(GoogleStreeJson) as SceneObject
        sceneTree.uiTree.clearAllSelectedItems();
    } else {
        isListeningForClick.value = false; // 启动监听
        Message.info('街景已经关闭')
        projectManager.destroySceneObject(BaiduStreeJsonOBJ)
        projectManager.destroySceneObject(GoogleStreeJsonOBJ)
    }
}


const createJsonGeHisSceneObject = async (modelType: string, modelTitle?: string, x?: number, y?: number) => {
    if (!GeHisOBJ) {
        Message.info('请耐心等待...')
        GeHisOBJ = sceneTree.createSceneObjectTreeItemFromJson(GeHisJson) as SceneTreeItem
    } else {
        GeHisOBJ.show = !GeHisOBJ.show;
    }
}

const createJsonArcgisHisSceneObject = async (modelType: string, modelTitle?: string, x?: number, y?: number) => {
    if (!ArcgisHisOBJ) {
        Message.info('请耐心等待...')
        ArcgisHisOBJ = sceneTree.createSceneObjectTreeItemFromJson(ArcgisHisJson) as SceneTreeItem
    } else {
        ArcgisHisOBJ.show = !ArcgisHisOBJ.show;
    }
}

const createJsonSceneObject = async (modelType: string, modelTitle?: string, x?: number, y?: number) => {
    if (!CzmTerrainOBJ) {
        Message.info('请耐心等待...')
        CzmTerrainOBJ = sceneTree.createSceneObjectTreeItemFromJson(TerrainJson) as SceneTreeItem
    } else {
        CzmTerrainOBJ.show = !CzmTerrainOBJ.show;
    }
}


const createModelJsonSceneObject = async (modelType: string, modelTitle?: string, x?: number, y?: number) => {
    if (!ModelOBJ) {
        isModelSceneObject.value = true; // 启动监听
        ModelOBJ = sceneTree.createSceneObjectTreeItemFromJson(ModelJson) as SceneTreeItem;
        Message.info('带宽受限,请耐心等待...', 20000)
    } else {
        ModelOBJ.show = !ModelOBJ.show;
    }
}

const getCurrentLocation = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            Message.info('请授权获取定位...')
            let dingweiposition: [number, number, number] | undefined;
            let dingweiicoposition: [number, number, number] | undefined;

            const { longitude, latitude } = position.coords;
            dingweiposition = [longitude, latitude, 10000];
            dingweiicoposition = [longitude, latitude, 100];
            viewer.flyTo(dingweiposition)
            Positioning.position = dingweiicoposition;
            sceneTree.addNewTreeItem(undefined, 'InnerOrAfter', false, SceneObject.createFromJson(Positioning))
        }, (error) => {
            // 处理错误情况
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    Message.error("您拒绝了位置请求。");
                    break;
                case error.POSITION_UNAVAILABLE:
                    Message.error("位置信息不可用。");
                    break;
                case error.TIMEOUT:
                    Message.error("请求用户位置超时。");
                    break;
                case error.UNKNOWN_ERROR:
                    Message.error("发生未知错误。");
                    break;
            }
        });
    } else {
        Message.error('你的浏览器禁用定位')
    }
};

const handleEarthViewerClick = (event: MouseEvent) => {
    let position: [number, number, number] | undefined;
    if (!isListeningForClick.value) return;
    if (event.type === 'click') {
        Message.info('双击蓝色区域')
        return;
    }

    const earthViewerElement = document.querySelector('.earthviewer') as HTMLElement;
    const rect = earthViewerElement.getBoundingClientRect();
    position = viewer.pickEllipsoid([
        event.clientX - rect.left,
        event.clientY - rect.top
    ]);
    // 创建全屏div和iframe显示街景
    showStreetView(position[0], position[1]);
};

const showStreetView = (longitude: number, latitude: number) => {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.zIndex = '10000';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';

    // 创建iframe
    const iframe = document.createElement('iframe');
    iframe.src = `https://street.giiiis.com/index.html?lat=${latitude}&lng=${longitude}`;
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.borderWidth= '0';

    // 创建退出按钮
    const closeButton = document.createElement('button');
    closeButton.innerText = '退出';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '22px'; // 调整为所需的位置
    closeButton.style.left = '20px'; // 调整为所需的位置
    closeButton.style.zIndex = '10001'; // 确保按钮在最前面
    closeButton.style.padding = '12px 22px'; // 按钮大小
    closeButton.style.fontSize = '14px'; // 字体大小
    closeButton.style.cursor = 'pointer'; // 鼠标样式
    // closeButton.style.borderRadius = '50px'; // 按钮背景颜色
    closeButton.style.border = 'none'; // 按钮背景颜色
    closeButton.style.outline = 'none'; // 按钮背景颜色
    // closeButton.style.backgroundColor = '#00000000'; // 按钮背景颜色

    // 配置退出按钮的点击事件
    closeButton.addEventListener('click', () => {
        document.body.removeChild(overlay);
    });

    overlay.appendChild(iframe);
    overlay.appendChild(closeButton); // 将退出按钮添加到overlay中
    document.body.appendChild(overlay);

    // 阻止在iframe上的点击事件冒泡
    iframe.addEventListener('click', (event) => {
        event.stopPropagation();
    });
};

// 用于更新指北针旋转角度的函数
const updateCompass = () => {
    if (viewer && compassRef.value) {
        let cameraInfo: { position: [number, number, number]; rotation: [number, number, number]; } | undefined
        cameraInfo = viewer.getCameraInfo()
        const earthRotation = cameraInfo.rotation;
        let heading = earthRotation[0];
        compassRef.value.style.transform = `rotate(${(-heading)}deg)`;
    }
};


onMounted(() => {
    const intervalId = setInterval(updateCompass, 1000); // 每100毫秒更新一次
    const earthViewerElement = document.querySelector('.earthviewer');
    earthViewerElement?.addEventListener('dblclick', handleEarthViewerClick);
    earthViewerElement?.addEventListener('click', handleEarthViewerClick);
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
            if (!isListeningForClick.value) return; // 如果不是监听状态，不执行后续逻辑
            x.value = e.offsetX
            y.value = e.offsetY
        }))
        //@ts-ignore
        viewer.__dropFlag = true
    }
    const dispose = projectManager.viewersManager.viewersChanged.disposableOn(update)
    onBeforeUnmount(dispose)
    onBeforeUnmount(() => {
        clearInterval(intervalId); // 清除定时器
    });
});

onBeforeUnmount(() => {
    const earthViewerElement = document.querySelector('.earthviewer');
    earthViewerElement?.removeEventListener('dblclick', handleEarthViewerClick);
    earthViewerElement?.removeEventListener('click', handleEarthViewerClick);
});

const BaiduStreeJson = {
    "type": "CzmImagery",
    "imageryProvider": {
        "type": "ESImageryLayer",
        "url": "https://mapsv0.bdimg.com/tile/?udt=20200825&qt=tile&styles=pl&x={x}&y={y}&z={z}"
    },
    "zIndex": 8,
    "name": "百度街景范围"
};

const GoogleStreeJson = {
    "type": "CzmImagery",
    "imageryProvider": {
        "type": "UrlTemplateImageryProvider",
        "url": "https://mt3v.gggis.com/maps/vt?pb=!1m5!1m4!1i{z}!2i{x}!3i{y}!4i256!2m8!1e2!2ssvv!4m2!1scb_client!2sapiv3!4m2!1scc!2s*211m3*211e3*212b1*213e2*211m3*211e2*212b1*213e2!3m3!3sUS!12m1!1e68!4e0"
    },
    "zIndex": 8,
    "name": "谷歌街景范围"
};

const TerrainJson = {
    "type": "CzmTerrain",
    "provider": {
        "type": "CesiumTerrainProvider",
        "url": "https://terrain.giiiis.com/terrain"
    },
    "name": "地形"
};

const ModelJson = {
    "type": "ES3DTileset",
    "name": "全球3D倾斜模型(仅测试)",
    "allowPicking": true,
    "url": "https://tiles.giiiis.com/v1/3dtiles/root.json"
};

const Positioning = {
    "type": "ESImageLabel",
    "position": [
        116.3409723901178,
        40.065357367032306,
        0
    ],
    "name": "定位点",
    "allowPicking": true,
    "url": "inner://RenyuanCircleBlue.png"
};

const GeHisJson = {
    "id": "4ab02ee7-0086-4650-905a-acca03915712",
    "type": "CzmGeHistoryImagery",
    "cssText": "position: absolute;\nleft:350px;\ntop:20px;\ncolor:white;\nfont-size:16px;\nwidth:140px;\nheight:32px;\nzIndex:100;\n text-align: center;\npointer-events:all;\nbackground-color:#292b2f;\noverflow:hidden;\nborder-radius: 50px;\nbox-shadow: 0px 5px 20px rgba(0, 0, 0, 0.61);\noutline: none;\n",
    "name": "谷歌历史影像"
}
const ArcgisHisJson = {
    "id": "d00d7ba2-d378-450d-8b5b-5f2bcc0c87cb",
    "type": "CzmArcgisHistoryImagery",
    "cssText": "position: absolute;\nleft:500px;\ntop:20px;\ncolor:white;\nfont-size:16px;\nwidth:140px;\nheight:32px;\nzIndex:100;\n text-align: center;\npointer-events:all;\nbackground-color:#043087CC;\noverflow:hidden;\nborder-radius: 50px;\nbox-shadow: 0px 5px 20px rgba(0, 0, 0, 0.61);\noutline: none;\n",
    "name": "Arcgis历史影像"
}

const modelList = [
    {
        icon: require("../../img/pegman.png"),
        title: '街景',
        type: "CzmImagery",
        func: (type: string, title: string) => {
            changemodelMessage(type, title)
        },
        clickFunc: (type: string, title: string) => {
            createStreeSceneObject(type, title)
        }
    },
    {
        icon: require("../../img/shijian2.png"),
        title: '谷歌历史影像',
        type: "CzmGeHistoryImagery",
        func: (type: string, title: string) => {
            changemodelMessage(type, title)
        },
        clickFunc: (type: string, title: string) => {
            createJsonGeHisSceneObject(type, title)
        }
    },
    {
        icon: require("../../img/shijian.png"),
        title: 'Arcgis历史影像',
        type: "CzmArcgisHistoryImagery",
        func: (type: string, title: string) => {
            changemodelMessage(type, title)
        },
        clickFunc: (type: string, title: string) => {
            createJsonArcgisHisSceneObject(type, title)
        }
    },
    {
        icon: require("../../img/dixing.png"),
        title: '地形数据',
        type: 'TerrainJson',
        func: (type: string, title: string) => {
            changemodelMessage(type, title)
        },
        clickFunc: (type: string, title: string) => {
            createJsonSceneObject(type)
        }
    },
    {
        icon: require("../../img/jianzhu.png"),
        title: '全球3D倾斜模型',
        type: 'ModelJson',
        func: (type: string, title: string) => {
            changemodelMessage(type, title)
        },
        clickFunc: (type: string, title: string) => {
            createModelJsonSceneObject(type)
        }
    },
    {
        icon: require("../../img/dingwei.png"),
        title: '定位',
        type: "ESGeoDivTextPoi",
        func: (type: string, title: string) => {
            changemodelMessage(type, title)
        },
        clickFunc: (type: string, title: string) => {
            getCurrentLocation()
        }
    }
]
</script>

<style>
.create_stree_model {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    border-radius: 3px;
}


.modedl_stree_box {
    margin-right: 8px;
    border-radius: 3px;
    transition: background 0.3s;
    background-color: #292b2fda;
    box-shadow: 0px 5px 10px rgb(0, 0, 0);
    border-radius: 50px;
    cursor: pointer;
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

.min_stree_sign {
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
