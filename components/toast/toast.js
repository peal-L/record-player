import toast from './toast.vue'
import Vue from 'vue'

// 引入组件
let AlertConstructor = Vue.extend(toast)
let instance
let index = 2000

const install = () => {
    Vue.prototype.$toast = function (text, type) {
        type = type || ''
        // 实例化组件
        instance = new AlertConstructor({
            propsData: {
                text: text,
                type: type
            }
        })
        index++
        instance.vm = instance.$mount()
        document.body.appendChild(instance.vm.$el)
        instance.vm.$el.style.zIndex = index
    }
}

export default install