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

    // init endless input containers
    $('.endlessInput').endlessInput();

    // AJAX forms
    $('form.ajaxForm').each(function() {
        var form = $(this);
        form.ajaxForm({
            error: function() {
                if (form.data('error')) {
                    $(form.data('error')).show();
                }
            },
            success: function() {
                if (form.data('modal')) {
                    $(form.data('modal')).modal('hide');
                }
                if (form.data('redrawTable')) {
                    $(form.data('redrawTable')).each(function() {
                        this.reloadTable();
                    });
                }
            }
        });
    });

    // Reset forms in modals
    $('.modal').on('show.bs.modal', function() {
        $(this).find('form').resetModalForm();
    });
})(jQuery);