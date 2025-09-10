<script setup>

import {
    ref
} from 'vue'

import {
    NButton,
    useDialog,
    NGradientText
} from 'naive-ui'
import ServerNet from '../websocket'

const dialog = useDialog()
const btnCanClick = ref(true)
const btnMsg= ref("一键测试打印")
async function toPrint(e) {
    btnCanClick.value = false
    btnMsg.value = "请等待..."
    let process = ""
    let arg = ""

    const platform = navigator.platform.toLowerCase();
    if (platform.includes("win")) {
        process = "powershell"
        arg = "Write-Output \"%PAGE_FILE_PATH%\""
    } else if (platform.includes("linux")) {
        process = "echo"
        arg = "%PAGE_FILE_PATH%"

    }

    const config = {}
    config.id = 0;
    config.name = "test";
    config.is_save_png = 1;
    config.is_to_printer = 0;
    config.width_mm = 1920;
    config.height_mm = 1080;
    config.left_margin = 0;
    config.right_margin = 0;
    config.top_margin = 0;
    config.bottom_margin = 0;
    config.printer_name = "";
    config.is_use_printer_default_config = 0;
    config.printer_paper_name = "";
    config.printer_orientation = "Landscape";
    config.process_at_end = process;
    config.process_argument_at_end = arg;

    const page = {

        id: 0,
        config_id: 0,
        page_loaded_or_js_request: "PAGE_LOADED",
        page_url: window.location.href,
    }

    let res1 = await ServerNet.send({ method: "add_config", data: config })

    if (res1.is_success) {
        page.config_id = res1.config_id
        let res2 = await ServerNet.send({ method: "print_page", data: page })
        if (res2.is_success) {

            dialog.success({
                title: '成功',
                content:`文件路径: ${res2.file_path}, id: ${res2.page_id}`, 
                positiveText: '好的',
                onPositiveClick: () => {
                    location.reload()
                }
            })
        } else {
            dialog.error({
                title: '失败',
                content: res2.msg,
                positiveText: '好的',
                onPositiveClick: () => {
                }
            })
        }

    } else {
        dialog.error({
            title: '失败',
            content: res1.msg,
            positiveText: '好的',
            onPositiveClick: () => {
            }
        })
    }
    btnCanClick.value = true
    btnMsg.value = "一键测试打印"
}

</script>
<template>
    <h2>测试</h2>
    <n-button :disabled="!btnCanClick" type="success" @click="toPrint">
        {{ btnMsg }}
    </n-button>
    <div style="height: 50px;">

    </div>
</template>