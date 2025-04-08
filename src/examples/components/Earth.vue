<script setup lang='ts'>
const props = withDefaults(defineProps<{ htmlStr: string }>(), { htmlStr: '' });
const emits = defineEmits(['run']);

</script>

<template>
    <div style="width: 100%;height: 100%; background: white">
        <iframe :srcdoc="props.htmlStr" style="width: 100%;height: 100%;border: none;"></iframe>
    </div>
</template>

<style scoped>

</style>
