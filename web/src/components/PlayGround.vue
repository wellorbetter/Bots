<template>
    <div class="playground">
        <GameMap />
    </div>
</template>

<script>
import GameMap from '@/components/GameMap.vue'

export default {
    components: { 
        GameMap 
    },
}
</script>

<style scoped>
div.playground {
    margin: 40px auto;
    width: 60vw;
    height: 70vh;
    background: blue;
}
</style>