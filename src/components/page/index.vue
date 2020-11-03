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
                    <el-button @click="doAddData()" type="info" >添加数据</el-button>
                    <el-button @click="doQueryID()" title="将搜索关键字作为文档ID来查询">ID查询</el-button>
                    <el-button @click="doRefresh()" class="mr10" icon="el-icon-lx-refresh"></el-button>
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
                    <el-input v-model="query.key" class="w4 mr10" placeholder="输入关键字" clearable></el-input>
                    <el-button type="primary" @click="doQuery()">查询</el-button>
                    <el-button type="success" @click="doQueryAll()" class="mr10">全部数据</el-button>
                    <el-button @click="doQuery(true, true)" type="danger" icon="el-icon-lx-delete" title="删除全部符合条件的数据">删除数据</el-button>
                    <el-button @click="doClearAll()" type="danger" icon="el-icon-lx-delete" class="mr10">清空数据</el-button>
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
                        :page-sizes="[1, 10, 20, 50, 100, 200, 500]"
                        :page-size="query.pagesize"
                        :total="count"
                        @size-change="handleSizeChange"
                        @current-change="handlePageChange"
                    ></el-pagination>
                </div>
            </div>
        </div>


        <!-- 添加弹出框 -->
        <el-dialog :visible.sync="edtAddDlgisible" :title="index.index + ' - ' + (form.editmode ? '编辑' : '添加') + '数据'"  width="68%" :close-on-click-modal="false">
            <el-container style="max-height: calc(100vh - 400px); ">
                <el-main>
                <el-form ref="index.add" :model="form">
                    <div style="margin-bottom: 8px">
                        <div style="margin-bottom: 4px"><span class="title red">ID</span></div>
                        <el-input v-model="form.id" placeholder="请输入自定义ID，留空则会自动生成"></el-input>
                    </div>
                    <div v-for="(item, i) in form.fields" :key="i" style="margin-bottom: 8px">
                        <div :style="'margin-bottom: 4px; margin-left:'+item.level*24+'px;'"><span class="title">
                                {{getItemName(item, true)}}
                            </span>
                            <span class="desc mr10" v-if="!item.data.properties"><span class="grey">数据类型：</span>{{item.data.type}}</span>
                            <el-checkbox v-if="item.data.properties" :key="uuid()" v-model="form.arrays[item.name]" label="数组"
                                @change="changeItemArrayState(item)"
                                class="ml10"
                                title="将这个字段的值作为一个数组"></el-checkbox>
                            <el-input-number v-if="item.data.properties && form.arrays[item.name]"
                                class="ml8 mr10"
                                title="数组下标"
                                :step='1'
                                @change="(v) => changeItemArrayIndex(item, v)"
                                v-model="item.curItemIndex" :min="0"
                                :max="getItemCount(item)"></el-input-number>
                            <span v-if="item.data.properties && form.arrays[item.name]">共{{getItemCount(item)}}项</span>
                        </div>
                        <div v-if="!item.data.properties" :style="'margin-left:'+item.level*24+'px'">
                            <el-input v-model="form.data[getItemName(item)]" placeholder="请输入值" clearable>
                                <template slot="append">
                                    <el-checkbox :key="uuid()" v-model="form.arrays[item.name]" label="数组" title="将这个字段的值作为一个数组"></el-checkbox>
                                </template>
                            </el-input>
                        </div>
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
                form: {data: {}, arrays: {}},
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
            doRefresh() {
                this.loadFileds();
            },
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
                    this.src = _src;
                    this.updateHeader();
                });
            },
            initProperties(fields, key, properties, ex, level, parent) {
                if (!properties) return;
                for (var _key in properties) {
                    if (!_key) continue;
                    let _data = properties[_key];
                    if (_data.properties) {
                        let _parent;
                        if (ex == true) {
                            _parent = {
                                name: key ? key + '.' + _key : _key,
                                key: _key,
                                data: _data,
                                level: level,
                                parent: parent,
                            };
                            fields.push(_parent);
                        }
                        this.initProperties(fields, key ? key + '.' + _key : _key, _data.properties, ex, level + 1, _parent);
                    } else {
                        fields.push({
                            name: key ? key + '.' + _key : _key,
                            key: _key,
                            data: _data,
                            level: level,
                            parent: parent
                        })
                    }
                }
            },
            doQuery(isDelete, confirm) {

                if (isDelete) {
                    if (!this.query.key) {
                        this.$message.info("条件删除必须输入查询关键字");
                        return;
                    }
                }

                if (isDelete == true && confirm == true) {
                    // 删除确认
                    this.$confirm('是否确定删除此索引下所有符合当前查询条件的数据？', '条件删除数据', {
                        type: 'warning',
                        dangerouslyUseHTMLString: true
                    }).then(() => {
                        this.doQuery(true);
                    }).catch(() => {});
                    return;
                }

                let _cmd = {};
                if (this.query.key) {
                    // 单个关键词
                    let _field = this.selectField;
                    if (_field && _field.length > 0) {
                        if (_field.length == 1) {
                            // 查询单个字段
                            _cmd.query = {"match": {}};
                            if (!isDelete) _cmd.highlight = {"fields": {}};
                            _cmd.query.match[_field[0]] = this.query.key;
                            if (!isDelete) _cmd.highlight.fields[_field[0]] = {};
                        } else {
                            // 查询多个字段
                            _cmd.query = {"multi_match": {
                                "query": this.query.key,
                                "fields": [],
                            }};
                            if (!isDelete) _cmd.highlight = {"fields": {}};
                            _field.forEach((_v) => {
                                _cmd.query.multi_match.fields.push(_v);
                                if (!isDelete) _cmd.highlight.fields[_v] = {};
                            });
                        }
                    } else {
                        // 查询所有字段，但要区分，如查key是数字，则查所有，不是数字，只查非数字字段
                        let _isNumber = !isNaN(parseInt(this.query.key));
                        let _isFloat = !isNaN(parseFloat(this.query.key));
                        let _isBool = Boolean(this.query.key).toString() == this.query.key;
                        let _isDate = this.isDate(this.query.key) || this.isDateTime(this.query.key);

                        _cmd.query = {"multi_match": {
                            "query": this.query.key,
                            "fields": [],
                        }};
                        if (!isDelete) _cmd.highlight = {"fields": {}};
                        this.fields.forEach((_field) => {
                            if (_field.data.index == false) return;
                            let _type = _field.data.type;
                            let _ok = (_type == "string" || _type == "text" || _type == "keyword"); //  || _type == "ip"
                            if (!_ok && !isDelete && _isNumber) {
                                _ok = _type == "integer" || _type == "long" || _type == "short" || _type == "byte";
                            }
                            if (!_ok && !isDelete && _isFloat) {
                                _ok = _type == "double" || _type == "float" || _type == "half_float" || _type == "scaled_float";
                            }
                            if (!_ok && _isDate) {
                                _ok = _type == "date";
                            }
                            if (!_ok && _isBool)
                                _ok = _type == "boolean";
                            if (_ok) {
                                _cmd.query.multi_match.fields.push(_field.name);
                                if (!isDelete) _cmd.highlight.fields[_field.name] = {};
                            }
                        });
                    }
                } else {
                    _cmd.query = {
                        "match_all": {}
                    }
                }
                if (isDelete == true) {
                    this.getData("/" + this.index.index + "/_delete_by_query", _cmd, true);
                } else {
                    this.getData("/" + this.index.index + "/_search", _cmd);
                }
            },
            // ID 查询
            doQueryID() {
                if (!this.query.key) {
                    this.$message.info("请输入查询关键字");
                    return;
                }
                const loading = this.$loading({
                    lock: true,
                    text: 'Loading',
                    spinner: 'el-icon-loading',
                    background: 'rgba(0, 0, 0, 0.7)'
                });
                this.$http.get("/" + this.index.index + "/_doc/" + this.query.key).then((resp) => {
                    this.count = 1;
                    this.items = [resp];
                    this.updateHeader();
                    this.loading = false;
                    loading.close();
                }).catch(() => {
                    this.loading = false;
                    loading.close();
                });
            },
            // 查询全部
            doQueryAll() {
                this.getData("/" + this.index.index + "/_search", {
                    "query": {
                        "match_all": {}
                    },
                });
            },
            getData(api, cmd, isDelete) {
                let _cmd = cmd ? cmd : this.lastCommand;
                let _api = api ? api : this.lastApi;
                if (!_cmd || !_api) return;

                if (!isDelete) {
                    let _page = this.query.pageindex < 1 ? 1 : this.query.pageindex;
                    let _pageSize = this.query.pagesize > 0 ? this.query.pagesize : 20;
                    _cmd.from = (_page - 1) * _pageSize;
                    _cmd.size = _pageSize;
                    this.lastCommand = _cmd;
                    this.lastApi = _api;
                }

                this.loading = true;
                const loading = this.$loading({
                    lock: true,
                    text: 'Loading',
                    spinner: 'el-icon-loading',
                    background: 'rgba(0, 0, 0, 0.7)'
                });
                this.$http.post(_api, null, _cmd).then((resp) => {
                    if (isDelete == true) {
                        this.$message.info(`成功删除了${resp.deleted}条数据`);
                    } else {
                        this.count = resp.hits.total.value;
                        this.items = resp.hits.hits;
                        this.updateHeader();
                    }
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
                // console.log(this.header);
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
            initFormData(row, _data, item, _pKey) {
                if (!row) return;
                if (item.data.properties) {
                    if (Array.isArray(row)) {
                        item.curItemIndex = 0;
                        let ___count = row.length;
                        if (___count < 1) ___count = 1;
                        _data.data[_pKey + item.key + '.count'] = ___count;
                        _data.arrays[item.name] = true;
                        for (let i=0; i < row.length; i++) {
                            let _ak = _pKey + item.key + '[' + i + ']';
                            for (var __key in item.data.properties) {
                                if (!__key) continue;
                                let _field = this.findField(item.name + "." + __key, _data.fields);
                                if (!_field) continue;
                                this.initFormData(row[i][_field.key], _data, _field, _ak + '.');
                            }
                        }
                    } else {
                        for (var __key in item.data.properties) {
                            if (!__key) continue;
                            let _field2 = this.findField(item.name + "." + __key, _data.fields);
                            if (!_field2) continue;
                            this.initFormData(row[_field2.key], _data, _field2, _pKey + item.key + ".");
                        }
                    }
                } else {
                    let _key = _pKey + item.key;
                    _data.data[_key] = row instanceof Object ? JSON.stringify(row) : row;
                }
            },
            // 添加
            doAddData(src) {
                let _data = {data: {}, arrays: {}, fields: [], src: src, closeDlg: false};
                this.initProperties(_data.fields, undefined, this.src.properties, true, 0);
                if (src != null) {
                    _data.fields.forEach((_v) => {
                        if (!_v || _v.level != 0) return;
                        this.initFormData(src._source[_v.name], _data, _v, '');
                    });
                    _data.id = src._id;
                    _data.closeDlg = true;
                    _data.editmode = true;
                } else {
                    _data.fields.forEach((_v) => {
                        _data.data[_v.name] = _v.data.null_value;
                    });
                }
                this.form = _data;
                this.edtAddDlgisible = true;
            },
            changeItemArrayState(item) {
                if (this.form.arrays[item.name] == true) {
                    this.form.data[item.name] = [];
                    item.curItemIndex = 0;
                    setItemCount(item, 1);
                } else {
                    this.form.data[item.name] = undefined;
                    item.curItemIndex = undefined;
                    setItemCount(item, undefined);
                }
            },
            changeItemArrayIndex(item, value) {
                let _key = this.getItemCountKey(item);
                let _count = this.form.data[_key];
                if (_count == undefined || _count == null)
                    _count = 1;
                if (value >= _count) {
                    _count++;
                    this.form.data[_key] = _count;
                }
                this.$forceUpdate();
            },
            getItemName(item, flag) {
                if (!item.parent) return item.name;
                let i = item.name.lastIndexOf('.');
                if (i > 0) {
                    if (this.form.arrays[item.parent.name] == true)
                        return (flag == true ? '' : this.getItemName(item.parent)) + '[' + item.parent.curItemIndex + ']' + item.name.substr(i);
                    else
                        return (flag == true ? '' : this.getItemName(item.parent)) + item.name.substr(i);
                } else
                    return item.name;
            },
            getItemCount(item) {
                let count = this.form.data[this.getItemCountKey(item)];
                if (count == undefined || count == null)
                    count = 1;
                return count;
            },
            setItemCount(item, value) {
                this.form.data[this.getItemCountKey(item)] = value;
            },
            getItemCountKey(item) {
                return this.getItemName(item) + '.count';
            },
            parseValueByType(type, value, array) {
                if (type == 'object') {
                    return JSON.parse(value);
                } else if (array == true) {
                    let _tmp = JSON.parse(value);
                    if (Array.isArray(_tmp)) {
                        for (let i=0; i<_tmp.length; i++) {
                            _tmp[i] = this.parseValueByType(type, _tmp[i]);
                        }
                        return _tmp;
                    }
                    throw new Error(`"${value} 不是一个数组`);
                } else if (type == "integer" || type == "long" || type == "short" || type == "byte") {
                    let _tmp = parseInt(value);
                    if (isNaN(_tmp))
                        throw new Error(`"${value} 不是一个整数`);
                    return _tmp;
                } else if (type == "double" || type == "float" || type == "half_float" || type == "scaled_float") {
                    let _tmp = parseFloat(value);
                    if (isNaN(_tmp))
                        throw new Error(`"${value} 不是一个浮点数`);
                    return _tmp;
                } else if (type == "boolean") {
                    if (value == "true" || value == "yes" || value == "1") return true;
                    if (value == "false" || value == "no" || value == "0") return false;
                    throw new Error(`"${value} 不是一个布尔值`);
                }
                return value;
            },
            // 处理数据
            parseValue(item, value) {
                if (!value) return undefined;
                let data = item.data;
                if (!data || !data.type) return value;
                let array = this.form.arrays[item.name];
                return this.parseValueByType(data.type, value, array);
            },
            findField(name, fields) {
                for (let i = 0; i < fields.length; i++) {
                    let item = fields[i];
                    if (item && item.name == name) {
                        return item;
                    }
                }
                return undefined;
            },
            setItemData(_data, _pKey, item) {
                let _key;
                let _value;
                if (item.data.properties) {
                    let count = this.getItemCount(item);
                    if (this.form.arrays[item.name] == true && count != undefined && count > 0) {
                        _data[item.key] = [];
                        for (let i=0; i < count; i++) {
                            let _ak = _pKey + item.key + '[' + i + ']';
                            let _newItem = {};
                            for (var __key in item.data.properties) {
                                if (!__key) continue;
                                let _field = this.findField(item.name + "." + __key, this.form.fields);
                                if (!_field) continue;
                                this.setItemData(_newItem, _ak + '.', _field);
                            }
                            if (Object.keys(_newItem).length > 0) {
                                _data[item.key].push(_newItem);
                            }
                        }
                    } else {
                        let _newItem2 = {};
                        for (var __key in item.data.properties) {
                            if (!__key) continue;
                            let _field2 = this.findField(item.name + "." + __key, this.form.fields);
                            if (!_field2) continue;
                            this.setItemData(_newItem2, _pKey + item.key + "." , _field2);
                        }
                        if (Object.keys(_newItem2).length > 0) {
                            _data[item.key] = _newItem2;
                        }
                    }
                } else {
                    _key = _pKey + item.key;
                    _value = this.form.data[_key];
                    if (_value == undefined) return;
                    this.__key = _key;
                    this.__value = _value;
                    _data[item.key] = this.parseValue(item, _value);
                }
            },
            // 插入数据
            doInsertData(flag) {
                let api = "/" + this.index.index + "/_doc/" + (this.form.id ? this.form.id : '');

                let _data = {};
                this.__key = undefined;
                this.__value = undefined;
                try {
                    console.log('make data');
                    for (let i = 0; i < this.form.fields.length; i++) {
                        let item = this.form.fields[i];
                        if (!item || item.level != 0) continue;
                        this.setItemData(_data, '', item);
                    }
                } catch(e) {
                    this.$message({
                        type: "error",
                        dangerouslyUseHTMLString: true,
                        message: `解析字段 <b>${this.__key}</b> 的值时发生异常:<br><br>${this.__value}<br><br><b>异常描述:</b> ` + e
                    });
                    return;
                }

                if (flag == 1) {
                    this.$alert('<el-container style="max-height: calc(100vh - 400px); "><el-main>'+
                        '<pre style="height: 60vh; overflow: scroll;">' +
                        (this.form.id ? '更新数据' : '插入数据') + '\n\n' +
                        'POST ' + config.sServiceHost + api + "\n\n" + JSON.stringify(_data, null, 2) + '</pre></el-main></el-container>',
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
                        this.form.editmode = undefined;
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
.ml10{
    margin-left: 10px;
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

.handle-box .el-button {
    margin-bottom: 2px;
}

.handle-box .el-input {
    margin-bottom: 2px;
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