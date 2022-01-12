<template>
    <div :class="'toast ' + ('toast-' + type)" :style="{'animation-duration': (duration/1000) + 's'}">{{text}}</div>
</template>

<script>
export default {
    name: 'Toast',
    props: {
        text: {
            type: String,
            default: ''
        },
        type: {
            type: String,
            default: 'success'
        },
        duration: {
            type: Number,
            default: 2500
        },
    },
    mounted() {
        setTimeout(() => {
            document.body.removeChild(this.vm.$el)
        }, this.duration)
    },
}
</script>

<style lang="less">
.toast {
    position: fixed;
    left: 50%;
    top: 0;
    padding: 12px 100px;
    border-radius: 5px;
    transform: translate(-50%, -100%);
    font-size: 14px;
    background-color: #506da0;
    border: 1px solid  #4e658e;
    color: #fff;
    cursor: default;
    animation: show 0.3s;
}

.toast-success {
    border-color: #339e8f;
    background-color: #4fab9e;
}

.toast-warn {
    border-color: #bb8535;
    background-color: #e09e3c;
}

.toast-error {
    border-color: #c33737;
    background-color: #ca4545;
}

@keyframes show {
    0% {
        transform: translate(-50%, -100%);
    }
    10% {
        transform: translate(-50%, 20px);
    }
    90% {
        transform: translate(-50%, 20px);
    }
    100% {
        transform: translate(-50%, -100%);
    }
}

@media screen and (max-width: 768px) {
    .toast {
        padding: 12px;
    }
}
</style>