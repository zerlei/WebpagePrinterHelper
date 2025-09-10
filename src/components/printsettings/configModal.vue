<script setup>

import {
    NModal,
    NStep,
    NSpace,
    NSteps,
    NButton,
    NDataTable,
    useDialog,
    NInputNumber,
    NSwitch,
    NInput,
    NGradientText,
    stepProps

} from 'naive-ui'

import { ref, watch } from 'vue'
import ServerNet from "../websocket"

const emit = defineEmits(['reload'])
const showModal = ref(false)
const currentStep = ref(1)
const acceptinfo = ref("下一步")
const currentStatus = ref('process')
const beforedisabled = ref(true)
const Printercolumns = ref([
    { type: 'selection', multiple: false, },
    { title: "打印机名称", key: "printer_name" }
])
const PrinterData = ref([])
const PrinterChecked = ref([])
const Papercolumns = ref([
    { type: 'selection', multiple: false, },
    { title: "纸张名称", key: "paper_name" },
])
const PaperData = ref([])
const PaperChecked = ref([])
const dialog = useDialog()

const Margin = ref({
    Top: 0,
    Left: 0,
    Bottom: 0,
    Right: 0
})

const width_mm = ref(210)
const height_mm = ref(297)
const is_save_png = ref(false)
const is_to_printer = ref(true)
const is_use_printer_default_config = ref(false)
const railStyle = ref(({
    focused,
    checked
}) => {
    const style = {};
    style.color = 'black'
    if (checked) {
        style.background = "#36ad6a";
        if (focused) {
            style.boxShadow = "0 0 0 2px #36ad6a";
        }
    } else {
        style.background = "#c98c33";
        if (focused) {
            style.boxShadow = "0 0 0 2px #c98c33";
        }
    }
    return style;
})
const Orientation = ref(true)
const name = ref("")
const NameInputStatus = ref("success")
const NameInputPh = ref("")
const process_at_end = ref("")
const process_argument_at_end = ref("")

let PrinterInfoData = []
let type_ = 'add'
let configId = null

watch(name, (n, o) => {
    if (n == "" || n == null) {
        NameInputStatus.value = 'error'
    } else {
        NameInputStatus.value = 'success'
    }
})
watch(is_to_printer, (n, o) => {
    if (!n) {
        acceptinfo.value = "确定"
    } else {
        if (currentStep.value == 1) {
            acceptinfo.value = "下一步"
        }
    }
})

async function addOnePrintConfig(ob) {

    let res = await ServerNet.send({ method: "add_config", data: ob })
    if (res.is_success) {
        dialog.success({
            title: '成功',
            content: '添加成功！',
            positiveText: '好的',
            onPositiveClick: () => {
            }
        })
        showModal.value = false
        currentStep.value = 1
        acceptinfo.value = "下一步"
        beforedisabled.value = true
        emit('reload')
    } else {
        dialog.error({
            title: '失败',
            content: res.msg,
            positiveText: '好的',
            onPositiveClick: () => {
            }
        })
    }


}
async function updateOnePrintConfig(ob) {
    ob.id = configId
    let res = await ServerNet.send({ method: "update_config", data: ob })

    if (res.is_success) {
        dialog.success({
            title: '成功',
            content: '修改成功！',
            positiveText: '好的',
            onPositiveClick: () => {
            }
        })
        showModal.value = false
        currentStep.value = 1
        acceptinfo.value = "下一步"
        beforedisabled.value = true
        emit('reload')
    } else {
        dialog.error({
            title: '失败',
            content: res.msg,
            positiveText: '好的',
            onPositiveClick: () => {
            }
        })
    }
}
//#region 显示效果
function acceptNext() {
    const acceptfun = () => {
        let ob = {}
        ob.name = name.value
        ob.width_mm = width_mm.value
        ob.height_mm = height_mm.value
        ob.top_margin = Margin.value.Top
        ob.bottom_margin = Margin.value.Bottom
        ob.left_margin = Margin.value.Left
        ob.right_margin = Margin.value.Right
        ob.is_save_png = is_save_png.value ? 1 : 0
        ob.is_to_printer = is_to_printer.value ? 1 : 0
        ob.process_at_end = process_at_end.value
        ob.process_argument_at_end = process_argument_at_end.value
        if (is_to_printer.value) {

            ob.is_use_printer_default_config = is_use_printer_default_config.value ? 1 : 0
            ob.printer_orientation = Orientation.value ? "Landscape" : "Portrait"
            ob.printer_name = PrinterChecked.value[0]
            ob.printer_paper_name = PaperData.value.find(e => {
                if (e.paper_id == PaperChecked.value[0]) {
                    return true
                }
            }).paper_name
        }
        if (type_ == 'add') {
            addOnePrintConfig(ob)

        } else {
            updateOnePrintConfig(ob)
        }
    }

    if (name.value == "" || name.value == null) {
        NameInputStatus.value = 'error'
        NameInputPh.value = "❌,输入名字！"
        return
    }
    if (currentStep.value == 1) {
        if (acceptinfo.value == "下一步") {

            beforedisabled.value = false
            acceptinfo.value = "确定"
            currentStep.value = currentStep.value + 1
            return
        } else {
            acceptfun()
        }
    }
    if (currentStep.value == 2) {
        acceptfun()
    }
}
function acceptBefore() {

    currentStep.value = currentStep.value - 1
    acceptinfo.value = "下一步"
    if (currentStep.value == 1) {
        beforedisabled.value = true
    }
}

function cancle() {
    showModal.value = false
}
function showOrHide(from, row) {
    showModal.value = true
    if (from == 'add') {

    } else {
        type_ = 'update'
        configId = row.id

        name.value = row.name
        Margin.value = {
            Top: row.top_margin,
            Left: row.left_margin,
            Right: row.right_margin,
            Bottom: row.bottom_margin
        }
        width_mm.value = row.width_mm
        height_mm.value = row.height_mm
        is_save_png.value = row.is_save_png == 1 ? true : false
        is_to_printer.value = row.is_to_printer == 1 ? true : false
        process_at_end.value = row.process_at_end
        process_argument_at_end.value = row.process_argument_at_end
        is_use_printer_default_config.value = row.is_use_printer_default_config == 1 ? true : false
        Orientation.value = row.printer_orientation == "Landscape" ? true : false
        PrinterChecked.value = [`${row.printer_name}`]
        PrinterInfoData.forEach(e => {
            if (e.printer_name == row.printer_name) {
                PaperData.value = e.supported_paper_names
                e.supported_paper_names.forEach(e2 => {
                    if (e2.paper_name == row.printer_paper_name) {
                        PaperChecked.value = [e2.paper_id]
                    }
                })
            }
        })


    }

}


//#endregion

function setPrintInfoData(data) {
    PrinterInfoData = data
    if (!PrinterInfoData)
        return
    PrinterInfoData.forEach(e => {
        // 打印机的纸张存在同名同Id的
        for (var i = 0; i < e.supported_paper_names.length; ++i) {
            e.supported_paper_names[i] = {
                paper_id: i,
                paper_name: e.supported_paper_names[i]
            }
        }
        let ob = {}
        ob.printer_name = e.printer_name
        PrinterData.value.push(ob)

    });
    if (PrinterData.value.length > 0) {
        PrinterChecked.value.push(PrinterData.value[0].printer_name)
        PaperData.value = PrinterInfoData[0].supported_paper_names
        PaperChecked.value.push(PaperData.value[0].paper_id)
    }
}
const PrinterCheckedChange = (keys) => {
    PrinterInfoData.forEach(e => {
        if (e.printer_name == keys[0]) {
            PaperData.value = e.supported_paper_names
            if (PaperData.value.length > 0) {
                PaperChecked.value = [PaperData.value[0].paper_id]
            }
        }
    })

}
defineExpose({
    showOrHide,
    setPrintInfoData
})
</script>
<template>
    <n-modal v-model:show="showModal" id="configModal" :mask-closable="false">
        <n-space vertical>
            <n-steps size="small" :current="currentStep" :status="currentStatus">
                <n-step title="配置" description="做一个打印配置，选择输出格式，起个名字等。" />
                <n-step title="打印机选择" description="选择（物理）打印机，选择纸张" />
            </n-steps>

            <div v-show="currentStep == 1" style="height: 350px;">
                <n-space style="margin-bottom: 40px;">
                    名字：
                    <n-input v-model:value="name" type="text" v-model:placeholder="NameInputPh"
                        v-model:status="NameInputStatus" />
                </n-space>

                <n-space style="margin-bottom: 40px;">
                    尺寸：
                    <n-input-number v-model:value="width_mm" :min="0" placeholder="宽度(mm)">
                        <template #prefix>
                            宽度(mm):
                        </template>
                    </n-input-number>
                    <n-input-number v-model:value="height_mm" :min="0" placeholder="高度(mm)">
                        <template #prefix>
                            高度(mm):
                        </template>
                    </n-input-number>
                </n-space>


                <n-space justify="end" vertical>
                    <n-space style="margin-bottom: 40px;">
                        边距：
                        <n-input-number style="width: 200px;" v-model:value="Margin.Left" :min="0"
                            placeholder="左边距(mm)">

                            <template #prefix>
                                左(mm):
                            </template>
                        </n-input-number>
                        <n-input-number style="width: 200px;" v-model:value="Margin.Top" :min="0" placeholder="上边距(mm)">
                            <template #prefix>
                                上(mm):
                            </template>
                        </n-input-number>
                        <n-input-number style="width: 200px;" v-model:value="Margin.Right" :min="0"
                            placeholder="右边距(mm)">

                            <template #prefix>
                                右(mm):
                            </template>
                        </n-input-number>
                        <n-input-number style="width: 200px;" v-model:value="Margin.Bottom" :min="0"
                            placeholder="下边距(mm)">
                            <template #prefix>
                                下(mm):
                            </template>
                        </n-input-number>
                    </n-space>

                    <n-space style="margin-bottom: 40px;">
                        输出：
                        <n-switch :rail-style="railStyle" v-model:value="is_save_png">
                            <template #checked>
                                保存png图片
                            </template>
                            <template #unchecked>
                                不保存png图片
                            </template>
                        </n-switch>
                        <n-switch style="color: black;" :rail-style="railStyle" v-model:value="is_to_printer">
                            <template #checked>
                                使用(物理)打印机
                            </template>
                            <template #unchecked>
                                不使用(物理)打印机
                            </template>
                        </n-switch>
                    </n-space>
                    <n-space style="margin-bottom: 40px;">
                        脚本：
                        <n-input v-model:value="process_at_end" type="text">
                            <template #prefix>
                                命令
                            </template>

                        </n-input>
                        <n-input v-model:value="process_argument_at_end" type="text">
                            <template #prefix>
                                参数
                            </template>
                        </n-input>
                        <n-gradient-text type="info">
                            *可在最后一步运行定义的脚本或命令,%PAGE_FILE_PATH% 会被替换文件路径(不包含文件后缀! .pdf|.png)
                        </n-gradient-text>

                    </n-space>
                </n-space>
            </div>



            <div v-show="currentStep == 2">
                <n-space style="margin-bottom: 10px;">
                    输出：
                    <n-switch :rail-style="railStyle" v-model:value="is_use_printer_default_config">
                        <template #checked>
                            使用打印机自定义配置
                        </template>
                        <template #unchecked>
                            使用打印机默认配置
                        </template>
                    </n-switch>

                    <n-switch :rail-style="railStyle" v-model:value="Orientation">
                        <template #checked>
                            横向
                        </template>
                        <template #unchecked>
                            纵向
                        </template>
                    </n-switch>
                </n-space>
                <n-space justify="space-between" :wrap="false">
                    <div>
                        <n-data-table :row-key="row => row.printer_name" :columns="Printercolumns" :data="PrinterData"
                            :onUpdateCheckedRowKeys="PrinterCheckedChange" v-model:checked-row-keys="PrinterChecked"
                            :style="{ height: `350px` }" flex-height />
                    </div>
                    <div>
                        <n-data-table :row-key="row => row.paper_id" :columns="Papercolumns" :data="PaperData"
                            v-model:checked-row-keys="PaperChecked" :style="{ height: `350px` }" flex-height />
                    </div>
                </n-space>

            </div>




            <n-space justify="end">
                <n-button type="warning" v-on:click="cancle">
                    取消
                </n-button>
                <n-button color="#8a2be2" :disabled="beforedisabled" v-on:click="acceptBefore">
                    上一步
                </n-button>
                <n-button type="success" v-on:click="acceptNext">
                    {{ acceptinfo }}
                </n-button>
            </n-space>
        </n-space>
    </n-modal>
</template>
<style>
#configModal {
    background-color: #2c2c32;
    border-radius: 10px;
    padding: 20px;
}
</style>