<template>
    <div class="loading" v-if="show">
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="30px" height="30px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
            <circle cx="50" cy="50" fill="none" stroke="#ffffff" stroke-width="10" r="35" stroke-dasharray="164.93361431346415 56.97787143782138" transform="rotate(156.816 50 50)">
                <animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="0.6578947368421053s" values="0 50 50;360 50 50" keyTimes="0;1"></animateTransform>
            </circle>
        </svg>
    </div>
</template>

<script>
export default {
    props: {
        show: Boolean
    }
}
</script>

<style lang="less" scoped>
.loading {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    animation: loadingShow 0.4s;
}

@keyframes loadingShow {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}
</style>