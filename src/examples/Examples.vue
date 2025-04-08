
<script setup lang='ts'>
import Header from "./components/Header.vue";
import Resize from "./components/Resize.vue";
import MenuBar from "./components/MenuBar.vue";
import CodeEdit from "./components/CodeEditer.vue";
import Earth from "./components/Earth.vue";
import { ref } from "vue";

const exampleStr = ref('')
const htmlStr = ref('')
const changeExample = (str: string) => {
    exampleStr.value = str
    htmlStr.value = str
}

const codeEdit = ref<{ getFile(): Promise<string>; }>();
const run = async () => {
    if (!codeEdit.value) {
        return
    }
    const code: Promise<string> = codeEdit.value.getFile()
    code.then((res: string) => {
        htmlStr.value = res
    })
}


</script>

<template>
    <Header />
    <MenuBar @changeExample="changeExample" @run="run" />
    <div class="examples_center">
        <Resize>
            <template v-slot:code>
                <CodeEdit slot="code" :exampleStr="exampleStr" ref="codeEdit"></CodeEdit>
            </template>
            <template v-slot:earth>
                <Earth slot="earth" :htmlStr="htmlStr"></Earth>
            </template>
        </Resize>
    </div>
</template>

<style>
body,
html {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
}

#examples {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #fff;
    background-color: #292b2f;
    width: 100%;
    height: 100%;
}

.examples_center {
    height: calc(100% - 120px);
    width: calc(100% - 20px);
    border: 10px solid #004052;
    border-top: none;
    overflow: hidden;
}
</style>
