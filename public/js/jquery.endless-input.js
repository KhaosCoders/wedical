(function($) {
    $.fn.endlessInput = function() {
        return this.each(function() {
            var container = $(this);
            var templateSelector = container.data('inputTemplate');
            var defaultCounter = parseInt(container.data('startIndex') || '1');
            var counter = defaultCounter;

            // function to add a new input group
            var addFields = function() {
                var group = $(templateSelector).clone(true);
                var index = counter++;

                var replaceIndex = function(element, attribute) {
                    if (element.attr(attribute)) {
                        element.attr(attribute, element.attr(attribute).replace('%s', index));
                    }
                }

                group.find('input').each(function() {
                    var input = $(this);
                    replaceIndex(input, 'name');
                    replaceIndex(input, 'placeholder');
                    input.keypress(function() {
                        if (index === counter - 1) {
                            addFields();
                        }
                        input.off('keypress');
                    });
                });
                group.removeClass('collapse');
                group.addClass('endlessInputGroup');
                container.append(group);
            };

            // add first input group
            addFields();

            // Add function to reset the input group
            container.addClass('endlessInputEnabled');
            this.resetEndlessInputs = function() {
                container.find('.endlessInputGroup').remove();
                counter = defaultCounter;
                addFields();
            }
        });
    };

    $.fn.resetModalForm = function() {
        this.filter('.endlessInputEnabled').each(function() {
            this.resetEndlessInputs();
        });
        return this.each(function() {
            var form = $(this);
            form.clearForm();
            if (form.data('error')) {
                $(form.data('error')).hide();
            }
        });
    };
})(jQuery);