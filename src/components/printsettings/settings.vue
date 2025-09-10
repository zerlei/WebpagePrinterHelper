<script setup>
import config from "./config.vue"
import dashboard from "./dashboard.vue";
import printtest from "./printtest.vue"
import {ref,nextTick} from 'vue'

</script>
<template>
    <dashboard>
    </dashboard>
    <config>
    </config>
    <printtest ref="printTest">
    </printtest> 
</template>