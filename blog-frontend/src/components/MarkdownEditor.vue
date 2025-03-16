<template>
    <div>
        <textarea ref="editorRef"></textarea>
    </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch, defineProps, defineEmits } from "vue";
import EasyMDE from "easymde";
import "easymde/dist/easymde.min.css";

const props = defineProps({
    modelValue: String,
});
const emit = defineEmits(["update:modelValue"]);

const editorRef = ref(null);
let easyMDE = null;

const fileUpload = async (file, onSuccess, onError) => {
    console.log("🚀 EasyMDE 正在执行 fileUpload", file); // 检查是否被调用

    try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("https://your-api.com/upload", {
            method: "POST",
            body: formData,
        });

        const result = await response.json();
        console.log("✅ 上传成功：", result);

        if (result.url) {
            onSuccess(result.url); // 返回图片 URL
        } else {
            throw new Error("Upload failed");
        }
    } catch (error) {
        console.error("❌ 上传失败：", error);
        onError("Upload failed");
    }
};

onMounted(() => {
    if (editorRef.value) {
        easyMDE = new EasyMDE({
            element: editorRef.value,
            autofocus: true,
            spellChecker: false,
            uploadImage: true,
            imageUploadFunction: fileUpload, // 自定义上传函数
            imageAccept: "image/*", // 限制只能上传图片
            placeholder: "请输入 Markdown 内容...",
            toolbar: [
                "bold",
                "italic",
                "heading",
                "|",
                "quote",
                "code",
                "unordered-list",
                "ordered-list",
                "|",
                "link",
                "image", // 确保包含图片按钮
                "table",
                "horizontal-rule",
                "|",
                "preview",
                "side-by-side",
                "fullscreen",
                "|",
                "guide",
            ],
        });

        easyMDE.codemirror.on("change", () => {
            emit("update:modelValue", easyMDE.value());
        });

        easyMDE.value(props.modelValue || "");
    }
});



// 监听 modelValue 变化并同步到 EasyMDE
watch(
    () => props.modelValue,
    (newValue) => {
        if (easyMDE && newValue !== easyMDE.value()) {
            easyMDE.value(newValue);
        }
    }
);

// 组件卸载前清理 EasyMDE
onBeforeUnmount(() => {
    if (easyMDE) {
        easyMDE.toTextArea();
        easyMDE = null;
    }
});
</script>

<style lang="scss">
.EasyMDEContainer {
    .fullscreen {
        z-index: 10003 !important;
    }

    .CodeMirror-scroll {
        overflow: hidden;
    }
}
</style>