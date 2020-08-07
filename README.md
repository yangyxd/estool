# ElasticSearch 管理系统 V1.0

基于 Vue + Element UI 的 ElasticSearch 管理系统。
Elasticsearch management tool based on Vue + element.

## 为什么会有它？

首先这是本人学习es和vue的一个沉淀， 其次是没看到好用的可视化索引类型映射管理和数据文档CURD工具。

还有没有其它原因？我想想，我也不知道，我是谁？我在干什么？

## 主要功能

* 多ES服务一键切换
* 支持ES安全认证
* 支持跨域配置 （vue.config.js 文件中修改 module.exports 下 devServer 配置）
* 创建索引
* 修改索引副本数
* 删除索引
* 别名管理
* 可视化类型映射管理(mapping)
* 基础查询
* 可视化添加数据
* 删除数据
* 清空数据

## 安装步骤

```angular2
npm install         // 安装项目依赖，等待安装完成之后，安装失败可用 cnpm 或 yarn

// 执行构建命令，生成的dist文件夹放在服务器下即可访问
npm run build

// 开启服务器，浏览器访问 http://localhost:8080
npm run serve
或
npm run dev

```


## 其他注意事项

## 根仓库换源

```angular2

// 淘宝仓库
npm config set registry https://registry.npm.taobao.org/

// 官方仓库
npm config set registry http://www.npmjs.org

```

## License

[MIT](https://github.com/lin-xin/vue-manage-system/blob/master/LICENSE)
