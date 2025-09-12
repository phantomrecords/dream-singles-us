class CountdownTimer {
    constructor(expiredDate, renderTimer, countdownComplete)
    {
        if(expiredDate instanceof Date) {
            this.setTimeRemaining(expiredDate);
        } else if (typeof expiredDate === 'string'){
            let timeParts = expiredDate.split(' ');
            let dateParts = timeParts[0].split('-');
            let clockParts = timeParts[1].split(':');
            let formatedDate = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]), parseInt(clockParts[0]) + 2, parseInt(clockParts[1]), parseInt(clockParts[0]));
            this.setTimeRemaining(formatedDate);
        }
        this.renderTimer = renderTimer;
        this.countdownComplete = countdownComplete;
    }

    setTimeRemaining(expired)
    {
        const currentTime = new Date().getTime();
        this.timeRemaining = expired.getTime() - currentTime;
        if (this.timeRemaining > 0) {
           this.start();
        } else {
            this.complete();
        }
    }

    format(t)
    {
        return t < 10 ? '0' + t : t;
    }

    getRemainingTime()
    {
        return {
            days: this.format(Math.floor(this.timeRemaining / 1000 / 60 / 60 / 24)),
            hours: this.format(Math.floor(this.timeRemaining / 1000 / 60 / 60) % 24),
            minutes: this.format(Math.floor(this.timeRemaining / 1000 / 60) % 60),
            seconds: this.format(Math.floor(this.timeRemaining / 1000) % 60)
        }
    }

    update()
    {
        if(typeof this.renderTimer === 'function') {
            this.renderTimer(this.getRemainingTime());
        }
    }
    complete()
    {
        if(typeof this.countdownComplete === 'function')
        {
            this.countdownComplete();
        }
    }

    start()
    {
        // Get a reference to the last interval + 1
        const interval_id = window.setInterval(function(){}, Number.MAX_SAFE_INTEGER);

        // Clear any timeout/interval up to that id
        for (let i = 1; i < interval_id; i++) {
            window.clearInterval(i);
        }
        this.update();
        const interval = setInterval(() => {
            this.timeRemaining -= 1000;
            if(this.timeRemaining < 0) {
                this.complete();
                clearInterval(interval);
            } else {
                this.update();
            }
        }, 1000);
    }
}