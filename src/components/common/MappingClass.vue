<template>
    <el-select
        v-model="cls.dynamic"
        class="w3 wp mr10"
        clearable
        :placeholder="placeholder">
        <el-option v-for="(item, index) in dynamicTypes" :key="index" :label="`${item.value}`" :value="item.value">
            <span>{{item.name}}</span>
        </el-option>
    </el-select>
</template>

<script>
export default {
    name: "mappingClass",
    data() {
        return {
            cls: {},
            dynamicTypes: [
                {name: "true (默认值，动态添加字段)", value: true},
                {name: "false (忽略新字段)", value: false},
                {name: "strict (陌生字段抛出异常)", value: "strict"},
            ],
        };
    },
    props: {
        mapClass: {
            type: Object,
            required: true
        },
        placeholder: {
            type: String,
            default: "点击选择"
        }
    },
    created() {

    },
    mounted() {
        this.cls = this.mapClass;
        if (this.cls.dynamic == "true")
            this.cls.dynamic = true
        else if (this.cls.dynamic == "false")
            this.cls.dynamic = false;
    },
    computed: {

    },
    methods: {

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