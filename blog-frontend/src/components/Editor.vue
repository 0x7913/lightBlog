<template>
    <div class="main-container">
        <div class="editor-container editor-container_classic-editor" ref="editorContainerElement">
            <div class="editor-container__editor">
                <div ref="editorElement">
                    <ckeditor v-if="editor && config" :modelValue="config.initialData" :editor="editor" :config="config"
                        @ready="onEditorReady" />
                </div>
            </div>
        </div>
    </div>
    <button @click="emitContent()">保存内容</button>
</template>

<script setup>
import { computed, ref, onMounted, watchEffect, watch } from 'vue';
import { Ckeditor, useCKEditorCloud } from '@ckeditor/ckeditor5-vue';

const emit = defineEmits(['content-change']);

const LICENSE_KEY =
    'eyJhbGciOiJFUzI1NiJ9.eyJleHAiOjE3NDMxMTk5OTksImp0aSI6ImNjYzI1YWY0LWEwNWMtNDFmOC05NTc4LTYzMWI2NGJlMDQ5MiIsInVzYWdlRW5kcG9pbnQiOiJodHRwczovL3Byb3h5LWV2ZW50LmNrZWRpdG9yLmNvbSIsImRpc3RyaWJ1dGlvbkNoYW5uZWwiOlsiY2xvdWQiLCJkcnVwYWwiLCJzaCJdLCJ3aGl0ZUxhYmVsIjp0cnVlLCJsaWNlbnNlVHlwZSI6InRyaWFsIiwiZmVhdHVyZXMiOlsiKiJdLCJ2YyI6IjkyMDljMzdhIn0.I9KRCluTmMMGKfXztS8AefbLbWUItTNIvFwZ91IPjjsViS-jC65comctlVFIjQ-eXCu9zHEZlaowH1R2NYKD-A';

const CLOUD_SERVICES_TOKEN_URL =
    'https://3q1t0lo3o0wf.cke-cs.com/token/dev/5d572c529bc54abc14b2d2cb762189f068cc70e0b14890a68000756bfde6?limit=10';

const cloud = useCKEditorCloud({ version: '44.3.0', translations: ['zh-cn'], ckbox: { version: '2.6.1' } });

const isLayoutReady = ref(false);
const editorInstance = ref(null);

const editor = computed(() => {
    if (!cloud.data.value) {
        return null;
    }

    return cloud.data.value.CKEditor.ClassicEditor;
});

// 监听编辑器实例化完成
const onEditorReady = (editor) => {
    editorInstance.value = editor; // 将编辑器实例赋值给 editorInstance
};

// 获取编辑器内容并传递给父组件
const emitContent = () => {
    if (editorInstance.value && typeof editorInstance.value.getData === 'function') {
        const content = editorInstance.value.getData(); // 获取编辑器内容
        emit('content-change', content); // 触发事件并传递内容
    } else {
        console.error('编辑器实例未初始化或 getData 方法不可用');
    }
};

const config = computed(() => {
    if (!isLayoutReady.value) {
        return null;
    }

    if (!cloud.data.value) {
        return null;
    }

    const {
        Alignment,
        AutoImage,
        Autosave,
        BlockQuote,
        Bold,
        CKBox,
        CloudServices,
        CodeBlock,
        Essentials,
        FontBackgroundColor,
        FontColor,
        FontFamily,
        FontSize,
        GeneralHtmlSupport,
        Heading,
        ImageBlock,
        ImageCaption,
        ImageEditing,
        ImageInline,
        ImageInsert,
        ImageInsertViaUrl,
        ImageResize,
        ImageStyle,
        ImageTextAlternative,
        ImageToolbar,
        ImageUpload,
        ImageUtils,
        Indent,
        IndentBlock,
        Italic,
        Link,
        LinkImage,
        List,
        ListProperties,
        Paragraph,
        PasteFromOffice,
        PictureEditing,
        Strikethrough,
        Table,
        TableCaption,
        TableCellProperties,
        TableColumnResize,
        TableProperties,
        TableToolbar,
        Title,
        Underline
    } = cloud.data.value.CKEditor;

    return {
        toolbar: {
            items: [
                'heading',
                '|',
                'fontSize',
                'fontFamily',
                'fontColor',
                'fontBackgroundColor',
                '|',
                'bold',
                'italic',
                'underline',
                'strikethrough',
                '|',
                'link',
                'insertImage',
                'ckbox',
                'insertTable',
                'blockQuote',
                'codeBlock',
                '|',
                'alignment',
                '|',
                'bulletedList',
                'numberedList',
                'outdent',
                'indent'
            ],
            shouldNotGroupWhenFull: false
        },
        plugins: [
            Alignment,
            AutoImage,
            Autosave,
            BlockQuote,
            Bold,
            CKBox,
            CloudServices,
            CodeBlock,
            Essentials,
            FontBackgroundColor,
            FontColor,
            FontFamily,
            FontSize,
            GeneralHtmlSupport,
            Heading,
            ImageBlock,
            ImageCaption,
            ImageEditing,
            ImageInline,
            ImageInsert,
            ImageInsertViaUrl,
            ImageResize,
            ImageStyle,
            ImageTextAlternative,
            ImageToolbar,
            ImageUpload,
            ImageUtils,
            Indent,
            IndentBlock,
            Italic,
            Link,
            LinkImage,
            List,
            ListProperties,
            Paragraph,
            PasteFromOffice,
            PictureEditing,
            Strikethrough,
            Table,
            TableCaption,
            TableCellProperties,
            TableColumnResize,
            TableProperties,
            TableToolbar,
            Title,
            Underline
        ],
        cloudServices: {
            tokenUrl: CLOUD_SERVICES_TOKEN_URL
        },
        fontFamily: {
            supportAllValues: true
        },
        fontSize: {
            options: [10, 12, 14, 'default', 18, 20, 22],
            supportAllValues: true
        },
        heading: {
            options: [
                {
                    model: 'paragraph',
                    title: 'Paragraph',
                    class: 'ck-heading_paragraph'
                },
                {
                    model: 'heading1',
                    view: 'h1',
                    title: 'Heading 1',
                    class: 'ck-heading_heading1'
                },
                {
                    model: 'heading2',
                    view: 'h2',
                    title: 'Heading 2',
                    class: 'ck-heading_heading2'
                },
                {
                    model: 'heading3',
                    view: 'h3',
                    title: 'Heading 3',
                    class: 'ck-heading_heading3'
                },
                {
                    model: 'heading4',
                    view: 'h4',
                    title: 'Heading 4',
                    class: 'ck-heading_heading4'
                },
                {
                    model: 'heading5',
                    view: 'h5',
                    title: 'Heading 5',
                    class: 'ck-heading_heading5'
                },
                {
                    model: 'heading6',
                    view: 'h6',
                    title: 'Heading 6',
                    class: 'ck-heading_heading6'
                }
            ]
        },
        htmlSupport: {
            allow: [
                {
                    name: /^.*$/,
                    styles: true,
                    attributes: true,
                    classes: true
                }
            ]
        },
        image: {
            toolbar: [
                'toggleImageCaption',
                'imageTextAlternative',
                '|',
                'imageStyle:inline',
                'imageStyle:wrapText',
                'imageStyle:breakText',
                '|',
                'resizeImage'
            ]
        },
        initialData:
            '',
        language: 'zh-cn',
        licenseKey: LICENSE_KEY,
        link: {
            addTargetToExternalLinks: true,
            defaultProtocol: 'https://',
            decorators: {
                toggleDownloadable: {
                    mode: 'manual',
                    label: 'Downloadable',
                    attributes: {
                        download: 'file'
                    }
                }
            }
        },
        list: {
            properties: {
                styles: true,
                startIndex: true,
                reversed: true
            }
        },
        placeholder: '输入内容',
        table: {
            contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties']
        }
    };
});

onMounted(() => {
    isLayoutReady.value = true;
});

// watchEffect(() => {
//     if (config.value) {
//         configUpdateAlert(config.value);
//     }
// });

// /**
//  * This function exists to remind you to update the config needed for premium features.
//  * The function can be safely removed. Make sure to also remove call to this function when doing so.
//  */
// function configUpdateAlert(config) {
//     if (configUpdateAlert.configUpdateAlertShown) {
//         return;
//     }

//     const isModifiedByUser = (currentValue, forbiddenValue) => {
//         if (currentValue === forbiddenValue) {
//             return false;
//         }

//         if (currentValue === undefined) {
//             return false;
//         }

//         return true;
//     };

//     const valuesToUpdate = [];

//     configUpdateAlert.configUpdateAlertShown = true;

//     if (!isModifiedByUser(config.cloudServices?.tokenUrl, '<YOUR_CLOUD_SERVICES_TOKEN_URL>')) {
//         valuesToUpdate.push('CLOUD_SERVICES_TOKEN_URL');
//     }

//     if (valuesToUpdate.length) {
//         window.alert(
//             [
//                 'Please update the following values in your editor config',
//                 'to receive full access to Premium Features:',
//                 '',
//                 ...valuesToUpdate.map(value => ` - ${value}`)
//             ].join('\n')
//         );
//     }
// }
</script>
