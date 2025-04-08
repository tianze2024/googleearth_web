
<script setup lang='ts'>
import { onMounted, reactive, ref, watch } from 'vue';

type MenuContentType = {
  type?: 'normal'
  text: string;
  keys: string;
  func: () => void;
} | {
  type: "divider",
}

const props = withDefaults(defineProps<{
  baseItems: MenuContentType[]
}>(), { baseItems: () => [] });

watch(() => props.baseItems, (val) => {
  if (val.length === 0) {
    return
  }
  popMenu()
})

const menubox = ref<HTMLElement>()
const watchDom = ref<HTMLElement>()
const show = ref(false)
const cursor = reactive({
  x: 0, y: 0
})
const boxStyle = ref('')

const popMenu = () => {
  if (show.value) return;
  show.value = true;
  let bottom = 0;
  props.baseItems.forEach((element) => {

    if (element.type === "divider") {
      bottom += 2;
    } else {
      bottom += 30;
    }
  });
  if (!watchDom.value) return
  const { x, y } = cursor
  if (watchDom.value.clientHeight < y + bottom) {
    cursor.y = y - bottom;
  }
  if (watchDom.value.clientWidth < x + 200) {
    cursor.x = x - 200;
  }
  boxStyle.value = `left:${cursor.x}px; top:${cursor.y}px;width:${200}px`;
}


const clickFunc = (it: MenuContentType) => {
  if (it.type === "divider") {
    return
  }
  it.func()
  show.value = false
}


onMounted(() => {
  if (!menubox.value) return;
  const dom = menubox.value.parentElement;
  if (!dom) return
  watchDom.value = document.getElementById('app') as HTMLElement
  watchDom.value.addEventListener("mousemove", (event) => {
    cursor.x = event.clientX
    cursor.y = event.clientY
  });

  //@ts-ignore
  function domContain(dom: HTMLElement, child: any) {
    if (dom === child) return true;
    if (!child) return false;
    return domContain(dom, child.parentElement);
  }
  //添加一个发生在dom元素外部的事件
  function addOutterEventListener(dom: HTMLElement, name: string, callback: (e: HTMLElement) => void) {
    return document.body.addEventListener(name, (e) => {
      e = e || event;
      if (!domContain(dom, e.target)) {
        if (callback) callback(dom);
      }
    });
  }
  addOutterEventListener(menubox.value, "pointerdown", () => {
    show.value = false;
  });
})
</script>

<template>
  <div v-show="show" class="menu-box" ref="menubox" :style="boxStyle">
    <ul>
      <li v-for="(item, index) in baseItems" :key="index" @click="clickFunc(item)"
        :class="{ divideron: item.type == 'divider' }">
        <span v-if="item.type !== 'divider'">{{ item.text }}</span>
        <span v-if="item.type !== 'divider'">{{ item.keys }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.menu-box {
  position: fixed;
  z-index: 10000;
  background: rgb(61, 64, 70);
  border-bottom-left-radius: 3px;
  border-bottom-right-radius: 3px;
  box-shadow: 2px 2px 10px 2px rgba(0, 0, 0, 0.4);
  color: #ccc;
}

.menu-box>ul {
  margin: 0;
  padding: 5px;
}

.menu-box ul li {
  width: 100%;
  cursor: pointer;
  text-align: left;
  height: 20px;
  line-height: 20px;
  padding: 0px 16px;
  margin: 5px 0;
  box-sizing: border-box;
  list-style: none;
  overflow: hidden;
}

.divideron {
  height: 1px !important;
  width: 100% !important;
  line-height: 1px !important;
  background: rgb(168, 168, 168);
  opacity: 0.3;
}

.menu-box ul li:hover {
  background: #003440;
}

.menu-box ul li span {
  display: inline-block;
  font-size: 12px;
}

.menu-box ul li span:first-child {
  margin-right: 5px;
}

.menu-box ul li span:last-child {
  float: right;
  display: block
}
</style>
