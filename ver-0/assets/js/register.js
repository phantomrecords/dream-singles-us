document.addEventListener('DOMContentLoaded', function() {
    $('[data-toggle="tooltip"]').tooltip();

    const passwordInput = document.getElementById('registration_password');
    if (passwordInput) {
        passwordInput.addEventListener('keyup', updatePasswordValidation);
        passwordInput.addEventListener('focus', function() {
            $("#password-error").css('display', 'none');
            $("#registration_password").tooltip('show');
            updatePasswordValidation();
        });
        passwordInput.addEventListener('blur', function() {
            $("#password-error").css('display', passwordErrors().length ? 'block' : 'none');
            $(".error").css('display', 'none');
            $("#passwordErrors").css('display', 'none');
        });
    }

    const VALIDATION_LABELS = {
        length: 'length',
        uppercase: 'uppercase',
        lowercase: 'lowercase',
        number: 'number',
    }

    let invalidCharacters = '';

    let passwordErrors = () =>
    {
        invalidCharacters = '';
        let password = passwordInput.value;
        let errors = [];

        if (password.length <= 7) {
            errors.push(VALIDATION_LABELS.length);
        }
        if (!/[A-Z]/.test(password)) {
            errors.push(VALIDATION_LABELS.uppercase);
        }
        if (!/[a-z]/.test(password)) {
            errors.push(VALIDATION_LABELS.lowercase);
        }
        if (!/[0-9]/.test(password)) {
            errors.push(VALIDATION_LABELS.number);
        }
        return errors;
    }

    function updateUIValidation(container, status)
    {
        if (status === 'success') {
            container.classList.remove('text-danger');
            container.classList.add('text-success');
            container.querySelector('.symbol').textContent = '✔️';
        } else {
            container.classList.remove('text-success');
            container.classList.add('text-danger');
            container.querySelector('.symbol').textContent = '❌';
        }
    }

    function updatePasswordValidation()
    {
        let errors = passwordErrors();
        let validationHTML = '';
        Object.values(VALIDATION_LABELS).forEach(value => {
            if (value === VALIDATION_LABELS.special) {
                if (invalidCharacters.length) {
                    document.getElementById('password-special-content').innerHTML = `${invalidCharacters} ${(invalidCharacters.length > 1) ? 'are not valid characters.' : 'is not a valid character.'} `;
                } else {
                    document.getElementById('password-special-content').innerHTML = 'Passwords may not include emojis or non-standard characters';
                }

            }
            let container = document.getElementById(`password-valid-${value}`);
            if (container) {
                updateUIValidation(container, (!errors.includes(value)) ? 'success' : 'fail');
                validationHTML += container.outerHTML;
            }
        });
        passwordInput.setAttribute('data-original-title', validationHTML);
    }
});