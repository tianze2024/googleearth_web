<template>
    <div class="es-player" ref="esPlayer" v-if="currenESPlayer">
        <img class="close" @click="close" src="./img/ESViewCollectionVue3UI/close.png">

        <div class="play-vessel">
            <div class="player" title="play" ref="paly" @click="startPlaying"></div>
        </div>
        <!-- <div class="line-icon"></div> -->
        <div class="vessel">
            <div class="stop" title="stop" @click="startStop"></div>
        </div>
        <div class="line-icon1"></div>
        <div class="bar-vessel">
            <div class="bar-box" ref="barBox">
                <div class="bar" :style="{ 'width': (ratioRef * 100) + '%' }">
                    <div class="bar-icon"> </div>
                </div>
            </div>
        </div>

        <!-- <div class="line-icon2"></div> -->
        <div class="loop-vessel">
            <div class="loop" title="loop" ref="loop" @click="startloop"></div>
        </div>
    </div>
</template>

<script setup lang='ts'>
import { onBeforeUnmount, onMounted, ref, watch, nextTick } from 'vue';
import { ProjectManager } from "xbsj-xe2/dist-node/xe2";
import { ESPlayer } from "esobjs-xe2-plugin/dist-node/esobjs-xe2-plugin-main";
import { createVueDisposer, toVR } from './tools';

const props = withDefaults(defineProps<{
    closeFn?: Function
    currenESPlayer?: ESPlayer
}>(), {});

const { closeFn } = props

let esPlayer = ref()
let playHeight = ref()
let barWidth = ref()

const disposer = createVueDisposer(onBeforeUnmount)
let currenESPlayer = props.currenESPlayer;

let playingRef = toVR<boolean>(disposer, [currenESPlayer, "playing"]) //播放
let loopRef = toVR<boolean>(disposer, [currenESPlayer, "loop"]) //循环
let ratioRef = toVR<number>(disposer, [currenESPlayer, "ratio"])//比例

let flagRatio = ref(false);
const paly = ref()
const loop = ref()
const barBox = ref()

const close = () => {
    if (closeFn) {
        closeFn()
    }
}

// 播放
const startPlaying = () => {
    playingRef.value = !playingRef.value
    paly.value.style.background = `url(${playingRef.value ? require('./img/ESPlayerVue3UI/start.png') : require('./img/ESPlayerVue3UI/suspend.png')}) no-repeat 100% 100%`;
    paly.value.style.backgroundSize = '100% 100%';
}

// 循环
const startloop = () => {
    loopRef.value = !loopRef.value
    loop.value.style.background = `url(${loopRef.value ? require('./img/ESPlayerVue3UI/loop_on.png') : require('./img/ESPlayerVue3UI/loop.png')}) no-repeat 100% 100%`;
    loop.value.style.backgroundSize = '100% 100%';
}

// 停止
const startStop = () => {
    playingRef.value = false
    ratioRef.value = 0
}

onMounted(() => {
    barBox.value.addEventListener('pointerdown', ($event: any) => {
        console.log(123);

        $event.target && ($event.target as Element).setPointerCapture($event.pointerId);
        flagRatio.value = true;
    });
    barBox.value.addEventListener('pointermove', ($event: any) => {
        if (!flagRatio.value || ($event.offsetX > 400 || $event.offsetX < 0)) {
            return
        }
        ratioRef.value = $event.offsetX / 400;
    });
    barBox.value.addEventListener('pointerup', ($event: any) => {
        $event.target && ($event.target as Element).setPointerCapture($event.pointerId);
        ratioRef.value = $event.offsetX / 400;
        flagRatio.value = false;
    });
    if (!esPlayer.value) return;
    barWidth.value = (esPlayer.value.offsetWidth - 45 * 3) / esPlayer.value.offsetWidth * 100
})




</script>

<style  scoped>
.es-player {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    width: 100%;
    height: 45px;
    min-width: 250px;
    background: url(./img/ESPlayerVue3UI/player_bg.png) no-repeat;
    background-size: 100% 100%;
    border-radius: 5px;
}

.mask {
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    background-color: rgba(0, 33, 43, 0.6);
}

.play-vessel {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 45px;
    height: 45px;
    border-right: 2px solid #225764;
}

.vessel {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 45px;
    height: 45px;
    border-right: 2px solid #225764;
}

.loop-vessel {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 45px;
    height: 45px;
    border-left: 2px solid #225764;
}

.bar-vessel {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 20px;
    height: 45px;
    width: calc(100% - 135px);

}


.player {
    cursor: pointer;
    background: url(./img/ESPlayerVue3UI/suspend.png) no-repeat 100% 100%;
    background-size: 100% 100%;
    height: 16px;
    width: 16px;
}

.stop {
    cursor: pointer;
    height: 12px;
    width: 12px;
    border-radius: 2px;
    background: #fff;
}

.bar-box {
    width: 100%;
    height: 12px;
    cursor: pointer;
    border-radius: 5px;
    background: #383838;
}

.bar {
    height: 12px;
    cursor: pointer;
    background: #98f8ff;
    border-radius: 5px;
    position: relative;
}

.bar-icon {
    height: 32px;
    width: 32px;
    border-radius: 50% 50%;
    background: url(./img/ESPlayerVue3UI/icon.png) no-repeat 100% 100%;
    background-size: 100% 100%;
    position: absolute;
    right: -14px;
    top: -10px;
    z-index: 5;
    pointer-events: none;
}

.line-icon {
    height: 44px;
    width: 1px;
    background: #225764;
}

.line-icon1 {
    height: 44px;
    width: 1px;
    background: #225764;
}

.line-icon2 {
    height: 44px;
    width: 1px;
    background: #225764;
}

.loop {
    cursor: pointer;
    background: url(./img/ESPlayerVue3UI/loop.png) no-repeat 100% 100%;
    background-size: 100% 100%;
    height: 14px;
    width: 14px;
}

.close {
    position: absolute;
    right: -5px;
    top: -10px;
    cursor: pointer;
    width: 15px;
    height: 15px;
    font-size: 20px;
    line-height: 20px;
    margin-top: 5px;
    color: #fff;
    opacity: 0.01;
}
</style>
