(function (Vue, interact) {
    var box, boxHeaderHeight, uploadTextHeight, uploadTipstHeight, boxContent, boxContentPaddingTop, boxContentPaddingBottom, totalHeight;
    var Defaults, Main, Upload,
        clientHeight = document.documentElement.clientHeight,
        clientWidth = document.documentElement.clientWidth,
        hasOwn = Object.hasOwnProperty,
        BOX_STYLE = '.el-message-box.el-draggable-resizable-box{display:block;padding-bottom:0;}.el-draggable-resizable-box .el-message-box__content{height:calc(100% - 43px);box-sizing:border-box;text-align:center;position:relative;}.el-draggable-resizable-box .el-upload,.el-draggable-resizable-box .el-upload-dragger{width:100%;}.el-draggable-resizable-box .el-upload-list__item-name{text-align:left;}.el-draggable-resizable-box .el-upload-list__item-name [class^=el-icon]{color:#108FE2;}.el-draggable-resizable-box .el-upload-list__item .el-icon-close{color:#F5222D;top:8px;}.el-draggable-resizable-box .el-upload-list__item .el-icon-close:before{content:"\\e79d";}.el-draggable-resizable-box .el-upload-list__item{font-size:16px;line-height:2;}.el-draggable-resizable-box .el-message-box__message{height:100%;}.el-draggable-resizable-box .el-upload-list{overflow:hidden auto;}.el-draggable-resizable-box .el-icon-circle-check:before {content: "\\e79c";}';
    var node = document.createElement('style');
    node.setAttribute('id', 'message-box-style');
    node.innerText = BOX_STYLE;
    document.head.append(node);

    function isFunction(target) {
        return Object.prototype.toString.call(target) === "[object Function]";
    }

    function isObject(target) {
        return Object.prototype.toString.call(target) === "[object Object]";
    }

    function isWindow(obj) {
        return obj != null && obj === obj.window
    }

    function isPlainObject(obj) {
        var key;

        // Not plain objects:
        // - Any object or value whose internal [[Class]] property is not "[object Object]"
        // - DOM nodes
        // - window

        if (!isObject(obj) || obj.nodeType || isWindow(obj)) {
            return false;
        }

        // Not own constructor property must be Object
        if (obj.constructor &&
            !hasOwn.call(obj, "constructor") &&
            !hasOwn.call(obj.constructor.prototype || {}, "isPrototypeOf")) {
            return false;
        }

        // Own properties are enumerated firstly, so to speed up,
        // if last one is own, then all properties are own
        for (key in obj) { }

        return key === undefined || hasOwn.call(obj, key);
    }

    function extend() {
        var options, name, src, copy, copyIsArray, clone,
            target = arguments[0] || {},
            i = 1,
            length = arguments.length,
            deep = false;

        // Handle a deep copy situation
        if (typeof target === "boolean") {
            deep = target;

            // Skip the boolean and the target
            target = arguments[i] || {};
            i++;
        }

        // Handle case when target is a string or something (possible in deep copy)
        if (typeof target !== "object" && !isFunction(target)) {
            target = {};
        }

        // Extend jQuery itself if only one argument is passed
        if (i === length) {
            target = this;
            i--;
        }

        for (; i < length; i++) {

            // Only deal with non-null/undefined values
            if ((options = arguments[i]) != null) {

                // Extend the base object
                for (name in options) {
                    src = target[name];
                    copy = options[name];

                    // Prevent never-ending loop
                    if (target === copy) {
                        continue;
                    }

                    // Recurse if we're merging plain objects or arrays
                    if (deep && copy && (isPlainObject(copy) ||
                        (copyIsArray = Array.isArray(copy)))) {

                        if (copyIsArray) {
                            copyIsArray = false;
                            clone = src && Array.isArray(src) ? src : [];

                        } else {
                            clone = src && isPlainObject(src) ? src : {};
                        }

                        // Never move original objects, clone them
                        target[name] = extend(deep, clone, copy);

                        // Don't bring in undefined values
                    } else if (copy !== undefined) {
                        target[name] = copy;
                    }
                }
            }
        }

        // Return the modified object
        return target;
    };

    function noop() { };

    function addEventListener(element, event, callback) {
        if (window.addEventListener) {
            document.querySelector(element).addEventListener(event, callback, false);
        }
        else {
            document.querySelector(element).attachEvent(event, callback);
        }
    }

    function removeEventListener(element, event, callback) {
        if (window.removeEventListener) {
            document.querySelector(element).removeEventListener(event, callback, false);
        }
        else {
            document.querySelector(element).detachEvent(event, callback);
        }
    }

    function layout() {
        boxHeaderHeight = parseInt(document.querySelector('.el-draggable-resizable-box .el-message-box__header').getBoundingClientRect().height);
        uploadTextHeight = parseInt(document.querySelector('.el-draggable-resizable-box .el-upload--text').getBoundingClientRect().height);
        uploadTipstHeight = parseInt(document.querySelector('.el-draggable-resizable-box .el-upload__tip').getBoundingClientRect().height);
        boxContent = window.getComputedStyle(document.querySelector('.el-draggable-resizable-box .el-message-box__content'));
        boxContentPaddingTop = parseInt(boxContent.paddingTop);
        boxContentPaddingBottom = parseInt(boxContent.paddingBottom);
        totalHeight = boxHeaderHeight + boxContentPaddingTop + boxContentPaddingBottom + uploadTextHeight + uploadTipstHeight + 54;
        removeEventListener('.el-message-box__wrapper', 'animationend', layout);
    }

    function initLayout() {
        // var parent = document.querySelector('.el-draggable-resizable-box').parentNode;
        // parent.style.display = 'flex';
        // parent.style.justifyContent = 'center';
        // parent.style.alignItems = 'center';
        var box, boxHeight, boxWidth, y, x;
        var box = document.querySelector('.el-draggable-resizable-box');
        boxHeight = box.getBoundingClientRect().height;
        boxWidth = box.getBoundingClientRect().width;
        y = clientHeight / 2 - boxHeight / 2;
        x = clientWidth / 2 - boxWidth / 2;
        box.style.webkitTransform = box.style.transform = 'translate(' + (x | 0) + 'px,' + (y | 0) + 'px)';
        box.setAttribute('data-x', x);
        box.setAttribute('data-y', y);
        removeEventListener('.el-message-box__wrapper', 'animationstart', initLayout);
    }

    function resetBox() {
        var box = document.querySelector('.el-draggable-resizable-box');
        box.style = '';
        box.removeAttribute('data-x')
        box.removeAttribute('data-y')
        removeEventListener('.el-message-box__wrapper', 'animationend', resetBox);
    }

    Defaults = {
        'before-remove': noop,
        'before-upload': noop,
        'http-request': noop,
        'on-error': noop,
        'on-exceed': noop,
        'on-preview': noop,
        'on-progress': noop,
        'on-remove': noop,
        'on-success': noop,
        'with-credentials': false,
        'show-file-list': true,
        accept: null,
        action: null,
        'auto-upload': true,
        data: null,
        disabled: false,
        drag: false,
        'file-list': [],
        headers: null,
        limit: null,
        'list-type': 'text',
        multiple: null,
        name: "files",
        type: null,
        title: '上传文件',
        submitButtonText: '上传到服务器',
        abortButtonText: '取消上传',
        fileButtonText: '将文件拖到此处，或 <em> 点击上传</em>',
        tips: '只能上传jpg/png文件，且不超过500kb',
        uploadCustomClass: ''
    }

    Main = {
        template: '<div style=" display: flex;flex-direction: column;height: 100%;"><div style="flex: 1;flex-basis:auto;">' +
            '<el-upload :class="uploadCustom.uploadCustomClass" v-bind="uploadProps" ref="upload-inner">' +
            '<i class="el-icon-upload"></i>' +
            '<div class="el-upload__text" v-html="uploadCustom.fileButtonText"> </div> ' +
            '<div class="el-upload__tip" slot = "tip" v-html="uploadCustom.tips"></div> ' +
            '</el-upload>' +
            '</div>' +
            '<div class="el-message-box__message-btns" style="display: flex;justify-content: flex-end;margin-top:15px;">' +
            '<el-button size = "mini" type = "primary" v-if="!uploadCustom[\'auto-upload\']" v-text="uploadCustom.submitButtonText" @click="submitUpload"></el-button> ' +
            '<el-button style = "margin-left: 10px;" size = "mini" type = "danger"  v-text="uploadCustom.abortButtonText"  @click="abortUpload"></el-button> ' +
            '</div>' +
            '</div>',
        data() {
            return {
                uploadProps: {},
                uploadCustom: {},
            }
        },
        methods: {
            submitUpload: function () {
                this.$refs['upload-inner'].submit();
            },
            abortUpload: function () {
                var vm = this;
                this.fileList.some(function (file) {
                    typeof file === 'object' && vm.$refs['upload-inner'].abort();
                })
                this.$refs['upload-inner'].clearFiles();
            }
        }
    }

    Upload = function (options, callback) {
        var h, dragInstance, uploadProps, uploadVnode, title;
        h = this.$createElement;
        uploadProps = extend(true, {}, Defaults, options);
        title = uploadProps.title
        uploadVnode = Vue.extend(extend(true, {}, Main, {
            data: function () {
                var uploadCustom = {};
                delete uploadProps.title;
                ['submitButtonText', 'abortButtonText', 'fileButtonText', 'uploadCustomClass', 'tips'].some(function (proto) {
                    uploadCustom[proto] = uploadProps[proto];
                    delete uploadProps[proto];
                })
                return {
                    uploadProps: uploadProps,
                    uploadCustom: uploadCustom
                }
            }
        }))

        this.$msgbox({
            title: title,
            customClass: 'el-draggable-resizable-box',
            modal: false,
            closeOnClickModal: false,
            showConfirmButton: false,
            message: h(uploadVnode, {
                key: (+new Date())
            }),
            beforeClose: function (action, instance, done) {
                addEventListener('.el-message-box__wrapper', 'animationend', resetBox);
                done();
            },
            callback: function (action, instance) {
                dragInstance.unset();
                delete dragInstance;
                if (isFunction(callback)) {
                    callback.apply(this, action, instance)
                }
            }
        })

        this.$nextTick(function () {
            addEventListener('.el-message-box__wrapper', 'animationstart', initLayout);
            addEventListener('.el-message-box__wrapper', 'animationend', layout);

            dragInstance = interact('.el-draggable-resizable-box').set({

                draggable: {
                    cursorChecker: function () {
                        return 'default'
                    },
                    ignoreFrom: '.el-message-box__content,span',
                    inertia: true,
                    modifiers: [
                        interact.modifiers.restrictRect({
                            restriction: 'parent'

                        })
                    ],
                    onmove: function (event) {
                        var target = event.target
                        var x = (parseInt(target.getAttribute('data-x')) || 0) + event.dx
                        var y = (parseInt(target.getAttribute('data-y')) || 0) + event.dy

                        target.style.webkitTransform = target.style.transform = 'translate(' + parseInt(x) + 'px, ' + parseInt(y) + 'px)'

                        target.setAttribute('data-x', x)
                        target.setAttribute('data-y', y)
                    }
                },
                resizable: {
                    origin: 'parent',
                    edges: {
                        left: true,
                        right: true,
                        bottom: true,
                        top: true
                    },
                    modifiers: [
                        interact.modifiers.restrictEdges({
                            outer: 'parent',
                            endOnly: true
                        }),

                        interact.modifiers.restrictSize({
                            min: {
                                width: 420,
                                height: 318
                            }
                        })
                    ],
                    inertia: false,
                    onmove: function (event) {
                        var target = event.target
                        var x = ((target.getAttribute('data-x') | 0) || 0);
                        var y = ((target.getAttribute('data-y') | 0) || 0);
                        target.style.width = event.rect.width + 'px'
                        target.style.height = event.rect.height + 'px'
                        document.querySelector('.el-draggable-resizable-box .el-upload-list').style.height = event.rect.height - totalHeight + 'px'
                        x += event.deltaRect.left
                        y += event.deltaRect.top

                        target.style.webkitTransform = target.style.transform = 'translate(' + (x | 0) + 'px,' + (y | 0) + 'px)'

                        target.setAttribute('data-x', x)
                        target.setAttribute('data-y', y)
                    }
                }
            })
        })
    }
    Vue.prototype.$upload = Upload
})(Vue, interact)