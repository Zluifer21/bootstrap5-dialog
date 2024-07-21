

(function (root, factory) {
    "use strict";


    if (typeof module !== 'undefined' && module.exports) {
        const bootstrap = require('bootstrap');
        module.exports = factory(bootstrap);
    }

    else if (typeof define === "function" && define.amd) {
        define("bootstrap-dialog", ["bootstrap"], function (bootstrap) {
            return factory(bootstrap);
        });
    } else {
        root.BootstrapDialog = factory(root.bootstrap);
    }

}(this ? this : window, function (bootstrap) {
    "use strict";

    var Modal = bootstrap.Modal;

    class BootstrapDialog {
        constructor(options) {
            this.defaultOptions = BootstrapDialog.extendDeep({
                id: BootstrapDialog.newGuid(),
                buttons: [],
                data: {},
                onshow: null,
                onshown: null,
                onhide: null,
                onhidden: null
            }, BootstrapDialog.defaultOptions);
            this.indexedButtons = {};
            this.registeredButtonHotkeys = {};
            this.draggableData = {
                isMouseDown: false,
                mouseOffset: {}
            };
            this.realized = false;
            this.opened = false;
            this.initOptions(options);
            this.holdThisInstance();
        }
  
        static configDefaultOptions(options) {
            BootstrapDialog.defaultOptions = BootstrapDialog.extendDeep(true, BootstrapDialog.defaultOptions, options);
        }
        
        static show(options) {
            return new BootstrapDialog(options).open();
        }
        
        static newGuid() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }

        initOptions(options) {
            this.options = BootstrapDialog.extendDeep(this.defaultOptions, options);
            return this;
        }

        holdThisInstance() {
            BootstrapDialog.addDialog(this);

            return this;
        }

        initModalStuff() {

            this.setModal(this.createModal())
                .setModalDialog(this.createModalDialog())
                .setModalContent(this.createModalContent())
                .setModalHeader(this.createModalHeader())
                .setModalBody(this.createModalBody())
                .setModalFooter(this.createModalFooter());

            this.getModal().append(this.getModalDialog());
            this.getModalDialog().append(this.getModalContent());
            this.getModalContent()
                .append(this.getModalHeader(), this.getModalBody(), this.getModalFooter());





            return this;
        }

        handleModalEvents() {
            console.log('handleModalEvents');
            var dialog = this;
            console.log(dialog);
            function handleShow(event) {
                dialog.setOpened(true);
                console.log(dialog.isModalEvent(event));
                if (dialog.isModalEvent(event) && typeof dialog.options.onshow === 'function') {
                    var openIt = dialog.options.onshow(dialog);
                    if (openIt === false) {
                        dialog.setOpened(false);
                        event.preventDefault();
                    }
                }
            }

            function handleShown(event) {
                if (dialog.isModalEvent(event) && typeof dialog.options.onshown === 'function') {
                    dialog.options.onshown(dialog);
                }
            }

            function handleHide(event) {
                dialog.setOpened(false);
                if (dialog.isModalEvent(event) && typeof dialog.options.onhide === 'function') {
                    var hideIt = dialog.options.onhide(dialog);
                    if (hideIt === false) {
                        dialog.setOpened(true);
                        event.preventDefault();
                    }
                }
            }

            function handleHidden(event) {
                if (dialog.isModalEvent(event) && typeof dialog.options.onhidden === 'function') {
                    dialog.options.onhidden(dialog);
                }
                if (dialog.isAutodestroy()) {
                    dialog.setRealized(false);
                    delete BootstrapDialog.dialogs[dialog.getId()];
                    dialog.getModal().remove();
                }
                BootstrapDialog.moveFocus();
                if (document.querySelector('.modal.show')) {
                    document.body.classList.add('modal-open');
                }
            }

            function handleKeyUp(event) {
                if (event.key === 'Escape' && dialog.isClosable() && dialog.canCloseByKeyboard()) {
                    dialog.close();
                }

                if (dialog.registeredButtonHotkeys[event.which]) {
                    var button = dialog.getButton(dialog.registeredButtonHotkeys[event.which]);
                    if (!button.disabled && !document.activeElement.isSameNode(button)) {
                        button.focus();
                        button.click();
                    }
                }
            }

            var modalElement = this.getModal();
            modalElement.addEventListener('show.bs.modal', handleShow);
            modalElement.addEventListener('shown.bs.modal', handleShown);
            modalElement.addEventListener('hide.bs.modal', handleHide);
            modalElement.addEventListener('hidden.bs.modal', handleHidden);
            modalElement.addEventListener('keyup', handleKeyUp);

            return this;
        }

        isModalEvent(event) {
            return event.type.startsWith('bs.modal');
        }

        createModalDialog() {
            var modalDialog = document.createElement('div');
            modalDialog.className = 'modal-dialog';
            return modalDialog;
        }

        getModalDialog() {
            return this.modalDialog;
        }

        setModalDialog(modalDialog) {
            this.modalDialog = modalDialog;
            return this;
        }

        createModal() {
            var modal = document.createElement('div');
            modal.className = 'modal';
            modal.setAttribute('role', 'dialog');
            modal.setAttribute('aria-hidden', 'true');
            modal.id = this.getId();
            modal.setAttribute('aria-labelledby', this.getId() + '_title');

            return modal;
        }

        getModal() {
            return this.modal;
        }

        setModal(modal) {
            this.modal = modal;

            return this;
        }
        createModalContent() {
            var modalContent = document.createElement('div');
            modalContent.className = 'modal-content';
            return modalContent;
        }
        getModalContent() {
            return this.modalContent;
        }

        setModalContent(modalContent) {
            this.modalContent = modalContent;

            return this;
        }

        createModalHeader() {
            var modalHeader = document.createElement('div');
            modalHeader.className = 'modal-header';
            return modalHeader;
        }

        getModalHeader() {
            return this.modalHeader;
        }

        setModalHeader(modalHeader) {
            this.modalHeader = modalHeader;
            return this;
        }

        createModalBody() {
            var modalBody = document.createElement('div');
            modalBody.className = 'modal-body';
            return modalBody;
        }

        getModalBody() {
            return this.modalBody;
        }

        setModalBody(modalBody) {
            this.modalBody = modalBody;
            return this;
        }

        createModalFooter() {
            var modalFooter = document.createElement('div');
            modalFooter.className = 'modal-footer';
            return modalFooter;
        }

        getModalFooter() {
            return this.modalFooter;
        }

        setModalFooter(modalFooter) {
            this.modalFooter = modalFooter;

            return this;
        }

        isClosable() {
            return this.options.closable;
        }

        canCloseByBackdrop() {
            return this.options.closeByBackdrop;
        }

        makeModalDraggable() {
            if (this.options.draggable) {
                var dialog = this;
                var modalHeader = this.getModalHeader();
                var modalDialog = this.getModalDialog();
                var body = document.body;

                modalHeader.classList.add(this.getNamespace('draggable'));


                modalHeader.addEventListener('mousedown', function (event) {
                    event.preventDefault();
                    dialog.draggableData.isMouseDown = true;
                    var dialogRect = modalDialog.getBoundingClientRect();
                    dialog.draggableData.mouseOffset = {
                        top: event.clientY - dialogRect.top,
                        left: event.clientX - dialogRect.left
                    };
                });


                dialog.getModal().addEventListener('mouseup', function () {
                    dialog.draggableData.isMouseDown = false;
                });


                body.addEventListener('mousemove', function (event) {
                    if (!dialog.draggableData.isMouseDown) {
                        return;
                    }
                    modalDialog.style.top = (event.clientY - dialog.draggableData.mouseOffset.top) + 'px';
                    modalDialog.style.left = (event.clientX - dialog.draggableData.mouseOffset.left) + 'px';
                });


                body.addEventListener('mouseleave', function () {
                    dialog.draggableData.isMouseDown = false;
                });
            }

            return this;
        }

        isAutodestroy() {
            return this.options.autodestroy;
        }

        setAutodestroy(autodestroy) {
            this.options.autodestroy = autodestroy;
        }

        getTitle() {
            return this.options.title;
        }

        setTitle(title) {
            this.options.title = title;
            this.updateTitle();

            return this;
        }
        
        getSpinicon() {
            return this.options.spinicon;
        }

        setSpinicon(spinicon) {
            this.options.spinicon = spinicon;

            return this;
        }

        updateTitle() {
            if (this.isRealized()) {
                var titleContent = this.getTitle() !== null ? this.createDynamicContent(this.getTitle()) : this.getDefaultText();
                var titleElement = this.getModalHeader().querySelector('.' + this.getNamespace('title'));

                if (titleElement) {                
                    titleElement.innerHTML = '';                
                    if (typeof titleContent === 'string') {                    
                        var tempDiv = document.createElement('div');
                        tempDiv.innerHTML = titleContent;                      
                        while (tempDiv.firstChild) {
                            titleElement.appendChild(tempDiv.firstChild);
                        }
                    } else if (titleContent instanceof Node) {                     
                        titleElement.appendChild(titleContent);
                    }                   
                    titleElement.id = this.getId() + '_title';
                }
            }

            return this;
        }

        isAnimate() {
            return this.options.animate;
        }
        
        updateAnimate() {
            if (this.isRealized()) {
                var modal = this.getModal();
                if (this.isAnimate()) {
                    modal.classList.add('fade');
                } else {
                    modal.classList.remove('fade');
                }
            }

            return this;
        }
        
        updateClosable() {
            if (this.isRealized()) {
                var closeButton = this.getModalHeader().querySelector('.' + this.getNamespace('close-button'));
                if (closeButton) {
                    closeButton.style.display = this.isClosable() ? 'block' : 'none';
                }
            }

            return this;
        }

        updateType() {
            if (this.isRealized()) {
                var types = [
                    BootstrapDialog.TYPE_DEFAULT,
                    BootstrapDialog.TYPE_INFO,
                    BootstrapDialog.TYPE_PRIMARY,
                    BootstrapDialog.TYPE_SECONDARY,
                    BootstrapDialog.TYPE_SUCCESS,
                    BootstrapDialog.TYPE_WARNING,
                    BootstrapDialog.TYPE_DARK,
                    BootstrapDialog.TYPE_LIGHT,
                    BootstrapDialog.TYPE_DANGER
                ];

                var modal = this.getModal();
                types.forEach(function (type) {
                    modal.classList.remove(type);
                });
                modal.classList.add(this.getType());
            }

            return this;
        }

        getTabindex() {
            return this.options.tabindex;
        }

        isOpened() {
            return this.opened;
        }

        setOpened(opened) {
            this.opened = opened;

            return this;
        }

        setMessage(message) {
            this.options.message = message;
            this.updateMessage();

            return this;
        }

        updateTabindex() {
            if (this.isRealized()) {
                var modal = this.getModal();
                modal.setAttribute('tabindex', this.getTabindex());
            }

            return this;
        }

        addButton(button) {
            this.options.buttons.push(button);

            return this;
        }

        addButtons(buttons) {
            var that = this;
            buttons.forEach(function (button) {
                that.addButton(button);
            });

            return this;
        }

        getButtons() {
            return this.options.buttons;
        }

        setButtons(buttons) {
            this.options.buttons = buttons;
            this.updateButtons();

            return this;
        }

        updateButtons() {
            if (this.isRealized()) {
                var modalFooter = this.getModalFooter();
                if (this.getButtons().length === 0) {
                    modalFooter.style.display = 'none';
                } else {
                                
                    while (modalFooter.firstChild) {
                        modalFooter.removeChild(modalFooter.firstChild);
                    }              
                    var footerButtons = this.createFooterButtons();
                    footerButtons.forEach(function (button) {
                        modalFooter.appendChild(button);
                    });
                }
            }

            return this;
        }
        setClosable(closable) {
            this.options.closable = closable;
            this.updateClosable();

            return this;
        
        }

        realize() {
            this.initModalStuff();
            this.getModal().classList.add(BootstrapDialog.NAMESPACE);
            const cssClasses = this.getCssClass().split(' ').filter(Boolean);
            cssClasses.forEach(cssClass => {
                this.getModal().classList.add(cssClass);
            });
            this.updateSize();
            if (this.getDescription()) {
                this.getModal().attr('aria-describedby', this.getDescription());
            }
            if (this.getVerticalCentered()) {
                this.getModalDialog().classList.add('modal-dialog-centered');
            }

            this.getModalBody().append(this.createBodyContent());
            this.getModalHeader().append(this.createHeaderContent());

            var modalElement = this.getModalForBootstrapDialogModal();
            var modalInstance = new bootstrap.Modal(modalElement, {
                backdrop: (this.isClosable() && this.canCloseByBackdrop()) ? true : 'static',
                keyboard: false,
                show: false
            });
            modalElement._bsModalInstance = modalInstance;

            this.makeModalDraggable();
            this.handleModalEvents();
            this.setRealized(true);
            this.updateButtons();
            this.updateType();
            this.updateTitle();
            this.updateMessage();
            this.updateClosable();
            this.updateAnimate();
            this.updateSize();
            this.updateTabindex();

            return this;

        }

        getCssClass() {
            return this.options.cssClass;
        }

        setCssClass(cssClass) {
            this.options.cssClass = cssClass;

            return this;
        }

        getDefaultText() {
            return BootstrapDialog.DEFAULT_TEXTS[this.getType()];
        }

        getTitle() {
            return this.options.title;
        }

        setTitle(title) {
            this.options.title = title;
            this.updateTitle();

            return this;
        }

        getMessage() {
            return this.options.message;
        }

        updateMessage() {
            if (this.isRealized()) {
                var messageContent = this.createDynamicContent(this.getMessage());
                var messageContainer = this.getModalBody().querySelector('.' + this.getNamespace('message'));
                if (messageContainer) {
                    messageContainer.innerHTML = '';
                    if (typeof messageContent === 'string') {
                        var tempDiv = document.createElement('div');
                        tempDiv.innerHTML = messageContent;
                        while (tempDiv.firstChild) {
                            messageContainer.appendChild(tempDiv.firstChild);
                        }
                    } else if (messageContent instanceof Node) {
                        messageContainer.appendChild(messageContent);
                    }
                }
            }

            return this;
        }

        getButton(id) {
            if (typeof this.indexedButtons[id] !== 'undefined') {
                return this.indexedButtons[id];
            }

            return null;
        }

        getButtonSize() {
            if (typeof BootstrapDialog.BUTTON_SIZES[this.getSize()] !== 'undefined') {
                return BootstrapDialog.BUTTON_SIZES[this.getSize()];
            }

            return '';
        }

        getType() {
            return this.options.type;
        }

        isRealized() {
            return this.realized;
        }

        setRealized(realized) {
            this.realized = realized;

            return this;
        }

        getModalForBootstrapDialogModal() {

            return this.getModal();
        }

        createDynamicContent(rawContent) {
            var content = null;
            if (typeof rawContent === 'function') {
                content = rawContent.call(rawContent, this);
            } else {
                content = rawContent;
            }
            if (typeof content === 'string') {
                content = this.formatStringContent(content);
            }

            return content;
        }

        getDescription() {
            return this.options.description;
        }

        setDescription(description) {
            this.options.description = description;

            return this;
        }

        createTitleContent() {
            var title = document.createElement('div');
            title.classList.add(this.getNamespace('title'));

            return title;
        }

        createHeaderContent() {
            var container = document.createElement('div');
            container.classList.add(this.getNamespace('header'));


            container.appendChild(this.createTitleContent());


            container.appendChild(this.createCloseButton());

            return container;
        }

        createCloseButton() {
            var container = document.createElement('div');
            container.classList.add(this.getNamespace('close-button'));

            var button = document.createElement('button');
            button.className = 'btn-close';
            button.setAttribute('aria-label', 'close');
            button.addEventListener('click', function () {
                this.close();
            }.bind(this));

            container.appendChild(button);

            return container;
        }

        getSize() {
            return this.options.size;
        }

        setSize(size) {
            this.options.size = size;
            this.updateSize();

            return this;
        }

        updateSize() {
            if (this.isRealized()) {
                var dialog = this;

                
                var modal = this.getModal();
                modal.classList.remove(
                    BootstrapDialog.SIZE_NORMAL,
                    BootstrapDialog.SIZE_SMALL,
                    BootstrapDialog.SIZE_WIDE,
                    BootstrapDialog.SIZE_EXTRAWIDE,
                    BootstrapDialog.SIZE_LARGE
                );
                modal.classList.add(this.getSize());

             
                var modalDialog = this.getModalDialog();
                modalDialog.classList.remove('modal-sm');
                if (this.getSize() === BootstrapDialog.SIZE_SMALL) {
                    modalDialog.classList.add('modal-sm');
                }

              
                modalDialog.classList.remove('modal-lg');
                if (this.getSize() === BootstrapDialog.SIZE_WIDE) {
                    modalDialog.classList.add('modal-lg');
                }

            
                modalDialog.classList.remove('modal-xl');
                if (this.getSize() === BootstrapDialog.SIZE_EXTRAWIDE) {
                    modalDialog.classList.add('modal-xl');
                }

           
                this.options.buttons.forEach(function (button) {
                    var buttonElement = dialog.getButton(button.id);
                    var buttonSizes = ['btn-lg', 'btn-sm', 'btn-xs'];
                    var sizeClassSpecified = false;
                    if (typeof button['cssClass'] === 'string') {
                        var btnClasses = button['cssClass'].split(' ');
                        btnClasses.forEach(function (btnClass) {
                            if (buttonSizes.includes(btnClass)) {
                                sizeClassSpecified = true;
                            }
                        });
                    }
                    if (!sizeClassSpecified) {
                        buttonSizes.forEach(function (size) {
                            buttonElement.classList.remove(size);
                        });
                        var buttonSize = dialog.getButtonSize().trim();
                        if (buttonSize) {
                            buttonElement.classList.add(buttonSize);
                        }

                    }
                });
            }

            return this;
        }

        formatStringContent(content) {
            if (this.options.nl2br) {
                return content.replace(/\r\n/g, '<br />').replace(/[\r\n]/g, '<br />');
            }

            return content;
        }

        createBodyContent() {
            var container = document.createElement('div');
            container.classList.add(this.getNamespace('body'));

            // Message
            container.appendChild(this.createMessageContent());

            return container;
        }
        createFooterButtons() {
            var that = this;
            var buttons = [];

            this.indexedButtons = {};
            this.options.buttons.forEach(function (button) {
                if (!button.id) {
                    button.id = BootstrapDialog.newGuid();
                }
                var buttonElement = that.createButton(button);
                that.indexedButtons[button.id] = buttonElement;
                buttons.push(buttonElement);
            });

            return buttons;
        }

        createButton(button) {
            var buttonElement = document.createElement('button');
            buttonElement.className = 'btn';
            buttonElement.id = button.id;

            
            if (typeof button.icon !== 'undefined' && button.icon.trim() !== '') {
                buttonElement.appendChild(this.createButtonIcon(button.icon));
            }

            
            if (typeof button.label !== 'undefined') {
                buttonElement.appendChild(document.createTextNode(button.label));
            }

            
            if (typeof button.title !== 'undefined') {
                buttonElement.title = button.title;
            }

            
            if (typeof button.cssClass !== 'undefined' && button.cssClass.trim() !== '') {
                button.cssClass.split(' ').forEach(function (cls) {
                    buttonElement.classList.add(cls);
                });
            } else {
                buttonElement.classList.add('btn-secondary');
            }

          
            if (typeof button.data === 'object' && button.data.constructor === {}.constructor) {
                Object.keys(button.data).forEach(function (key) {
                    buttonElement.setAttribute('data-' + key, button.data[key]);
                });
            }

            
            if (typeof button.hotkey !== 'undefined') {
                this.registeredButtonHotkeys[button.hotkey] = buttonElement;
            }

            
            buttonElement.addEventListener('click', function (event) {
                if (button.autospin) {
                    buttonElement.toggleSpin(true);
                }
                if (typeof button.action === 'function') {
                    return button.action.call(buttonElement, this, event);
                }
            }.bind(this));

            
            this.enhanceButton(buttonElement);

            
            if (typeof button.enabled !== 'undefined') {
                buttonElement.toggleEnable(button.enabled);
            }

            buttonElement.classList.add("bootstrap4-dialog-button");

            return buttonElement;
        }

        onshow(onshow) {
            this.options.onshow = onshow;

            return this;        
        }

        onshown(onshown) {
            this.options.onshown = onshown;

            return this;
        
        }

        onHide(onhide) {
            this.options.onhide = onhide;

            return this;
        
        }

        onhidden(onhidden) {
            this.options.onhidden = onhidden;

            return this;
        }

        enhanceButton(buttonElement) {
            var dialog = this;

            
            buttonElement.toggleEnable = function (enable) {
                if (typeof enable !== 'undefined') {
                    buttonElement.disabled = !enable;
                    buttonElement.classList.toggle('disabled', !enable);
                } else {
                    buttonElement.disabled = !buttonElement.disabled;
                }
                return buttonElement;
            };
            buttonElement.enable = function () {
                buttonElement.toggleEnable(true);
                return buttonElement;
            };
            buttonElement.disable = function () {
                buttonElement.toggleEnable(false);
                return buttonElement;
            };

            

            buttonElement.toggleSpin = function(spin) {
                var icon = buttonElement.querySelector('.' + dialog.getNamespace('button-icon'));
                if (typeof spin === 'undefined') {
                    spin = !(buttonElement.querySelector('.icon-spin'));
                }
                if (spin) {
                    if (icon) icon.style.display = 'none';
                    var spinIcon = dialog.createButtonIcon(dialog.getSpinicon());
                    spinIcon.classList.add('icon-spin');
                    buttonElement.insertBefore(spinIcon, buttonElement.firstChild);
                } else {
                    if (icon) icon.style.display = '';
                    var spinIcon = buttonElement.querySelector('.icon-spin');
                    if (spinIcon) buttonElement.removeChild(spinIcon);
                }
                return buttonElement;
            };
            buttonElement.spin = function () {
                buttonElement.toggleSpin(true);
                return buttonElement;
            };
            buttonElement.stopSpin = function () {
                buttonElement.toggleSpin(false);
                return buttonElement;
            };

            return this;
        }

        createButtonIcon(icon) {
            var iconElement = document.createElement('span');
            icon.split(' ').forEach(function (cls) {
                iconElement.classList.add(cls);
            });
            return iconElement;
        }
        
        enableButtons(enable) {
            Object.keys(this.indexedButtons).forEach(function (id) {
                var buttonElement = this.indexedButtons[id];
                buttonElement.toggleEnable(enable);
            }.bind(this));

            return this;
        }

        getData(key) {
            return this.options.data[key];
        }

        setData(key, value) {
            this.options.data[key] = value;

            return this;
        }

        createMessageContent() {
            var message = document.createElement('div');
            message.classList.add(this.getNamespace('message'));

            return message;
        }

        createFooterContent() {
            var container = document.createElement('div');
            container.classList.add(this.getNamespace('footer'));

            return container;
        }

        getVerticalCentered() {
            return this.options.verticalCentered;
        }

        setVerticalCentered(verticalcentered) {
            this.options.verticalCentered = verticalcentered;

            return this;
        }

        getNamespace(name) {
            return BootstrapDialog.NAMESPACE + '-' + name;
        }

        open() {
            !this.isRealized() && this.realize();
            var modalElement = this.getModal();
            var modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
            modalInstance.show();
            return this;
        }

        close() {
            !this.isRealized() && this.realize();
            var modalElement = this.getModal();
            var modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
            modalInstance.hide();
            return this;
        }

        getId() {
            return this.options.id;
        }

        static extendDeep(...objects) {
            return objects.reduce((prev, obj) => {
                if (obj && typeof obj === 'object') {
                    Object.keys(obj).forEach(key => {
                        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
                            if (!prev[key]) {
                                prev[key] = {};
                            }
                            prev[key] = BootstrapDialog.extendDeep(prev[key], obj[key]);
                        } else {
                            prev[key] = obj[key];
                        }
                    });
                }
                return prev;
            }, {});
        }

        static addDialog(dialog) {
            return BootstrapDialog.setDialog(dialog);
        }

        static setDialog(dialog) {
            BootstrapDialog.dialogs[dialog.getId()] = dialog;

            return dialog;
        }

        static moveFocus() {
            var lastDialogInstance = null;
            Object.keys(BootstrapDialog.dialogs).forEach(function (id) {
                var dialogInstance = BootstrapDialog.dialogs[id];
                if (dialogInstance.isRealized() && dialogInstance.isOpened()) {
                    lastDialogInstance = dialogInstance;
                }
            });
            if (lastDialogInstance !== null) {
                lastDialogInstance.getModal().focus();
            }
        }

        static alert() {
            var alertOptions = {};
            var defaultAlertOptions = {
                type: BootstrapDialog.TYPE_PRIMARY,
                title: null,
                message: null,
                closable: false,
                draggable: false,
                buttonLabel: BootstrapDialog.DEFAULT_TEXTS.OK,
                buttonHotkey: null,
                callback: null
            };

            if (typeof arguments[0] === 'object' && arguments[0].constructor === {}.constructor) {
                alertOptions = BootstrapDialog.extendDeep( defaultAlertOptions, arguments[0]);
            } else {
                alertOptions = BootstrapDialog.extendDeep( defaultAlertOptions, {
                    message: arguments[0],
                    callback: typeof arguments[1] !== 'undefined' ? arguments[1] : null
                });
            }

            var dialog = new BootstrapDialog(alertOptions);
            dialog.setData('callback', alertOptions.callback);
            dialog.addButton({
                label: alertOptions.buttonLabel,
                hotkey: alertOptions.buttonHotkey,
                action: function (dialog) {
                    if (typeof dialog.getData('callback') === 'function' && dialog.getData('callback').call(this, true) === false) {
                        return false;
                    }
                    dialog.setData('btnClicked', true);

                    return dialog.close();
                }
            });

            if (typeof dialog.options.onhide === 'function') {
                dialog.onHide(function (dialog) {
                    var hideIt = true;
                    if (!dialog.getData('btnClicked') && dialog.isClosable() && typeof dialog.getData('callback') === 'function') {
                        hideIt = dialog.getData('callback')(false);
                    }
                    if (hideIt === false) {
                        return false;
                    }
                    hideIt = this.onhide(dialog);

                    return hideIt;
                }.bind({
                    onhide: dialog.options.onhide
                }));
            } else {
                dialog.onHide(function (dialog) {
                    var hideIt = true;
                    if (!dialog.getData('btnClicked') && dialog.isClosable() && typeof dialog.getData('callback') === 'function') {
                        hideIt = dialog.getData('callback')(false);
                    }

                    return hideIt;
                });
            }

            return dialog.open();
        }
   
        static confirm() {
            var confirmOptions = {};
            var defaultConfirmOptions = {
                type: BootstrapDialog.TYPE_PRIMARY,
                title: null,
                message: null,
                closable: false,
                draggable: false,
                btnCancelLabel: BootstrapDialog.DEFAULT_TEXTS.CANCEL,
                btnCancelClass: null,
                btnCancelHotkey: null,
                btnOKLabel: BootstrapDialog.DEFAULT_TEXTS.OK,
                btnOKClass: null,
                btnOKHotkey: null,
                btnsOrder: BootstrapDialog.defaultOptions.btnsOrder,
                callback: null
            };
            if (typeof arguments[0] === 'object' && arguments[0].constructor === {}.constructor) {
                confirmOptions = BootstrapDialog.extendDeep(true, defaultConfirmOptions, arguments[0]);
            } else {
                confirmOptions = BootstrapDialog.extendDeep(true, defaultConfirmOptions, {
                    message: arguments[0],
                    callback: typeof arguments[1] !== 'undefined' ? arguments[1] : null
                });
            }
            if (confirmOptions.btnOKClass === null) {
                confirmOptions.btnOKClass = ['btn', confirmOptions.type.split('-')[1]].join('-');
            }

            var dialog = new BootstrapDialog(confirmOptions);
            dialog.setData('callback', confirmOptions.callback);

            var buttons = [{
                label: confirmOptions.btnCancelLabel,
                cssClass: confirmOptions.btnCancelClass,
                hotkey: confirmOptions.btnCancelHotkey,
                action: function (dialog) {
                    if (typeof dialog.getData('callback') === 'function' && dialog.getData('callback').call(this, false) === false) {
                        return false;
                    }

                    return dialog.close();
                }
            }, {
                label: confirmOptions.btnOKLabel,
                cssClass: confirmOptions.btnOKClass,
                hotkey: confirmOptions.btnOKHotkey,
                action: function (dialog) {
                    if (typeof dialog.getData('callback') === 'function' && dialog.getData('callback').call(this, true) === false) {
                        return false;
                    }

                    return dialog.close();
                }
            }];
            if (confirmOptions.btnsOrder === BootstrapDialog.BUTTONS_ORDER_OK_CANCEL) {
                buttons.reverse();
            }
            dialog.addButtons(buttons);

            return dialog.open();

        }
  
        static warning(message, callback) {
            return new BootstrapDialog({
                type: BootstrapDialog.TYPE_WARNING,
                message: message
            }).open();
        }

        static danger(message, callback) {
            return new BootstrapDialog({
                type: BootstrapDialog.TYPE_DANGER,
                message: message
            }).open();
        }

        static success(message, callback) {
            return new BootstrapDialog({
                type: BootstrapDialog.TYPE_SUCCESS,
                message: message
            }).open();
        }
    }

        BootstrapDialog.NAMESPACE = 'bootstrap-dialog';
        BootstrapDialog.TYPE_DEFAULT = 'type-default';
        BootstrapDialog.TYPE_INFO = 'type-info';
        BootstrapDialog.TYPE_PRIMARY = 'type-primary';
        BootstrapDialog.TYPE_SECONDARY = 'type-secondary';
        BootstrapDialog.TYPE_SUCCESS = 'type-success';
        BootstrapDialog.TYPE_WARNING = 'type-warning';
        BootstrapDialog.TYPE_DANGER = 'type-danger';
        BootstrapDialog.TYPE_DARK = 'type-dark';
        BootstrapDialog.TYPE_LIGHT = 'type-light';
        BootstrapDialog.DEFAULT_TEXTS = {};
        BootstrapDialog.DEFAULT_TEXTS[BootstrapDialog.TYPE_DEFAULT] = 'Default';
        BootstrapDialog.DEFAULT_TEXTS[BootstrapDialog.TYPE_INFO] = 'Information';
        BootstrapDialog.DEFAULT_TEXTS[BootstrapDialog.TYPE_PRIMARY] = 'Primary';
        BootstrapDialog.DEFAULT_TEXTS[BootstrapDialog.TYPE_SECONDARY] = 'Secondary';
        BootstrapDialog.DEFAULT_TEXTS[BootstrapDialog.TYPE_SUCCESS] = 'Success';
        BootstrapDialog.DEFAULT_TEXTS[BootstrapDialog.TYPE_WARNING] = 'Warning';
        BootstrapDialog.DEFAULT_TEXTS[BootstrapDialog.TYPE_DANGER] = 'Danger';
        BootstrapDialog.DEFAULT_TEXTS[BootstrapDialog.TYPE_DARK] = 'Dark';
        BootstrapDialog.DEFAULT_TEXTS[BootstrapDialog.TYPE_LIGHT] = 'Light';
        BootstrapDialog.DEFAULT_TEXTS['OK'] = 'OK';
        BootstrapDialog.DEFAULT_TEXTS['CANCEL'] = 'Cancel';
        BootstrapDialog.DEFAULT_TEXTS['CONFIRM'] = 'Confirmation';
        BootstrapDialog.SIZE_NORMAL = 'size-normal';
        BootstrapDialog.SIZE_SMALL = 'size-small';
        BootstrapDialog.SIZE_WIDE = 'size-wide';    // size-wide is equal to modal-lg
        BootstrapDialog.SIZE_EXTRAWIDE = 'size-extrawide';    // size-wide is equal to modal-lg
        BootstrapDialog.SIZE_LARGE = 'size-large';
        BootstrapDialog.BUTTON_SIZES = {};
        BootstrapDialog.BUTTON_SIZES[BootstrapDialog.SIZE_NORMAL] = '';
        BootstrapDialog.BUTTON_SIZES[BootstrapDialog.SIZE_SMALL] = 'btn-small';
        BootstrapDialog.BUTTON_SIZES[BootstrapDialog.SIZE_WIDE] = 'btn-block';
        BootstrapDialog.BUTTON_SIZES[BootstrapDialog.SIZE_LARGE] = 'btn-lg';
        BootstrapDialog.ICON_SPINNER = 'fas fa-spinner';
        BootstrapDialog.BUTTONS_ORDER_CANCEL_OK = 'btns-order-cancel-ok';
        BootstrapDialog.BUTTONS_ORDER_OK_CANCEL = 'btns-order-ok-cancel';
        BootstrapDialog.Z_INDEX_BACKDROP = 1040;
        BootstrapDialog.Z_INDEX_MODAL = 1050;

        BootstrapDialog.defaultOptions = {
            type: BootstrapDialog.TYPE_PRIMARY,
            size: BootstrapDialog.SIZE_NORMAL,
            cssClass: '',
            title: null,
            message: null,
            nl2br: true,
            closable: true,
            closeByBackdrop: true,
            closeByKeyboard: true,
            closeIcon: '&#215;',
            spinicon: BootstrapDialog.ICON_SPINNER,
            autodestroy: true,
            draggable: false,
            animate: true,
            description: '',
            tabindex: -1,
            verticalCentered: false,
            btnsOrder: BootstrapDialog.BUTTONS_ORDER_CANCEL_OK
        };

    var BootstrapDialogModal = function (element, options) {
        Modal.call(this, element, options);
    }


    BootstrapDialog.BootstrapDialogModal = BootstrapDialogModal;

    BootstrapDialog.dialogs = {}; 

    return BootstrapDialog;

}));