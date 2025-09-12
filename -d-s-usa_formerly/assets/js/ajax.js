/**
 * Ajax plugin to facilitate easy to use ajax features
 */
(function($) {
    $.fn.ajaxPlugin = {
        /**
         * Execute an ajax post/get
         * data contains a url and a data object
         * callback is a javascript function
         * @param data
         * @param callback
         */
        getAjax : function(data, callback) {
            this.beforeAjaxCall();
            if (data.data instanceof FormData) {
                jQuery.ajax({
                    url         : data.url,
                    data        : data.data,
                    processData : false,
                    contentType : false,
                    type        : 'POST',
                    success     : function(results) {
                        if (callback) {
                            callback(results);
                        }
                    }
                });
            } else {
                jQuery.get(data.url, data.data, function(results) {
                    if (callback) {
                        callback(results);
                    }
                });
            }
        },
        /**
         * Replace the content of an element with new html
         * @param data
         * @param el
         */
        replaceContent : function(data, el) {
            el.replaceWith(data.html);
        },
        /**
         * Execute any before ajax actions
         */
        beforeAjaxCall() {
            $('#message-error').html('').toggle(false);
            $('#message-success').html('').toggle(false);


        },
        /**
         * Execute all waiting ajax events
         */
        executeAjaxEvents : function() {
            this.rebindEvents();


            var r = this;

            // This will stop the repeat execution of an ajax request
            // if there is some sort of issue in the execution
            var thisBatch = $('.ajax_placeholder:not(.executed)');

            thisBatch.each(function() {
                $(this).addClass('executed');
            });

            thisBatch.each(function() {
                var el = $(this);

                r.getAjax({
                    url: $(this).attr('data-url')
                }, function (results) {
                    r.replaceContent(results, el);
                });
            });
        },
        /**
         * Load the content via ajax for an element
         * Expects data-url attribute to have url
         * Expects data-content-target attribute with jquery selector to know where to put the content
         * Optional data-spinner-target attribute to place a spinner during ajax routine
         * @param element
         */
        loadContent : function(element) {
            var r = this;

            var spinnerTarget = element.attr('data-spinner-target')
                ? $(element.attr('data-spinner-target'))
                : element;

            var url     = element.attr('data-url');
            var target  = $(element.attr('data-content-target'));

            spinnerTarget.html("<i class=\"fa fa-spinner fa-spin\" style=\"font-size:50px\"></i>");

            r.getAjax({
                url: url
            }, function(results) {
                r.replaceContent(results, target)
            });
        },
        rebindEvents : function() {
            var r = this;

            $('body').off('click.ajaxPlugin', '.clickAjaxLoadContent, .click-load');

            $('body').on('click.ajaxPlugin', '.clickAjaxLoadContent, .click-load', function() {
                r.loadContent($(this));
            });

            $('body').off('click.ajaxPlugin', '.click-ajax-modal');

            $('body').on('click.ajaxPlugin', '.click-ajax-modal', function() {
                let element = $(this);
                r.getAjax({
                    url : element.attr('data-url')
                }, function(results) {
                    let modal_target = element.attr('data-modal-target')
                        ? $(element.attr('data-modal-target'))
                        : $('#modal');

                    modal_target.find('.modal-content').html(results.html);
                    modal_target.modal('show', {
                        keyboard:false,
                        backdrop:'static'
                        }
                    );
                });
            });

            $('body').off('click.ajaxPlugin', '.click-do-ajax');
            $('body').on('click.ajaxPlugin', '.click-do-ajax', function() {

                let element = $(this);

                r.doAjax(element);

                if (element.attr('data-success')) {
                    eval(element.attr('data-success'));
                }

            });
        },
        /**
         * Execute an ajax routine without expecting a return value
         * Expects data-url attribute to have url
         * @param el
         */
        doAjax(el) {
            var r = this;

            r.getAjax({
                url: el.attr('data-url')
            }, function(results) {

                r.processAjaxCallbacks(results);
            });
        },
        processAjaxCallbacks(data) {

            if (data.redirect) {
                window.location.href = data.redirect;
            }

            /**
             * Create a generic standard for returning messages via ajax
             */
            if (data.messages) {
                if(data.messages.success) {
                    $('#messages-success').html('');

                    data.messages.success.forEach(function(item, index) {
                        $('#message-success').html(
                            $('#message-success').html() + item + "<br />"
                        );
                    });

                    $('#message-success').toggle('show');
                }

                if (data.messages.error) {
                    $('#message-error').html('');

                    data.messages.error.forEach(function(item,index) {
                        $('#message-error').html(
                            $('#message-error').html() + item + "<br />"
                        );
                    });

                    $('#message-error').toggle('show');
                }
            }
        }
    }

    /**
     * Execute ajax events on document ready
     */
    $(document).ready(function() {
        $.fn.ajaxPlugin.executeAjaxEvents();
    });

    /**
     * Execute new ajax events loaded via a previous ajax event
     */
    $(document).ajaxComplete(function() {
        $.fn.ajaxPlugin.executeAjaxEvents();
    });
})(jQuery);