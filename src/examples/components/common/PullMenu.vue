
<script setup lang='ts'>
type defaultType = {
    "type": string,
    "name": string,
    "id": string,
    "url": string
}

const props = withDefaults(defineProps<{
    isShow: boolean;
    list?: defaultType[]
}>(), {
    isShow: false
});

const emits = defineEmits(['selectExample']);

const clickItem = (it: defaultType) => {
    emits('selectExample', it)
}

</script>

<template>
    <Transition name="opa-fade">
        <div class="menu-box" v-show="props.isShow">
            <ul class="list-unstyled">
                <li v-for="(it, i) in list" :key="i" @click="clickItem(it)">
                    <span :title="it.url">{{ it.name }}</span>
                </li>
            </ul>
        </div>
    </Transition>
</template>

<style scoped>
.menu-box {
    width: 350px;
    max-height: 600px;
    overflow-y: auto;
    position: absolute;
    top: 45px;
    left: 10px;
    z-index: 999;
    background: rgb(61, 64, 70);
    border-bottom-left-radius: 3px;
    border-bottom-right-radius: 3px;
    box-shadow: 1px 1px 1px 1px rgba(0, 0, 0, 0.4);
    color: #ccc;
}

.menu-box>ul {
    margin: 0;
    padding: 5px;
}

.menu-box>ul>li {
    width: 100%;
    cursor: pointer;
    text-align: left;
    height: 40px;
    line-height: 40px;
    padding: 0px 10px;
    margin: 3px 0;
    box-sizing: border-box;
    list-style: none;
}

.menu-box ul li:hover {
    background: #003440;
}

.menu-box ul li span {
    display: inline-block;
    font-size: 14px;
    overflow: hiddden;
    text-overflow: ellipsis;
    font-weight: 700;
    white-space: nowrap;
}

.menu-box ul li span:first-child {
    margin-right: 5px;
}

.opa-fade-enter-active,
.opa-fade-leave-active {
    transition: all 0.5s ease;
}

.opa-fade-enter-from,
.opa-fade-leave-to {
    opacity: 0;
}
</style>
