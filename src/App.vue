<template>
    <div id="app">
        <router-view></router-view>
    </div>
</template>
<script>
import bus from './components/common/bus';
export default {
    data() {
        return {
            sysConfig: undefined
        }
    },
    created() {
        this.loadSysConfig();
    },
    activated() {
        if (!this.sysConfig)
            this.loadUserData();
    },
    methods: {
        loadSysConfig() {
            config.sSiteTitle = "ElasticSearch 管理系统";
            config.sServiceHost = localStorage.getItem("conn");
            config.sUser = localStorage.getItem("user");
            config.sPwd = localStorage.getItem("pwd");
            console.log(config.sServiceHost);
            this.$const.sSiteTitle = config.sSiteTitle;
            document.title = config.sSiteTitle;
            this.$http.updateBaseUrl();
            this.$http.get(config.sServiceHost).then(resp => {
                config.cluster_name = resp.cluster_name;
                config.name = resp.name;
            });
            bus.$emit('titlechange', config.sSiteTitle);
        }
    }
}
</script>
<style>
    @import "./assets/css/main.css";
    @import "./assets/css/color-dark.css";     /*深色主题*/
    /*@import "./assets/css/theme-green/color-green.css";   浅绿色主题*/
</style>