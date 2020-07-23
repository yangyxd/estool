<template>
    <div>
        <div v-if="fieldData.items != undefined && fieldData.items.length > 0">
            <div v-for="(field, index) in fieldData.items" :key="index">
                <field-item :field="field" @onDelete="doDeleteItem" :style="'margin-left:'+field.level*24+'px;'"></field-item>
            </div>
        </div>
        <el-button @click="doAddField()" icon="el-icon-plus"></el-button>
        <div style="width: 100%; margin-top: 8px;">
            <span class="grey">提示：<span class="red">建立映射后，字段名称和数据类型将无法修改！</span>尽量选择范围小的类型，提高搜索效率. <br>日期格式可以是：yyyy-MM-dd HH:mm:ss||yyyy-MM-dd||epoch_millis</span>
        </div>
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
            let index = this.fieldData.items.indexOf(item);
            if (index >= 0) {
                this.fieldData.items.splice(index, 1);
                this.$forceUpdate();
            }
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
</style>