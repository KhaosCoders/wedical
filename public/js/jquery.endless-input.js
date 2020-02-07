(function($) {
    $.fn.endlessInput = function() {
        return this.each(function() {
            var container = $(this);
            var templateSelector = container.data('inputTemplate');
            var counter = parseInt(container.data('startIndex') || '1');

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
                container.append(group);
            };

            addFields();
        });
    };
})(jQuery);