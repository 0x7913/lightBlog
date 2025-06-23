<template>
  <div>
    <textarea ref="editorRef"></textarea>
  </div>
</template>

<script setup>
import {onMounted, onBeforeUnmount, ref, watch} from "vue";
import {ElMessage} from 'element-plus';
import EasyMDE from "easymde";
import "easymde/dist/easymde.min.css";
import * as BlogApi from '@/api';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';  // 可以选择其他样式

const props = defineProps({
  modelValue: String,
});
const emit = defineEmits(["update:modelValue"]);

const editorRef = ref(null);
let easyMDE = null;

// 配置 highlight.js
hljs.configure({
  tabReplace: '    ', // 替换制表符为4个空格
  languages: ['javascript', 'python', 'java', 'c', 'cpp', 'go', 'rust', 'php', 'ruby', 'bash', 'sql', 'json', 'xml', 'html', 'css', 'scss', 'markdown'] // 预加载常用语言
});

const fileUpload = async (file, onSuccess, onError) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

  if (!allowedTypes.includes(file.type)) {
    onError("只能上传 JPEG, PNG, GIF, 或 WebP 格式的图片");
    return;
  }
  try {
    const formData = new FormData();
    formData.append("image", file);

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
      imageUploadFunction: fileUpload,
      imageAccept: "image/*",
      placeholder: "请输入 Markdown 内容...",
      renderingConfig: {
        codeSyntaxHighlighting: true, // 启用代码高亮
        hljs: hljs // 传入 highlight.js 实例
      },
      toolbar: [
        // 保持原有的工具栏配置不变
        {name: "bold", action: EasyMDE.toggleBold, className: "fa fa-bold", title: "加粗"},
        {name: "italic", action: EasyMDE.toggleItalic, className: "fa fa-italic", title: "斜体"},
        {name: "heading", action: EasyMDE.toggleHeadingSmaller, className: "fa fa-header", title: "标题"},
        "|",
        {name: "quote", action: EasyMDE.toggleBlockquote, className: "fa fa-quote-left", title: "引用"},
        {name: "code", action: EasyMDE.toggleCodeBlock, className: "fa fa-code", title: "代码"},
        {
          name: "inline-code", action: function (editor) {
            let cm = editor.codemirror;
            let selection = cm.getSelection();
            cm.replaceSelection('`' + selection + '`');
            if (!selection) {
              let cursorPos = cm.getCursor();
              cm.setCursor(cursorPos.line, cursorPos.ch - 1);
            }
            cm.focus();
          }, className: "fa fa-terminal", title: "行内代码"
        },
        {name: "unordered-list", action: EasyMDE.toggleUnorderedList, className: "fa fa-list-ul", title: "无序列表"},
        {name: "ordered-list", action: EasyMDE.toggleOrderedList, className: "fa fa-list-ol", title: "有序列表"},
        "|",
        {name: "link", action: EasyMDE.drawLink, className: "fa fa-link", title: "插入链接"},
        {name: "image", action: EasyMDE.drawImage, className: "fa fa-image", title: "插入图片"},
        {name: "table", action: EasyMDE.drawTable, className: "fa fa-table", title: "插入表格"},
        {name: "horizontal-rule", action: EasyMDE.drawHorizontalRule, className: "fa fa-minus", title: "插入水平线"},
        "|",
        {name: "preview", action: EasyMDE.togglePreview, className: "fa fa-eye no-disable", title: "预览"},
        {
          name: "side-by-side",
          action: EasyMDE.toggleSideBySide,
          className: "fa fa-columns no-disable",
          title: "并排预览"
        },
        {name: "fullscreen", action: EasyMDE.toggleFullScreen, className: "fa fa-arrows-alt no-disable", title: "全屏"},
        "|",
        {
          name: "guide",
          action: "https://www.markdownguide.org/basic-syntax/",
          className: "fa fa-question-circle",
          title: "Markdown 指南"
        },
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
  line-height: 1.8;
  white-space: normal;
  word-break: break-word;

  img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    object-fit: cover;
  }

  .CodeMirror {
    height: 600px;
  }

  .fullscreen {
    z-index: 10003 !important;
  }

  .CodeMirror-scroll {
    overflow: auto !important;
    padding-bottom: 10px;
  }

  // 引用的样式
  .CodeMirror .cm-quote {
    font-style: normal !important;
    color: #555;
  }

  .editor-preview blockquote,
  .editor-preview-active blockquote {
    border-left: 4px solid #ccc;
    padding-left: 1rem;
    color: #555;
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

  /* 代码块样式优化 */
  .editor-preview pre,
  .editor-preview-active pre {
    border-radius: 8px;
    overflow: auto;
    margin: 16px 0;
    //border: 1px solid #e1e4e8;
    //background: #f6f8fa;
    //padding: 16px;
  }

  /* 预览区域中的代码块样式 */
  .editor-preview pre code,
  .editor-preview-active pre code {
    background: #282c34;
    color: #abb2bf;
    padding: 10px;
    border-radius: 8px;
    display: block;
    overflow-x: auto;
  }

  /* 表格样式 */
  .editor-preview table,
  .editor-preview-active table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
  }

  .editor-preview table th,
  .editor-preview-active table th {
    background-color: #f4f4f4;
    color: #333;
    font-weight: bold;
    border: 1px solid #ddd;
    padding: 12px;
    text-align: left;
  }

  .editor-preview table td,
  .editor-preview-active table td {
    border: 1px solid #ddd;
    padding: 12px;
    text-align: left;
  }

  /* 链接样式 */
  .editor-preview a,
  .editor-preview-active a {
    color: #1e88e5;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
    border-bottom: 1px solid rgba(30, 136, 229, 0.5);
  }

  .editor-preview a:hover,
  .editor-preview-active a:hover {
    color: #1565c0;
    border-bottom: 1px solid rgba(21, 101, 192, 0.7);
  }

  .editor-preview a:active,
  .editor-preview-active a:active {
    color: #0d47a1;
  }
}
</style>
