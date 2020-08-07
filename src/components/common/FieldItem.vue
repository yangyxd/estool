<template>
    <div class="field-item" style="margin-bottom: 4px;">
        <el-input v-model="fieldData.name" placeholder="属性名称" class="w1 mr10 wp" :disabled="field.old"></el-input>
        <el-select
            v-model="fieldData.data.type"
            class="w4 wp mr10"
            clearable
            @change="onDataTypeChange"
            :disabled="field.old || fieldData.data.properties != undefined"
            placeholder="属性类型">
            <el-option v-for="(item, index) in fieldTypes" :key="'_opt_' + index" :label="`${item.value}`" :value="item.value">
                <span>{{item.value}}</span><span class="select-desc">{{item.name}}</span>
            </el-option>
        </el-select>

        <mapping-class v-if="fieldData.data.properties" :mapClass="fieldData.data"></mapping-class>
        <el-input v-if="!fieldData.data.properties && fieldData.data.type!='string' && fieldData.data.type!='text'"
            v-model="null_value" placeholder="默认值" @input="setNullValue" class="w2 mr10 wp"></el-input>
        <el-input v-if="!fieldData.data.properties"
            v-model="fieldData.data.boost" placeholder="加权" class="w5 mr10 wp"
            title="字段级别索引分数加权，浮点数值，默认1.0"></el-input>
        <el-input v-if="!fieldData.data.properties && fieldData.data.type=='scaled_float'"
            v-model="fieldData.data.scaling_factor" placeholder="比例因子" class="w2 mr10 wp"></el-input>
        <el-input v-if="!fieldData.data.properties && fieldData.data.type=='date'"
            v-model="fieldData.data.format" placeholder="格式" class="w3 mr10 wp"></el-input>
        <el-select
            v-if="!fieldData.data.properties"
            v-model="fieldData.data.index"
            class="w3 wp mr10"
            clearable
            @change="onIndexTypeChange"
            title="默认 not_analyzed"
            placeholder="索引状态">
            <el-option v-for="(item, index) in indexStatus" :key="'_opt_' + index" :label="`${item.value}`" :value="item.value">
                <span>{{item.value}}</span><span class="select-desc">{{item.name}}</span>
            </el-option>
        </el-select>
        <el-select
            v-if="!fieldData.data.properties && (fieldData.data.type=='string' || fieldData.data.type=='text' || fieldData.data.type=='keyword')"
            v-model="fieldData.data.index_options"
            class="w3 wp mr10"
            clearable
            :title="fieldData.data.index == undefined || fieldData.data.index ? '默认 positions' : '默认 docs'"
            placeholder="索引选项">
            <el-option v-for="(item, index) in indexOptions" :key="'_opt_' + index" :label="`${item.value}`" :value="item.value">
                <span>{{item.value}}</span><span class="select-desc">{{item.name}}</span>
            </el-option>
        </el-select>
        <el-checkbox v-if="!fieldData.data.properties" v-model="fieldData.data.doc_values" label="排序聚合" class="mr8" title="支持排序和聚合"
            :checked="fieldData.data.doc_values == undefined || fieldData.data.doc_values"></el-checkbox>

        <el-button @click="doViewCode()" icon="el-icon-setting" size="mini" type="text" title="查看或编辑代码"></el-button>
        <el-button v-if="!field.old" @click="doDeleteField()" icon="el-icon-close" size="mini" type="text" title="删除属性"></el-button>
        <el-button v-if="!field.old || fieldData.data.properties" @click="doAddField()" icon="el-icon-plus" size="mini" type="text" title="添加子属性"></el-button>
    </div>
</template>

<script>
import mappingClass  from './MappingClass';
export default {
    name: "fieldItem",
    components: { mappingClass },
    data() {
        return {
            null_value: undefined,
            fieldData: {
                data: {}
            },
            fieldTypes: [
                // {name: "字符串（ES 5.x开始不再支持）", value: "string"},
                {name: "字符串（需要全文检索时使用）", value: "text"},
                {name: "字符串（精确值搜索）", value: "keyword"},
                {name: "布尔值（true 或 false）", value: "boolean"},
                {name: "整数（32位有符号）", value: "integer"},
                {name: "整数（64位有符号）", value: "long"},
                {name: "整数（-32768~32767）", value: "short"},
                {name: "整数（-128~127）", value: "byte"},
                {name: "浮点数（64位）", value: "double"},
                {name: "浮点数（32位）", value: "float"},
                {name: "浮点数（16位）", value: "half_float"},
                {name: "浮点数（缩放类型）", value: "scaled_float"},
                {name: "日期类型", value: "date"},
                {name: "范围类型", value: "range"},
                {name: "二进制数据（默认只存储不索引）", value: "binary"},
                // {name: "数组型", value: "array"},
                {name: "JSON对象", value: "object"},
                {name: "嵌套类", value: "nested"},
                {name: "地理坐标", value: "geo_point"},
                {name: "地理地图", value: "geo_shape"},
                {name: "IPv4或IPv6地址", value: "ip"},
                {name: "范围类型", value: "completion"},
                {name: "附件类型", value: "attachment"},
                {name: "抽取类型", value: "percolator"},
            ],
            indexStatus: [
                {name: "无索引，不可查询", value: false},
                {name: "有索引（默认）", value: true},
            ],
            indexOptions: [
                {name: "索引文档号", value: "docs"},
                {name: "文档号+词频", value: "freqs"},
                {name: "文档号+词频+位置，通常用来距离查询", value: "positions"},
                {name: "文档号+词频+位置+偏移量，通常被使用在高亮字段", value: "offsets"},
            ]
        };
    },
    props: {
        field: {
            type: Object,
            required: true
        },
    },
    created() {
    },
    computed: {
    },
    mounted() {
        this.fieldData = this.field;
        this.null_value = this.getNullValue();
    },
    methods: {
        doDeleteField() {
            this.$emit('onDelete', this.field);
        },
        doAddField() {
            this.$emit('onAddChild', this.field);
            this.$forceUpdate();
        },
        doViewCode() {
            this.$emit('onShowCode', this.field);
        },
        onDataTypeChange(v) {
            this.setNullValue(this.null_value, v);
            this.null_value = this.getNullValue();
        },
        onIndexTypeChange(v) {
            if (v == undefined || v == '')
                this.index = undefined;
            else
                this.index = v === "true" ? true : false;
        },
        getNullValue() {
            let v = this.fieldData.data.null_value;
            if (v != undefined)
                v = v + '';
            return v;
        },
        setNullValue(v, t) {
            // 设置默认值，这里需要作类型转换处理
            let _v;
            if (v != undefined && v !== '') {
                let _t = t == undefined ? this.fieldData.data.type : t;
                // print(_t);
                if (_t == "integer" || _t == "long" || _t == "short" || _t == "byte") {
                    _v = parseInt(v);
                    if (isNaN(_v)) _v = undefined;
                } else if (_t == "double" || _t == "float" || _t == "half_float" || _t == "scaled_float") {
                    _v = parseFloat(v);
                    if (isNaN(_v)) _v = undefined;
                } else if (_t == "boolean") {
                    _v = (v == "true" || v == "yes" || v === true) ? true : false;
                } else if (_t == "object" || _t == "array") {
                    if (!v)
                        _v = undefined;
                    else {
                        try {
                            _v = JSON.parse(v);
                        } catch(e) {
                            _v = undefined;
                        }
                    }
                } else
                    _v = v;
            }
            this.fieldData.data.null_value = _v;
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
    width: 100px;
}
.w4 {
    width: 120px;
}
.w5 {
    width: 60px;
}
.wp {
    margin-right: 8px;
    display: inline-block;
}
.mr8 {
    margin-right: 8px;
}
.title {
    font-weight: bold;
}
.select-desc {
    margin-left: 8px;
    color: #999;
}
</style>