<script setup>
import {
    NIcon,
    NButton,
    NSpace,
    NDataTable,
    useDialog,

} from 'naive-ui'
import { Add } from "@vicons/ionicons5";
import ServerNet from "../websocket"
import { ref, onMounted, h } from 'vue'
import configModal from './configModal.vue'
const dialog = useDialog();
const _configModal = ref(null)
const tableData = ref([])
const columns = [
    { title: "id", key: "id" },
    { title: "名称", key: "name" },
    { title: "宽度mm", key: "width_mm" },
    { title: "高度mm", key: "height_mm" },
    { title: "上边距mm", key: "top_margin" },
    { title: "下边距mm", key: "bottom_margin" },
    { title: "左边距mm", key: "left_margin" },
    { title: "右边距mm", key: "right_margin" },
    {
        title: "保存png图片", key: "is_save_png", render(row) {
            return row.is_save_png == 1 ? "是" : "否"
        }
    },
    {
        title: "输出到打印机", key: "is_to_printer", render(row) {
            return row.is_to_printer == 1 ? "是" : "否"
        }
    },
    { title: "打印机名称", key: "printer_name" },
    {
        title: "使用打印机默认配置", key: "is_to_printer", render(row) {
            return row.is_to_printer == 1 ? "是" : "否"
        }
    },
    { title: "打印机纸张", key: "printer_paper_name" },
    { title: "打印方向", key: "printer_orientation" },
    { title: "最后执行命令", key: "process_at_end" },
    { title: "最后执行命令参数", key: "process_argument_at_end" },
    {
        title: "操作", key: "op", width: "200", fixed: "right",
        render(row) {
            return [
                h(
                    NButton,
                    {
                        strong: true,
                        type: "info",
                        style: {
                            marginRight: '6px'
                        },
                        onclick: () => {
                            _configModal.value.showOrHide('update', row)
                        }

                    },
                    { default: () => "修改" }
                ),
                h(
                    NButton,
                    {
                        strong: true,
                        type: "warning",
                        onclick: () => {
                            dialog.warning({
                                title: "删除",
                                content: "确定删除吗？",
                                positiveText: '确定',
                                negativeText: "等一下",
                                onPositiveClick: () => {
                                    delOnePrinterConfig(row.id)
                                }

                            })

                        }

                    },
                    { default: () => "删除" }
                ),
            ]
        }
    }
]

function add() {
    _configModal.value.showOrHide('add', {})
}
async function getPrinterConfigInfo() {
    let res = await ServerNet.send({ method: "get_all_configs" })
    if (res.is_success) {
        if (res.data && res.data.length > 0) {
            tableData.value = res.data
            return
        }
    }
    tableData.value = []
}

async function delOnePrinterConfig(Id) {
    let res = await ServerNet.send({ method: "del_config", data: Id })
    if (res.is_success) {
        dialog.success({
            title: "删除",
            content: "删除成功了！",

        })
        getPrinterConfigInfo()
        return
    } else {
        dialog.error({
            title: "删除失败了",
            content: res.msg,

        })

    }
}
onMounted(async () => {
    let res = await ServerNet.send({ method: "get_printers_info" })
    if (res.is_success) {
        _configModal.value.setPrintInfoData(res.data)
    }
    getPrinterConfigInfo();

})


</script>

<template>
    <configModal ref="_configModal" @reload="getPrinterConfigInfo" style="width: 1000px;height: 500px;">
    </configModal>

    <h2>
        打印配置
    </h2>
    <n-space style="margin-top: 2vh;">
        <n-button type="info" v-on:click="add" style="margin-bottom: 1vh;">
            <template #icon>
                <n-icon :size="20" :component="Add"></n-icon>
            </template>
            添加
        </n-button>
    </n-space>
    <n-data-table :columns="columns" :data="tableData" flex-height style="min-height: 600px;max-height: 600px;" />
</template>

<style></style>