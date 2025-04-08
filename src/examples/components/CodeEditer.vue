
<script setup lang='ts'>
import { getAssetsDir } from '@/components/xe2/tools';
import { ref, watch } from 'vue';

const props = withDefaults(defineProps<{
    exampleStr: string;
}>(), { exampleStr: '<div>暂无数据<div>' });

const emits = defineEmits(['run']);

const mainIframe = ref<HTMLIFrameElement>()

const iframeSrc = getAssetsDir() + '/monaco-editor/html-editor.html';

const loadIframe = async () => {
    await setHtml(props.exampleStr)
}

function setHtml(value: string) {
    return new Promise<void>((resolve, reject) => {
        if (!mainIframe.value || !mainIframe.value.contentWindow) {
            return;
        }
        const setKey = getUuid()
        mainIframe.value.contentWindow.postMessage({ type: 'setHtml', id: setKey, value })
        const time = setTimeout(() => {
            removeEventListener('message', messageSetEventWatch, false);
            reject();
        }, 10000);

        const messageSetEventWatch = (messageEvent: MessageEvent<{ type: string, id: string, status: string } | undefined>) => {
            var data = messageEvent.data;
            if (!data || (data.type && data.type !== 'setHtmlReturn') || (data.id && data.id !== setKey)) {
                return;
            }
            removeEventListener('message', messageSetEventWatch, false);
            clearTimeout(time)
            if (data.status === 'ok') {
                resolve();
            } else {
                reject();
            }
        }
        addEventListener('message', messageSetEventWatch, false);
    })

}

const getFile = async () => {
    const str = await getHtml()
    return str
}

function getHtml() {
    return new Promise<string>((resolve, reject) => {
        if (!mainIframe.value || !mainIframe.value.contentWindow) {
            return;
        }
        const getKey = getUuid()
        mainIframe.value.contentWindow.postMessage({ type: 'getHtml', id: getKey })
        const time = setTimeout(() => {
            removeEventListener('message', messageGetEventWatch, false);
            reject();
        }, 10000);

        const messageGetEventWatch = (messageEvent: MessageEvent<{ type: string, id: string, status: string, value: string | undefined } | undefined>) => {
            var data = messageEvent.data;
            if (!data || (data.type && data.type !== 'getHtmlReturn') || (data.id && data.id !== getKey)) {
                return;
            }
            removeEventListener('message', messageGetEventWatch, false);
            clearTimeout(time)
            if (data.status === 'ok' && data.value) {
                resolve(data.value);
            } else {
                reject();
            }
        }
        addEventListener('message', messageGetEventWatch, false);
    })

}

function getUuid() {
    var d = new Date().getTime();
    if (window.performance && typeof window.performance.now === "function") {
        d += performance.now();
    }
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
}

defineExpose({ getFile })

const loadNum = ref(false)
watch(() => props.exampleStr, () => {
    if (!loadNum.value) {
        loadNum.value = true
        return
    }
    loadIframe()
})

</script>

<template>
    <div class="codeEdit" style="width: 100%;height: 100%;">
        <iframe :src="iframeSrc" frameborder="0" @load="loadIframe" ref="mainIframe"
            style="width:100%;  height:calc(100%);"></iframe>
    </div>
</template>

<style scoped>

</style>
