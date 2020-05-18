function getDate() {
    const today = new Date();
    const currentDay = today.toDateString();
    const current = new Date(currentDay).getDay();
    let className = '';
    if (current === 6 || current === 7) {
        className = "danger"
    } else {
        className = "danger"
    }
    return {
        className: className,
        currentDay: currentDay
    }
}

module.exports = getDate;