$(document).ready(function()
{
    function FreeTrial()
    {
        this.$ = {
            step_btn       : $('#free-trial-modal-v5 .step-toggle'),
            join_now       : $('#free-trial-modal-v5 .join-now'),
            form           : $('#free-trial-modal-v5 form'),
            form_state     : $('#free-trial-modal-v5 form [name=billing_state]'),
            form_country   : $('#free-trial-modal-v5 form [name=billing_country]'),
            form_cc_type   : $('#free-trial-modal-v5 form input[name=cc_type]'),
            form_cc_num    : $('#free-trial-modal-v5 form input[name=cc_nmb]'),
            form_cc_icon   : $('#free-trial-modal-v5 form #icon-cc-type'),
            form_month     : $('#free-trial-modal-v5 form .select-expiration-month'),
            form_year      : $('#free-trial-modal-v5 form .select-expiration-year'),
        }
    }

    var proto = FreeTrial.prototype;

    proto.registerEvents = function()
    {
        this.$.step_btn.on('click', this.onClickStepButton.bind(this))
        this.$.join_now.on('click', this.onClickJoinNow.bind(this))

        var cc_config = {supported: ['visa', 'mastercard', 'american-express', 'discover']}
        this.$.form_cc_num.detectCard(cc_config).on('cardChange', this.onDetectCard.bind(this))

        $('#free-trial-modal-v5').on('hidden.bs.modal', this.onCloseModal.bind(this))

        return this
    }

    proto.init = function()
    {
        return this
    }

    proto.promoTracking = function(mode, lady_profile_id, callback)
    {
        if (! callback)
            callback = function(){}

        $.ajax({
            url: '/members/promoTracking/action/'+mode+'?lady_profile_id=' + lady_profile_id,
            method: 'POST',
            dataType: 'json',
            data: { promo: 'freetrialpopupv5' },
            success: callback.bind(this),
        })
    }

    proto.onDetectCard = function(e, card)
    {
        var cc_map = {'visa':1, 'mastercard':2, 'american-express':3, 'discover':5}
        var ccn = (card.type) ? cc_map[card.type] : 0;
        var cct = (card.type) ? card.type : 'none';
        this.$.form_cc_type.val(ccn);
        this.$.form_cc_icon.removeClass().addClass(cct);

        if ('none' == cct)
        {
            this.$.form_cc_num.parent().addClass('block')
            this.$.form_cc_icon.parent().hide()
        }
        else
        {
            this.$.form_cc_num.parent().removeClass('block')
            this.$.form_cc_icon.parent().show()
        }
    }

    proto.onClickStepButton = function()
    {
        $('#free-trial-modal-v5 #step1').toggle()
        $('#free-trial-modal-v5 #step2').toggle()
        $('#free-trial-modal-v5.modal .modal-body').css('background-color', '#ffffff');
    }

    proto.onClickJoinNow = function ()
    {
        let previous_content = this.$.join_now.html();
        this.$.join_now.prop('disabled', true).html("Processing...");

        if (this.$.form.valid())
        {
            this.$.form.submit()
        } else
        {
            this.$.join_now.prop('disabled', false).html(previous_content);
            this.hackSelectErrors()
        }
    }

    proto.onCloseModal = function()
    {
        this.promoTracking('close')
        $('body').css('overflow', 'auto').css('position', 'relative').css('max-height', 'auto').css('max-width', 'auto');
        $('#free-trial-modal-v5.modal .modal-body').css('background-color', '#f2f2f1');
        $('#free-trial-modal-v5 #step1').show()
        $('#free-trial-modal-v5 #step2').hide()
    }

    proto.onAjaxOptions = function(response)
    {
        this.appendObjectOptions(response.states, this.$.form_state)
        this.appendObjectOptions(response.expiration_years, this.$.form_year)
        this.sortObjectKeysAndAppendOptions(response.expiration_months, this.$.form_month)
        populateCountryDropdown(this.$.form_country[0], 0)
        this.$.form_country.selectpicker('refresh')
    }

    proto.onInitValidation = function(response)
    {
        try {
            this.$.form.validate({
                rules: {
                    billing_address: 'required',
                    billing_city: 'required',
                    billing_zip: 'required',
                    billing_country: 'required',
                    // state only required for U.S.
                    billing_state: {
                        required: {
                            depends: function() {
                                return $('[name=billing_country]').val() == 5000
                            }
                        }
                    },
                    cc_first_name: 'required',
                    cc_last_name: 'required',
                    cc_nmb: 'required',
                    cc_exp_month: 'required',
                    cc_exp_year: 'required',
                    cc_vv: {required:true, digits:true},
                    agree_to_silver: 'required'
                },
                messages: {
                    billing_address: 'Address is required.',
                    billing_city: 'City is required.',
                    billing_zip: 'Zip is required.',
                    billing_country: 'Country is required.',
                    billing_state: 'State is required.',
                    cc_first_name: 'First Name is required.',
                    cc_last_name: 'Last Name is required.',
                    cc_nmb: 'Card # is required.',
                    cc_exp_month: 'Month is required.',
                    cc_exp_year: 'Year is required.',
                    cc_vv: 'CVV is required.',
                    agree_to_silver: 'Checkbox is required.'
                },
                errorPlacement: function(error, element){
                    element.parent().append(error)
                    if ('SELECT' == element.prop('nodeName').toUpperCase())
                        element.next('.bootstrap-select').addClass('error')
                    $('.boxed-frame').css('height','400px');
                },
            })
        } catch(error){}
    }

    proto.appendObjectOptions = function(object, element)
    {
        for (var key in object)
            element.append($('<option>', {value: key, text: object[key]}))

        try{element.selectpicker('refresh')}catch(error){}
    }

    proto.sortObjectKeysAndAppendOptions = function(object, element)
    {
        var ids = []
        for (var id in object)
            ids.push(id)
        ids.sort()

        for (var i = 0; i < ids.length; i++) {
            var content = {
                value : ids[i],
                text  : object[ids[i]]
            }
            element.append($('<option>', content))
        }

        try{element.selectpicker('refresh')}catch(error){}
    }

    proto.hackSelectErrors = function()
    {
        /*
         * hack the bootstrap-select plugin
         * error styling not deactivating when error is corrected by client
         * when the label has style="display:none" then we dont need the error class anymore
         */
        var errs = $('.bootstrap-select.error')
        for (var x = 0; x < errs.length; x++)
        {
            var err = $(errs[x])
            if (err.next('label.error').attr('style'))
                err.removeClass('error')
        }
    }

    var freeTrial = new FreeTrial()
    freeTrial.registerEvents().init()

    popupTrial = function(lady_profile_id = null, lady_name = null, context = 'default')
    {
        let button_texts = {
            'default'       : 'find my match now',
            'chat'          : 'chat with her now',
            'message'       : 'read her message now',
            'send_message'  : 'send her a message now',
        };

        $('.join-now').text(button_texts[context]);



        if (lady_name && lady_profile_id) {
            $("#free-trial-modal-v5 .generic").hide();
            $("#free-trial-modal-v5 .personal").show();
            $("#free-trial-modal-v5 .lady-name").text(lady_name);
            $("#free-trial-modal-v5 .lady-profile-pic").attr("src", "https://dream-marriage-profilephotos.s3.amazonaws.com/im" + lady_profile_id + "_1.jpg" );
        } else {
            $("#free-trial-modal-v5 .generic").show();
            $("#free-trial-modal-v5 .personal").hide();
        }

        if (window.trialDecision) {
            window.trialDecision.then(shouldShow => {
                if (shouldShow) {
                    $('#free-trial-modal-v5').modal();
                }
            });
        } else {
            $('#free-trial-modal-v5').modal();
        }

        freeTrial.promoTracking('open', lady_profile_id)
        $('body').css('overflow', 'hidden').css('max-height', '100%').css('max-width', '100%');
        return false
    }
});
