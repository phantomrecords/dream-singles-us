/**
 * Limits the number of clicks on a button within a specified time period.
 *
 * @param {string} elemButton - The button element or selector.
 * @param {string|null} [formTag=null] - The form element or selector. If not provided, the button's parent form will be used.
 * @param {number|null} [delay=2000] - The delay in milliseconds before re-enabling the button after form submission. Set to null to disable the delay.
 */
function limitClicks(elemButton, formTag = null, delay = 2000) {
    // Convert elemButton to a jQuery object
    const $elemButton = $(elemButton);

    // If formTag is not provided, select the parent form of the button
    const $formTag = formTag ? $(formTag) : $elemButton.parents('form');

    // Submit event handler for the form to respect `required` attributes
    $formTag.submit(function () {
        // Disable the submit button
        $elemButton.prop('disabled', true);

        // Check if a delay is specified to renable the submit button
        if (delay !== null) {
            setTimeout(function () {
                // Re-enable the button
                $elemButton.removeAttr('disabled');
            }, delay);
        }
    });
}
