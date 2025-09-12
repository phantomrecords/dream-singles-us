$(function() {
    $('.form-control').change(function (event) {
        $select = $(event.target);
        if ($select.val().includes('clearSelected')) {
            $select.selectpicker('deselectAll');
            $select.selectpicker('toggle');
        }
    })
});