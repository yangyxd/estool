<template>
    <div class="tags" v-if="showTags">
        <ul>
            <li class="tags-li" v-for="(item,index) in tagsList" :class="{'active': isActive(item.path)}" :key="index">
                <router-link :to="item.path" class="tags-li-title">
                    <i v-if="item.icon" :class="item.icon"></i>
                    {{item.title}}
                </router-link>
                <span v-if="!item.fixed" class="tags-li-icon" @click="closeTags(index)"><i class="el-icon-close"></i></span>
            </li>
        </ul>
        <div class="tags-close-box">
            <el-dropdown @command="handleTags">
                <i class="el-icon-arrow-down" style="width: 42px; height: 42px; line-height: 40px; cursor: pointer"></i>
                <el-dropdown-menu size="small" slot="dropdown">
                    <el-dropdown-item command="other">关闭其他</el-dropdown-item>
                    <el-dropdown-item command="all">关闭所有</el-dropdown-item>
                    <el-dropdown-item :command="index" :divided="index == 0" :disabled="item.path==$route.fullPath"
                                      v-for="(item,index) in tagsList" :key="'_i_' + index">{{item.title}}</el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
        </div>
    </div>
</template>

<script>
    import bus from './bus';
    export default {
        data() {
            return {
                tagsList: []
            }
        },
        methods: {
            isActive(path) {
                return path === this.$route.fullPath;
            },
            // 关闭单个标签
            closeTags(index) {
                const delItem = this.tagsList.splice(index, 1)[0];
                const item = this.tagsList[index] ? this.tagsList[index] : this.tagsList[index - 1];
                if (item) {
                    delItem.path === this.$route.fullPath && this.$router.push(item.path);
                }else{
                    this.$router.push('/');
                }
            },
            // 关闭全部标签
            closeAll(){
                this.tagsList = this.tagsList.filter(item => {
                    return item.fixed;
                });
                this.$router.push('/');
            },
            // 关闭其他标签
            closeOther(){
                const curItem = this.tagsList.filter(item => {
                    return item.path === this.$route.fullPath && item.fixed;
                });
                this.tagsList = curItem;
            },
            activeTag(index) {
                this.$router.push({path: this.tagsList[index].path, params: this.tagsList[index].params});
            },
            // 设置标签
            setTags(route){
                const isExist = this.tagsList.some(item => {
                    return item.path === route.fullPath;
                })
                if(!isExist){
                    if(this.tagsList.length >= 8){
                        this.tagsList.shift();
                    }
                    // console.log(route);
                    this.tagsList.push({
                        title: route.params.title ? route.params.title : route.meta.title,  // 此处默认优先读params中的title, 如果不存在, 则读meta中的title
                        fixed: route.meta.fixed,
                        icon: route.meta.icon,
                        path: route.fullPath,
                        params: route.params,
                        name: route.matched[1].components.default.name
                    })
                }
                // console.log("bus.emit('tags')");
                bus.$emit('tags', this.tagsList);
            },
            handleTags(command){
                command === 'other' ? this.closeOther() : (isNaN(Number(command)) ? this.closeAll() : this.activeTag(Number(command)));
            }
        },
        computed: {
            showTags() {
                return this.tagsList.length > 0;
            }
        },
        watch:{
            $route(newValue, oldValue){
                this.setTags(newValue);
            }
        },
        created(){
            this.setTags(this.$route);
            // 监听关闭当前页面的标签页
            bus.$on('close_current_tags', () => {
                for (let i = 0, len = this.tagsList.length; i < len; i++) {
                    const item = this.tagsList[i];
                    if(item.path === this.$route.fullPath){
                        if(i < len - 1){
                            this.$router.push({path: this.tagsList[i+1].path, params: this.tagsList[i+1].params});
                        }else if(i > 0){
                            this.$router.push({path: this.tagsList[i-1].path, params: this.tagsList[i-1].params});
                        }else{
                            this.$router.push('/');
                        }
                        this.tagsList.splice(i, 1);
                        break;
                    }
                }
            })
        }
    }

</script>


<style>
    .tags {
        position: relative;
        height: 42px;
        overflow: hidden;
        background: #fff;
        padding-right: 45px;
        box-shadow: 0 5px 10px #ddd;
        margin-bottom: 1px;
    }

    .tags ul {
        box-sizing: border-box;
        width: 100%;
        height: 100%;
    }

    .tags-li {
        float: left;
        display: inline;
        margin: 3px 5px 2px 3px;
        border-radius: 3px;
        font-size: 14px;
        overflow: hidden;
        cursor: pointer;
        height: 39px;
        line-height: 39px;
        border: 1px solid #e9eaec;
        background: #fff;
        padding: 0 5px 0 12px;
        vertical-align: middle;
        color: #666;
        -webkit-transition: all .3s ease-in;
        -moz-transition: all .3s ease-in;
        transition: all .3s ease-in;
    }

    .tags-li:not(.active):hover {
        background: #f8f8f8;
    }

    .tags-li.active {
        color: #fff;
    }

    .tags-li-title {
        float: left;
        max-width: 100px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        margin-right: 5px;
        color: #666;
    }

    .tags-li.active .tags-li-title {
        color: #fff;
    }

    .tags-close-box {
        position: absolute;
        right: 0;
        top: 0;
        box-sizing: border-box;
        padding-top: 1px;
        text-align: center;
        width: 42px;
        height: 42px;
        background: #fff;
        box-shadow: -3px 0 15px 3px rgba(0, 0, 0, .1);
        z-index: 10;

        .ex {
            width: 100%!important;
            height: 100%;
        }
    }

</style>
