(function($) {
    /**
     * @summary
     * Clears the fields of a form
     */
    $.fn.resetFormFields = function() {
        return this.each(function() {
            $(this).clearForm();
        });
    };

    /**
     * @summary
     * Clears the state (validation/erros) of a form
     */
    $.fn.resetFormState = function() {
        return this.each(function() {
            var form = $(this);
            if (form.data('error')) {
                $(form.data('error')).hide();
            }
            // reset validation results
            form.removeClass('was-validated');
            form.find('input').each(function() {
                this.setCustomValidity("");
                $(this).removeClass('is-valid').removeClass('is-invalid');
            });
        });
    };

    /**
     * @summary
     * enable buttons perform AJAX reqests
     */
    $.fn.ajaxRequest = function() {
        return this.each(function() {
            var btn = $(this);
            btn.on('click', function() {
                $.ajax({
                    url: btn.data('action').replace('{id}', btn.data('id')),
                    method: btn.data('method'),
                    timeout: 2000,
                    headers: { "CSRF-Token": getCSRF() },
                    error: function() { showElement(btn.data('error')); },
                    success: function() { handleModalSuccess(btn); },
                    complete: handleCSRF
                })
            });
        });
    };

    /**
     * @summary
     * enable form submitting via AJAX
     */
    $.fn.ajaxFormSubmit = function() {
        return this.each(function() {
            var form = $(this);
            var handleError = function() { showElement(form.data('error')); };
            var handleComplete = handleCSRF;
            if (form.hasClass('needs-validation')) {
                handleError = function(result) {
                    if (result.responseJSON && result.responseJSON.errors) {
                        for (let error of result.responseJSON.errors) {
                            form.find(`[name="${error.param}"]`).each(function() {
                                $(this).removeClass('is-valid').addClass('is-invalid');
                                this.setCustomValidity(error.msg);
                            });
                        }
                    } else {
                        showElement(form.data('error'));
                    }
                }
                handleComplete = function(jqXHR) {
                    handleCSRF(jqXHR);
                    form.addClass('was-validated');
                }
                form.find('input').on('change', function() {
                    this.setCustomValidity('');
                    $(this).removeClass('is-valid').removeClass('is-invalid');
                });
            }
            form.ajaxForm({
                headers: { "CSRF-Token": getCSRF() },
                method: form.attr('method'),
                beforeSubmit: function(a, $this, options) {
                    form.resetFormState();
                    options.url = options.url
                        .replace('{id}', form.data('id'))
                        .replace('%7Bid%7D', form.data('id'));
                },
                success: function() { handleModalSuccess(form); },
                error: handleError,
                complete: handleComplete
            });
        });
    };

    /**
     * @summary
     * enable forms to load form data via AJAX
     */
    $.fn.ajaxFillForm = function() {
        return this.each(function() {
            var form = $(this);
            this.populateForm = function() {
                // reset form data
                form.find('input:not([type="checkbox"]):not([type="hidden"]):not([type="radio"])').val('');
                form.find('input[type="radio"]').closest('label').removeClass('active');
                form.find('input[type="checkbox"]').prop("checked", false);
                // load data
                $.ajax({
                    headers: { "CSRF-Token": getCSRF() },
                    method: form.data('fillMethod'),
                    url: form.attr('action').replace('{id}', form.data('id')),
                    complete: handleCSRF,
                    error: function(err) { console.log(err); },
                    success: function(data) {
                        if (data.data) {
                            for (let [key, value] of Object.entries(data.data)) {
                                if (key === 'auth' || key === 'roles') {
                                    continue;
                                }
                                var inputs = form.find(`[name=${key}]`);
                                inputs.not('[type="radio"]').each(function() {
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
                                inputs.filter(`[type="radio"][value="${value}"]`).closest('label').addClass('active');
                            }
                            // set checkboxes in roles dialogs
                            if (data.data.auth) {
                                let checkboxes = form.find('input[type="checkbox"]');
                                for (let authObj of data.data.auth) {
                                    console.log(authObj);
                                    for (let [fieldKey, fieldValues] of Object.entries(authObj.AuthFieldValue)) {
                                        for (let option of fieldValues) {
                                            let chkName = `r_${authObj.AuthObject}_${fieldKey}_${option}`;
                                            checkboxes.each(function() {
                                                let chk = $(this);
                                                if (chk.attr('name').startsWith(chkName)) {
                                                    chk.prop("checked", true);
                                                }
                                            });
                                        }
                                    }
                                }
                            }
                            // set checkboxes in roles dialogs
                            if (data.data.roles) {
                                let checkboxes = form.find('input[type="checkbox"]');
                                for (let roleId of data.data.roles) {
                                    let chkName = `r_${roleId}`;
                                    checkboxes.each(function() {
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
})(jQuery);