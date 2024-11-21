let timerField;
let seconds = 0;
let totalSeconds = 0;
const timerElement = document.getElementById("timer");
const totalTimerElement = document.getElementById("total_timer");
const startButton = document.getElementById("startButton");
const taskNamesDatalist = document.getElementById("taskNames");

document.addEventListener("DOMContentLoaded", () => {
    const totalTimeString = totalTimerElement.textContent;
    totalSeconds = timeStringToSeconds(totalTimeString);
    updateTotalTime();
    populateDatalist();
});

function timeStringToSeconds(timeString) {
    const [hrs, mins, secs] = timeString.split(':').map(Number);
    return hrs * 3600 + mins * 60 + secs;
}

function populateDatalist() {
    const nameWorkAll = document.querySelectorAll('.nameWork');
    nameWorkAll.forEach(elem => {
        const option = document.createElement('option');
        option.value = elem.textContent;
        taskNamesDatalist.appendChild(option);
    });
}

function updateTotalTime() {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    totalTimerElement.textContent = `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

function startTimer() {
    timerField = setInterval(() => {
        seconds++;
        totalSeconds++;
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        timerElement.textContent = `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
        updateTotalTime();
    }, 1000);
}

function stopTimer() {
    clearInterval(timerField);
    totalSeconds += seconds;
    seconds = 0;
    timerElement.textContent = '00:00:00';
}

function formattedDate() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    return `${day}.${month}.${year}`;
}

startButton.addEventListener("click", () => {
    if (startButton.textContent === "Пуск") {
        startButton.textContent = "Стоп";
        startTimer();
    } else {
        const input = document.querySelector("#taskName");
        const timer = document.querySelector("#timer");
        const conteiner = document.querySelector(".task-list");
        const itemTemplate = document.querySelector("#template__task-item");
        const cloneTemplate = itemTemplate.content.cloneNode(true);
        const item = cloneTemplate.querySelector(".task-item");
        const nowDate = formattedDate();

        const name = item.querySelector(".nameWork");
        name.textContent = input.value;
        const date = item.querySelector(".date");
        date.textContent = nowDate;
        const time = item.querySelector(".time");
        time.textContent = timer.textContent;

        const nameWorkAll = document.querySelectorAll('.nameWork');
        let isExist = false;

        nameWorkAll.forEach(elem => {
            const existingItem = elem.closest('.task-item');
            const existingDate = existingItem.querySelector('.date').textContent;

            if (elem.textContent === input.value && existingDate === nowDate) {
                isExist = true;
                const time = existingItem.querySelector('.time');
                const timeString = time.textContent;
                const [hoursWork, minutesWork, secondsWork] = timeString.split(':').map(Number);
                const sec = (hoursWork * 3600) + (minutesWork * 60) + secondsWork;
                seconds += sec;
                const hrs = Math.floor(seconds / 3600);
                const mins = Math.floor((seconds % 3600) / 60);
                const secs = seconds % 60;
                time.textContent = `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
            }
        });
        const objInf = {
            name_of_work: `${input.value}`,
            time: `${time.textContent}`,
            date: `${date.textContent}`
        };

        if (!isExist) {
            const currentItems = document.querySelectorAll('.task-item');
            const perPage = 5;
            const currentPage = parseInt(new URLSearchParams(window.location.search).get('page')) || 1;

            conteiner.prepend(item);
        }

        fetch(`/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=utf-8",
            },
            body: JSON.stringify(objInf),
        });

        startButton.textContent = "Пуск";
        input.value = '';
        stopTimer();
    }
});

function deleteTable(idWork, event) {
    event.stopPropagation();
    if (confirm('Вы уверены, что хотите удалить эту запись?')) {
        fetch(`/delete/${idWork}`, {
            method: 'DELETE'
        }).then(response => {
            if (response.ok) {
                location.reload();
            } else {
                alert('Ошибка при удалении записей');
            }
        });
    }
}
