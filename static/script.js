let timerField;
let seconds = 0;
const timerElement = document.getElementById("timer");
const startButton = document.getElementById("startButton");
const taskNamesDatalist = document.getElementById("taskNames");

// Функция для добавления названий дел в datalist
function populateDatalist() {
    const nameWorkAll = document.querySelectorAll('.nameWork');
    nameWorkAll.forEach(elem => {
        const option = document.createElement('option');
        option.value = elem.textContent;
        taskNamesDatalist.appendChild(option);
    });
}

function startTimer() {
    timerField = setInterval(() => {
        seconds++;
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        timerElement.textContent = `${hrs.toString().padStart(2, "0")}:${mins
            .toString()
            .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }, 1000);
}

function stopTimer() {
    clearInterval(timerField);
    seconds = 0;
    timerElement.textContent = '00:00:00';
}

function formattedDate() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    return `${year}-${month}-${day}`;
}

startButton.addEventListener("click", () => {
    if (startButton.textContent === "Пуск") {
        startButton.textContent = "Стоп";
        startTimer();
    } else {
        const input = document.querySelector("#taskName");
        const timer = document.querySelector("#timer");
        const conteiner = document.querySelector(".container");
        const itemTemplate = document.querySelector("#template__task-item");
        const cloneTemplate = itemTemplate.content.cloneNode(true);
        const item = cloneTemplate.querySelector(".task-item");

        const name = item.querySelector(".nameWork");
        name.textContent = input.value;
        const date = item.querySelector(".date");
        date.textContent = formattedDate();
        const time = item.querySelector(".time");
        time.textContent = timer.textContent;

        const nameWorkAll = document.querySelectorAll('.nameWork');
        const isExist = Array.from(nameWorkAll).some(elem => {
            if (elem.textContent === input.value) {
                const item = elem.closest('.task-item');
                const time = item.querySelector('.time');
                const timeString = time.textContent;
                const [hoursWork, minutesWork, secondsWork] = timeString.split(':').map(Number);
                const sec = (hoursWork * 3600) + (minutesWork * 60) + secondsWork;
                seconds += sec;
                const hrs = Math.floor(seconds / 3600);
                const mins = Math.floor((seconds % 3600) / 60);
                const secs = seconds % 60;
                time.textContent = `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
                return true;
            }
        });

        const objInf = {
            name_of_work: `${input.value}`,
            time: `${time.textContent}`,
            date: `${date.textContent}`
        };

        if (!isExist) conteiner.append(item);

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

// Заполнение datalist при загрузке страницы

document.addEventListener("DOMContentLoaded", populateDatalist);

function deleteTable(idWork, event) {
event.stopPropagation(); // Остановить всплытие события
if (confirm('Вы уверены, что хотите удалить эту запись?')) {
    fetch(`/delete/${idWork}`, {
        method: 'DELETE'
    }).then(response => {
        if (response.ok) {
//            alert('Записи удалены');
            location.reload(); // Перезагрузить страницу
        } else {
            alert('Ошибка при удалении записей');
        }
    });
}
}
