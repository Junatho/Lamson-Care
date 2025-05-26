/* sessionTimeout.js */

let sessionTimeoutDurationInSeconds = 900; // 15 minutes
let timeout;

function secondsToMilliseconds(seconds) {
    return seconds * 1000;
}

function startSessionTimer() {
    clearTimeout(timeout);
    timeout = setTimeout(handleSessionTimeout, secondsToMilliseconds(sessionTimeoutDurationInSeconds));
}

function handleSessionTimeout() {
    alert("Your session has expired due to inactivity. Please login again.");
    
    window.location.replace('LoginPage.html');
}

function resetTimerOnActivity() {
    startSessionTimer();
}

document.addEventListener('mousemove', resetTimerOnActivity);
document.addEventListener('keypress', resetTimerOnActivity);
document.addEventListener('click', resetTimerOnActivity);

window.onload = function() {
    startSessionTimer();
};
