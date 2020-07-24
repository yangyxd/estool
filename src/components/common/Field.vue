<template>
    <div>
        <div v-if="fieldData.items != undefined && fieldData.items.length > 0">
            <div v-for="(field, index) in fieldData.items" :key="field.id">
                <field-item
                    :field="field"
                    @onDelete="doDeleteItem"
                    @onAddChild="doAddChildItem"
                    @onShowCode="doShowFieldCode"
                    :style="'margin-left:'+field.level*24+'px;'"></field-item>
            </div>
        </div>
        <el-button @click="doAddField()" icon="el-icon-plus">添加</el-button>

        <!-- 代码弹出框 -->
        <el-dialog :visible.sync="edtFieldCodeVisible" :title="'属性  ' + curField.name" width="75%" append-to-body :close-on-click-modal="false">
            <el-input :readonly="curField.old" type="textarea" :rows="20" placeholder="请输入内容" v-model="curFieldCode"></el-input>
            <span slot="footer" class="dialog-footer">
                <el-button @click="edtFieldCodeVisible = false">取 消</el-button>
                <el-button :disabled="curField.old" @click="doSaveFieldCode()">确 定</el-button>
            </span>
        </el-dialog>

    </div>
</template>

<script>
import fieldItem  from './FieldItem';
export default {
    name: "field",
    components: { fieldItem },
    data() {
        let _this = this;
        return {
            cls: {
                data: {},
                name: undefined,
            },
            curField: {},
            edtFieldCodeVisible: false,
            curFieldCode: undefined
        };
    },
    props: {
        fieldData: {
            type: Object,
            required: true
        },
    },
    created() {
    },
    computed: {

    },
    mounted() {
    },
    methods: {
        // 显示字段code
        doShowFieldCode(field) {
            this.curField = field;
            this.curFieldCode = JSON.stringify(field.data, null, 2);
            this.edtFieldCodeVisible = true;
        },
        // 保存字段code
        doSaveFieldCode() {
            try {
                let _data = JSON.parse(this.curFieldCode);
                if (_data == undefined) _data = {};
                this.curField.data = _data;
                this.curField = {};
                this.edtFieldCodeVisible = false;
            } catch(e) {
                this.$message.error("代码错误：" + e);
            }
        },
        doAddField() {
            this.$emit('onAddChange', this.fieldData, {
                name: this.cls.name,
                type: this.cls.data.type,
                format: this.cls.data.format,
                scaled_float: this.cls.data.scaled_float,
                index: this.cls.data.index,
                enabled: true,
            });
            this.cls.name = undefined;
            this.$forceUpdate();
        },
        doDeleteItem(item) {
            let status = this.getParentItem(item);
            if (status.index < 0) return;
            console.log(status);
            if (status.count <= 1 && status.parent) {
                status.parent.data = {};
            }

            // 向下查找所有子项
            let j = 1;
            for (let i = status.index + 1; i < this.fieldData.items.length; i++) {
                let _item = this.fieldData.items[i];
                if (_item.level > item.level) {
                    j++;
                } else
                    break;
            }

            // 删除自己及所有子项
            this.fieldData.items.splice(status.index, j);
            this.$forceUpdate();
        },
        // 添加子节点
        doAddChildItem(item) {
            let index = this.fieldData.items.indexOf(item);
            if (index < 0) return;
            item.data = {properties: {}};
            let _nextIndex = this.getNextItemIndex(index);
            this.$emit('onAddChange', this.fieldData, {
                name: undefined,
                type: undefined,
                level: item.level + 1,
                enabled: true,
            }, _nextIndex < 0 ? index + 1 : _nextIndex);
            this.$forceUpdate();
        },
        // 查找下一个兄弟节点
        getNextItemIndex(index) {
            let level = this.fieldData.items[index].level;
            for (let i = index + 1; i < this.fieldData.items.length; i++) {
                if (this.fieldData.items[i].level == level)
                    return i;
            }
            return -1;
        },
        // 查找父级item，并返回当前item的索引号及兄弟节点个数
        getParentItem(item) {
            let items = this.fieldData.items;
            let p;
            let count = 0;
            let sindex = -1;
            let index = -1;
            for (let i = 0; i < items.length; i++) {
                if (items[i] == item) {
                    index = i;
                    if (item.level == 0) {
                        sindex = 0;
                    } else {
                        for (let j = i; j >= 0; j--) {
                            if (items[j].level < item.level) {
                                p = items[j];
                                sindex = j;
                                break;
                            }
                        }
                    }
                    break;
                }
            }
            for (let i = sindex + 1; i < items.length; i++) {
                let _level = items[i].level;
                if (_level == item.level)
                    count++;
                else if (_level < item.level)
                    break;
            }
            return {count: count, parent: p, index: index};
        },

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
</style>