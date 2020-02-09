(function($) {
    $.fn.modalTooltips = function() {
        return this.each(function() {
            $(this).on('shown.bs.modal', function() {
                $(this).find('[data-toggle="tooltip"]').tooltip();
            });
        });
    };

    $.fn.modalResetForm = function() {
        return this.each(function() {
            $(this).on('show.bs.modal', function() {
                var form = $(this).find('form');
                form.resetEndlessForm()
                form.resetFormState();
                form.resetFormFields();
            });
        });
    };

})(jQuery);