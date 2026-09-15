const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

// Топ-8 вопросов
const questions = [
    {
        title: "1. Носки у кровати: преступление или элемент декора?",
        options: [
            "Это однозначно объявление войны",
            "Они уже нечистые, но еще и не грязные!",
            "Что дальше, склад одежды на диване???",
            "2 пары еще нормально, 5 — уже перебор..."
        ]
    },
    {
        title: "2. Настал её судный день: у него температура 36,9!",
        options: [
            "Вызвать нотариуса для завещания и попрощаться",
            "Вам не понять: у вас высокий болевой порог и нет души!",
            "Вернуть его маме, пока гарантийный срок не вышел",
            "Пожалеть и позаботиться, слава богу 36,9, а не 37,1"
        ]
    },
    {
        title: "3. «Сфоткаешь меня?» (Как в здоровых отношениях?)",
        options: [
            "400 одинаковых кадров, крики: «Ты совсем не стараешься!»",
            "«Почему ты сам не предлагаешь меня сфотографировать?»",
            "Это обязанность, включенная в брачный договор",
            "Ракурс, экспозиция, x2, x5, фильтры — чтобы хоть одно вышло"
        ]
    },
    {
        title: "4. Если она явно была не права, кто должен извиниться?",
        options: [
            "Конечно же он!",
            "Виноват тот, кто довел до этой ошибки",
            "Потушить пожар бензином и объяснить, в чем она не права",
            "А давайте вспомним, сколько раз он был не прав"
        ]
    },
    {
        title: "5. «Я уже крашу ресницы, буду готова через 5 минут!»",
        options: [
            "5 женских минут — это философская концепция. Расслабься",
            "Повод посмотреть тайм футбола, помыть машину и поспать",
            "Начать делать свое и самому стать причиной задержки"
        ]
    },
    {
        title: "6. Он ушёл в туалет с телефоном, шла 44-я минута...",
        options: [
            "Это крепость одиночества, где его никто не трогает",
            "Эксперимент: рекорд по длительности онемения ног",
            "Уберите телефон — время сократится десятикратно!",
            "Кто вообще придумал время, часы, секунды?"
        ]
    },
    {
        title: "7. «Сериальная измена» (посмотрел 3 серии вперед)",
        options: [
            "Подать заявление на развод",
            "«Ого, убийца — садовник?!» (притвориться, что не видел)",
            "«Ну мы так никогда его не досмотрим!»",
            "«А помнишь фильм, что хотели глянуть? Концовка дно» (Месть)"
        ]
    },
    {
        title: "8. Легли в кровать... и тут: «А мы закрыли входную дверь?»",
        options: [
            "Включить талант Ди Каприо: натурально спать и сопеть",
            "Рассказать страшилку, чтобы второй пошел проверять",
            "Сыграть в рулетку и уснуть с незакрытой дверью",
            "Ну хоть бы уже кто-то заглянул"
        ]
    }
];

let currentIndex = 0;
// Хранилище голосов: { 0: { 0: count, 1: count, ... } }
let votes = {};

function initVotesFor(index) {
    if (!votes[index]) {
        votes[index] = {};
        questions[index].options.forEach((_, optIdx) => {
            votes[index][optIdx] = 0;
        });
    }
}
initVotesFor(currentIndex);

function getPayload() {
    initVotesFor(currentIndex);
    return {
        index: currentIndex,
        total: questions.length,
        question: questions[currentIndex],
        votes: votes[currentIndex]
    };
}

io.on('connection', (socket) => {
    // Отправляем текущее состояние новому подключению
    socket.emit('state-update', getPayload());

    // Гость проголосовал
    socket.on('cast-vote', (optIndex) => {
        initVotesFor(currentIndex);
        if (votes[currentIndex][optIndex] !== undefined) {
            votes[currentIndex][optIndex]++;
            io.emit('votes-update', votes[currentIndex]);
        }
    });

    // Админ переключил вопрос
    socket.on('admin-next', () => {
        if (currentIndex < questions.length - 1) {
            currentIndex++;
            initVotesFor(currentIndex);
            io.emit('state-update', getPayload());
        }
    });

    socket.on('admin-prev', () => {
        if (currentIndex > 0) {
            currentIndex--;
            initVotesFor(currentIndex);
            io.emit('state-update', getPayload());
        }
    });

    socket.on('admin-reset', () => {
        votes[currentIndex] = {};
        questions[currentIndex].options.forEach((_, optIdx) => {
            votes[currentIndex][optIdx] = 0;
        });
        io.emit('votes-update', votes[currentIndex]);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Сервер запущен: http://localhost:${PORT}`);
});