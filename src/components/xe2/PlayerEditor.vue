
<template>
    <div class="player_editor" v-if="props.currentPlayer" ref="playerDom">
        <div class="player_name">
            <span>{{ nameRef }}</span>
            <span class="player_close" @click="showPlayerViewRef = false" title="关闭播放器">╳</span>
        </div>

        <div class="player_editing">
            <span class="playing_setting" :class="playingRef ? 'actived' : ''" @click="playingRef = !playingRef"
                :title="playingRef ? '暂停' : '播放'">{{ playingRef ? '〓' : '▼' }}</span>
            <span class="loop player_stop" title="停止" @click="playingRef = false, currentTimeRef = 0">■</span>
            <span class="loop" title="是否循环" @click="loopRef = !loopRef">
                <span :class="loopRef ? 'loop_true' : 'loop_false'">
                </span>
            </span>
            <span class="loop player_speed" title="速度" :class="speedRef !== 1 ? 'actived' : ''" @click="changeSpeed">x{{
                speedRef
            }}</span>
            <span class="loop player_speed" title="高度缩放" :class="yScale !== 1 ? 'actived' : ''"
                @click="changeHeightScale">x{{ yScale }}</span>
            <span class="loop" title="新增子播放器" @click="addPlayer">+</span>

        </div>

        <div class="player_barbox">
            <div
                :style="{ width: `${durationRef * xScale}px`, height: `${totalItemHeight}px`, background: '#eee', position: 'relative', }">

                <svg :width="durationRef * xScale" :height="totalItemHeight" preserveAspectRatio="none"
                    :viewBox="`0 0 ${durationRef * xScale} ${totalItemHeight}`" @pointerdown="pointerdown"
                    @pointerup="pointerup" @pointermove="pointermove" @pointerover="pointerover" @pointerout="pointerout"
                    @wheel="wheel">
                    <g v-for="([id, start, duration], index) of channelsRef" :key="id">
                        <rect :x="start * xScale" :y="itemHeight * index + 1" :width="duration * xScale"
                            @contextmenu="contextmenu([id, start, duration], index)" :height="itemHeight - 2" fill="#33F"
                            :index='index' name="channel_rect" class="channel_rect" />
                        <line :x1="start * xScale" :x2="start * xScale" :y1="itemHeight * index + 1"
                            :y2="itemHeight * (index + 1) - 1" stroke="#009" :stroke-width="4" :index='index'
                            name="channel_left_line" class="channel_line" />
                        <line :x1="(start + duration) * xScale" :x2="(start + duration) * xScale"
                            :y1="itemHeight * index + 1" :y2="itemHeight * (index + 1) - 1" stroke="#009" :stroke-width="4"
                            :index='index' name="channel_right_line" class="channel_line" />
                    </g>
                    <rect v-if="channelsRef" class="bottom-rect" :x="0" :y="itemHeight * channelsRef.length"
                        :width="durationRef * xScale" :height="20" fill="#DDD" name="bottomRect" />
                    <line class="hover-time-line" :x1="(hoverTimeRef ?? 0) * xScale" :x2="(hoverTimeRef ?? 0) * xScale"
                        y1="0" :y2="totalItemHeight" stroke="#999" :stroke-width="1" name="hoverTimeLine"
                        v-show="!!hoverTimeRef" />
                    <line class="last-time-line" :x1="durationRef * xScale" :x2="durationRef * xScale" y1="0"
                        :y2="totalItemHeight" stroke="#99F" :stroke-width="6" name="lastTimeLine" />
                    <line class="current-time-line" :x1="currentTimeRef * xScale" :x2="currentTimeRef * xScale" y1="0"
                        :y2="totalItemHeight" stroke="#99F" :stroke-width="4" name="currentTimeLine" />
                </svg>
                <div v-show="textInfo.show"
                    style="pointer-events: none; font-size: 12px; background: rgba(0, 0, 0, .8); color: rgba(255, 255, 255, .8); padding: 3px 5px 3px 5px; border-radius: 3px; white-space: nowrap;"
                    :style="{ position: 'absolute', left: `${textInfo.x}px`, top: `${textInfo.y}px`, }">
                    {{ textInfo.text }}
                </div>
                <div class="player_scale" :style="{ width: `${durationRef * xScale}px`, }">
                    <div v-for="(item) in playerScaleList" :key="item.id" class="scale_bigItem">
                        <span class="scale_number">{{ item.value }}</span>
                        <div v-for="(ite) in playerScaleListItem" :key="ite.id" class="scale_item">
                        </div>
                    </div>
                </div>

            </div>
        </div>
        <ContextMenuCom :baseItems="baseItems"></ContextMenuCom>
    </div>
    <Window :title="'播放器设置'" :footervisible="true" v-if="showEdit && isType" @ok="changOk"
        @cancel="showEdit = false, isType = undefined, resetEditItem" :width="400" :height="210">
        <div class="add_player">
            <div class="add_item">
                <label for="">id</label>
                <input type="text" v-model.lazy="editItem.id">
            </div>
            <div class="add_item">
                <label for="">起始时间</label>
                <input type="number" v-model.number.lazy="editItem.startTime">
            </div>
            <div class="add_item">
                <label for="">持续时间</label>
                <input type="number" v-model.number.lazy="editItem.endTime">
            </div>
        </div>
    </Window>
</template>

<script setup lang='ts'>
import { ProjectManager } from "xbsj-xe2/dist-node/xe2";
import { computed, onBeforeUnmount, onMounted, reactive, Ref, ref } from 'vue';
import { SceneObject } from 'xbsj-xe2/dist-node/xe2-base-objects';
import { Player } from "xbsj-xe2/dist-node/xe2-base-objects";
import { createVueDisposer, toVR } from './tools';
import ContextMenuCom from "./common/ContextMenuCom.vue";
import Window from "./common/WindowPop.vue";
import { getUuid } from "./utility/getUuid";
import Message from './utility/Message';
import { ChannelItemType, CurrentTimeLineDragger, Dragger, LastTimeLineDragger, PlayingChannelLeftLineDragger, PlayingChannelRightLineDragger, PlayingRectLineDragger } from './utility/playerEditorTools';

type MenuContentType = {
    text: string;
    keys: string;
    func: () => void;
}

const props = withDefaults(defineProps<{
    currentPlayer?: Player,
    projectManager: ProjectManager
}>(), {});

const player = props.currentPlayer;

const disposer = createVueDisposer(onBeforeUnmount)

const nameRef = toVR<string>(disposer, [player, 'name'], s => s)//名称
const playingRef = toVR<boolean>(disposer, [player, 'playing'], s => s)//播放
const loopRef = toVR<boolean>(disposer, [player, 'loop'], s => s)//循环
const speedRef = toVR<number>(disposer, [player, 'speed'], s => s)//速度
const currentTimeRef = toVR<number>(disposer, [player, 'currentTime'], s => s)//当前时间
const durationRef = toVR<number>(disposer, [player, 'duration'], s => s)//总时长
const channelsRef = toVR<ChannelItemType[] | undefined>(disposer, [player, 'channels'], s => s && s.map(e => [...e]))//内部播放器

const { projectManager } = props
const showPlayerViewRef = toVR<boolean>(disposer, [projectManager, "showPlayerView"])
const currentPlayerRef = toVR<Player | undefined>(disposer, [projectManager, "currentPlayer"]) as Ref<Player | undefined>

const baseItems = ref<MenuContentType[]>([])
const playerDom = ref<HTMLElement>()
const showEdit = ref(false)
const changeIndex = ref<number | undefined>(undefined)
const isType = ref<'isEdit' | 'isAdd' | undefined>(undefined)
const editItem = reactive<{ id: string, startTime: number | null, endTime: number | null }>({ id: '', startTime: null, endTime: null })

const resetEditItem = () => {
    editItem.id = ''
    editItem.startTime = null
    editItem.endTime = null
}
onMounted(() => {
    if (playerDom.value) {
        playerDom.value.oncontextmenu = () => { return false; }
    }
})

const initItemHeight = 20 // px
const itemHeight = computed(() => initItemHeight * yScale.value) // px;
const totalItemHeight = computed(() => itemHeight.value * (channelsRef.value ? channelsRef.value.length : 0) + 20)
const xScale = ref(0.02)
const yScale = ref(1)
const textInfo = reactive({ x: 0, y: 0, show: false, text: '' });
const hoverTimeRef = ref<number | undefined>(undefined);
const playerScaleList = computed(() => {
    const length = durationRef.value * xScale.value
    const list = []
    for (let i = 0; i <= length; i += 80) {
        const value = Math.round(i / xScale.value)
        const item = {
            id: getUuid(),
            value
        }
        list.push(item)
    }
    return list
})

const playerScaleListItem = computed(() => {
    const length = 80
    const list = []
    for (let i = 0; i < length; i += 8) {
        const item = {
            id: getUuid(),
            value: i
        }
        list.push(item)
    }
    return list
})


let currentDragger: Dragger | undefined = undefined;

const changeSpeed = () => {
    speedRef.value *= 2;
    if (speedRef.value > 4) {
        speedRef.value = 0.5;
    }
}


const addPlayer = () => {
    resetEditItem()
    isType.value = 'isAdd'
    showEdit.value = true
}
const editPlayer = (item: [string, number, number], index: number) => {
    editItem.id = item[0]
    editItem.startTime = item[1]
    editItem.endTime = item[2]
    changeIndex.value = index
    isType.value = 'isEdit'
    showEdit.value = true
}
const changOk = () => {
    if (editItem.id === '' || editItem.startTime === null || editItem.endTime === null) {
        Message.warning('属性不能为空!')
        return
    }
    const addItem: [string, number, number] = [editItem.id, editItem.startTime, editItem.endTime]
    if (isType.value === 'isAdd') {
        const channels = channelsRef.value ? [...channelsRef.value] : []
        channels.push(addItem)
        channelsRef.value = channels
    } else if (isType.value === 'isEdit' && changeIndex.value !== undefined) {
        const channels = channelsRef.value ? [...channelsRef.value] : []
        channels[changeIndex.value] = addItem
        channelsRef.value = channels
    }
    isType.value = undefined
    changeIndex.value = undefined
    resetEditItem()
    showEdit.value = false
}

const changeHeightScale = () => {
    yScale.value *= 2
    if (yScale.value > 4) {
        yScale.value = 0.5
    }
}

const resetCurrentDragger = () => {
    if (currentDragger) {
        currentDragger.destroy();
        currentDragger = undefined;
    }
}

const pointerdown = (event: PointerEvent) => {
    if (!event.target) {
        return
    }
    resetCurrentDragger();
    const dom = event.target as HTMLElement;
    const name = dom.getAttribute('name');
    if (!name) {
        return
    }
    if (name === 'currentTimeLine') {
        currentDragger = new CurrentTimeLineDragger(event, xScale, currentTimeRef);
    } else if (name === 'lastTimeLine') {
        currentDragger = new LastTimeLineDragger(event, xScale, durationRef);
    } else if (name === 'channel_rect') {
        const index = +(dom.getAttribute('index') ?? 0)
        currentDragger = new PlayingRectLineDragger(event, xScale, index, channelsRef);
    } else if (name === 'channel_left_line') {
        const index = +(dom.getAttribute('index') ?? 0)
        currentDragger = new PlayingChannelLeftLineDragger(event, xScale, index, channelsRef);
    } else if (name === 'channel_right_line') {
        const index = +(dom.getAttribute('index') ?? 0)
        currentDragger = new PlayingChannelRightLineDragger(event, xScale, index, channelsRef);
    }

    if (name === 'bottomRect') {
        if (event.buttons === 1) {
            currentTimeRef.value = event.offsetX / xScale.value;
        }
        return;
    }
}

const contextmenuUp = (index: number) => {

    const channels = channelsRef.value ? [...channelsRef.value] : []

    const current = channels[index]
    const previous = channels[index - 1]
    channels[index] = previous
    channels[index - 1] = current

    channelsRef.value = channels

}

const contextmenuDown = (index: number) => {
    const channels = channelsRef.value ? [...channelsRef.value] : []
    const current = channels[index]
    const next = channels[index + 1]
    channels[index] = next
    channels[index + 1] = current
    channelsRef.value = channels
}


const contextmenu = (item: [string, number, number], index: number) => {

    let base: MenuContentType[] = [
        {
            text: "重置时长",
            keys: "",
            func: () => {
                setDuration(index)
            },
        },
        {
            text: "进入子播放器",
            keys: "",
            func: () => {
                innerPlayer(index)
            },
        },
        {
            text: "修改",
            keys: "edit",
            func: () => {
                editPlayer(item, index)
            },
        },
        {
            text: "删除",
            keys: "delete",
            func: () => {
                const channelVal = channelsRef.value ? [...channelsRef.value] : []
                channelVal.splice(index, 1)
                channelsRef.value = channelVal
            },
        },
    ];

    if (channelsRef.value && channelsRef.value.length !== 1) {
        if (index === 0) {
            const itemDown = {
                text: "下移",
                keys: "↓",
                func: () => {
                    contextmenuDown(index)
                },
            }

            base.unshift(itemDown)

        } else if (index === channelsRef.value.length - 1) {
            const itemUp = {
                text: "上移",
                keys: "↑",
                func: () => {
                    contextmenuUp(index)
                },
            }
            base.unshift(itemUp)
        } else {
            const itemArr: MenuContentType[] = [
                {
                    text: "上移",
                    keys: "↑",
                    func: () => {
                        contextmenuUp(index)
                    },
                },
                {
                    text: "下移",
                    keys: "↓",
                    func: () => {
                        contextmenuDown(index)
                    },
                },
            ]
            base = itemArr.concat(base)
        }
    }

    baseItems.value = base
}

const pointerup = (event: PointerEvent) => {
    event.target && (event.target as HTMLElement).releasePointerCapture(event.pointerId);
    resetCurrentDragger();
}

const pointermove = (event: PointerEvent) => {
    if (currentDragger) {
        currentDragger.update(event);
    }

    const dom = event.target as HTMLElement;
    const name = dom.getAttribute('name');
    if (!name) {
        return;
    }

    textInfo.x = event.offsetX + 20;
    textInfo.y = event.offsetY - 10;

    if (['channel_rect', 'channel_left_line', 'channel_right_line'].includes(name)) {
        const index = +(dom.getAttribute('index') ?? 0);
        if (channelsRef.value) {
            const [id, start, duration] = channelsRef.value[index];
            const sceneObj = SceneObject.getSceneObjById(id);
            if (sceneObj) {
                textInfo.show = true;
                textInfo.text = `名称: ${sceneObj.name}, 起始时刻：${start.toFixed(2)}ms, 时长：${duration.toFixed(2)}ms`;
            }
        }
    } else if (name === 'currentTimeLine') {
        textInfo.show = true;
        textInfo.text = `当前时刻: ${currentTimeRef.value.toFixed(2)}`;
    } else if (name === 'lastTimeLine') {
        textInfo.show = true;
        textInfo.text = `总时长: ${durationRef.value.toFixed(2)}`;
    } else if (name === 'bottomRect') {
        hoverTimeRef.value = event.offsetX / xScale.value;
        textInfo.show = true;
        textInfo.text = `当前时刻: ${hoverTimeRef.value.toFixed(2)}`;
    }
}

const pointerover = (event: PointerEvent) => {
    // currentTimeLineHovered.value = true
}

const pointerout = () => {
    // currentTimeLineHovered.value = false
    textInfo.show = false;
    hoverTimeRef.value = undefined;
    resetCurrentDragger();
}

const wheel = (event: WheelEvent) => {
    // console.log(`event.deltaY`, event.deltaY)
    const w = event.deltaY / -100;
    xScale.value *= (1 + w * .1);
    const min = 100 / durationRef.value;
    if (xScale.value < min) {
        xScale.value = min;
    }
    if (xScale.value > 0.1) {
        xScale.value = 0.1;
    }
}

// 跳转到子播放器
const innerPlayer = (index: number) => {
    if (!channelsRef.value) return;
    const [id] = channelsRef.value[index]
    const sceneObj = SceneObject.getSceneObjById(id) as Player | undefined;
    if (sceneObj) {
        currentPlayerRef.value = sceneObj
    } else {
        return
    }
}
//获取子播放器时长并设置
const setDuration = (index: number) => {
    if (!channelsRef.value) return;
    const [id] = channelsRef.value[index]
    const sceneObj = SceneObject.getSceneObjById(id) as Player | undefined;
    if (sceneObj) {
        const duration = sceneObj.duration ?? 1000
        const channel = [...channelsRef.value]
        channel[index][2] = duration
        channelsRef.value = channel
    } else {
        return
    }
}

</script>

<style scoped>
.player_barbox {
    width: 100%;
    height: calc(100% - 80px);
    overflow: auto;
    position: absolute;
    bottom: 0px;
}

.current-time-line:hover {
    stroke: red;
    cursor: e-resize;
}

.hover-time-line {
    pointer-events: none;
}

.last-time-line:hover {
    stroke: red;
    cursor: e-resize;
}

.channel_line:hover {
    stroke: red;
    cursor: col-resize;
}

.channel_rect:hover {
    fill: red;
    cursor: e-resize;
}

.bottom-rect:hover {
    cursor: pointer;
}

.player_editor {
    width: 100%;
    height: 100%;
    background-color: #292b2f;
    color: #fff;
    position: relative;
}

.player_name {
    width: calc(100%);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.player_editing {
    height: 50px;
    width: 100%;
    display: flex;
    justify-content: flex-start;
    align-items: center;
}

.player_editing>span {
    margin: 0px 20px;
}

.playing_setting {
    transform: rotate(-90deg);
    width: 30px;
    height: 30px;
    line-height: 30px;
    font-size: 16px;
    border-radius: 3px;
    background-color: #383838;
    cursor: pointer;
    user-select: none;

}

.playing_setting:hover {
    background-color: #242424;
}

.actived {
    color: #49ec12 !important;
}

.loop {
    width: 30px;
    height: 30px;
    line-height: 30px;
    font-size: 18px;
    cursor: pointer;
    border-radius: 3px;
    text-align: center;
    background-color: #383838;
    user-select: none;
}

.loop:hover {
    background-color: #242424;
}

.loop_false {
    display: block;
    width: 20px;
    height: 20px;
    margin: 5px auto;
    background-image: url('./img/loop.png');
    background-size: 100% 100%;
}

.loop_true {
    display: block;
    width: 20px;
    height: 20px;
    margin: 5px auto;
    background-image: url('./img/loop_true.png') !important;
    background-size: 100% 100%;
}

.player_stop {
    line-height: 26px;
    font-size: 24px;
}

.player_speed {
    letter-spacing: 0px;
    font-size: 12px;
}

.player_scale {
    position: absolute;
    bottom: 0;
    background: #09000000;
    height: 20px;
    pointer-events: none;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    overflow: hidden;
}

.scale_bigItem {
    height: 20px;
    width: 80px;
    border-left: 1px solid #000;
    box-sizing: border-box;
    position: relative;
    display: flex;
    justify-content: flex-start;
    align-items: flex-end;
}

.scale_item {
    height: 6px;
    width: 8px;
    border-left: 1px solid #000;
    box-sizing: border-box;
    overflow: hidden;
}

.scale_number {
    position: absolute;
    left: 0px;
    top: 0px;
    font-size: 12px;
    color: #000;
}

.add_player {
    margin: 0 auto;
    width: 90%;
    height: 100%;
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    align-items: center;
}

.add_item {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.add_item label {
    font-size: 12px;
}

.add_item input {
    padding-left: 10px;
    width: 70%;
    height: 16px;
    background: #003847;
    border: 1px solid #384b50;
    outline: 1px solid #384b50;
    border-radius: 2px;
    font-size: 12px;
    color: #fff;
}

.player_close {
    cursor: pointer;
    width: 40px;
    height: 20px;
    font-size: 20px;
    line-height: 20px;
    margin-top: 5px;
}

.player_close:hover {
    color: #49ec12;
}
</style>
