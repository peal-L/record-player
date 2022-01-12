<template>
    <div class="music">
        <div class="bg" :style="'background-image: url(' + (playData.id ? playData.albumPic : '') + ')'"></div>

        <!-- 播放列表 -->
        <div class="player-list">
            <!-- 头部 -->
            <div class="header">
                <ul class="tab">
                    <li v-for="(item, i) in listTab" :key="'tab' + i" :class="{active: listIndex === i}" @click="changeList(i)">{{ item }}</li>
                    <span class="tab-active-line"></span>
                </ul>
                <div class="search">
                    <input type="text" v-model="search.keyword" placeholder="搜索..." @keypress.enter="searchSend(1)">
                    <span @click="searchSend(1)">
                        <i class="iconfont icon-sousuo"></i>
                    </span>
                </div>
            </div>
            <!-- 可拖拽列表 -->
            <transition-group v-if="listIndex > 0" name="list-transition" tag="ul" class="list scrollBar">
                <li class="list-transition-item" v-for="(item, i) in playList[listIndex]" draggable="true" :key="item.id" @click="playSong(i)" :data-index="i" @dragstart="dragStart" @dragenter="dragEnter" @dragend="dragEnd">
                    <p :title="`${item.name} - ${item.artists[0].name}`">
                        <span>{{i + 1}}. </span>
                        <span>{{item.name}} - {{item.artists[0].name}}</span>
                    </p>
                    <p :title="item.album.name">{{item.album.name}}</p>
                    <p>
                        <span v-if="item.id !== playData.id || playStatus !== 1">{{calcDuration(item.duration)}}</span>
                        <span v-else class="playing"></span>
                        <span @click.stop="deleteSong(i)" class="op-song delete-song">
                            <i class="iconfont icon-shanchu"></i>
                        </span>
                    </p>
                </li>
                <p :key="'no'" v-if="playList[listIndex].length === 0" class="no-song">无歌曲，请搜索后添加</p>
            </transition-group>
            <!-- 搜索列表 -->
            <ul v-else class="list scrollBar" @scroll="searchMore">
                <li v-for="(item, i) in playList[listIndex]" :key="'list' + i" @click="playSong(i)">
                    <p :title="`${item.name} - ${item.artists[0].name}`">
                        <span>{{i + 1}}. </span>
                        <span>{{item.name}} - {{item.artists[0].name}}</span>
                    </p>
                    <p :title="item.album.name">{{item.album.name}}</p>
                    <p>
                        <span v-if="item.id !== playData.id || playStatus !== 1">{{calcDuration(item.duration)}}</span>
                        <span v-else class="playing"></span>
                        <span @click.stop="addSong(i)" class="op-song add-song">
                            <i class="iconfont icon-plus"></i>
                        </span>
                    </p>
                </li>
                <p v-if="playList[listIndex].length === 0" class="no-song">未搜索</p>
                <!-- 点击加载更多 -->
                <li v-if="listIndex === 0 && playList[0].length >= 20 && !searchDone" @click="searchSend()" class="load-more">加载更多...</li>
            </ul>
            <loading :show="listLoading" />
        </div>

        <!-- 唱片机 -->
        <div class="player-box">
            <div :class="{'player': true, 'disk-in': playData.id, 'disk-play': playStatus === 1}">
                <!-- 唱片盘 -->
                <div class="player-disk">
                    <div class="album-disk">
                        <span></span>
                        <span :style="'background-image: url(' + (playData.id ? playData.albumPic : '') + ')'"></span>
                        <span></span>
                    </div>
                    <span class="player-disk-center"></span>
                </div>
                <!-- 唱片指针 -->
                <div class="player-point">
                    <div class="player-point-circle"></div>
                    <div class="player-point-item" :style="`transform: rotate(${playData.id ? (277 + (playerCurrentTimePoint / playData.duration * 13)) : '265'}deg)`">
                        <div class="player-point-pointer">

                            <svg xmlns="http://www.w3.org/2000/svg" version="1.1">
                                <path d="M 0 0 q 20 60 120 60" stroke="#E8E8E8" stroke-width="5" fill="none" filter="url(#innershadow)" />
                                <filter id="innershadow" x0="-50%" y0="-50%" width="200%" height="200%">
                                    <feComponentTransfer in="SourceAlpha">
                                        <feFuncA type="table" tableValues="1 0" />
                                    </feComponentTransfer>
                                    <feGaussianBlur stdDeviation="1" />
                                    <feOffset dx="0" dy="0" result="offsetblur" />
                                    <feFlood floodColor="#7059ef" floodOpacity="1" result="color" />
                                    <feComposite in2="offsetblur" operator="in" />
                                    <feComposite in2="SourceAlpha" operator="in" />
                                    <feMerge>
                                        <feMergeNode in="SourceGraphic" />
                                        <feMergeNode />
                                    </feMerge>
                                </filter>
                            </svg>

                        </div>
                    </div>
                    <div class="player-point-top"></div>
                </div>
                <!-- 电源灯 -->
                <span class="power-light"></span>
                <div class="player-info">
                    <!-- 显示屏 -->
                    <div class="player-screen">
                        <p class="song-name" v-if="!playerScreenText">{{playData.id ? `${playData.name} - ${playData.artists[0].name}`  : '未播放'}}</p>
                        <p v-else>{{ playerScreenText }}</p>
                    </div>
                    <!-- 按钮 -->
                    <div class="player-btn">
                        <span @click="stop"><i class="iconfont icon-stop"></i></span>
                        <span @click="clickPlayPrev"><i class="iconfont icon-play-prev"></i></span>
                        <span @click="play" :class="{'player-btn-on': playStatus === 1}"><i class="iconfont icon-play"></i></span>
                        <span @click="clickPlayNext"><i class="iconfont icon-play-next"></i></span>
                        <span @click="changeMode">
                            <i v-if="player.mode === 0" class="iconfont icon-shunxu"></i>
                            <i v-if="player.mode === 1" class="iconfont icon-danquxunhuan"></i>
                            <i v-if="player.mode === 2" class="iconfont icon-random"></i>
                            <i v-if="player.mode === 3" class="iconfont icon-tingzhi"></i>
                        </span>
                        <div class="player-volume">
                            <input @input="changeVolume" type="range" min="0" max="100" v-model="player.volumn">
                        </div>
                    </div>
                    <!-- 进度条 -->
                    <div class="player-rate">
                        <input @change="changeRate" @mousedown="durationDragStart" @mouseup="durationDragEnd" type="range" min="0" :max="playData.duration || 0" v-model="playerCurrentTimePoint">
                    </div>
                </div>
            </div>

            <!-- 歌词 -->
            <div class="lyric-box scrollBar">
                <ul v-if="playData.id && playData.lyric && playData.lyric.constructor === Array && playData.lyric.length > 0" :style="`transform: translateY(${lyric.top}px)`">
                    <li :class="{selected: lyric.index === i}" :ref="'lyric-item-' + i" v-for="(item, i) in playData.lyric" :key="'lyric' + i">{{ item[1] }}</li>
                </ul>
                <div class="lyric-none" v-if="playData.id && (playData.lyric && playData.lyric.constructor === Array && playData.lyric.length === 0)">无歌词</div>
            </div>
        </div>

        <!-- 播放器 -->
        <audio id="player" :src="playData.id ? `https://music.163.com/song/media/outer/url?id=${playData.id}.mp3`  : ''" @canplay="canPlay" @canplaythrough="canPlay" @pause="playPause" @ended="playDone" @error="playFail" @timeupdate="playingTime"></audio>
    </div>
</template>

<script>
import Vue from 'vue'
import axios from 'axios'
import loading from '../components/loading.vue'
import toast from '@/components/toast/toast.js'

Vue.use(toast)

var playerDom = null,
    tabActiveDom = null
var timer1, timer1Point, timer2
var dragIndex = null

export default {
    layout: 'player',
    components: {
        loading
    },
    data() {
        return {
            playStatus: 0, // 播放状态 0停止 1播放 2暂停
            playData: {},
            listIndex: 0, // 列表tabIndex
            listTab: ['搜索', '播放列表'],
            playList: [
                [], // 搜索
                [], // 正在播放
                [], // 收藏
            ],
            listLoading: false,
            // 播放器设置
            player: {
                volumn: 100,
                mode: 0, // 0顺序 1单曲循环 2随机 3单曲停止
            },
            lyric: {
                top: 0,
                index: 0
            },
            playerCurrentTime: 0,
            playerCurrentTimePoint: 0, // 指针用
            playerScreenText: '',
            // 搜索参数
            search: {
                page: 0,
                size: 30,
                keyword: ''
            },
            // 搜索没有更多
            searchDone: false,
            lyricBoxHeight: 0,
            durationDraging: false,
        }
    },
    mounted() {
        this.init()
    },
    methods: {
        // 页面初始化
        init() {
            document.title = '唱片播放器'
            // 初始化获取dom
            playerDom = document.getElementById('player')
            tabActiveDom = document.querySelector('.tab-active-line')
            let lyricHeight = document.querySelector('.lyric-box').offsetHeight / 2 - 14
            this.lyric.top = lyricHeight
            this.lyricBoxHeight = lyricHeight
            // 读取播放器设置
            let setting = localStorage.getItem('player')
            if (setting) {
                try {
                    setting = JSON.parse(setting)
                    // 遍历保存的设置，确保参数完整
                    for (let i in this.player) {
                        if (setting[i] === undefined) {
                            setting = this.player
                            break;
                        }
                    }
                    this.player = setting
                    playerDom.volume = setting.volumn / 100
                } catch (e) {
                    localStorage.removeItem('player')
                }
            }
            // 读取本地正在播放列表
            let playList = localStorage.getItem('playList')
            if (playList) {
                try {
                    playList = JSON.parse(playList)
                    this.playList[1] = playList
                } catch (e) {
                    localStorage.removeItem('playList')
                }
            }

            this.changeList(1)
        },
        // 发送请求
        searchSend(init) {
            if (this.search.keyword.replace(' ', '') !== '' && !this.listLoading && !this.searchDone) {
                // 清空搜索列表
                if (init) {
                    this.$set(this.playList, 0, [])
                    this.search.page = 0
                }
                let that = this
                that.listLoading = true
                axios.get(`/api/search?keyword=${this.search.keyword}&page=${this.search.page * this.search.size}&size=${this.search.size}`).then(res => {
                    if (res.data.status === 100000) {
                        that.changeList(0)
                        if (res.data.data.songCount === 0 || !res.data.data.songs || res.data.data.songs.length === 0) that.searchDone = true
                        that.search.page = that.search.page + 1
                        res.data.data.songs.map(item => {
                            item.duration = Math.floor(item.duration / 1000)
                        })
                        this.$set(that.playList, 0, that.playList[0].concat(res.data.data.songs))
                    }
                    that.listLoading = false
                }).catch(_ => {
                    that.listLoading = false
                })
            }
        },
        // 点击加载更多
        searchMore(e) {
            if (this.listIndex === 0 && !this.searchDone) {
                let dom = document.querySelector('.player-list>.list')
                if (dom.offsetHeight + dom.scrollTop > (dom.scrollHeight - 10)) {
                    this.searchSend()
                }
            }
        },
        // 请求详情拿封面
        searchDetail() {
            let that = this
            axios.get(`/api/songDetail?id=${this.playData.id}`).then(res => {
                if (res.data.status === 100000) {
                    let img = res.data.data.album.picUrl || res.data.data.album.blurPicUrl || ''
                    let index = this.idFindIndex(1, this.playData.id)
                    this.playData.albumPic = img
                    this.$set(that.playList[1][index], 'albumPic', img)
                    this.savePlayList()
                }
            })
        },
        // 请求歌词
        searchLyric() {
            let that = this
            axios.get(`/api/lyric?id=${this.playData.id}`).then(res => {
                if (res.data.status === 100000) {
                    let data = res.data.data
                    if (data) {
                        let arr = data.split('\n')
                        let result = []
                        // 分割成歌词数组
                        arr.forEach(item => {
                            // 分割时间符
                            let index = item.match(']')
                            if (index) {
                                index = index.index
                                let content = item.slice(index + 1)
                                let time = item.slice(1, index)
                                let timeArr = time.split(':')
                                result.push([Number(timeArr[0]) * 60 + Number(timeArr[1]), content || ''])
                            }
                        })
                        // 不带时间分割的纯音乐判断
                        if (result.length === 0 && data.match('纯音乐') !== null) {
                            // 分割成歌词数组
                            arr.forEach((item, i) => {
                                // 分割时间符
                                let index = item.match(']')
                                if (index) {
                                    index = index.index
                                    let content = item.slice(index + 1)
                                    let time = item.slice(1, index)
                                    let timeArr = time.split(':')
                                    result.push([Number(timeArr[0]) * 60 + Number(timeArr[1]), content || ''])
                                }
                                else {
                                    result.push([(i + 1) / 3, item])
                                }
                            })
                        }
                        // 最后统一更改纯音乐歌词焦点到最后一句
                        if (result.length > 0 && result[result.length - 1][1].match('纯音乐') !== null) result[result.length - 1][0] = 0

                        let index = this.idFindIndex(1, this.playData.id)
                        this.playData.lyric = result
                        this.$set(that.playList[1][index], 'lyric', result)
                        this.savePlayList()
                    }
                }
            })
        },
        // 列表点击播放
        playSong(index) {
            this.playData = this.playList[this.listIndex][index]
            // 若封面和歌词不存在则请求
            this.playData.albumPic === undefined && this.searchDetail()
            this.playData.lyric === undefined && this.searchLyric()
            // 重置歌词动画
            this.lyric.top = this.lyricBoxHeight
            this.lyric.index = -1
            // 搜索列表点击，先判断是否在正在播放列表内，不在则添加
            if (this.listIndex === 0) {
                let isExist = this.playList[1].some(item => {
                    return item.id === this.playData.id
                })
                if (!isExist) {
                    this.playList[1].unshift(this.playData)
                    this.savePlayList()
                }
            }
            // 更改完曲目后加载
            this.$nextTick(function () {
                playerDom.load()
                this.playStatus = 1
            })
        },
        addSong(index) {
            let row = this.playList[0][index]
            let isExist = this.playList[1].some(item => {
                return item.id === row.id
            })
            if (!isExist) {
                this.playList[1].unshift(row)
                this.savePlayList()
                this.$toast('添加播放列表成功')
            } else {
                this.$toast('已经添加过了', 'warn')
            }
        },
        // 删除列表
        deleteSong(index) {
            if (this.playData.id && this.playData.id === this.playList[1][index].id) {
                playerDom.pause()
                playerDom.currentTime = 0
                this.playStatus = 0
                this.playData = {}
            }
            this.playList[1].splice(index, 1)
            this.$forceUpdate()
            this.savePlayList()
        },
        // 音频载入完成，可播放状态
        canPlay() {
            console.log('play', this.playStatus)
            if (this.playStatus === 1) {
                playerDom.play()
                document.title = `${this.playData.name} - ${this.playData.artists[0].name}`
            }
        },
        // 暂停事件
        playPause() {
            this.playStatus = 2
        },
        // 播放完
        playDone() {
            console.log('done')
            playerDom.currentTime = 0
            this.playStatus = 1
            switch (this.player.mode) {
                // 顺序播放
                case 0:
                    this.playNext()
                    break;
                // 单曲循环
                case 1:
                    playerDom.play()
                    break;
                // 随机
                case 2:
                    let index = Math.floor(Math.random() * (this.playList[1].length - 1))
                    this.playData = this.playList[1][index]
                    break;
                // 单曲停止
                case 3:
                    this.playStatus = 0
                    break;
            }
        },
        // 播放失败
        playFail() {
            console.log('fail')
            if (this.playData.id) {
                let nowId = this.playData.id
                this.$toast('资源失效，自动播放下一首', 'error')
                this.playNext()
                this.$nextTick(() => {
                    // 删除播放失败那条
                    let index = this.idFindIndex(1, nowId)
                    this.playList[1].splice(index, 1)
                    this.savePlayList()
                })
            }
        },
        // 播放按键
        play() {
            if (this.playData.id) {
                if (this.playStatus !== 1) {
                    this.playStatus = 1
                    this.screenTip('开始播放')
                    playerDom.play()
                } else {
                    this.playStatus = 2
                    this.screenTip('已暂停')
                    playerDom.pause()
                }
            }
        },
        // 停止按键
        stop() {
            this.playStatus = 0
            this.playerCurrentTime = 0
            this.playerCurrentTimePoint = 0
            playerDom.currentTime = 0
            playerDom.pause()
            this.screenTip('已停止')
        },
        // 上一曲
        playPrev() {
            if (this.playList[1].length >= 1 && this.playData.id) {
                // 遍历找到当前播放的id然后播放上一条
                let index = this.idFindIndex(1, this.playData.id)
                let next = index - 1
                if (next < 0) next = this.playList[1].length - 1
                this.playData = this.playList[1][next]
                this.playData.lyric === undefined && this.searchLyric()
                // 未在播放状态则播放
                if (this.playStatus !== 1) {
                    this.playStatus = 1
                    playerDom.play()
                }
            }
        },
        // 下一曲
        playNext() {
            if (this.playList[1].length >= 1 && this.playData.id) {
                // 遍历找到当前播放的id然后播放下一条
                let index = this.idFindIndex(1, this.playData.id)
                let next = index + 1
                if (next > this.playList[1].length - 1) next = 0
                this.playData = this.playList[1][next]
                this.playData.lyric === undefined && this.searchLyric()
                // 未在播放状态则播放
                if (this.playStatus !== 1) {
                    this.playStatus = 1
                    playerDom.play()
                }
            }
        },
        // 播放条事件
        playingTime() {
            if (!timer1) timer1 = setTimeout(() => {
                this.playerCurrentTime = playerDom.currentTime
                timer1 = null
            }, 100)
            if (!timer1Point && !this.durationDraging) timer1Point = setTimeout(() => {
                this.playerCurrentTimePoint = playerDom.currentTime
                timer1Point = null
            }, 1000)
        },
        // 点击上一曲
        clickPlayPrev() {
            // 随机
            if (this.player.mode === 2) {
                let index = Math.floor(Math.random() * (this.playList[1].length - 1))
                this.playData = this.playList[1][index]
                playerDom.play()
            } else {
                this.playPrev()
            }
            this.screenTip('播放上一曲')
        },
        // 点击下一曲
        clickPlayNext() {
            // 随机
            if (this.player.mode === 2) {
                let index = Math.floor(Math.random() * (this.playList[1].length - 1))
                this.playData = this.playList[1][index]
                playerDom.play()
            } else {
                this.playNext()
            }
            this.screenTip('播放下一曲')
        },
        // 调节音量
        changeVolume(e) {
            playerDom.volume = e.target.value / 100
            this.savePlayer()
        },
        // 调节进度
        changeRate(e) {
            if (this.playData.id) {
                playerDom.currentTime = e.target.value
                this.screenTip('跳转 ' + this.calcDuration(e.target.value))
                if (playerDom.paused) {
                    playerDom.play()
                    this.playStatus = 1
                }
            }
        },
        // 调节进度开始
        durationDragStart(e) {
            this.durationDraging = true
            clearTimeout(timer1Point)
            timer1Point = null
        },
        // 调节进度结束
        durationDragEnd(e) {
            this.durationDraging = false
        },
        // 列表tab切换
        changeList(index) {
            this.listIndex = index
            const listTitle = document.querySelectorAll('.tab>li')
            const width = listTitle[index].offsetWidth
            tabActiveDom.style.left = listTitle[index].offsetLeft - width * 0.1 + 'px'
            tabActiveDom.style.width = width * 1.2 + 'px'
        },
        // 切换播放模式
        changeMode() {
            let mode = this.player.mode + 1
            if (mode > 3) mode = 0
            this.player.mode = mode
            // 显示屏提示
            let text = ['顺序播放', '单曲循环', '随机播放', '单曲停止'][mode]
            this.screenTip(text)
            this.savePlayer()
        },
        // 显示屏提示
        screenTip(text) {
            let that = this
            this.playerScreenText = text
            timer2 && clearTimeout(timer2)
            timer2 = setTimeout(() => {
                that.playerScreenText = ''
            }, 1000)
        },
        // 保存正在播放列表
        savePlayList() {
            localStorage.setItem('playList', JSON.stringify(this.playList[1]))
        },
        // 保存播放器设置
        savePlayer() {
            localStorage.setItem('player', JSON.stringify(this.player))
        },
        // 秒换算分秒
        calcDuration(time) {
            let m = Math.floor(time / 60)
            m = m < 10 ? ('0' + m) : m
            let s = Math.floor(time % 60)
            s = s < 10 ? ('0' + s) : s
            return `${m}:${s}`
        },
        // 根据id查找index
        idFindIndex(listIndex, id) {
            for (let i = 0; i < this.playList[listIndex].length; i++) {
                if (this.playList[listIndex][i].id === id) {
                    return i
                }
            }
        },
        // 开始拖动
        dragStart(e) {
            dragIndex = e.target.dataset.index
        },
        // 拖动到某一个地方
        dragEnter(e) {
            if (e.target.className === 'list-transition-item') {
                let end = e.target.dataset.index
                if (end && dragIndex && dragIndex !== end) {
                    let preArr = this.playList[this.listIndex]
                    let old = preArr[dragIndex]
                    preArr.splice(dragIndex, 1)
                    preArr.splice(end, 0, old)
                    this.$set(this.playList, this.listIndex, preArr)
                    dragIndex = end
                }
            }
        },
        // 结束拖动
        dragEnd() {
            dragIndex = null
            this.savePlayList()
        },
    },
    watch: {
        // 播放时间改变则滚动歌词
        playerCurrentTime: function (sec) {
            let list = this.playData.lyric
            // 歌词数组存在
            if (list) {
                let len = list.length
                // 数组有长度
                if (len > 0) {
                    let index = 0
                    // 倒序循环判断当前时间大于某一条，则滚动到这一条
                    for (let i = len - 1; i >= 0; i--) {
                        if (sec >= list[i][0] - 0.2) {
                            index = i
                            break
                        }
                    }
                    let dom = this.$refs['lyric-item-' + index]
                    this.lyric.top = 0 - (dom && dom[0] ? dom[0].offsetTop : 0) + this.lyricBoxHeight
                    this.lyric.index = index
                }
            }
        }
    }
}
</script>

<style lang="less" scoped>
@import url(../assets/css/index.less);
</style>

<style lang="less">
@import url(../assets/css/reset.css);
@import url(../assets/css/icon.css);

body {
    color: #bdc0c5;
    background-color: #333e43;
    min-width: 350px;
    overflow: hidden;
    font-family: STXihei, "PingFangTC-Light", "Open Sans", "PingFang SC",
        "Helvetica Neue", "Hiragino Sans GB", "Microsoft Yahei", sans-serif;
}
</style>