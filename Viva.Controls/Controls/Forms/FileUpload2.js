var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "../../Util/TemplateEngine", "../Base/ValidationPlacements/DockedBalloon", "../Base/Validators", "../../Base/Base.TriggerableLifetimeManager", "../Base/ValidationPlacements/Css", "./TextBox", "../DockedBalloon", "./Button", "../Base/Base", "../Base/ValidatableControl", "../../Util/StringUtil"], function (require, exports, TemplateEngine, DockedBalloon, Validators, TriggerableLifetimeManagerBase, Css, TextBox, DockedBalloon2, Button, Base, ValidatableControl, StringUtil) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery, uuid = 0, globalFormControl = "azc-formControl", widgetClass = "azc-fileUpload2", widgetHoverClass = "azc-fileUpload-state-hover", widgetHasFocusClass = "azc-fileUpload-hasfocus", widgetSecondaryClass = "azc-btn-secondary", prefixId = "__azc-fileUpload", progressBarCancelUploadSelector = ".azc-fileUpload-progressBar-cancelUpload", progressBarGroupCancelUploadSelector = ".azc-fileUpload-progressBarGroup-cancelUpload", progressBarGroupCollapseAllSelector = ".azc-fileUpload-progresBarGroup-collapseAll", defaultFullFileUploadMaxSize = 2097152, defaultFullFileUploadChunkSize = defaultFullFileUploadMaxSize, defaultStreamFileUploadMaxSize = 209715200, defaultStreamFileUploadChunkSize = 1048576, defaultBlobStoreUploadMaxSize = 53687091200, defaultBlobStoreUploadChunkSize = defaultFullFileUploadMaxSize, template = "<div class='azc-fileUpload-wrapper'>" + "<div class='azc-fileUpload-selectedFile' data-bind='azcTextBox: func._textBoxViewModel'></div>" + "<button class='" + widgetSecondaryClass + "' data-bind='azcButton: func._buttonViewModel'>" + "<svg width='16px' height='16px' x='0px' y='0px' viewBox='0 0 12 12' enable-background='new 0 0 12 12' xml: space='preserve' >" + "<path d ='M11.3,3H1v9h10.4c0.3,0,0.6-0.3,0.6-0.6V3H11.3z'></path>" + "<path d ='M1,3v8.6C1,11.9,0.9,12,0.6,12C0.3,12,0,12.1,0,11.8V1h3.8l1.4,1H12v1H1z'></path>" + "</svg>" + "</button>" + "<input type='file' class='azc-fileUpload-overlay " + globalFormControl + "' data-bind='attr: { name: func._name, accept: data.accept, multiple: data.maxFiles > 1 }'></input>" + "</div>" + "<div class='azc-fileUpload-progressBars' data-bind='visible: data.showProgressBars'>" + "<!--ko if: data.files().length === 1 -->" + "<!-- ko foreach: data.files() -->" + "<!-- ko if: !$data.cancelUpload() -->" + "<!-- ko template: { name: 'progressBar', templateEngine: $root.customTemplateEngine } --><!-- /ko -->" + "<!-- /ko -->" + "<!-- /ko -->" + "<!-- /ko -->" + "<!--ko if: data.files().length > 1 -->" + "<!-- ko template: { name: 'progressBarGroup', templateEngine: $root.customTemplateEngine } --><!-- /ko -->" + "<!-- ko if: !$root.func._progressBarGroupCollapseAll() -->" + "<!-- ko foreach: data.files() -->" + "<!-- ko if: !$data.cancelUpload() -->" + "<!-- ko template: { name: 'progressBar', templateEngine: $root.customTemplateEngine } --><!-- /ko -->" + "<!-- /ko -->" + "<!-- /ko -->" + "<!-- /ko -->" + "<!-- /ko -->" + "</div>", progressBarTemplate = "<div class='azc-fileUpload-progressBar'>" + "<div class='azc-fileUpload-progressBarAndCancel-container'>" + "<div class='azc-fileUpload-progressBar-container'>" + "<div class='azc-fileUpload-progress-value' data-bind='style: { width: (($data.uploadResult().progressPercent * 100) + \"%\") }, css: {\"azc-bg-success\": $data.uploadResult().valid, \"azc-bg-invalid\": !$data.uploadResult().valid }'></div>" + "<div class='azc-fileUpload-progress-background'></div>" + "</div>" + "<a href='#' class='azc-fileUpload-progressBar-cancelUpload azc-fill-text' tabindex='0'>" + "<svg x='0px' y='0px' width='16px' height='16px' viewBox='0 0 16 16' enable-background='new 0 0 16 16' xml:space='preserve'>" + "<polygon points='15,3.475 12.539,1.001 8.006,5.534 3.474,1.001 1,3.475 5.52,8.007 1,12.527 3.474,15.001 7.994, 10.481 12.526, 15.014 15, 12.54 10.467, 8.007'/>" + "</svg>" + "</a>" + "<div class='azc-fileUpload-progresBar-infoBalloon' data-bind='azcDockedBalloon: $root.func._getProgressInfoBalloonViewModel($data)'></div>" + "</div>" + "<div class='azc-fileUpload-progressDetails' data-bind='text: $data.name'></div>" + "</div>", progressBarGroupTemplate = "<div class='azc-fileUpload-progressBarGroup'>" + "<div class='azc-fileUpload-progressBarAndCancel-container'>" + "<div class='azc-fileUpload-progressBar-container'>" + "<div class='azc-fileUpload-progress-value' data-bind='style: { width: (($root.func._progressBarGroupPercent() * 100) + \"%\") }, css: {\"azc-bg-success\": $root.func._progressBarGroupValid(), \"azc-bg-invalid\": !$root.func._progressBarGroupValid() }'></div>" + "<div class='azc-fileUpload-progress-background'></div>" + "</div>" + "<a href='#' class='azc-fileUpload-progressBarGroup-cancelUpload azc-fill-text' tabindex='0'>" + "<svg x='0px' y='0px' width='16px' height='16px' viewBox='0 0 16 16' enable-background='new 0 0 16 16' xml:space='preserve'>" + "<polygon points='15,3.475 12.539,1.001 8.006,5.534 3.474,1.001 1,3.475 5.52,8.007 1,12.527 3.474,15.001 7.994, 10.481 12.526, 15.014 15, 12.54 10.467, 8.007'/>" + "</svg>" + "</a>" + "<a href='#' class='azc-fileUpload-progresBarGroup-collapseAll azc-fill-text' tabindex='0'>" + "<!-- ko if: $root.func._progressBarGroupCollapseAll() -->" + "<svg x='0px' y='0px' width='16px' height='16px' viewBox='0 0 11.9 7' enable-background='new 0 0 11.9 7' xml:space='preserve'>" + "<polygon points='5.1,6.1 5.1,6.1 6,7 6.8,6.1 6.8,6.1 11.9,1 10.9,0 6,4.9 1,0 0,1'/>" + "</svg>" + "<!-- /ko -->" + "<!-- ko if: !$root.func._progressBarGroupCollapseAll() -->" + "<svg x='0px' y='0px' width='16px' height='16px' viewBox='0 0 11.9 7' enable-background='new 0 0 11.9 7' xml:space='preserve'>" + "<polygon points='5.1, 0.9 5.1, 0.9 6, 0 6.8, 0.9 6.8, 0.9 11.9, 6 10.9, 7 6, 2.1 1, 7 0, 6' />" + "</svg>" + "<!-- /ko -->" + "</a>" + "</div>" + "<div class='azc-fileUpload-progressDetails' data-bind='text: $root.func._progressBarGroupDetails'></div>" + "</div>", validationPlacementOptions = {
            "validationStateBalloonOptions": {
                "pending": {
                    "balloonVisible": false
                }
            }
        };
        /**
         *  Specifies how the file content should be uploaded.
         */
        (function (FileUploadType) {
            /**
             *  Full file content will be read. Use this option only for small file sizes less than 2 MB.
             */
            FileUploadType[FileUploadType["Full"] = 0] = "Full";
            /**
             * File content will be read in chunks and provided to user in chunks.
             * Use this option to read large files and if user wants control over where to post the content.
             */
            FileUploadType[FileUploadType["Stream"] = 1] = "Stream";
            /**
             * File content will be uploaded to blob store.
             * Use this option for uploading large files in GBs.
             */
            FileUploadType[FileUploadType["BlobStore"] = 2] = "BlobStore";
        })(Main.FileUploadType || (Main.FileUploadType = {}));
        var FileUploadType = Main.FileUploadType;
        /**
         * Specifies how the file content should be read and encoded in memory.
         * These options mimics the html5 file reader options to read the file content.
         */
        (function (ContentType) {
            /**
             * By default, file content will be read and stored as binary data in an ArrayBuffer.
             */
            ContentType[ContentType["Default"] = 0] = "Default";
            /**
             * The file content will be read as plain text.
             * By default the string is encoded in 'UTF-8' format. Use the optional encoding parameter to specify a different format.
             */
            ContentType[ContentType["Text"] = 1] = "Text";
            /**
             * The file content will be available in an ArrayBuffer.
             */
            ContentType[ContentType["ArrayBuffer"] = 2] = "ArrayBuffer";
            /**
             * The file content will be encoded in the data uri scheme. Use this option for images and if those need to be directly shown in img tag.
             */
            ContentType[ContentType["DataUri"] = 3] = "DataUri";
        })(Main.ContentType || (Main.ContentType = {}));
        var ContentType = Main.ContentType;
        (function (UploadStatus) {
            /**
             * Invalid.
             */
            UploadStatus[UploadStatus["Invalid"] = 0] = "Invalid";
            /**
             * Pending.
             */
            UploadStatus[UploadStatus["Pending"] = 1] = "Pending";
            /**
             * Uploading.
             */
            UploadStatus[UploadStatus["Uploading"] = 2] = "Uploading";
            /**
             * Paused.
             */
            UploadStatus[UploadStatus["Paused"] = 3] = "Paused";
            /**
             * Complete.
             */
            UploadStatus[UploadStatus["Complete"] = 4] = "Complete";
            /**
             * Canceled.
             */
            UploadStatus[UploadStatus["Canceled"] = 5] = "Canceled";
        })(Main.UploadStatus || (Main.UploadStatus = {}));
        var UploadStatus = Main.UploadStatus;
        /**
         * Full file upload context.
         */
        var FullFileUploadContext = (function () {
            function FullFileUploadContext() {
                /**
                 * Full file will be read and the entire content will be available in memory.
                 */
                this.type = 0 /* Full */;
                /**
                 * File content will be stored by default in an array buffer.
                 */
                this.contentType = 0 /* Default */;
                /**
                 * Optionally specify the encoding for Text content type like "UTF-8", "UTF-16" etc.
                 * This parameter will be used directly for HTML5 file reader's readAsText method.
                 */
                this.encoding = null;
                /**
                 * Specify the maximum file size that can be uploaded.
                 * Recommended max file is less than 2 MB for this upload type.
                 */
                this.maxFileSize = defaultFullFileUploadMaxSize;
                /**
                 * Specify the maximum chunk size the file should be chunked and uploaded.
                 * Default chunk size should be same as maxFileSize for fill file download.
                 */
                this.chunkSize = defaultFullFileUploadChunkSize;
            }
            return FullFileUploadContext;
        })();
        Main.FullFileUploadContext = FullFileUploadContext;
        /**
         * Stream file upload context. File will be read in chunks and chunked content will be available in memory.
         */
        var StreamFileUploadContext = (function (_super) {
            __extends(StreamFileUploadContext, _super);
            /**
             * Initialize default properties for stream file upload context.
             */
            function StreamFileUploadContext() {
                _super.call(this);
                this.type = 1 /* Stream */;
                this.maxFileSize = defaultStreamFileUploadMaxSize;
                this.chunkSize = defaultStreamFileUploadChunkSize;
            }
            return StreamFileUploadContext;
        })(FullFileUploadContext);
        Main.StreamFileUploadContext = StreamFileUploadContext;
        /**
         * BlobStore file upload context. File will be uploaded directly to blob store specified by the SAS uri.
         */
        var BlobStoreFileUploadContext = (function (_super) {
            __extends(BlobStoreFileUploadContext, _super);
            /**
             * Initialize default properties for blob store file upload context.
             */
            function BlobStoreFileUploadContext() {
                _super.call(this);
                /**
                 * Sas uri command context that will be passed to the execute method of the sasUriCommand.
                 */
                this.context = ko.observable();
                this.type = 2 /* BlobStore */;
                this.maxFileSize = defaultBlobStoreUploadMaxSize;
                this.chunkSize = defaultBlobStoreUploadChunkSize;
            }
            return BlobStoreFileUploadContext;
        })(FullFileUploadContext);
        Main.BlobStoreFileUploadContext = BlobStoreFileUploadContext;
        var ViewModel = (function (_super) {
            __extends(ViewModel, _super);
            function ViewModel() {
                _super.apply(this, arguments);
                /**
                 * A comma-separated list of allowed file mime-types, excluding extensions.
                 * This maps directly to the HTML accept attribute for file input controls.
                 */
                this.accept = "";
                /**
                 * The maximum number of files allowed to be uploaded at once.
                 * This limit is applied post-selection.
                 */
                this.maxFiles = 1;
                /**
                 * The upload context options around how/where to upload and size limits.
                 */
                this.uploadContext = ko.observable();
                /**
                 * The currently-selected files (as limited by maxFiles).
                 */
                this.files = ko.computed(function () {
                    return [];
                });
                /**
                 * Cancel all uploads that are in progress and clears the files list array.
                 */
                this.cancelAllUploads = ko.observable(false);
                /**
                 * Show progress bars demonstrating the progress of the file upload.
                 * Default is true.
                 */
                this.showProgressBars = ko.observable(true);
                /**
                 * Callback to handle the file chunk in a domain specific scenarios like uploading to blob store.
                 */
                this.onFileChunkUploadCallback = null;
            }
            return ViewModel;
        })(ValidatableControl.ViewModel);
        Main.ViewModel = ViewModel;
        var Widget = (function (_super) {
            __extends(Widget, _super);
            /**
             * Creates a new instance of the Widget.
             *
             * @param element The element to apply the widget to.
             * @param options The view model to use, as an un-typed object with key/value pairs that match the view model properties.
             * @param viewModelType The view model type expected. Used to create a default view model instance if the options param is an un-typed object instance. If null, will use the widget ViewModel type.
             */
            function Widget(element, options, createOptions) {
                this._lifetimeManger = new TriggerableLifetimeManagerBase.TriggerableLifetimeManager();
                this._templateEngine = new TemplateEngine.HtmlTemplateEngine();
                _super.call(this, element, options, $.extend({ viewModelType: ViewModel }, createOptions));
                this._setTemplates();
                this._addDisposablesToCleanUp(this._lifetimeManger);
                this.element.addClass(widgetClass).html(template);
                this._name = this.options.name || (prefixId + (uuid++));
                this._input = this.element.find(".azc-fileUpload-selectedFile");
                this._inputOverlay = this.element.find("input.azc-fileUpload-overlay");
                this._progressBarGroupValid = ko.observable(false);
                this._progressBarGroupPercent = ko.observable(0);
                this._progressBarGroupDetails = ko.observable("1 file selected");
                this._progressBarGroupCollapseAll = ko.observable(false);
                this._selectedFiles = ko.observableArray([]);
                this._autoReadBookmarks = {};
                this._progressInfoBalloon = {};
                this.options.text = this.options.text || this._getDefaultResourceStrings();
                // Create the view models for the composite controls
                this._textBoxViewModel = new TextBox.ViewModel();
                this._textBoxViewModel.validationPlacements.push(new Css.Css());
                this._textBoxViewModel.validationPlacements.push(new DockedBalloon.DockedBalloon(validationPlacementOptions));
                this._textBoxViewModel.readonly(true);
                this._buttonViewModel = new Button.ViewModel();
                this._buttonViewModel.tabindex(-1);
                this._attachEvents();
                this._initializeComputeds();
                this._bindDescendants({ customTemplateEngine: this._templateEngine });
                this._afterCreate();
            }
            /**
             * See interface.
             */
            Widget.prototype.dispose = function () {
                if (this._checkExistsOrRegisterDestroyId(_super.prototype.dispose)) {
                    return;
                }
                this._detachEvents();
                this._cleanElement(widgetClass, widgetHoverClass);
                _super.prototype.dispose.call(this);
            };
            Object.defineProperty(Widget.prototype, "options", {
                /**
                 * See interface.
                 */
                get: function () {
                    return this._options;
                },
                enumerable: true,
                configurable: true
            });
            Widget.prototype.read = function (selectedFile, startByte) {
                var bookmark = this._autoReadBookmarks[selectedFile.name], file = this._files[selectedFile.name], readStartByte, readEndByte;
                // If startByte is explicitly passed in, use it as the start byte
                // instead of determining one
                if (startByte) {
                    readStartByte = startByte;
                    readEndByte = startByte + this.options.uploadContext().chunkSize;
                }
                else {
                    // If the bookmark isn't defined start at the beginning of the file,
                    // or the point where they left off as defined by readStartByte.
                    // Otherwise, determine the next chunk based on chunkSize
                    if (!bookmark) {
                        readStartByte = selectedFile.uploadStartByte > 0 ? selectedFile.uploadStartByte : 0;
                        readEndByte = readStartByte + this.options.uploadContext().chunkSize;
                    }
                    else {
                        readStartByte = bookmark.startByte + this.options.uploadContext().chunkSize;
                        readEndByte = bookmark.endByte + this.options.uploadContext().chunkSize;
                    }
                }
                if (readEndByte > file.size) {
                    readEndByte = file.size;
                }
                this._autoReadBookmarks[selectedFile.name] = { startByte: readStartByte, endByte: readEndByte };
                this.readChunk(selectedFile, readStartByte, readEndByte);
            };
            /**
             * See base.
             */
            Widget.prototype._getElementToFocus = function () {
                return this._inputOverlay[0];
            };
            /**
             * Reads the selectedFile and returns a chunk of size options.chunkSize starting at startByte.
             *
             * @param selectedFile The file to read.
             * @param startByte The lower byte bound.
             * @param endByte The upper byte bound.
             */
            Widget.prototype.readChunk = function (selectedFile, startByte, endByte) {
                var _this = this;
                var reader = new FileReader(), file = this._files[selectedFile.name], blob, uploadResult = $.extend({}, selectedFile.uploadResult());
                if (uploadResult.valid && file && !this.options.disabled()) {
                    // File reader "onload" handler.
                    reader.onload = function (evt) {
                        if (selectedFile.cancelUpload()) {
                            // Cancel upload subscription should have updated the upload result.
                            return;
                        }
                        // update the upload task chunk
                        uploadResult = $.extend({}, uploadResult);
                        switch (_this.options.uploadContext().type) {
                            case 0 /* Full */:
                                uploadResult.data = {
                                    type: _this.options.uploadContext().type,
                                    contentType: _this.options.uploadContext().contentType,
                                    content: evt.target.result
                                };
                                break;
                            case 1 /* Stream */:
                            case 2 /* BlobStore */:
                                uploadResult.data = {
                                    type: _this.options.uploadContext().type,
                                    contentType: _this.options.uploadContext().contentType,
                                    content: evt.target.result,
                                    startByte: startByte,
                                    endByte: endByte
                                };
                                break;
                        }
                        uploadResult.progressPercent = endByte / selectedFile.size;
                        if (uploadResult.progressPercent >= 1) {
                            uploadResult.progressPercent = 1;
                            uploadResult.status = 4 /* Complete */;
                        }
                        else {
                            // Automatically set the status to paused as we wait for
                            // explicit read requests to continue
                            uploadResult.status = 3 /* Paused */;
                        }
                        // save the bookmark so auto-read can be called after if desired
                        _this._autoReadBookmarks[selectedFile.name] = { startByte: startByte, endByte: endByte };
                        selectedFile.resumeUpload(false);
                        switch (_this.options.uploadContext().type) {
                            case 0 /* Full */:
                            case 1 /* Stream */:
                                selectedFile.uploadResult(uploadResult);
                                break;
                            case 2 /* BlobStore */:
                                if (_this.options.onFileChunkUploadCallback) {
                                    _this.options.onFileChunkUploadCallback(selectedFile, uploadResult);
                                }
                                break;
                        }
                    };
                    // File reader "onerror" handler.
                    reader.onerror = function (evt) {
                        var errorMessage = _this._getFileReadErrorMessage(evt, selectedFile), uploadResult = $.extend({}, uploadResult);
                        uploadResult.valid = false;
                        uploadResult.status = 0 /* Invalid */;
                        uploadResult.data = null;
                        selectedFile.uploadResult(uploadResult);
                        _this.options.validationState(1 /* Invalid */);
                        _this.options.validators.push(new Validators.Invalid(errorMessage));
                    };
                    uploadResult.status = 2 /* Uploading */;
                    selectedFile.uploadResult(uploadResult);
                    blob = file.slice(startByte, endByte, file.type);
                    switch (this.options.uploadContext().contentType) {
                        case 1 /* Text */:
                            if (!this.options.uploadContext().encoding) {
                                reader.readAsText(blob);
                            }
                            else {
                                reader.readAsText(blob, this.options.uploadContext().encoding);
                            }
                            break;
                        case 3 /* DataUri */:
                            reader.readAsDataURL(blob);
                            break;
                        case 0 /* Default */:
                        case 2 /* ArrayBuffer */:
                        default:
                            reader.readAsArrayBuffer(blob);
                            break;
                    }
                }
                else {
                    selectedFile.resumeUpload(false);
                }
            };
            Widget.prototype._setTemplates = function () {
                this._templateEngine.setTemplate("progressBar", progressBarTemplate);
                this._templateEngine.setTemplate("progressBarGroup", progressBarGroupTemplate);
            };
            Widget.prototype._getFileReadErrorMessage = function (evt, selectedFile) {
                var errorMessage;
                switch (evt.target.error.code) {
                    case evt.target.error.NOT_FOUND_ERR:
                        errorMessage = StringUtil.format(this.options.text.fileNotFoundMessage, selectedFile.name);
                        break;
                    case evt.target.error.NOT_READABLE_ERR:
                        errorMessage = StringUtil.format(this.options.text.fileNotReadablMessage, selectedFile.name);
                        break;
                    case evt.target.error.ABORT_ERR:
                        errorMessage = StringUtil.format(this.options.text.fileReadAbortedMessage, selectedFile.name);
                        break;
                    default:
                        errorMessage = StringUtil.format(this.options.text.fileReadErrorMessage, selectedFile.name);
                        break;
                }
                ;
                return errorMessage;
            };
            Widget.prototype._initializeComputeds = function () {
                var _this = this;
                this._addDisposablesToCleanUp(ko.computed(function () {
                    var isDisabled = _this.options.disabled();
                    _this.element.find("input.azc-fileUpload-overlay").prop("disabled", isDisabled);
                    _this._buttonViewModel.disabled(isDisabled);
                    _this._textBoxViewModel.disabled(isDisabled);
                    _this.options.cancelAllUploads(isDisabled);
                }));
                this._addDisposablesToCleanUp(ko.computed(function () {
                    var isDirty = _this.options.dirty();
                    _this._textBoxViewModel.dirty(isDirty);
                }));
                // Display string in control box
                this._addDisposablesToCleanUp(this._displayedString = ko.computed(function () {
                    var displayedString = _this.options.text.placeholderText, files = _this._selectedFiles();
                    if (files.length === 1) {
                        displayedString = files[0].name;
                    }
                    else if (files.length > 1) {
                        displayedString = StringUtil.format(_this.options.text.multipleFilesSelectedMessage, files.length);
                    }
                    return displayedString;
                }, this));
                // ViewModel files property (populated by selected files)
                this._addDisposablesToCleanUp(this.options.files = ko.computed(function () {
                    var selectedFiles = _this._selectedFiles() || [], uploadResult, invalidFiles = false, fileNames = [];
                    _this._autoReadBookmarks = {};
                    _this._resetValidationState(0 /* None */);
                    if (selectedFiles.length > 0) {
                        selectedFiles.forEach(function (selectedFile) {
                            uploadResult = $.extend({}, selectedFile.uploadResult.peek());
                            fileNames.push(selectedFile.name);
                            selectedFile.cancelUpload(false);
                            selectedFile.resumeUpload(false);
                            // Verify the file.
                            // Assume it's valid, and invalidate if not
                            uploadResult.valid = true;
                            uploadResult.status = 1 /* Pending */;
                            uploadResult.progressPercent = 0;
                            uploadResult.data = null;
                            if (!_this._files[selectedFile.name] || selectedFile.size === 0 || selectedFile.size > _this.options.uploadContext().maxFileSize) {
                                uploadResult.valid = false;
                                uploadResult.status = 0 /* Invalid */;
                                invalidFiles = true;
                            }
                            selectedFile.uploadResult(uploadResult);
                        });
                        // Update the validation state based on where invalid files are found or not
                        if (invalidFiles) {
                            _this.options.validationState(1 /* Invalid */);
                            _this.options.validators.push(new Validators.Invalid(StringUtil.format(_this.options.text.fileSizeExceededMessage, _this.options.uploadContext().maxFileSize)));
                        }
                        else {
                            _this._resetValidationState(2 /* Valid */);
                        }
                        // Update the form values/state
                        _this.options.value(fileNames.join(";"));
                    }
                    return selectedFiles;
                }));
                this._addDisposablesToCleanUp(ko.computed(function () {
                    var selectedFiles = _this.options.files(), allValid = true, allUploadDone = true, invalidFiles = 0, canceledFiles = 0, avgProgressPercent = 0;
                    if (!_this.options.disabled() && _this.options.showProgressBars() && selectedFiles.length > 1) {
                        selectedFiles.forEach(function (selectedFile) {
                            var uploadResult = selectedFile.uploadResult();
                            if (!uploadResult.valid) {
                                allValid = false;
                            }
                            if (uploadResult.status !== 0 /* Invalid */ && uploadResult.status !== 4 /* Complete */ && uploadResult.status !== 5 /* Canceled */) {
                                allUploadDone = false;
                            }
                            if (uploadResult.status === 0 /* Invalid */) {
                                invalidFiles++;
                            }
                            if (uploadResult.status === 5 /* Canceled */) {
                                canceledFiles++;
                            }
                            else {
                                // skip canceled files from the average calculation.
                                avgProgressPercent += uploadResult.progressPercent;
                            }
                        });
                        avgProgressPercent = avgProgressPercent / (selectedFiles.length - canceledFiles);
                        if (avgProgressPercent > 1) {
                            avgProgressPercent = 1;
                        }
                        var uploadString = allUploadDone ? _this.options.text.progressBarGroupUploadedMessage : _this.options.text.progressBarGroupUploadingMessage, validFiles = selectedFiles.length - invalidFiles - canceledFiles, statusTextFormat = "{0} | {1}", progressBarGroupStatusText = StringUtil.format(_this.options.text.progressBarGroupSuccessMessage, validFiles, uploadString);
                        if (invalidFiles > 0) {
                            progressBarGroupStatusText = StringUtil.format(statusTextFormat, progressBarGroupStatusText, StringUtil.format(_this.options.text.progressBarGroupFailureMessage, invalidFiles));
                        }
                        if (canceledFiles > 0) {
                            progressBarGroupStatusText = StringUtil.format(statusTextFormat, progressBarGroupStatusText, StringUtil.format(_this.options.text.progressBarGroupCanceledMessage, canceledFiles));
                        }
                        _this._progressBarGroupValid(allValid);
                        _this._progressBarGroupPercent(avgProgressPercent);
                        _this._progressBarGroupDetails(progressBarGroupStatusText);
                    }
                }));
                this._addDisposablesToCleanUp(ko.computed(function () {
                    if (_this.options.cancelAllUploads()) {
                        _this._selectedFiles(_this._toSelectedFileArray([]));
                    }
                }));
                this._addDisposablesToCleanUp(ko.computed(function () {
                    _this._textBoxViewModel.validators(_this.options.validators());
                }));
                this._addDisposablesToCleanUp(ko.computed(function () {
                    _this._textBoxViewModel.validationState(_this.options.validationState());
                }));
                this._addDisposablesToCleanUp(ko.computed(function () {
                    _this._textBoxViewModel.value(_this._displayedString());
                }));
            };
            Widget.prototype._attachEvents = function () {
                var _this = this;
                var that = this;
                this._detachEvents();
                this._inputOverlayFocusHandler = function (evt) {
                    _this._focus();
                };
                this._inputOverlayBlurHandler = function (evt) {
                    _this._blur();
                };
                this._inputOverlayChangeHandler = function (evt) {
                    var fileInput = evt.target;
                    if (fileInput.files) {
                        // The VM files property is computed from a change to the private selectedFiles array
                        _this._selectedFiles(_this._toSelectedFileArray(fileInput.files));
                    }
                };
                this._inputOverlayMouseEnterHandler = function (evt) {
                    _this._mouseEnter();
                };
                this._inputOverlayMouseLeaveHandler = function (evt) {
                    _this._mouseLeave();
                };
                this._inputOverlayClickHandler = function (evt) {
                    _this._inputOverlay.val("");
                };
                this._inputOverlay.on("focus." + widgetClass, this._inputOverlayFocusHandler).on("blur." + widgetClass, this._inputOverlayBlurHandler).on("change." + widgetClass, this._inputOverlayChangeHandler).on("mouseenter." + widgetClass, this._inputOverlayMouseEnterHandler).on("mouseleave." + widgetClass, this._inputOverlayMouseLeaveHandler).on("click." + widgetClass, this._inputOverlayClickHandler);
                this.element.on("click.azcFileUploadProgressCancelButton", progressBarCancelUploadSelector, this._progressBarCancelHandler = function (evt) {
                    evt.preventDefault();
                    var selectedFile = ko.dataFor(this);
                    selectedFile.cancelUpload(true);
                });
                this.element.on("click.azcFileUploadProgressCancelButton", progressBarGroupCancelUploadSelector, this._progressBarGroupCancelHandler = function (evt) {
                    evt.preventDefault();
                    _this.options.cancelAllUploads(true);
                });
                this.element.on("click.azcFileUploadProgressGroupCollapseAllButton", progressBarGroupCollapseAllSelector, this._progressBarGroupCollapseAllHandler = function (evt) {
                    evt.preventDefault();
                    _this._progressBarGroupCollapseAll(!_this._progressBarGroupCollapseAll());
                });
            };
            Widget.prototype._detachEvents = function () {
                if (this._inputOverlayFocusHandler) {
                    this._inputOverlay.off("focus." + widgetClass, this._inputOverlayFocusHandler);
                    this._inputOverlayFocusHandler = null;
                }
                if (this._inputOverlayBlurHandler) {
                    this._inputOverlay.off("blur." + widgetClass, this._inputOverlayBlurHandler);
                    this._inputOverlayBlurHandler = null;
                }
                if (this._inputOverlayChangeHandler) {
                    this._inputOverlay.off("change." + widgetClass, this._inputOverlayChangeHandler);
                    this._inputOverlayChangeHandler = null;
                }
                if (this._inputOverlayMouseEnterHandler) {
                    this._inputOverlay.off("mouseenter." + widgetClass, this._inputOverlayMouseEnterHandler);
                    this._inputOverlayMouseEnterHandler = null;
                }
                if (this._inputOverlayMouseLeaveHandler) {
                    this._inputOverlay.off("mouseleave." + widgetClass, this._inputOverlayMouseLeaveHandler);
                    this._inputOverlayMouseLeaveHandler = null;
                }
                if (this._inputOverlayClickHandler) {
                    this._inputOverlay.off("click." + widgetClass, this._inputOverlayClickHandler);
                    this._inputOverlayClickHandler = null;
                }
                if (this._progressBarCancelHandler) {
                    this.element.off("click.azcFileUploadProgressCancelButton", progressBarCancelUploadSelector, this._progressBarCancelHandler);
                    this._progressBarCancelHandler = null;
                }
                if (this._progressBarGroupCancelHandler) {
                    this.element.off("click.azcFileUploadProgressCancelButton", progressBarGroupCancelUploadSelector, this._progressBarGroupCancelHandler);
                    this._progressBarGroupCancelHandler = null;
                }
                if (this._progressBarGroupCollapseAllHandler) {
                    this.element.off("click.azcFileUploadProgressGroupCollapseAllButton", progressBarGroupCollapseAllSelector, this._progressBarGroupCollapseAllHandler);
                    this._progressBarGroupCollapseAllHandler = null;
                }
            };
            Widget.prototype._focus = function () {
                this._textBoxViewModel.focused(true);
                this.element.toggleClass(widgetHasFocusClass, true);
            };
            Widget.prototype._blur = function () {
                this._textBoxViewModel.focused(false);
                this.element.toggleClass(widgetHasFocusClass, false);
            };
            Widget.prototype._mouseEnter = function () {
                if (!this.options.disabled()) {
                    this.element.addClass(widgetHoverClass);
                    if (this.options.validationState() === 1 /* Invalid */) {
                        // Show the validation message balloon
                        this.element.find(".azc-dockedballoon-anchor").trigger("mouseenter");
                    }
                }
            };
            Widget.prototype._mouseLeave = function () {
                if (!this.options.disabled()) {
                    this.element.removeClass(widgetHoverClass);
                    if (this.options.validationState() === 1 /* Invalid */) {
                        // Hide the validation message balloon
                        this.element.find(".azc-dockedballoon-anchor").trigger("mouseleave");
                    }
                }
            };
            Widget.prototype._getDefaultResourceStrings = function () {
                return {
                    placeholderText: "Select a file",
                    singleFileSelectedMessage: "1 file selected",
                    multipleFilesSelectedMessage: "{0} files selected",
                    fileSizeExceededMessage: "One or more of the selected files do not meet the size constraints. Each file must be between 1 and {0} bytes.",
                    fileNotFoundMessage: "{0} file not found.",
                    fileNotReadablMessage: "{0} file not readable.",
                    fileReadAbortedMessage: "{0} file read was cancelled.",
                    fileReadErrorMessage: "An error occurred when reading {0} file.",
                    uploadStatusPending: "File upload is pending",
                    uploadStatusError: "File upload error",
                    uploadStatusDone: "File upload completed",
                    progressBarGroupUploadedMessage: "uploaded",
                    progressBarGroupUploadingMessage: "uploading",
                    progressBarGroupSuccessMessage: "{0} files {1}",
                    progressBarGroupFailureMessage: "{0} file error",
                    progressBarGroupCanceledMessage: "{0} file canceled"
                };
            };
            Widget.prototype._resetValidationState = function (newState) {
                this.options.validationState(newState);
                this.options.validators.removeAll();
            };
            // Transforms an HTML5 FileList object into a name-mapped list
            // of SelectedFile objects, which are exposed on the VM as part
            // of the API for this control.
            Widget.prototype._toSelectedFileArray = function (files) {
                var selectedFiles = [], selectedFile, file, i, maxFiles = files.length;
                this._files = {};
                this._autoReadBookmarks = {};
                this._progressInfoBalloon = {};
                this.options.cancelAllUploads(false);
                if (this._uploadSubscribeLifetimeManager) {
                    this._uploadSubscribeLifetimeManager.dispose();
                    this._uploadSubscribeLifetimeManager = null;
                }
                this._uploadSubscribeLifetimeManager = this._lifetimeManger.createChildLifetime();
                if (this.options.maxFiles && !(this.options.maxFiles > files.length)) {
                    maxFiles = this.options.maxFiles;
                }
                for (i = 0; i < maxFiles; i++) {
                    file = files[i];
                    selectedFile = {
                        name: file.name,
                        mimetype: file.type,
                        size: file.size,
                        cancelUpload: ko.observable(false),
                        resumeUpload: ko.observable(false),
                        uploadStartByte: 0,
                        uploadResult: ko.observable({
                            valid: false,
                            status: 1 /* Pending */,
                            progressPercent: 0,
                            data: null
                        })
                    };
                    selectedFiles.push(selectedFile);
                    // Save the raw file object for access when uploading
                    this._files[file.name] = file;
                    var viewModelInfo = new DockedBalloon2.ViewModel();
                    viewModelInfo.type = 0 /* Info */;
                    viewModelInfo.content(this.options.text.uploadStatusPending);
                    this._linkProgressBarInfoBalloonContent(selectedFile, viewModelInfo);
                    this._progressInfoBalloon[file.name] = viewModelInfo;
                    this._subscribeForCancelUpload(selectedFile);
                    this._subscribeForResumeUpload(selectedFile);
                }
                return selectedFiles;
            };
            Widget.prototype._subscribeForResumeUpload = function (selectedFile) {
                var _this = this;
                // When upload changes to true, read the next chunk.
                this._uploadSubscribeLifetimeManager.registerForDispose(selectedFile.resumeUpload.subscribe(function (upload) {
                    if (upload && !selectedFile.cancelUpload()) {
                        _this.read(selectedFile);
                    }
                }));
            };
            Widget.prototype._subscribeForCancelUpload = function (selectedFile) {
                var _this = this;
                this._uploadSubscribeLifetimeManager.registerForDispose(selectedFile.cancelUpload.subscribe(function (canceled) {
                    if (canceled) {
                        var uploadResult = $.extend({}, selectedFile.uploadResult());
                        if (uploadResult.status !== 4 /* Complete */ && uploadResult.status !== 0 /* Invalid */) {
                            uploadResult.valid = true;
                            uploadResult.status = 5 /* Canceled */;
                            uploadResult.data = null;
                            selectedFile.uploadResult(uploadResult);
                        }
                        if (_this._selectedFiles().length === 1) {
                            _this._selectedFiles(_this._toSelectedFileArray([]));
                        }
                    }
                }));
            };
            Widget.prototype._getProgressInfoBalloonViewModel = function (selectedFile) {
                return this._progressInfoBalloon[selectedFile.name];
            };
            Widget.prototype._linkProgressBarInfoBalloonContent = function (selectedFile, viewModel) {
                var _this = this;
                this._uploadSubscribeLifetimeManager.registerForDispose(viewModel.content = ko.computed(function () {
                    return _this._getProgressDetailsLabel(selectedFile.uploadResult());
                }));
            };
            Widget.prototype._getProgressDetailsLabel = function (uploadResult) {
                if (!uploadResult) {
                    return "";
                }
                switch (uploadResult.status) {
                    case 1 /* Pending */:
                        return this.options.text.uploadStatusPending;
                    case 0 /* Invalid */:
                        return this.options.text.uploadStatusError;
                    case 4 /* Complete */:
                        return this.options.text.uploadStatusDone;
                    case 2 /* Uploading */:
                    case 3 /* Paused */:
                    default:
                        return StringUtil.format("{0} {1}", (Math.floor(uploadResult.progressPercent * 100).toString() + "%"), this.options.text.progressBarGroupUploadedMessage);
                }
            };
            return Widget;
        })(ValidatableControl.Widget);
        Main.Widget = Widget;
        ko.bindingHandlers["azcFileUpload2"] = Base.Widget.getBindingHandler(Widget);
    })(Main || (Main = {}));
    return Main;
});
