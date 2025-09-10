<script setup>
import {
    NIcon,
    NSpace,
    NTooltip,
    NDataTable

} from 'naive-ui'
import ServerNet from '../websocket'
import { ref, onMounted, h } from 'vue'

const tableData = ref([])
const columns = [
    { title: "id", key: "id" },
    { title: "页面地址", key: "page_url" },
    { title: "打印时间", key: "time" },
    { title: "来源", key: "from_ip" },
    { title: "打印发生方式", key: "page_loaded_or_js_request" },
    { title: "打印配置id", key: "config_id" },
    { title: "文件路径", key: "page_file_path" },
    { title: "状态", key: "status" },
    { title: "命令结果", key: "end_cmd_exec_status" },
    { title: "命令消息", key: "end_cmd_exec_message" },
    { title: "错误信息", key: "error_message" },
]
const loading = ref(true)
const pagination = ref({
    page: 1,
    pageSize: 20,
    pageCount: 1,
    prefix({ itemCount }) {
        return [
            h(
                "DIV",
                {
                    style: {
                        color: 'white'
                    }
                },
                { default: () => `共计: ${itemCount}` }
            )

        ]
    }
})

function pageChanged(currentPage) {
    if (!loading.value) {
        loading.value = true
        getPrintedPage(currentPage)
    }
}
async function getPrintedPage(currentPage) {
    let res = await ServerNet.send({ method: "get_pages_desc",page_size: 20, page_index: currentPage  })
    tableData.value = res.data == null ? [] : res.data

    pagination.value.page = currentPage
    pagination.value.pageCount = (res.count / 20).toFixed(0) + 1
    pagination.value.itemCount = res.count
    loading.value = false
}
onMounted(async () => {

    getPrintedPage(1)
})

</script>

<template>
    <h2>
        打印页面信息
    </h2>
    <n-data-table :columns="columns" remote :data="tableData" :loading="loading" striped flex-height
        style="min-height: 600px;max-height: 600px;" :pagination="pagination" v-on:update:page="pageChanged" />
</template>