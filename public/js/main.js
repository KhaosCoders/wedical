;
// load eruda
(function() {
    var src = '/js/eruda.js';
    if (!/eruda=true/.test(window.location) &&
        localStorage.getItem('active-eruda') != 'true') return;
    document.write('<scr' +
        'ipt src="' + src + '"></scr' +
        'ipt>');
    document.write('<scr' +
        'ipt>eruda.init();</scr' +
        'ipt>');
})();

// init
(function($) {
    // tooltips
    $('[data-toggle="tooltip"]').not('.lazy-tooltip').tooltip();
    // tooltips in modals
    $('.modal').on('shown.bs.modal', function() {
        $(this).find('[data-toggle="tooltip"]').tooltip();
    });

    // init endless input containers
    $('.endlessInput').endlessInput();

    // Reset forms in modals
    $('.modal.clear-form').on('show.bs.modal', function() {
        $(this).find('form').resetModalForm();
    });

    // AJAX forms (submit)
    $('form.ajaxForm').each(function() {
        var form = $(this);
        form.ajaxForm({
            headers: { "CSRF-Token": getCSRF() },
            method: form.attr('method'),
            beforeSubmit: function(a, $this, options) {
                options.url = options.url
                    .replace('{id}', form.data('id'))
                    .replace('%7Bid%7D', form.data('id'));
            },
            error: function() { showElement(form.data('error')); },
            success: function() { handleModalSuccess(form); },
            complete: handleCSRF
        });
    });
    // AJAX forms (populate/fill)
    $('form.ajaxForm[data-fill-method]').each(function() {
        var form = $(this);
        this.populateForm = function() {
            $.ajax({
                headers: { "CSRF-Token": getCSRF() },
                method: form.data('fillMethod'),
                url: form.attr('action').replace('{id}', form.data('id')),
                complete: handleCSRF,
                error: function(err) { console.log(err); },
                success: function(data) {
                    form.find('input[type="radio"]').closest('label').removeClass('active');
                    form.find('input[type="checkbox"]').prop("checked", false);
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

    // AJAX buttons
    $('.ajax-btn').each(function() {
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

    // init datatables
    $('.data-table').each(function() {
        var table = $(this);
        // use __ from en.js/de.js/...
        var options = { language: __, columnDefs: [] };
        var groupColumn = null;

        // data-group-column
        if (typeof table.data('groupColumn') === 'number') {
            groupColumn = table.data('groupColumn');

            // Hide the grouping column
            options.columnDefs.push({ "visible": false, "targets": groupColumn });

            // Add group headers
            options.drawCallback = function(settings) {
                var api = this.api();
                var rows = api.rows({ page: 'current' }).nodes();
                var last = null;

                api.column(groupColumn, { page: 'current' }).data().each(function(group, i) {
                    if (last !== group) {
                        if (group) {
                            $(rows).eq(i).before(
                                '<tr class="group"><td colspan="5">' + group + '</td></tr>'
                            );
                        }
                        last = group;
                    }
                });
            };
        }

        // data-gender-column
        if (typeof table.data('genderColumn') === 'number') {
            var genderColumn = table.data('genderColumn');
            options.columnDefs.push({
                "targets": genderColumn,
                "render": function(data, type, row, meta) {
                    switch (data) {
                        case 'm':
                            return '<i class="fas fa-mars"></i>';
                        case 'd':
                            return '<i class="fas fa-genderless"></i>';
                        case 'f':
                            return '<i class="fas fa-venus"></i>';
                    }
                    return '';
                }
            });
        }

        // data-age-column
        if (typeof table.data('ageColumn') === 'number') {
            var ageColumn = table.data('ageColumn');
            options.columnDefs.push({
                "targets": ageColumn,
                "render": function(data, type, row, meta) {
                    switch (data) {
                        case 'baby':
                            return '<i class="fas fa-baby"></i>';
                        case 'child':
                            return '<i class="fas fa-child"></i>';
                        case 'teen':
                            return '<i class="fas fa-male"></i>';
                        case 'youndAdult':
                            return '<i class="fas fa-user"></i>';
                        case 'adult':
                            return '<i class="fas fa-user-tie"></i>';
                        case 'senior':
                            return '<i class="fas fa-hiking"></i>';
                    }
                    return '';
                }
            });
        }

        // data-action-column
        if (typeof table.data('actionColumn') === 'number') {
            var actionColumn = table.data('actionColumn');
            var editModal = table.data('editModal');
            var editForm = table.data('editForm');
            var deleteModal = table.data('deleteModal');
            var disableEdit = table.data('disableEdit');
            var editBtn = table.data('editBtn');
            options.columnDefs.push({
                "targets": actionColumn,
                "render": function(data, type, row, meta) {
                    return '<div class="btn-group w-100 action-group">' +
                        `<button type="button" class="edtbtn btn btn-s btn-outline-info w-50 rounded-0" data-id="${data}" ${disableEdit && row[disableEdit] ? 'data-disabled="yes"' : ''}><i class="fas fa-edit"></i></button>` +
                        `<button type="button" class="delbtn btn btn-s btn-outline-danger w-50 rounded-0" data-id="${data}" ${disableEdit && row[disableEdit] ? 'disabled' : ''}><i class="fas fa-trash"></i></button>` +
                        '</div>';
                }
            });
            options.createdRow = function(row, data, index) {
                $('td', row).eq(actionColumn).addClass('actionColumn');
                $('button.edtbtn', row).on('click', function() {
                    let btn = $(this);
                    if (disableEdit && editBtn) {
                        $(editBtn).attr('disabled', btn.data('disabled') === 'yes');
                    }

                    $(editModal).modal('toggle');
                    var form = $(editForm);
                    form.data('id', btn.data('id'));
                    if (form[0].populateForm) {
                        form[0].populateForm();
                    }
                });
                $('button.delbtn', row).on('click', function() {
                    $(deleteModal).modal('toggle');
                    $(deleteModal + 'Submit').data('id', $(this).data('id'));
                });
            };
        }

        var dt = table.DataTable(options);

        this.reloadTable = function() { dt.ajax.reload(); };

        if (typeof groupColumn === 'number') {
            dt.on('preDraw', function(e, settings) {
                var ordArr = dt.order();
                if (ordArr && ordArr.length > 0) {
                    if (ordArr[0][0] !== groupColumn) {
                        var ord = [
                            [groupColumn, 'asc']
                        ];
                        for (let order of ordArr) {
                            ord.push([order[0], order[1]]);
                        }
                        dt.order(ord).draw();
                        return;
                    }
                }
            });
        }
    });
})(jQuery);

function getCSRF() {
    return document.querySelector('meta[name="csrf-token"]').getAttribute('content');
}

function setCSRF(token) {
    document.querySelector('meta[name="csrf-token"]').setAttribute('content', token);
}

function handleCSRF(jqXHR) {
    var csrf = jqXHR.getResponseHeader('CSRF-Token');
    if (csrf) { setCSRF(csrf); }
}

function showElement(selector) {
    if (selector) { $(selector).show(); }
}

function handleModalSuccess(element) {
    if (element.data('modal')) {
        $(element.data('modal')).modal('hide');
    }
    if (element.data('redrawTable')) {
        $(element.data('redrawTable')).each(function() {
            this.reloadTable();
        });
    }
}