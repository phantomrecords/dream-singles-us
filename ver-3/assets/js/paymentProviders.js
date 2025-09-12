class PaymentProviders {
    static ENVIRONMENT_DEV = 'TEST';
    static ENVIRONMENT_PRODUCTION = 'PRODUCTION';
    static GATEWAY = 'authorizenet';
    static GATEWAY_ID = '981758';
    static MERCHANT = 'Dream Singles: Premier Dating';
    static MERCHANT_ID = 'BCR2DN4TS7A3PMLY';
    
    constructor(environment, purchaseType = '', forceAmount = false) {
        this.purchaseType = purchaseType;
        this.forceAmount = forceAmount;
        this.amount = '0';
        this.loadAttempts = 0;
        this.googlePayClient;
        this.baseCardPaymentMethod;
        this.isReadyToPayResponse;
        this.paymentDataRequest;
        this.onSubmitHideElements;
        this.onSubmitClickElement;
        this.environment = environment == 'dev' ? PaymentProviders.ENVIRONMENT_DEV : PaymentProviders.ENVIRONMENT_PRODUCTION;
        
        this.buttonContainerPaypalPay = '';

        this.getCreditsCost();
    }

    setOnSubmitHideElements(onSubmitHideElements) {
        this.onSubmitHideElements = onSubmitHideElements;
    }

    setOnSubmitClickElement(onSubmitClickElement) {
        this.onSubmitClickElement = onSubmitClickElement;
    }

    /**
     * Retrieves the cost of the selected credits purchase plan.
     */
    getCreditsCost() {
        if (this.forceAmount) {
            this.amount = this.forceAmount;
            return;
        }

        const self = this;

        let creditsID = self.getCreditsID();

        jQuery.ajax({
            type: "GET",
            url: '/members/credits/cost',
            data: {credits_id:  parseInt(creditsID)},
            success: function(data) {
                self.amount = data.price;
            }
        });
    }

    getCreditsID() {
        let creditsID = $('input[name="credits_purchase[plan]"]:checked').val();
        if (!creditsID) {
            creditsID = 0;
        }
        return creditsID;
    }

    /**
     * Google Pay
     * 
     * @param {*} buttonContainer 
     */
    loadGooglePay(buttonContainer) {
        ++this.loadAttempts;
        let googlePayLoaded = this.onGooglePayLoaded(buttonContainer);

        if (googlePayLoaded) {
            return;
        }

        if (this.loadAttempts > 20) {
            return;
        }

        setTimeout(() => {
            this.loadGooglePay(buttonContainer);
        }, 250);
    }

    onGooglePayLoaded(buttonContainer) {
        this.baseCardPaymentMethod = {
            type: 'CARD',
            parameters: {
                allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                allowedCardNetworks: ['AMEX', 'DISCOVER', 'JCB', 'MASTERCARD', 'VISA'],
            },
            tokenizationSpecification: {
                type: 'PAYMENT_GATEWAY',
                parameters: {
                    gateway: PaymentProviders.GATEWAY,
                    gatewayMerchantId: PaymentProviders.GATEWAY_ID
                }
            }
        };

        if (typeof google === "undefined" || !google) {
            console.error("Google object not found");
            return false;
        }

        if (typeof google.payments === "undefined" || !google.payments) {
            console.error("Google.payments object not found");
            return false;
        }

        if (typeof google.payments.api === "undefined" || !google.payments.api) {
            console.error("Google.payments.api object not found");
            return false;
        }
        
        this.googlePayClient = new google.payments.api.PaymentsClient({
            environment: this.environment,
        });

        this.isReadyToPayRequest = {
            apiVersion: 2,
            apiVersionMinor: 0,
            allowedPaymentMethods: [this.baseCardPaymentMethod]
        };

        this.googlePayClient.isReadyToPay(this.isReadyToPayRequest).then((response) => {
            if (response.result) {
                const button = this.googlePayClient.createButton({onClick: this.onGooglePayButtonClicked.bind(this)});
                document.getElementById(buttonContainer).appendChild(button);
            }
        }).catch((err) => {
            console.error(err);
        });

        return true;
    }

    onGooglePayButtonClicked() {
        this.paymentDataRequest = {
            apiVersion: 2,
            apiVersionMinor: 0,
            allowedPaymentMethods: [this.baseCardPaymentMethod],
            transactionInfo: {
                totalPriceStatus: 'FINAL',
                totalPrice: this.amount,
                countryCode: 'US',
                currencyCode: 'USD',
            },
            merchantInfo: {
                merchantId: PaymentProviders.MERCHANT_ID,
                merchantName: PaymentProviders.MERCHANT
            }
        };

        this.googlePayClient.loadPaymentData(this.paymentDataRequest).then((paymentData) => {
            let paymentToken = paymentData.paymentMethodData.tokenizationData.token;
            var enc = window.btoa(paymentToken);

            if (paymentToken) {
                this.onPaymentSuccess(
                    'paymentTokenGoogle',
                    enc,
                    paymentData.paymentMethodData.info.cardDetails,
                    paymentData.paymentMethodData.info.cardNetwork
                );
            }
        }).catch((err) => {
            console.error(err);
        });
    }

    /**
     * PayPal Pay
     * 
     * @param {*} buttonContainer 
     * @returns 
     */
    loadPaypalPay(buttonContainer) {
        ++this.loadAttempts;
        let paypalPayLoaded = this.onPaypalPayLoaded(buttonContainer);

        if (paypalPayLoaded) {
            return;
        }

        if (this.loadAttempts > 20) {
            return;
        }

        setTimeout(() => {
            this.loadPaypalPay(buttonContainer);
        }, 250);
    }

    onPaypalPayLoaded(buttonContainer) {
        if (typeof paypal === "undefined" || !paypal) {
            console.error("Paypal object not found");
            return false;
        }

        const self = this;

        paypal.Buttons({
            style: {
                layout: 'vertical',
                // color: 'gold',
                shape: 'rect',
                label: 'paypal',
                height: 40
            },
            fundingSource: paypal.FUNDING.PAYPAL,
            createOrder: function(data, actions) {
                return fetch('/members/credits/paypal/initOrder', {
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        credits_id: self.getCreditsID()
                    }),
                }).then(function(res) {
                    return res.json();
                }).then(function(orderData) {
                    return orderData.id;
                });
            },
            onApprove: function(data, actions) {
                if (data.orderID) {
                    self.onPaymentSuccess(
                        'paymentTokenPayPal',
                        data.orderID,
                        '',
                        'paypal'
                    );
                }
            }
        }).render('#' + buttonContainer);

        return true;
    }

    loadApplePay(buttonContainer) {
        ++this.loadAttempts;
        let applePayLoaded = this.onApplePayLoaded(buttonContainer);
    
        if (applePayLoaded) {
            return;
        }
    
        if (this.loadAttempts > 3) {
            return;
        }
    
        setTimeout(() => {
            this.loadApplePay(buttonContainer);
        }, 250);
    }
    
    onApplePayLoaded(buttonContainer) {
        if (!window.ApplePaySession) {
            return false;
        }

        if (!ApplePaySession.canMakePayments()) {
            return false;
        }

        const button = document.createElement('apple-pay-button');
        button.type = 'button';
        button.id = 'apple-pay-button';
        button.setAttribute('buttonstyle', 'black');
        button.type = 'buy';
        button.className = 'apple-pay-button';
        document.getElementById(buttonContainer).appendChild(button);

        button.addEventListener('click', () => {
            const paymentRequest = {
                countryCode: "US",
                currencyCode: "USD",
                supportedNetworks: ["visa", "masterCard", "amex"],
                merchantCapabilities: ["supports3DS"],
                total: {
                    label: "Dream Singles",
                    amount: this.amount
                }
            };

            const session = new ApplePaySession(3, paymentRequest);

            session.onvalidatemerchant = async function (event) {
                const validationURL = event.validationURL;
                const response = await fetch("/members/credits/apple/initOrder", {
                    method: "POST",
                    body: JSON.stringify({ validationURL }),
                    headers: { "Content-Type": "application/json" }
                });
                const merchantSession = await response.json();
                session.completeMerchantValidation(merchantSession);
            };

            session.onpaymentauthorized = async (event) => {
                const tokenObject = event.payment.token;
                const paymentToken = JSON.stringify(tokenObject);

                this.onPaymentSuccess(
                    'paymentTokenApple',
                    paymentToken,
                    tokenObject.paymentMethod.displayName,
                    'applepay'
                );

                session.completePayment(ApplePaySession.STATUS_SUCCESS);
            };

            session.begin();
        });


        return true;
    }

    onPaymentSuccess(paymentType, paymentToken, cardNumber, cardType) {
        if (this.onSubmitHideElements) {
            $(this.onSubmitHideElements).hide();
        }

        $("#" + this.purchaseType + "credits_purchase_billing_paymentType").val(paymentType);
        $("#" + this.purchaseType + "credits_purchase_billing_" + paymentType).val(paymentToken);
        $("#" + this.purchaseType + "credits_purchase_billing_tokenCardNumber").val(cardNumber);
        $("#" + this.purchaseType + "credits_purchase_billing_tokenCardType").val(cardType);

        if (this.onSubmitClickElement) {
            $(this.onSubmitClickElement).click();
        }
    }
}