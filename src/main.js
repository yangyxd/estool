import Vue from 'vue';
import App from './App.vue';
import router from './router';
import ElementUI from 'element-ui';
import VueI18n from 'vue-i18n';
import { messages } from './components/common/i18n';
import 'element-ui/lib/theme-chalk/index.css'; // 默认主题
//import './assets/css/theme-green/index.css'; // 浅绿色主题
import './assets/css/icon.css';
import './components/common/directives';
import 'babel-polyfill';
import request from './utils/request';
import moment from "miment";
// import eCharts from 'echarts';
import _ from 'lodash';
import plugin from './api/plugin';
import _const from './utils/consts';

Vue.config.productionTip = false;
Vue.use(VueI18n);
Vue.use(ElementUI, {
    size: 'small'
});
const i18n = new VueI18n({
    locale: 'zh',
    messages
});

Vue.prototype.$const = _const;
Vue.prototype.$http = request;
// Vue.prototype.$echarts = eCharts;
Vue.prototype.$moment = moment;  // 其实是 miment
Vue.prototype._ = _;

Vue.use(plugin);

new Vue({
    router,
    i18n,
    render: h => h(App)
}).$mount('#app');

