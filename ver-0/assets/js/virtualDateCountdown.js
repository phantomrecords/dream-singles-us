let timerButtons = document.querySelectorAll(".date-timer-button");
timerButtons.forEach(button => button.addEventListener("click", startDateCountdown));
function startDateCountdown() {
    const expirationDate = this.dataset.expire;
    const timer = document.querySelector('.countdown-timer');
    const render = (time) => { timer.innerHTML = `${time.hours} : ${time.minutes} : ${time.seconds}`; };
    const complete = () => { location.reload(); };
    const countdown = new CountdownTimer(expirationDate, render, complete);
}