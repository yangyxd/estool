import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
    // mode:'hash',  // history, hash
    routes: [
        {
            path: '/',
            redirect: '/main'
        },
        {
            path: '/',
            component: () => import(/* webpackChunkName: "home" */ '../components/common/Home.vue'),
            meta: { title: '首页' },
            children: [
                {
                    path: '/main',
                    component: () => import(/* webpackChunkName: "main" */ '../components/page/main.vue'),
                    meta: { title: '系统首页', fixed: true, icon: 'el-icon-lx-main' }
                },
                {
                    path: '/index',
                    component: () => import(/* webpackChunkName: "index" */ '../components/page/index.vue'),
                    meta: { title: '索引查询' }
                },
                {
                    path: '/404',
                    component: () => import(/* webpackChunkName: "404" */ '../components/page/404.vue'),
                    meta: { title: '404' }
                },
                {
                    path: '/403',
                    component: () => import(/* webpackChunkName: "403" */ '../components/page/403.vue'),
                    meta: { title: '403' }
                },
                {
                    path: '/icon',
                    component: () => import(/* webpackChunkName: "icon" */ '../components/page/Icon.vue'),
                    meta: { title: '自定义图标' }
                },
            ]
        },
        {
            path: '*',
            redirect: '/404'
        }
    ]
});
