<template>
    <!-- ref绑定 -->
  <div ref="parent" class="gamemap">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script>
import { GameMap } from '@/assets/scripts/GameMap'
import { ref, onMounted } from 'vue'

export default {
    setup() {
        let parent = ref(null);
        let canvas = ref(null);

        // onMounted: 在实例挂载之后执行，也就是确保这里的div和canvas元素已经挂载到页面上了
        onMounted(() => {
            new GameMap(canvas.value.getContext('2d'), parent.value)
        });
        return {
            parent,
            canvas,
        }
    },
}
</script>

<style>
div.gamemap {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>