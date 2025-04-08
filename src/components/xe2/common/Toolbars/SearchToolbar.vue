<template>
  <div class="search-container">
    <div class="search-box">
      <input type="text" v-model="searchQuery" placeholder="搜索地点..." class="search-input" @keyup.enter="triggerSearch" />
      <span class="search-icon" @click="triggerSearch"></span>
    </div>
    <div class="results-container" v-if="searchResults.length > 0 && showResults">
      <div class="result" v-for="result in searchResults" :key="result.displayName" @click="flyTo(result.location)">
        {{ result.displayName }}
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, Ref } from 'vue';
import { ProjectManager } from 'xbsj-xe2/dist-node/xe2';
import { CzmViewer } from "xbsj-xe2/dist-node/xe2-cesium-objects";
import { SceneObject } from 'xbsj-xe2/dist-node/xe2-base-objects';

import { gcj02towgs84} from '../../../../scripts/coordTransform.js';

const props = withDefaults(defineProps<{
  projectManager: ProjectManager,
  isMinToolView: boolean,
}>(), {});

const { projectManager, isMinToolView } = props
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
    }))
    //@ts-ignore
    viewer.__dropFlag = true
  }
  const dispose = projectManager.viewersManager.viewersChanged.disposableOn(update)
  onBeforeUnmount(dispose)
});


function flyTo(location: number[]): void {
  if (!viewer || !location || location.length !== 2) return;
  const [longitude, latitude] = location;
  let dingweiicoposition: [number, number, number] | undefined;

  let wgs84location = gcj02towgs84(longitude, latitude);
  dingweiicoposition = [wgs84location[0], wgs84location[1], 100];
  Positioning.position = dingweiicoposition;
  projectManager.createSceneObjectFromJson(Positioning) as SceneObject
  // 检查经纬度值是否有效
  if (isNaN(longitude) || isNaN(latitude)) {
    console.error("Invalid longitude or latitude values", location);
    return;
  }
  viewer.flyTo([wgs84location[0], wgs84location[1], 3000]);
}

interface SearchResult {
  displayName: string;
  location: number[]; // [longitude, latitude]
}

//搜索内容和状态全局变量
const searchQuery: Ref<string> = ref('');
const searchResults: Ref<SearchResult[]> = ref([]);
const showResults: Ref<boolean> = ref(false); // 控制搜索结果显示

function geocode(input: string): void {
  const apiKey: string = '6f8f33f78da8f3bae9dfe5e185e36499';
  const baseUrl: string = 'https://restapi.amap.com/v3/place/text';
  const inputParams: string = `keywords=${encodeURIComponent(input)}&city=beijing&output=json&key=${apiKey}`;
  const requestUrl: string = `${baseUrl}?${inputParams}`;

  fetch(requestUrl)
    .then(response => response.json())
    .then(data => {
      // 限制结果数量为8
      searchResults.value = data.pois.slice(0, 8).map((poi: any) => ({
        displayName: `${poi.name} - ${poi.address}`,
        location: poi.location.split(',').map(Number), // 转换为[number, number]
      }));
    })
    .catch(error => {
      console.error('Geocoding request failed:', error);
      searchResults.value = [];
    });
}

function triggerSearch(): void {
  if (!searchQuery.value.trim()) {
    searchResults.value = [];
    showResults.value = false;
    return;
  }
  geocode(searchQuery.value);
  showResults.value = true;
}
// 监听全局点击事件，判断点击位置
onMounted(() => {
  document.addEventListener('click', (event) => {
    const searchContainer = document.querySelector('.search-container');
    if (searchContainer && !searchContainer.contains(event.target as Node)) {
      showResults.value = false; // 如果点击的不是搜索容器内部，则隐藏搜索结果
    }
  });
});

onBeforeUnmount(() => {
  document.removeEventListener('click', () => {
    showResults.value = false;
  });
});


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

</script>



<style>
.search-container {
  border-radius: 10px;
  position: relative;
  width: 100%;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  width: calc(100% - 40px);
  /* 为图标留出空间 */
  border-radius: 50px;
  outline: none;
  color: #fff;
  background: rgb(61, 64, 70);
  border: none;
  width: 100%;
  /* padding: 8px; */
  box-sizing: border-box;
  padding: 10px 40px 10px 10px;
  /* 右侧内填充留出图标空间 */
  box-sizing: border-box;
  /* 其余样式保持不变 */
}

.search-icon {
  position: absolute;
  right: 10px;
  cursor: pointer;
  /* 使用背景图像作为搜索图标 */
  background: url('../../img/sousuo.svg') no-repeat center center;
  background-size: contain;
  width: 18px;
  height: 18px;
}

.result {
  position: relative;
  padding: 15px;
  padding-left: 35px;
  cursor: pointer;
}

.result:before {
  content: '';
  /* 伪元素内容 */
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  /* 使用背景图像作为点位图标 */
  background: url('../../img/biaoji.svg') no-repeat center center;
  background-size: contain;
  width: 16px;
  /* 图标宽度 */
  height: 16px;
  /* 图标高度 */
  margin-right: 10px;
}

.result:hover {
  background-color: rgba(240, 248, 255, 0.288);
}


.results-container {
  overflow: hidden;
  border-radius: 10px;
  margin-top: 10px;
  position: absolute;
  font-size: 14px;
  color: #c9c7c7;
  top: 100%;
  left: 0;
  width: 100%;
  background: rgb(61, 64, 70);
  z-index: 1000;
  box-shadow: 0px 0px 10px rgb(0, 0, 0);
}

.result:last-child {
  border-bottom: none;
}
</style>
  