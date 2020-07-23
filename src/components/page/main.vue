<template>
    <div class="changePwd">
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-setting"></i> 系统管理
                </el-breadcrumb-item>
                <el-breadcrumb-item>首页</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <div class="handle-box">
                <div class="bill-top">
                    <el-button type="primary" @click="onSubmit">保存修改</el-button>
                    <el-button @click="onTest" :loading="loading">测试连接</el-button>
                </div>
                <el-form ref="form" :model="form" label-width="85px" inline label-position="left" class="handle-box-form">
                    <el-form-item label="连接URL">
                        <el-input v-model="form.connection" maxlength="5000" placeholder="输入 ElasticSearch 服务器连接地址" class="handle-input mr10"></el-input>
                    </el-form-item>
                    <el-form-item label="服务名称">
                        <el-input v-model="form.name" readonly class="handle-input mr10 blue"></el-input>
                    </el-form-item>
                    <el-form-item label="集群名称">
                        <el-input v-model="form.connName" readonly class="handle-input mr10 blue"></el-input>
                    </el-form-item>
                    <el-form-item label="集群ID">
                        <el-input v-model="form.cluster_uuid" readonly class="handle-input mr10 blue"></el-input>
                    </el-form-item>
                </el-form>
                <div style="display: inline-flex">
                    <h3><span style="margin-right: 20px">索引 ({{indexs.length}})</span></h3>
                    <el-button type="text"
                            icon="el-icon-refresh"
                            class="handle-del mr10"
                            @click="doRefresh"
                    >刷新</el-button>
                    <el-button type="text"
                            icon="el-icon-plus"
                            class="handle-del mr10"
                            @click="doAddIndex"
                    >添加索引</el-button>
                </div>
                <el-row :gutter="12">
                    <el-col :span="12" v-for="(item, index) in indexs" :key="index" >
                    <el-card class="box-card" shadow="hover">
                        <div slot="header" class="clearfix no-wrap nopadding">
                            <i class="el-icon-s-opportunity" :style="'margin-right: 6px; padding: 2px; border-radius: 3px; background: #ccc; color:' + (item.health == 'green' ? '#2da33e' : item.health)"></i>
                            <span><b>{{item.index}}</b></span>
                            <div style="float: right;">
                                <el-button style="padding: 3px 3px; margin-left: 8px;" type="danger" @click="doDeleteIndex(item)">删除</el-button>
                                <el-button style="padding: 3px 3px; margin-left: 8px;" type="info" @click="doEditIndex(item)">编辑</el-button>
                                <el-button style="padding: 3px 3px; margin-left: 8px;" type="info" @click="doEditIndexAlias(item)">别名</el-button>
                                <el-button style="padding: 3px 3px; margin-left: 8px;" type="warning" @click="doEditIndexMappings(item)">类型映射</el-button>
                                <el-button style="padding: 3px 3px; margin-left: 8px;" type="info" @click="doViewIndex(item)">查看数据</el-button>
                            </div>
                        </div>
                        <div class="text item">状态：<span>{{item.status}}</span></div>
                        <div class="text item no-wrap">描述：<span class="grey">{{getHealthDesc(item)}}</span></div>
                        <div class="text item">分片数量：<span>{{item.pri}}</span></div>
                        <div class="text item">副本数量：<span>{{item.rep}}</span></div>
                        <div class="text item">文档数量：<span>{{item['docs.count']}}</span></div>
                        <div class="text item">已删除文档数量：<span>{{item['docs.deleted']}}</span></div>
                        <div class="text item">总存储空间：<span>{{item['store.size']}}</span></div>
                        <div class="text item">索引存储空间：<span>{{item['pri.store.size']}}</span></div>
                    </el-card>
                    </el-col>
                </el-row>
            </div>
        </div>


        <!-- 添加弹出框 -->
        <el-dialog :title="newform.edit ? '编辑索引' : '添加索引'" :visible.sync="addIndexVisible" :width="newform.edit ? '450px' : '80%'">
            <el-form ref="newform" :model="newform" label-width="85px">
                <el-form-item label="* 索引名称">
                    <el-input v-model="newform.name" maxlength="255" placeholder='输入索引名称（不超过255个字符）' :disabled="newform.edit" show-word-limit></el-input>
                    <ul style="margin-top: 12px; margin-left: 16px" v-if="!newform.edit">
                    <li class="hint-txt">索引受文件系统的限制。仅可能为小写字母，不能下划线开头</li>
                    <li class="hint-txt">不能包括 , /, *, ?, ", &gt;, &lt;, |, 空格, 逗号, #</li>
                    <li class="hint-txt">不能以这些字符 -, _, + 开头</li>
                    <li class="hint-txt">不能包括 . 或 …</li>
                    </ul>
                </el-form-item>
                <el-form-item label="* 分片数">
                    <el-input v-model="newform.number_of_shards" :disabled="newform.edit"></el-input>
                </el-form-item>
                <el-form-item label="* 副本数">
                    <el-input v-model="newform.number_of_replicas"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addIndexVisible = false">取 消</el-button>
                <el-button type="primary" @click="doCreateIndex(newform.item)">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 类型映射弹出框 -->
        <el-dialog :visible.sync="edtMappingsVisible" :title="mappings.index + ' - 字段映射 (mapping)'"  width="65%">
            <el-card shadow="never">
                <el-form ref="mappings.mappings" :model="mappings.mappings" label-width="80px" label-position="left">
                    <el-form-item label="动态映射:">
                        <mapping-class :mapClass="mappings.mappings"></mapping-class>
                    </el-form-item>
                    <el-form-item label="属性:">
                        <field :fieldData="mappings.mappings" @onAddChange="doAddMappingsField"></field>
                    </el-form-item>
                </el-form>
            </el-card>
            <span slot="footer" class="dialog-footer">
                <el-button @click="edtMappingsVisible = false">取 消</el-button>
                <el-button type="primary" @click="doSaveMappings()">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 别名管理弹出框 -->
        <el-dialog :visible.sync="edtAliasesVisible" :title="alias.index + ' - 别名管理 (aliases)'" width="50%">
            <el-form ref="alias" :model="mappings.mappings" label-width="80px" label-position="left">
                <el-tag
                    v-for="tag in alias.data"
                    :key="tag"
                    closable
                    size="medium"
                    class="el-tag-mh"
                    :disable-transitions="false"
                    @close="doDeleteAlias(tag)">
                    {{tag.name}}
                </el-tag>
                <el-input
                    class="input-new-alias"
                    v-if="alias.inputVisible"
                    v-model="alias.inputValue"
                    ref="saveAliasInput"
                    size="small"
                    placeholder="新别名"
                    @keyup.enter.native="doAddAlias"
                    ></el-input>
                <el-button v-else class="button-new-alias" size="small" @click="showAliasInput">+ 新别名</el-button>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="edtAliasesVisible = false">完  成</el-button>
            </span>
        </el-dialog>

    </div>
</template>

<script>
    import field  from '../common/Field';
    import mappingClass  from '../common/MappingClass';
    export default {
        name: 'main',
        components: { field, mappingClass },
        data() {
            return {
                loading: false,
                form: {
                    connection: config.sServiceHost,
                    connName: undefined,
                },
                newform: {},
                mappings: {
                    mappings: {}
                },
                alias: {},
                indexs: [],
                dynamicTypes: [
                    {name: "true (默认值，动态添加字段)", value: "true"},
                    {name: "false (忽略新字段)", value: "false"},
                    {name: "strict (陌生字段抛出异常)", value: "strict"},
                ],
                addIndexVisible: false,
                edtMappingsVisible: false,
                edtAliasesVisible: false,
            }
        },
        created() {
            this.doRefresh();
        },
        methods: {
            doRefresh() {
                if (!this.check()) return;
                this.loading = true;
                this.form.connName = undefined;
                this.$http.get('/').then(resp => {
                    this.form.connName = resp.cluster_name;
                    this.form.name = resp.name;
                    this.form.cluster_uuid = resp.cluster_uuid;
                    config.cluster_name = resp.cluster_name;
                    config.name = resp.name;
                    this.loading = false;
                }).catch(() => this.loading = false);
                this.getIndexs();
            },
            doViewIndex(item) {
                this.$router.push({path: 'index', query: item});
            },
            showAliasInput() {
                this.alias.inputVisible = true;
                this.$forceUpdate();
                this.$nextTick(_ => {
                    this.$refs.saveAliasInput.$refs.input.focus();
                });
            },
            doAddAlias() {
                this.$http.post("/_aliases", null, {
                    actions: [
                        {
                            add: {
                                index: this.alias.index,
                                alias: this.alias.inputValue,
                            }
                        }
                    ]
                }).then((resp) => {
                    this.alias.data.push({
                        name: this.alias.inputValue,
                        value: {}
                    });
                    this.alias.inputVisible = false;
                    this.alias.inputValue = undefined;
                });
            },
            doDeleteAlias(item) {
                this.$http.post("/_aliases", null, {
                    actions: [
                        {
                            remove: {
                                index: this.alias.index,
                                alias: item.name,
                            }
                        }
                    ]
                }).then((resp) => {
                    let index = this.alias.data.indexOf(item);
                    if (index >= 0)
                        this.alias.data.splice(index, 1);
                });
            },
            doAddIndex() {
                // 添加索引
                this.newform = {
                    number_of_shards: 5,
                    number_of_replicas: 1,
                };
                this.addIndexVisible = true;
            },
            doCreateIndex(item) {
                if (this.newform.edit) {
                    if (!this.newform.number_of_replicas) {
                        this.$message.error("请输入副本数");
                        return;
                    }
                    this.$http.put("/" + this.newform.name + '/_settings', null, {
                        number_of_replicas: this.newform.number_of_replicas
                    }).then(resp => {
                        if (resp.acknowledged == true) {
                            item.rep = this.newform.number_of_replicas;
                            this.addIndexVisible = false;
                        }
                    });
                    return;
                }
                if (!this.check()) return;
                if (!this.newform.name) {
                    this.$message.error("请输入索引名称");
                    return;
                }
                if (!this.newform.number_of_shards) {
                    this.$message.error("请输入分片数");
                    return;
                }
                if (!this.newform.number_of_replicas) {
                    this.$message.error("请输入副本数");
                    return;
                }
                this.$http.put("/" + this.newform.name, null, {
                    settings: {
                        number_of_shards: this.newform.number_of_shards,
                        number_of_replicas: this.newform.number_of_replicas
                    }
                }).then(resp => {
                    if (resp.acknowledged == true) {
                        this.doRefresh();
                        this.addIndexVisible = false;
                    }
                });
            },
            doEditIndexMappings(item) {
                if (!this.check()) return;
                const loading = this.$loading({
                    lock: true,
                    text: 'Loading',
                    spinner: 'el-icon-loading',
                    background: 'rgba(0, 0, 0, 0.7)'
                });
                console.log('2');
                this.mappings = {
                    item: item,
                    index: item.index,
                    mappings: {},
                    src: undefined,
                    newClass: {}
                };
                this.$http.get("/" + item.index + "/_mappings").then(resp => {
                    loading.close();
                    this.mappings.src = resp[item.index].mappings;
                    let _src = this.mappings.src;
                    let _item = {};
                    _item.dynamic = _src.dynamic;
                    _item.items = [];
                    console.log('2');
                    if (_src.properties != undefined) {
                        for (var _p in _src.properties) {
                            if (!_p) continue;
                            let _field = _src.properties[_p];
                            _item.items.push({
                                name: _p,
                                old: true,
                                data: _field,
                            });
                        }
                    }
                    this.mappings.mappings = _item;
                    console.log(JSON.stringify(this.mappings));
                    this.edtMappingsVisible = true;
                }).catch(() => loading.close());
            },
            doAddMappingsField(item, newField) {
                if (item.items == undefined || item.items == null)
                    item.items = [];
                item.items.push({
                    name: newField.name,
                    data: {

                    }
                });
            },
            // doDeleteMappingItem(key) {
            //     console.log("delete");
            //     delete this.mappings.mappings[key];
            //     this.$forceUpdate();
            // },
            doSaveMappings() {
                // 保存映射数据
                let _item = {
                    properties: {}
                };
                let _fileds = [];
                let item = this.mappings.mappings;
                if (item.dynamic != undefined)
                    _item.dynamic = item.dynamic;
                if (item.items) {
                    item.items.forEach((v)=> {
                        if (v == undefined || !v.name || !v.data || !v.data.type) return;
                        if (_fileds.indexOf(v.name) >= 0) {
                            this.$message.error("属性名称【" + v.name + "】冲突");
                            return;
                        }
                        _fileds.push(v.name);
                        let _field = {
                            type: v.data.type
                        };
                        if (v.data.null_value != undefined) _field.null_value = v.data.null_value;
                        if (v.data.boost != undefined) _field.boost = v.data.boost;
                        if (v.data.scaling_factor != undefined) _field.scaling_factor = v.data.scaling_factor;
                        if (v.data.format != undefined) _field.format = v.data.format;
                        if (v.data.index != undefined) _field.index = v.data.index;
                        if (v.data.index_options != undefined) _field.index_options = v.data.index_options;
                        if (v.data.doc_values != undefined) _field.doc_values = v.data.doc_values;
                        _item.properties[v.name] = _field;
                    });
                }

                const loading = this.$loading({
                    lock: true,
                    text: 'Loading',
                    spinner: 'el-icon-loading',
                    background: 'rgba(0, 0, 0, 0.7)'
                });
                this.$http.put("/" + this.mappings.item.index + "/_mapping", null, _item).then((resp) => {
                    loading.close();
                    console.log(resp);
                    this.edtMappingsVisible = false;
                    this.$message.info("保存成功");
                }).catch(() => loading.close());
            },
            onSubmit() {
                if (!this.check()) return;
                localStorage.setItem("conn", this.form.connection);
                config.sServiceHost = this.form.connection;
                this.$http.updateBaseUrl();
                this.doRefresh();
            },
            onTest() {
                if (!this.check()) return;
                this.loading = true;
                this.form.connName = undefined;
                this.$http.getEx(this.form.connection).then(resp => {
                    this.loading = false;
                    this.form.connName = resp.cluster_name;
                    this.form.name = resp.name;
                    this.form.cluster_uuid = resp.cluster_uuid;
                    config.cluster_name = resp.cluster_name;
                    config.name = resp.name;
                }).catch(() => this.loading = false);
            },
            check() {
                if (!this.form.connection) {
                    this.$message.error("请输入 ElasticSearch 服务器连接地址");
                    return false;
                }
                return true;
            },
            getIndexs() {
                if (!this.check()) return;
                this.$http.get("/_cat/indices?format=json").then(resp => {
                    this.indexs = resp == null ? [] : resp;
                });
            },
            getHealthDesc(item) {
                if (item.health == "yellow")
                    return "[可用] 所有数据是可以获取的，但是一些复制品还没有被分配(集群功能齐全)";
                if (item.health == "green")
                    return "[良好] 一切运行正常(集群功能齐全)";
                if (item.health == "red")
                    return "[异常] 数据缺失(集群部分功能不可用)";
                return '';
            },
            doDeleteIndex(item) {
                this.$confirm(`删除索引【<b>${item.index}</b>】,` + '是否确定？', '删除索引', {
                    type: 'warning',
                    dangerouslyUseHTMLString: true
                }).then(() => {
                    this.$http.delete('/' + item.index + '?pretty').then(resp => {
                        this.doRefresh();
                    });
                }).catch(() => {});
            },
            doEditIndex(item) {
                // 添加索引
                this.newform = {
                    name: item.index,
                    edit: true,
                    item: item,
                    number_of_shards: item.pri,
                    number_of_replicas: item.rep,
                };
                this.addIndexVisible = true;
            },
            doEditIndexAlias(item) {
                if (!this.check()) return;
                const loading = this.$loading({
                    lock: true,
                    text: 'Loading',
                    spinner: 'el-icon-loading',
                    background: 'rgba(0, 0, 0, 0.7)'
                });
                this.alias = {
                    item: item,
                    index: item.index,
                    data: [],
                };
                this.$http.get("/" + item.index + "/_alias").then(resp => {
                    loading.close();
                    let _aliases = resp[item.index].aliases;
                    for (var _key in _aliases) {
                        this.alias.data.push({
                            name: _key,
                            value: _aliases[_key]
                        });
                    }
                    this.edtAliasesVisible = true;
                }).catch(() => loading.close());
            }
        }
    };
</script>

<style scoped>
.w1 {
    width: 180px;
}
.w2 {
    width: 85px !important;
}
.w3 {
    width: 120px;
}
.wp {
    margin-right: 8px;
    display: inline-block;
}
.title {
    font-weight: bold;
}
h3 {
    display: block;
    margin-top: 1em;
    margin-bottom: 1em;
}
.handle-box {
    margin-bottom: 16px;
}
.handle-select {
    width: 130px;
}

.handle-input {
    width: 200px;
    display: inline-block;
}
.table {
    width: 100%;
    font-size: 14px;
}
.table-slot {
    width: 450px;
    font-size: 14px;
}
.red {
    color: #ff0000;
}
.mr10 {
    margin-right: 10px;
}
.table-td-thumb {
    display: block;
    margin: auto;
    width: 40px;
    height: 40px;
}
.desc {
    color: #2d8cf0;
    margin-right: 12px;
}

.el-tag-mh {
    margin-left: 10px;
    margin-bottom: 8px;
    line-height: 32px!important;
    height: 32px;
}
.button-new-alias {
    margin-left: 10px;
    height: 32px;
    line-height: 32px;
    padding-top: 0;
    padding-bottom: 0;
}
.input-new-alias {
    width: 90px;
    margin-left: 10px;
    margin-top: 0px!important;
    margin-bottom: 8px!important;
    vertical-align: bottom;
    line-height: 32px;
}

</style>

<style>
.text {
    font-size: 14px;
}
.item {
    margin-bottom: 8px;
}
.item span {
    margin-left: 4px;
    color: #999;
}
.box-card {
    margin-right: 8px;
    margin-bottom: 16px;
  }
.blue .el-input__inner {
    color: #3300FF!important;
    background-color: #e6ffe5;
    cursor: default!important;
}

.weight .el-form-item  {
    width: 113px !important;
}

.weight .el-form-item__content {
    width: 113px !important;
}

.handle-box-form .realTimeWeight label {
    width: 80px;
}

.handle-dlg-box-form .realTimeWeight label {
    width: 80px;
}

.realTimeWeight input {
    font-size: 36px;
    padding: 30px;
    background-color: #1f2f3d;
    color: #85ce61;
}

.realTimeWeight .el-form-item {
    width: 100% !important;
}

.realTimeWeight .el-form-item__content {
    width: 100%;
}

.pb20 {
    padding-bottom: 20px;
}

.project-table-expand {
    font-size: 0;
    margin-bottom: 12px;
}

.project-table-expand label {
    width: 90px;
    color: #99a9bf !important;
}

.projectView .container .badge {
    width: calc(100% - 55px);
}

.projectView .container .el-badge__content {
    padding: 4px 12px!important;
    font-size: 12pt;
    box-shadow: 3px 3px 8px #666;
    border: 1px solid #f56c6c;
    border-radius: 25px;
}
.el-card__header {
    background: #fafbfc;
    padding: 0px 9px 0px 20px!important;
    line-height: 40px;
}

</style>