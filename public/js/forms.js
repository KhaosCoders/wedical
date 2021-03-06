(function ($) {

    /**
     * @summary
     * Copies the value of a target input field into the clipboard
     */
    $.fn.copyToClipboard = function () {
        return this.each(function () {
            $(this).on('click', function (e) {
                var btn = $(this);
                if (btn.data('copyTarget')) {
                    var target = $(btn.data('copyTarget'));
                    if (target.length > 0) {
                        target = target[0];
                        // Select the text field
                        target.select();
                        // For mobile devices
                        target.setSelectionRange(0, 99999);
                        // Copy the text inside the text field
                        document.execCommand("copy");
                    }
                }
                e.preventDefault();
                return false;
            });
        });
    };

    /**
     * @summary
     * Control is only visible when the assigned control is checked or has a value
     */
    $.fn.visibleWhen = function () {
        return this.each(function () {
            var control = $(this);
            var trigger = $(control.data('visibleWhen'));
            var handler = function () {
                var val = trigger.prop('checked');
                if (val == undefined) {
                    val = trigger.val();
                }
                if (val && val !== 'false') {
                    control.show();
                } else {
                    control.hide();
                }
            };
            trigger.on('change', handler);
            handler();
        });
    };

    /**
     * @summary
     * Send changes on a cntrol as POST message
     */
    $.fn.postChange = function () {
        return this.each(function () {
            $(this).on('change', function () {
                var control = $(this);
                var val = control.prop('checked');
                if (val == undefined) {
                    val = control.val();
                }
                $.ajax({
                    url: control.data('changeApi'),
                    data: {
                        value: val
                    },
                    method: 'POST',
                    timeout: 2000,
                    headers: {
                        "CSRF-Token": getCSRF()
                    },
                    complete: handleCSRF
                })
            });
        });
    };

    /**
     * @summary
     * Clears the fields of a form
     */
    $.fn.resetFormFields = function () {
        return this.each(function () {
            var form = $(this);
            form.clearForm();
            form.find('select').each(function () {
                if ($(this).data('multiselect')) {
                    $(this).data('multiselect').deselect_all();
                }
            });
            form.find('.btn-group[data-default-value]').each(function () {
                var group = $(this);
                // set default radio button
                group.find(`[type="radio"][value!="${group.data('defaultValue')}"]`).closest('label').removeClass('active');
                var radio = group.find(`[type="radio"][value="${group.data('defaultValue')}"]`);
                radio.prop('checked', true).closest('label').addClass('active');
                // activate default section
                var hideSelector = group.data('defaultHide');
                var showSelector = group.data('defaultShow');
                if (hideSelector) {
                    $(hideSelector).removeClass('show');
                }
                if (showSelector) {
                    $(showSelector).addClass('show');
                }
            });
        });
    };

    /**
     * @summary
     * Clears the state (validation/erros) of a form
     */
    $.fn.resetFormState = function () {
        return this.each(function () {
            var form = $(this);
            if (form.data('error')) {
                $(form.data('error')).hide();
            }
            // reset validation results
            form.removeClass('was-validated');
            form.find('input').each(function () {
                this.setCustomValidity("");
                $(this).removeClass('is-valid').removeClass('is-invalid');
            });
        });
    };

    /**
     * @summary
     * enable buttons perform AJAX reqests
     */
    $.fn.ajaxRequest = function () {
        return this.each(function () {
            var btn = $(this);
            btn.on('click', function () {
                $.ajax({
                    url: btn.data('action').replace('{id}', btn.data('id')),
                    method: btn.data('method'),
                    timeout: 2000,
                    headers: {
                        "CSRF-Token": getCSRF()
                    },
                    error: function () {
                        showElement(btn.data('error'));
                    },
                    success: function () {
                        handleModalSuccess(btn);
                    },
                    complete: handleCSRF
                });
            });
        });
    };

    /**
     * @summary
     * enable form submitting via AJAX
     */
    $.fn.ajaxFormSubmit = function () {
        return this.each(function () {
            var form = $(this);
            var handleError = function () {
                showElement(form.data('error'));
            };
            var handleComplete = handleCSRF;
            if (form.hasClass('needs-validation')) {
                handleError = function (result) {
                    if (result.responseJSON && result.responseJSON.errors) {
                        for (let error of result.responseJSON.errors) {
                            form.find(`[name="${error.param}"]`).each(function () {
                                $(this).removeClass('is-valid').addClass('is-invalid');
                                this.setCustomValidity(error.msg);
                            });
                        }
                    } else {
                        showElement(form.data('error'));
                    }
                }
                handleComplete = function (jqXHR) {
                    handleCSRF(jqXHR);
                    form.addClass('was-validated');
                }
                form.find('input').on('change', function () {
                    this.setCustomValidity('');
                    $(this).removeClass('is-valid').removeClass('is-invalid');
                });
            }
            form.ajaxForm({
                headers: {
                    "CSRF-Token": getCSRF()
                },
                method: form.attr('method'),
                beforeSubmit: function (a, $this, options) {
                    form.resetFormState();
                    options.url = options.url
                        .replace('{id}', form.data('id'))
                        .replace('%7Bid%7D', form.data('id'));
                },
                success: function (data) {
                    if (data.redirect) {
                        window.location = data.redirect;
                    } else {
                        handleModalSuccess(form);
                    }
                },
                error: handleError,
                complete: handleComplete
            });
        });
    };

    /**
     * @summary
     * enable forms to load form data via AJAX
     */
    $.fn.ajaxFillForm = function () {
        return this.each(function () {
            var form = $(this);
            this.populateForm = function () {
                // reset form data
                form.find('input:not([type="checkbox"]):not([type="hidden"]):not([type="radio"])').val('');
                form.find('input[type="radio"]').closest('label').removeClass('active');
                form.find('input[type="checkbox"]').prop('checked', false);
                // reset quickseach selects
                form.find('select.quickMultiSelect').each(function () {
                    this.multiSelect.qs1.reset();
                });

                // load data
                $.ajax({
                    headers: {
                        "CSRF-Token": getCSRF()
                    },
                    method: form.data('fillMethod'),
                    url: form.attr('action').replace('{id}', form.data('id')),
                    complete: handleCSRF,
                    error: function (err) {
                        console.log(err);
                    },
                    success: function (data) {
                        if (data.data) {
                            for (let [key, value] of Object.entries(data.data)) {
                                if (key === 'auth' || key === 'roles') {
                                    continue;
                                }
                                var container = form.find(`[name='${key}1']`).closest('.endlessInputEnabled');
                                if (Array.isArray(value) && container.length > 0) {
                                    if (container.length < 1) {
                                        continue;
                                    }
                                    for (let index = 0; index < value.length; index++) {
                                        var input = container.find(`[name='${key}${index+1}']`);
                                        if (input.length === 0) {
                                            container[0].addFields();
                                            input = container.find(`[name='${key}${index+1}']`);
                                        }
                                        input.val(value[index]);
                                    }
                                    if (value.length > 0) {
                                        container[0].addFields();
                                    }
                                    continue;
                                }

                                var inputs = form.find(`[name=${key}]`);
                                // text
                                inputs.not('[type="radio"]').not('select').each(function () {
                                    var input = $(this);
                                    switch (input.data('format')) {
                                        case 'datetime':
                                            value = new Date(Date.parse(value)).toLocaleString();
                                            break;
                                        case 'date':
                                            value = new Date(Date.parse(value)).toDateString();
                                            break;
                                    }
                                    input.val(value);
                                });
                                // radio button group
                                inputs.filter(`[type="radio"][value="${value}"]`).each(function () {
                                    var radio = $(this);
                                    radio.prop('checked', true).closest('label').addClass('active');
                                    if (radio.data('toggle') === 'radio') {
                                        $(radio.data('target')).removeClass('show');
                                        $(radio.data('show')).addClass('show');
                                    }
                                });
                                // multiselect
                                inputs.filter('select').each(function () {
                                    if ($(this).data('multiselect')) {
                                        $(this).data('multiselect').select(value);
                                    }
                                });
                            }
                            // set checkboxes in role dialogs
                            if (data.data.auth) {
                                let checkboxes = form.find('input[type="checkbox"]');
                                for (let authObj of data.data.auth) {
                                    console.log(authObj);
                                    for (let [fieldKey, fieldValues] of Object.entries(authObj.AuthFieldValue)) {
                                        for (let option of fieldValues) {
                                            let chkName = `r_${authObj.AuthObject}_${fieldKey}_${option}`;
                                            checkboxes.each(function () {
                                                let chk = $(this);
                                                if (chk.attr('name').startsWith(chkName)) {
                                                    chk.prop('checked', true);
                                                }
                                            });
                                        }
                                    }
                                }
                            }
                            // set checkboxes in user dialogs
                            if (data.data.roles) {
                                let checkboxes = form.find('input[type="checkbox"]');
                                for (let roleId of data.data.roles) {
                                    let chkName = `r_${roleId}`;
                                    checkboxes.each(function () {
                                        let chk = $(this);
                                        if (chk.attr('name').startsWith(chkName)) {
                                            chk.prop("checked", true);
                                        }
                                    });
                                }
                            }
                        }
                    }
                });
            };
        });
    };

    /**
     * @summary
     * enable forms to load form data via AJAX
     */
    $.fn.quickMultiSelect = function () {
        return this.each(function () {
            var otherThat = this;
            var select = $(this);
            var leftHeader = select.data('leftHeader') || 'Available';
            var rightHeader = select.data('rightHeader') || 'Active';
            var placeholder = select.data('placeholder') || 'Search...';
            select.multiSelect({
                selectableHeader: `<p class="h5">${leftHeader}</p><div><input type='text' class='list-search-input' autocomplete='off' placeholder='${placeholder}' novalidate></div>`,
                selectionHeader: `<p class="h5">${rightHeader}</p><div><input type='text' class='list-search-input' autocomplete='off' placeholder='${placeholder}' novalidate></div>`,
                cssClass: "list-form-control",
                afterInit: function (ms) {
                    otherThat.multiSelect = this;
                    var that = this,
                        $selectableSearch = that.$selectableUl.prev().children('input'),
                        $selectionSearch = that.$selectionUl.prev().children('input'),
                        selectableSearchString = '#' + that.$container.attr('id') + ' .ms-elem-selectable:not(.ms-selected)',
                        selectionSearchString = '#' + that.$container.attr('id') + ' .ms-elem-selection.ms-selected';
                    that.qs1 = $selectableSearch.quicksearch(selectableSearchString)
                        .on('keydown', function (e) {
                            if (e.which === 40) {
                                that.$selectableUl.focus();
                                return false;
                            }
                        });
                    that.qs2 = $selectionSearch.quicksearch(selectionSearchString)
                        .on('keydown', function (e) {
                            if (e.which == 40) {
                                that.$selectionUl.focus();
                                return false;
                            }
                        });
                    console.log(that);
                    console.log(that.qs1);
                },
                afterSelect: function () {
                    this.qs1.cache();
                    this.qs2.cache();
                },
                afterDeselect: function () {
                    this.qs1.cache();
                    this.qs2.cache();
                }
            });
        });
    };
})(jQuery);