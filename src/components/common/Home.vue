<template>
    <div class="wrapper">
        <v-head></v-head>
        <v-sidebar></v-sidebar>
        <div class="content-box" :class="{'content-collapse':collapse}">
            <v-tags></v-tags>
            <!--                <transition name="move" mode="out-in">-->
            <!--                    <keep-alive :include="tagsList">-->
            <!--                        <router-view :key="key"></router-view>-->
            <!--                    </keep-alive>-->
            <!--                </transition>-->
            <div class="content">
                <keep-alive :include="tagsList">
                    <router-view :key="key"></router-view>
                </keep-alive>
                <el-backtop target=".content"></el-backtop>
            </div>
        </div>
    </div>
</template>

<script>
import vHead from './Header.vue';
import vSidebar from './Sidebar.vue';
import vTags from './Tags.vue';
import bus from './bus';
export default {
    data() {
        return {
            tagsList: [],
            collapse: config.sCollapse
        };
    },
    components: {
        vHead,
        vSidebar,
        vTags
    },
    computed: {
        key() {
            return this.$route.fullPath
        }
    },
    created() {
        console.log('home created. init();')
        this.init();
    },
    mounted() {
    },
    methods: {
        init() {
            try {
                bus.$on('collapse-content', msg => {
                    this.collapse = msg;
                });

                // 只有在标签页列表里的页面才使用keep-alive，即关闭标签之后就不保存到内存中了。
                bus.$on('tags', msg => {
                    // console.log("bus.on('tags')");
                    let arr = [];
                    for (let i = 0, len = msg.length; i < len; i++) {
                        msg[i].name && arr.push(msg[i].name);
                    }
                    this.tagsList = arr;
                });
            } catch (e) {}
        }
    }
};
</script>
