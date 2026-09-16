const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/screen', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'screen.html'));
});

app.get('/pult', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

const questions = [
  {
    title: "1. Носки у кровати: преступление или элемент декора?",
    image: "/1.jpg",
    options: [
      "Это однозначно объявление войны",
      "Они уже нечистые, но ещё и не грязные!",
      "Что дальше — склад одежды на диване???",
      "Две пары ещё нормально, пять — уже перебор..."
    ]
  },
  {
    title: "2. Одежда на диване? (Одежда везде, но только не в шкафу)",
    image: "/2.jpg",
    options: [
      "Решение уровня городского инженера, оптимизирующее процессы",
      "Добавить стул как второй склад: «на работу» и «до мусорки»",
      "Вешать сразу в шкаф (типичное поведение маньяка-психопата)",
      "«Убери, я так не раскидываю!» (манипуляция ради места)"
    ]
  },
  {
    title: "3. Если она явно была не права, кто должен извиниться первым?",
    image: "/3.jpg",
    options: [
      "Конечно же, он!",
      "Виноват тот, кто довёл до этой ошибки",
      "Потушить пожар бензином и объяснить ей, в чём она не права",
      "А давайте вспомним, сколько раз он вообще был не прав?"
    ]
  },
  {
    title: "4. «Сериальная измена» (втайне посмотрел три серии вперёд)",
    image: "/4.jpg",
    options: [
      "Подать заявление на развод",
      "«Ого, убийца — садовник?!» (притвориться, что не видел)",
      "«Ну мы так никогда его не досмотрим!» (жалкое оправдание)",
      "«А помнишь фильм, что хотели глянуть? Концовка дно» (месть)"
    ]
  },
  {
    title: "5. Пароли от телефонов",
    image: "/5.jpg",
    options: [
      "Знаем пароли друг друга лучше, чем номера телефонов",
      "Личные! Доверие строится на уважении к перепискам...",
      "Пусть попробует найти: на важном у меня пароль, хе-хе...",
      "Мой телефон — мой храм"
    ]
  },
  {
    title: "6. Настал её судный день: у него температура 36,9!",
    image: "/6.jpg",
    options: [
      "Вызвать нотариуса для завещания и попрощаться",
      "Вам не понять: у вас высокий болевой порог и нет души!",
      "Вернуть его маме, пока гарантийный срок ещё не вышел",
      "Пожалеть и позаботиться, слава богу, 36,9, а не 37,1"
    ]
  },
  {
    title: "7. «Сфоткаешь меня?» (Как в здоровых отношениях?)",
    image: "/7.jpg",
    options: [
      "400 одинаковых кадров, крики: «Ты совсем не стараешься!»",
      "«Почему ты сам не предлагаешь меня сфотографировать?»",
      "Это обязанность, включённая в брачный договор",
      "Ракурс, экспозиция, x2, x5, фильтры — чтобы хоть одно вышло"
    ]
  },
  {
    title: "8. Обещал помыть посуду вечером, но утром она всё ещё в раковине...",
    image: "/8.jpg",
    options: [
      "Мужик сказал — сделает! Не надо каждые полгода напоминать",
      "Она помоет сама — и считай, подписал сделку с дьяволом...",
      "Всё продумано: накопится с завтрака и помоется за раз. Или завтра :)"
    ]
  },
  {
    title: "9. «Я уже крашу ресницы, буду готова через 5 минут!»",
    image: "/9.jpg",
    options: [
      "5 женских минут — это философская концепция. Расслабься",
      "Повод посмотреть тайм футбола, помыть машину и поспать",
      "Начать делать своё и самому стать причиной задержки"
    ]
  },
  {
    title: "10. Выбор фильма на вечер: романтика или проверка брака на прочность?",
    image: "/10.jpg",
    options: [
      "Выбирать фильм 1:40, чтобы уснуть на 4-й минуте титров",
      "«Выбирай ты, мне всё равно!» — и критиковать каждый вариант",
      "Сдаться и включить «Властелин колец», смотрели всего 6 раз",
      "Он смотрит документалку, она — реалити-шоу в наушниках"
    ]
  },
  {
    title: "11. Он ушёл в туалет с телефоном, шла 44-я минута...",
    image: "/11.jpg",
    options: [
      "Это крепость одиночества, где его никто не трогает",
      "Эксперимент: рекорд по длительности онемения ног",
      "Уберите телефон — и время сократится десятикратно!",
      "Кто вообще придумал время, часы, секунды?"
    ]
  }
];

let currentIndex = 0;
let votes = {};
let resetCounter = {};

function initVotesFor(index) {
  if (index >= questions.length) return;
  if (!votes[index]) {
    votes[index] = {};
    questions[index].options.forEach((_, optIdx) => {
      votes[index][optIdx] = 0;
    });
    resetCounter[index] = 0;
  }
}
initVotesFor(currentIndex);

function getPayload() {
  const isFinished = (currentIndex === questions.length);

  if (isFinished) {
    let totalAllVotes = 0;
    const summary = questions.map((q, qIdx) => {
      const qVotes = votes[qIdx] || {};
      const totalQVotes = Object.values(qVotes).reduce((a, b) => a + b, 0);
      totalAllVotes += totalQVotes;

      let winnerIdx = 0;
      let maxVotes = -1;
      q.options.forEach((opt, oIdx) => {
        const c = qVotes[oIdx] || 0;
        if (c > maxVotes) {
          maxVotes = c;
          winnerIdx = oIdx;
        }
      });

      const letters = ['А', 'Б', 'В', 'Г'];
      const percent = totalQVotes > 0 ? Math.round((maxVotes / totalQVotes) * 100) : 0;

      return {
        questionNumber: qIdx + 1,
        questionTitle: q.title,
        winnerLetter: letters[winnerIdx],
        winnerOption: q.options[winnerIdx],
        percent: percent,
        votes: maxVotes
      };
    });

    return {
      isFinished: true,
      total: questions.length,
      summary: summary,
      totalAllVotes: totalAllVotes
    };
  }

  initVotesFor(currentIndex);
  return {
    isFinished: false,
    index: currentIndex,
    total: questions.length,
    question: questions[currentIndex],
    votes: votes[currentIndex],
    voteId: `${currentIndex}_${resetCounter[currentIndex] || 0}`
  };
}

io.on('connection', (socket) => {
  socket.emit('state-update', getPayload());

  socket.on('cast-vote', (optIndex) => {
    if (currentIndex >= questions.length) return;
    initVotesFor(currentIndex);
    if (votes[currentIndex][optIndex] !== undefined) {
      votes[currentIndex][optIndex]++;
      io.emit('votes-update', votes[currentIndex]);
    }
  });

  socket.on('admin-next', () => {
    if (currentIndex <= questions.length - 1) {
      currentIndex++;
      io.emit('state-update', getPayload());
    }
  });

  socket.on('admin-prev', () => {
    if (currentIndex > 0) {
      currentIndex--;
      io.emit('state-update', getPayload());
    }
  });

  socket.on('admin-reset', () => {
    if (currentIndex >= questions.length) return;
    initVotesFor(currentIndex);
    questions[currentIndex].options.forEach((_, optIdx) => {
      votes[currentIndex][optIdx] = 0;
    });
    resetCounter[currentIndex] = (resetCounter[currentIndex] || 0) + 1;
    io.emit('votes-update', votes[currentIndex]);
    io.emit('state-update', getPayload());
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
