<template>
    <div>
        <textarea ref="editorRef"></textarea>
    </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch, defineProps, defineEmits } from "vue";
import { ElMessage } from 'element-plus';
import EasyMDE from "easymde";
import "easymde/dist/easymde.min.css";
import * as BlogApi from '@/api';

const props = defineProps({
    modelValue: String,
});
const emit = defineEmits(["update:modelValue"]);

const editorRef = ref(null);
let easyMDE = null;

const fileUpload = async (file, onSuccess, onError) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

    // 检查文件类型
    if (!allowedTypes.includes(file.type)) {
        onError("只能上传 JPEG, PNG, GIF, 或 WebP 格式的图片");
        return;
    }
    try {
        const formData = new FormData();
        formData.append("image", file);

        // 调用上传文章图片的 API
        const res = await BlogApi.uploadPostImage(formData);

        if (res.code === 0 && res.data?.url) {
            ElMessage.success("图片上传成功！");
            const fullUrl = `http://localhost:5000${res.data.url}`;
            onSuccess(fullUrl);
        } else {
            ElMessage.error("图片上传失败，请重试！");
        }
    } catch (error) {
        console.error("上传失败：", error);
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
            minHeight: "600px",
            imageUploadFunction: fileUpload, // 自定义上传函数
            imageAccept: "image/*", // 限制只能上传图片
            placeholder: "请输入 Markdown 内容...",
            toolbar: [
                { name: "bold", action: EasyMDE.toggleBold, className: "fa fa-bold", title: "加粗" },
                { name: "italic", action: EasyMDE.toggleItalic, className: "fa fa-italic", title: "斜体" },
                { name: "heading", action: EasyMDE.toggleHeadingSmaller, className: "fa fa-header", title: "标题" },
                "|",
                { name: "quote", action: EasyMDE.toggleBlockquote, className: "fa fa-quote-left", title: "引用" },
                { name: "code", action: EasyMDE.toggleCodeBlock, className: "fa fa-code", title: "代码" },
                {
                    name: "inline-code", action: function (editor) {
                        var cm = editor.codemirror;
                        var selection = cm.getSelection();
                        cm.replaceSelection('`' + selection + '`');
                        if (!selection) {
                            var cursorPos = cm.getCursor();
                            cm.setCursor(cursorPos.line, cursorPos.ch - 1);
                        }
                        cm.focus();
                    }, className: "fa fa-terminal", title: "行内代码"
                },
                { name: "unordered-list", action: EasyMDE.toggleUnorderedList, className: "fa fa-list-ul", title: "无序列表" },
                { name: "ordered-list", action: EasyMDE.toggleOrderedList, className: "fa fa-list-ol", title: "有序列表" },
                "|",
                { name: "link", action: EasyMDE.drawLink, className: "fa fa-link", title: "插入链接" },
                { name: "image", action: EasyMDE.drawImage, className: "fa fa-image", title: "插入图片" },
                { name: "table", action: EasyMDE.drawTable, className: "fa fa-table", title: "插入表格" },
                { name: "horizontal-rule", action: EasyMDE.drawHorizontalRule, className: "fa fa-minus", title: "插入水平线" },
                "|",
                { name: "preview", action: EasyMDE.togglePreview, className: "fa fa-eye no-disable", title: "预览" },
                { name: "side-by-side", action: EasyMDE.toggleSideBySide, className: "fa fa-columns no-disable", title: "并排预览" },
                { name: "fullscreen", action: EasyMDE.toggleFullScreen, className: "fa fa-arrows-alt no-disable", title: "全屏" },
                "|",
                { name: "guide", action: "https://www.markdownguide.org/basic-syntax/", className: "fa fa-question-circle", title: "Markdown 指南" },
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

    img {
        max-width: 100%;
        max-height: 500px;
        object-fit: cover;
        padding: 5px;
    }

    .CodeMirror {
        height: 600px;
    }

    .fullscreen {
        z-index: 10003 !important;
    }

    .CodeMirror-scroll {
        overflow: hidden;
    }

    /* 行内代码样式 */
    .editor-preview code:not(pre code),
    .editor-preview-active code:not(pre code) {
        background-color: var(--gray-100);
        color: var(--tw-prose-code);
        padding: .15rem .3rem;
        font-weight: 500;
        border-radius: .25rem;
    }


    /* 预览区域中的代码块样式 */
    .editor-preview pre code,
    .editor-preview-active pre code {
        background: #282c34;
        /* 背景颜色 */
        color: #abb2bf;
        /* 文字颜色 */
        padding: 10px;
        /* 内边距 */
        border-radius: 4px;
        /* 圆角边框 */
        display: block;
        overflow-x: auto;
    }
}
</style>