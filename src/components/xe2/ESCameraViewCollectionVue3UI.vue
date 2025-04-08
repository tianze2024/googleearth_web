<template>
    <div class="view" v-if="esCameraViewCollection">

        <img class="close" @click="close" src="./img/ESViewCollectionVue3UI/close.png">
        <div class="up">
            <span>
                <img :src="vfc[0].url" title="添加视角" @click="esCameraViewCollection.appendView()" class="img1">
            </span>
            <span>
                <img :src="vfc[1].url" title="删除视角" @click="esCameraViewCollection.deleteCurrentView()" class="img8">
            </span>
            <span>
                <img :src="vfc[2].url" title="移动到上一个视角" class="img6" @click="esCameraViewCollection.moveToPreView()">
            </span>
            <span>
                <img :src="vfc[3].url" title="移动到下一个视角" class="img7" @click="esCameraViewCollection.moveToNextView()"> 
            </span>
            <span>
                <img :src="(playingRef ?? false) ? vfc[4].url : vfc[4].url2" title="是否播放"
                    :class="{ 'img3-1': playingRef, 'img3-2': !playingRef }" @click="playingRef = !playingRef">
            </span>
            <span>
                <img :src="vfc[5].url" title="下载" @click="saveAs" class="save">
            </span>
        </div>
        <div class="bottom">
            <div class="box" v-for="(e, index) in viewsRef" :key="index" :class="{ 'check': index === currentViewIndexRef }"
                @click="esCameraViewCollection.setCurrentView(index)" @dblclick="esCameraViewCollection.flyToView(index)">
                <img :src="e.thumbnail" alt="" class="thumbnail-img">
            </div>
        </div>
    </div>
</template>

<script setup lang='ts'>
// @ts-ignore
import { ESCameraViewCollection, ViewInfo } from "esobjs-xe2-plugin/dist-node/esobjs-xe2-plugin-main";
import { onBeforeUnmount } from 'vue';
import Message from 'vue-xe2-plugin/dist-node/components/xe2/utility/Message';
import { getSaveFileHandle, saveFile } from "xbsj-xe2/dist-node/xe2-base-objects";
import { createVueDisposer, toVR } from './tools';


const props = withDefaults(defineProps<{
    closeFn?: Function
    currenESCameraViewCollection?: ESCameraViewCollection
}>(), {});

const { closeFn } = props

const disposer = createVueDisposer(onBeforeUnmount)
const esCameraViewCollection = props.currenESCameraViewCollection;

const viewsRef = toVR<ViewInfo[]>(disposer, [esCameraViewCollection, 'views'], s => ([...s]))//视角数组
const playingRef = toVR<boolean>(disposer, [esCameraViewCollection, "playing"]) //播放·
const loopRef = toVR<boolean>(disposer, [esCameraViewCollection, "loop"]) //循环
const currentViewIndexRef = toVR<number>(disposer, [esCameraViewCollection, "currentViewIndex"]) //选中视角的索引


const vfc = [
    {
        title: '添加视角',
        url: require('./img/ESViewCollectionVue3UI/jia.png'),

    },
    {
        title: '删除当前视角',
        url: require('./img/ESViewCollectionVue3UI/shanchu.png')
    },
    {
        title: '上一个视角',
        url: require('./img/ESViewCollectionVue3UI/shang.png')
    },
    {
        title: '下一个视角',
        url: require('./img/ESViewCollectionVue3UI/xia.png')

    },
    {
        title: '是否播放',
        url: require("./img/ESViewCollectionVue3UI/zanting.png"),
        url2: require("./img/ESViewCollectionVue3UI/bofang.png")
    },
    {
        title: '下载',
        url: require("./img/ESViewCollectionVue3UI/xiazai.png"),
    },
]

const close = () => {
    if (closeFn) {
        closeFn()
    }
}

const saveAs = async () => {
    const json = JSON.parse(JSON.stringify(viewsRef.value));
    const name = "视角集合"
    try {
        Message.info('正在另存为..');
        const handle = await getSaveFileHandle('json', name);
        if (!handle) return;
        const jsonStr = JSON.stringify(json, undefined, '    ');
        await saveFile(handle, jsonStr);
        Message.success('另存成功!');
    } catch (error) {
        Message.error('另存失败! error: ${error}');
    }
}

</script>

<style scoped>
.view {
    box-sizing: border-box;
    min-width: 350px;
    min-height: 175px;
    width: 100%;
    height: 100%;
    background: url(./img/ESViewCollectionVue3UI//beijing.png) no-repeat;
    background-size: 100% 100%;
    padding: 10px;
    border-radius: 8px;
}

.up {
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding-top: 20px;
}

span {
    width: 30px;
    height: 30px;
    user-select: none;
    border-radius: 3px;
    cursor: pointer;
}

span img {
    width: 30px;
    height: 30px;
    border-radius: 3px;
}

.bottom {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    margin: 10px 30px 0 30px;
    height: 90px;
    overflow-x: auto;
}

.box {
    width: 64px;
    height: 64px;
    margin: 0 10px 5px 10px;
}

.close {
    position: absolute;
    right: 3px;
    top: 0px;
    cursor: pointer;
    width: 15px;
    height: 15px;
    font-size: 20px;
    line-height: 20px;
    margin-top: 5px;
    color: #fff;
    /* opacity: 0.01; */
}

.save:hover {
    content: url("./img/ESViewCollectionVue3UI/xiazaixuanzhong.png");
}

.img1:hover {
    content: url("./img/ESViewCollectionVue3UI/jiaxuanzhong.png");
}

.img2:hover {
    content: url("./img/ESViewCollectionVue3UI/dangqiantianjaixuanzhong.png");
}

.img3-1:hover {
    content: url("./img/ESViewCollectionVue3UI/zantingxuanzhong.png");
}

.img3-2:hover {
    content: url("./img/ESViewCollectionVue3UI/bofangxuanzhong.png");
}

.img4:hover {
    content: url("./img/ESViewCollectionVue3UI/stopxuanzhong.png");
}

.img5:hover {
    content: url("./img/ESViewCollectionVue3UI/loopxuanzhong.png");
}

.img6:hover {
    content: url("./img/ESViewCollectionVue3UI/shangxuanzhong.png");
}

.img7:hover {
    content: url("./img/ESViewCollectionVue3UI/xiaxuanzhong.png");
}

.img8:hover {
    content: url("./img/ESViewCollectionVue3UI/shanchuxuanzhong.png");
}

.check {
    border: 2px solid red
}
</style>
