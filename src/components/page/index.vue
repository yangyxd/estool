<template>
    <div class="changePwd">
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-setting"></i> 系统管理
                </el-breadcrumb-item>
                <el-breadcrumb-item>查询索引 - {{index.index}}</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <div class="handle-box">
                <div class="bill-top">
                    <el-button @click="doAddData()" type="info" class="mr10">添加数据</el-button>
                    <el-select
                        v-model="selectField"
                        class="wp mr10 w4"
                        multiple
                        clearable
                        filterable
                        placeholder="选择字段">
                        <el-option v-for="(item, index) in fields" :key="'_opt_' + index" :label="`${item.name}`" :value="item.name">
                            <span>{{item.name}}</span><span class="desc">{{item.data.type}}</span>
                        </el-option>
                    </el-select>
                    <el-input v-model="query.key" class="w4 mr10" placeholder="输入关键字"></el-input>
                    <el-button type="primary" @click="doQuery()">查询</el-button>
                    <el-button @click="doQueryAll()">全部数据</el-button>
                    <el-button @click="doClearAll()" type="danger" icon="el-icon-lx-delete" title="清空数据"></el-button>
                    <el-checkbox v-model="query.expandedHeader" label="展开对象" class="mr8 ml8"></el-checkbox>
                </div>
                <el-table
                    :data="items"
                    :render-header="labelHead"
                    border
                    class="table"
                    v-loading="loading"
                    ref="hitsTable"
                    height="calc(100vh - 350px)"
                    header-cell-class-name="table-header"
                >
                    <el-table-column label="操作" width="130" align="center">
                        <template slot-scope="scope">
                            <el-button
                                    type="text"
                                    icon="el-icon-lx-text"
                                    @click.stop="doAddData(scope.row)"
                            >编辑</el-button>
                            <el-button
                                type="text"
                                icon="el-icon-delete"
                                class="red"
                                @click.stop="doDelete(scope.$index, scope.row)"
                            >删除</el-button>
                        </template>
                    </el-table-column>
                    <!-- <el-table-column prop="_index" label="索引" min-width="50" class-name="column-no-wrap"></el-table-column> -->
                    <el-table-column prop="_type" label="类型" min-width="50"></el-table-column>
                    <el-table-column prop="_id" label="ID" min-width="80" class-name="column-no-wrap"></el-table-column>
                    <el-table-column prop="_score" label="分数" min-width="50"></el-table-column>
                    <el-table-column :label="item" v-for="(item) in header" :key="item" class-name="column-no-wrap">
                        <template slot-scope="scope">
                            <span v-html="getColumnText(scope.row._source, scope.row.highlight, item)"></span>
                        </template>
                    </el-table-column>
                </el-table>
                <div class="pagination">
                    <el-pagination
                        background
                        layout="total, sizes, prev, pager, next, jumper"
                        :current-page="query.pageindex"
                        :page-sizes="[10, 20, 50, 100, 200]"
                        :page-size="query.pagesize"
                        :total="count"
                        @size-change="handleSizeChange"
                        @current-change="handlePageChange"
                    ></el-pagination>
                </div>
            </div>
        </div>


        <!-- 添加弹出框 -->
        <el-dialog :visible.sync="edtAddDlgisible" :title="index.index + ' - 添加数据'"  width="68%">
            <el-container style="max-height: calc(100vh - 400px); ">
                <el-main>
                <el-form ref="index.add" :model="form">
                    <div style="margin-bottom: 8px">
                        <div style="margin-bottom: 4px"><span class="title red">ID</span></div>
                        <el-input v-model="form.id" placeholder="请输入自定义ID，留空则会自动生成"></el-input>
                    </div>
                    <div v-for="(item, i) in fields" :key="i" style="margin-bottom: 8px">
                        <div style="margin-bottom: 4px"><span class="title">{{item.name}}</span>
                        <span class="desc"><span class="grey">数据类型：</span>{{item.data.type}}</span></div>
                        <el-input v-model="form.data[item.name]" placeholder="请输入值"></el-input>
                    </div>
                </el-form>
            </el-main></el-container>
            <span slot="footer" class="dialog-footer">
                <div style="float: left">
                    <el-checkbox v-model="form.closeDlg" label="操作成功后关闭" class="mr8 ml8"></el-checkbox>
                </div>
                <el-button @click="doInsertData(1)">查看请求语句</el-button>
                <el-button @click="edtAddDlgisible = false">取 消</el-button>
                <el-button type="primary" @click="doInsertData()">确 定</el-button>
            </span>
        </el-dialog>

    </div>
</template>

<script>
    import field  from '../common/Field';
    import mappingClass  from '../common/MappingClass';
    export default {
        name: 'index',
        components: { field, mappingClass },
        data() {
            return {
                loading: false,
                query: {
                    key: undefined,
                    pageindex: 1,
                    pagesize: 100,
                    expandedHeader: false,
                },
                form: {data: {}},
                index: {},
                items: [],
                header: [],
                fields: [],
                selectField: [],
                count: 0,
                lastCommand: undefined,
                lastApi: undefined,
                edtAddDlgisible: false,
            }
        },
        beforeRouteEnter (to, from, next) {
            let index = to.query.index;
            to.params.title = index;
            next();
        },
        created() {
            this.index = this.$route.query;
        },
        mounted() {
            this.loadFileds();
        },
        methods: {
            getColumnText(row, highlight, key) {
                if (highlight && highlight[key]) {
                    return highlight[key][0];
                }
                if (!row) return '';
                let i = key.indexOf('.');
                if (i < 0)
                    return row[key];
                let keys = key.split('.');
                for (let j=0; j < keys.length; j++) {
                    row = row[keys[j]];
                    if (!row) return '';
                }
                return row;
            },
            loadFileds() {
                this.$http.get("/" + this.index.index + "/_mappings").then(resp => {
                    console.log(resp);
                    let _src = resp[this.index.index].mappings;
                    let _fields = [];
                    this.initProperties(_fields, undefined, _src.properties);
                    this.fields = _fields;
                    this.updateHeader();
                });
            },
            initProperties(fields, key, properties) {
                if (!properties) return;
                for (var _key in properties) {
                    if (!_key) continue;
                    let _data = properties[_key];
                    if (_data.properties) {
                        this.initProperties(fields, key ? key + '.' + _key : _key, _data.properties);
                    } else {
                        fields.push({
                            name: key ? key + '.' + _key : _key,
                            data: _data
                        })
                    }
                }
            },
            doQuery() {
                let _cmd = {};
                if (this.query.key) {
                    // 单个关键词
                    let _field = this.selectField;
                    if (_field && _field.length > 0) {
                        if (_field.length == 1) {
                            // 查询单个字段
                            _cmd.query = {"match": {}};
                            _cmd.highlight = {"fields": {}};
                            _cmd.query.match[_field[0]] = this.query.key;
                            _cmd.highlight.fields[_field[0]] = {};
                        } else {
                            // 查询多个字段
                            _cmd.query = {"multi_match": {
                                "query": this.query.key,
                                "fields": [],
                            }};
                            _cmd.highlight = {"fields": {}};
                            _field.forEach((_v) => {
                                _cmd.query.multi_match.fields.push(_v);
                                _cmd.highlight.fields[_v] = {};
                            });
                        }
                    } else {
                        // 查询所有字段，但要区分，如查key是数字，则查所有，不是数字，只查非数字字段
                        let _isNumber = !isNaN(parseInt(this.query.key));
                        let _isBool = Boolean(this.query.key).toString() == this.query.key;

                        _cmd.query = {"multi_match": {
                            "query": this.query.key,
                            "fields": [],
                        }};
                        _cmd.highlight = {"fields": {}};
                        this.fields.forEach((_field) => {
                            let _type = _field.data.type;
                            let _ok = (_type == "string" || _type == "text" || _type == "keyword" || _type == "date" || _type == "ip");
                            if (!_ok && _isNumber)
                                _ok = _type == "integer" || _type == "long" || _type == "short"
                                    || _type == "byte" || _type == "double" || _type == "float"
                                    || _type == "half_float" || _type == "scaled_float";
                            if (!_ok && _isBool)
                                _ok = _type == "boolean";
                            if (_ok) {
                                _cmd.query.multi_match.fields.push(_field.name);
                                _cmd.highlight.fields[_field.name] = {};
                            }
                        });
                    }
                } else {
                    _cmd.query = {
                        "match_all": {}
                    }
                }
                this.getData("/" + this.index.index + "/_search", _cmd);
            },
            doQueryAll() {
                this.getData("/" + this.index.index + "/_search", {
                    "query": {
                        "match_all": {}
                    },
                });
            },
            getData(api, cmd) {
                let _cmd = cmd ? cmd : this.lastCommand;
                let _api = api ? api : this.lastApi;
                if (!_cmd || !_api) return;

                let _page = this.query.pageindex < 1 ? 1 : this.query.pageindex;
                let _pageSize = this.query.pagesize > 0 ? this.query.pagesize : 20;
                _cmd.from = (_page - 1) * _pageSize;
                _cmd.size = _pageSize;
                this.lastCommand = _cmd;

                this.loading = true;
                const loading = this.$loading({
                    lock: true,
                    text: 'Loading',
                    spinner: 'el-icon-loading',
                    background: 'rgba(0, 0, 0, 0.7)'
                });
                this.$http.post(_api, null, _cmd).then((resp) => {
                    this.count = resp.hits.total.value;
                    this.items = resp.hits.hits;
                    this.updateHeader();
                    this.loading = false;
                    loading.close();
                }).catch(() => {
                    this.loading = false;
                    loading.close();
                });
            },
            updateHeader() {
                this.header = [];
                let header = [];
                this.fields.forEach((field) => {
                    let i = field.name.indexOf('.');
                    if (i < 0) {
                        header.push(field.name);
                    } else {
                        if (this.query.expandedHeader)
                            header.push(field.name);
                        else {
                            let _key = field.name.substr(0, i);
                            if (header.indexOf(_key) < 0)
                                header.push(_key);
                        }
                    }
                });
                this.header = header;
                console.log(this.header);
            },
            labelHead(h,{column,index}) {
                //动态表头渲染
                return h('span',{class:'table-head',style:{width:'100%'}},[column.label]);
            },
            // 分页大小
            handleSizeChange(val) {
                this.$set(this.query, 'pagesize', val);
                this.getData();
            },
            // 分页导航
            handlePageChange(val) {
                this.$set(this.query, 'pageindex', val);
                this.getData();
            },
            // 删除
            doDelete(index, data) {
                this.$http.post("/" + this.index.index + "/_delete_by_query", null, {
                    "query": {
                        "term": {
                            "_id": data._id
                        }
                    }
                }).then((resp) => {
                    this.$message.info("删除成功");
                    this.items.splice(index, 1);
                    this.count--;
                });
            },
            // 清空数据
            doClearAll() {
                this.$confirm('是否确定清除此索引下所有数据？', '清空数据', {
                    type: 'warning',
                    dangerouslyUseHTMLString: true
                }).then(() => {
                    this.$http.post("/" + this.index.index + "/_delete_by_query", null, {
                        "query": {"match_all": {}}
                    }).then((resp) => {
                        this.$message.info("清除成功");
                        this.items = [];
                        this.count = 0;
                    });
                }).catch(() => {});
            },
            // 添加
            doAddData(src) {
                let _data = {data: {}, src: src, closeDlg: false};
                if (src != null) {
                    this.fields.forEach((_v) => {
                        _data.data[_v.name] = this.getColumnText(src._source, undefined, _v.name);
                    });
                    _data.id = src._id;
                    _data.closeDlg = true;
                }
                this.form = _data;
                this.edtAddDlgisible = true;
            },
            // 插入数据
            doInsertData(flag) {
                let api = "/" + this.index.index + "/_doc/" + (this.form.id ? this.form.id : '');

                let _data = {};
                for (var _key in this.form.data) {
                    if (!_key) continue;
                    let _value = this.form.data[_key];
                    let _keys = _key.split('.');
                    if (_keys.length == 1)
                        _data[_key] = _value;
                    else {
                        let _sub = _data;
                        for (let j = 0; j < _keys.length - 1; j++) {
                            let _v = _keys[j];
                            if (_sub[_v] == undefined)
                                _sub[_v] = {};
                            _sub = _sub[_v];
                        }
                        _sub[_keys[_keys.length - 1]] = _value;
                    }
                }

                if (flag == 1) {
                    this.$alert('<el-container style="max-height: calc(100vh - 400px); "><el-main>'+
                        '<span><b>请求地址: </b><br>POST '+api+'</span><br><br><pre style="height: 60vh; overflow: scroll;">' + JSON.stringify(_data, null, 2) + '</pre></el-main></el-container>',
                        '请求数据', {
                        dangerouslyUseHTMLString: true
                    }).then(() => {});
                    return;
                }

                const loading = this.$loading({
                    lock: true,
                    text: 'Saveing',
                    spinner: 'el-icon-loading',
                    background: 'rgba(0, 0, 0, 0.7)'
                });

                this.$http.post(api, null, _data).then((resp) => {
                    loading.close();
                    let _msg = this.form.src ? "修改成功" : "添加成功";
                    if (this.form.closeDlg) {
                        this.edtAddDlgisible = false;
                        this.$message.info(_msg + "，请重新查询查看结果");
                    } else {
                        this.form.id = undefined;
                        this.form.src = undefined;
                        this.$message.info(_msg);
                    }
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
.w4 {
    width: 300px;
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
.ml8{
    margin-left: 8px;
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
    margin-left: 12px;
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
.cell em {
    background: yellow;
    font-style: normal;
}
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
pre {outline: 1px solid #ccc; }
 .string { color: green; }
 .number { color: darkorange; }
 .boolean { color: blue; }
 .null { color: magenta; }
 .key { color: red; }
</style>