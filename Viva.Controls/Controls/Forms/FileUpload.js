var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "../Base/ValidationPlacements/DockedBalloon", "../Base/Validators", "../Base/ValidationPlacements/Css", "./TextBox", "./Button", "../Base/Base", "../Base/ValidatableControl", "../../Util/StringUtil"], function (require, exports, DockedBalloon, Validators, Css, TextBox, Button, Base, ValidatableControl, StringUtil) {
    var Main;
    (function (Main) {
        "use strict";
        var global = window, $ = jQuery, uuid = 0, globalFormControl = "azc-formControl", widgetClass = "azc-fileUpload", widgetHoverClass = "azc-fileUpload-state-hover", widgetHasFocusClass = "azc-fileUpload-hasfocus", widgetSecondaryClass = "azc-btn-secondary", prefixId = "__azc-fileUpload", template = "<div class='azc-fileUpload-wrapper'>" + "<div class='azc-fileUpload-selectedFile' data-bind='azcTextBox: func._textBoxViewModel'></div>" + "<button class='" + widgetSecondaryClass + "' data-bind='azcButton: func._buttonViewModel'>" + "<svg width='16px' height='16px' x='0px' y='0px' viewBox='0 0 12 12' enable-background='new 0 0 12 12' xml: space='preserve' >" + "<path d ='M11.3,3H1v9h10.4c0.3,0,0.6-0.3,0.6-0.6V3H11.3z'></path>" + "<path d ='M1,3v8.6C1,11.9,0.9,12,0.6,12C0.3,12,0,12.1,0,11.8V1h3.8l1.4,1H12v1H1z'></path>" + "</svg>" + "</button>" + "</div>" + "<input type='file' class='azc-fileUpload-overlay " + globalFormControl + "' data-bind='attr: { name: func._name, accept: data.accept, multiple: data.maxFiles > 1 }'></input>", validationPlacementOptions = {
            "validationStateBalloonOptions": {
                "pending": {
                    "balloonVisible": false
                }
            }
        };
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
        })(Main.UploadStatus || (Main.UploadStatus = {}));
        var UploadStatus = Main.UploadStatus;
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
                 * The limit of the file size in bytes.
                 * Default is 200MB.
                 */
                this.sizeLimit = 209715200;
                /**
                 * The size of chunks to break the file into to stream read it.
                 * Default is 1MB.
                 */
                this.chunkSize = 1048576;
                /**
                 * The currently-selected files (as limited by maxFiles).
                 */
                this.files = ko.computed(function () {
                    return [];
                });
            }
            return ViewModel;
        })(ValidatableControl.ViewModel);
        Main.ViewModel = ViewModel;
        var Widget = (function (_super) {
            __extends(Widget, _super);
            function Widget(element, options, createOptions) {
                _super.call(this, element, options, $.extend({ viewModelType: ViewModel }, createOptions));
                this.element.addClass(widgetClass).html(template);
                this._name = this.options.name || (prefixId + (uuid++));
                this._input = this.element.find(".azc-fileUpload-selectedFile");
                this._inputOverlay = this.element.find("input.azc-fileUpload-overlay");
                this._selectedFiles = ko.observableArray([]);
                this._autoReadBookmarks = {};
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
                this._bindDescendants();
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
                    readEndByte = startByte + this.options.chunkSize;
                }
                else {
                    // If the bookmark isn't defined start at the beginning of the file,
                    // or the point where they left off as defined by readStartByte.
                    // Otherwise, determine the next chunk based on chunkSize
                    if (!bookmark) {
                        readStartByte = selectedFile.uploadStartByte > 0 ? selectedFile.uploadStartByte : 0;
                        readEndByte = readStartByte + this.options.chunkSize;
                    }
                    else {
                        readStartByte = bookmark.startByte + this.options.chunkSize;
                        readEndByte = bookmark.endByte + this.options.chunkSize;
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
                var reader = new FileReader(), file = this._files[selectedFile.name], blob, uploadTask = $.extend({}, selectedFile.uploadTask());
                if (uploadTask.valid && file && !this.options.disabled()) {
                    reader.onload = function (e) {
                        // update the upload task chunk
                        uploadTask = $.extend({}, uploadTask);
                        uploadTask.chunk = {
                            content: e.target.result,
                            startByte: startByte,
                            endByte: endByte
                        };
                        uploadTask.progressPercent = endByte / selectedFile.size;
                        if (uploadTask.progressPercent >= 1) {
                            uploadTask.progressPercent = 1;
                            uploadTask.status = 4 /* Complete */;
                        }
                        else {
                            // Automatically set the status to paused as we wait for
                            // explicit read requests to continue
                            uploadTask.status = 3 /* Paused */;
                        }
                        // save the bookmark so auto-read can be called after if desired
                        _this._autoReadBookmarks[selectedFile.name] = { startByte: startByte, endByte: endByte };
                        selectedFile.upload(false);
                        selectedFile.uploadTask(uploadTask);
                    };
                    uploadTask.status = 2 /* Uploading */;
                    selectedFile.uploadTask(uploadTask);
                    blob = file.slice(startByte, endByte, file.type);
                    reader.readAsArrayBuffer(blob);
                }
                else {
                    selectedFile.upload(false);
                }
            };
            Widget.prototype._initializeComputeds = function () {
                var _this = this;
                this._addDisposablesToCleanUp(ko.computed(function () {
                    var isDisabled = _this.options.disabled();
                    _this.element.find("input.azc-fileUpload-overlay").prop("disabled", isDisabled);
                    _this._buttonViewModel.disabled(isDisabled);
                    _this._textBoxViewModel.disabled(isDisabled);
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
                    var selectedFiles = _this._selectedFiles() || [], uploadTask, invalidFiles = false, fileNames = [];
                    if (selectedFiles.length > 0) {
                        selectedFiles.forEach(function (selectedFile, i) {
                            uploadTask = selectedFile.uploadTask.peek();
                            fileNames.push(selectedFile.name);
                            // Verify the file
                            // Assume it's valid, and invalidate if not
                            uploadTask.valid = true;
                            uploadTask.status = 1 /* Pending */;
                            if (!_this._files[selectedFile.name] || selectedFile.size === 0 || selectedFile.size > _this.options.sizeLimit) {
                                uploadTask.valid = false;
                                uploadTask.status = 0 /* Invalid */;
                                invalidFiles = true;
                            }
                            selectedFile.uploadTask(uploadTask);
                            selectedFiles[i] = selectedFile;
                            // When upload changes to true, read the next chunk.
                            selectedFile.upload.subscribe(function (upload) {
                                if (upload) {
                                    _this.read(selectedFile);
                                }
                            }, _this);
                        });
                        // Update the validation state based on where invalid files are found or not
                        if (invalidFiles) {
                            _this.options.validationState(1 /* Invalid */);
                            _this._textBoxViewModel.validators.push(new Validators.Invalid(StringUtil.format(_this.options.text.fileSizeExceededMessage, _this.options.sizeLimit)));
                        }
                        else {
                            _this._resetValidationState(2 /* Valid */);
                        }
                        // Update the form values/state
                        _this.options.value(fileNames.join(";"));
                        _this.options.dirty(true);
                    }
                    else {
                        _this._resetValidationState(0 /* None */);
                    }
                    return selectedFiles;
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
                this._detachEvents();
                this._inputOverlayChangeHandler = function (evt) {
                    var fileInput = evt.target;
                    if (fileInput.files) {
                        // The VM files property is computed from a change to the private selectedFiles array
                        _this._selectedFiles(_this._toSelectedFileArray(fileInput.files));
                    }
                };
                this._inputOverlayClickHandler = function (evt) {
                    _this._inputOverlay.val("");
                };
                this._inputOverlay.on("focus." + widgetClass, function () {
                    _this._focus();
                }).on("blur." + widgetClass, function () {
                    _this._blur();
                }).on("change." + widgetClass, this._inputOverlayChangeHandler).on("mouseenter." + widgetClass, function () {
                    _this._mouseEnter();
                }).on("mouseleave." + widgetClass, function () {
                    _this._mouseLeave();
                }).on("click." + widgetClass, this._inputOverlayClickHandler);
            };
            Widget.prototype._detachEvents = function () {
                if (this._inputOverlayChangeHandler) {
                    this._inputOverlay.off("change." + widgetClass, this._inputOverlayChangeHandler);
                    this._inputOverlayChangeHandler = null;
                }
                if (this._inputOverlayClickHandler) {
                    this._inputOverlay.off("click." + widgetClass, this._inputOverlayClickHandler);
                    this._inputOverlayClickHandler = null;
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
                    fileSizeExceededMessage: "One or more of the selected files do not meet the size constraints. Each file must be between 1 and {0} bytes."
                };
            };
            Widget.prototype._resetValidationState = function (newState) {
                this.options.validationState(newState);
                this._textBoxViewModel.validators.removeAll();
            };
            // Transforms an HTML5 FileList object into a name-mapped list
            // of SelectedFile objects, which are exposed on the VM as part
            // of the API for this control.
            Widget.prototype._toSelectedFileArray = function (files) {
                var selectedFiles = [], selectedFile, file, i, maxFiles = files.length;
                this._files = {};
                this._autoReadBookmarks = {};
                if (this.options.maxFiles && !(this.options.maxFiles > files.length)) {
                    maxFiles = this.options.maxFiles;
                }
                for (i = 0; i < maxFiles; i++) {
                    file = files[i];
                    selectedFile = {
                        name: file.name,
                        mimetype: file.type,
                        size: file.size,
                        upload: ko.observable(false),
                        uploadStartByte: 0,
                        uploadTask: ko.observable({
                            valid: false,
                            status: null,
                            progressPercent: 0,
                            chunk: { content: "", startByte: 0, endByte: 0 }
                        })
                    };
                    selectedFiles.push(selectedFile);
                    // Save the raw file object for access when uploading
                    this._files[file.name] = file;
                }
                return selectedFiles;
            };
            return Widget;
        })(ValidatableControl.Widget);
        Main.Widget = Widget;
        ko.bindingHandlers["azcFileUpload"] = Base.Widget.getBindingHandler(Widget);
    })(Main || (Main = {}));
    return Main;
});
