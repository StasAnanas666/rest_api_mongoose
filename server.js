const express = require("express");
const MongoClient = require("mongodb").MongoClient; //класс для работы с БД
const objectId = require("mongodb").ObjectId; //класс для работы с идентификаторами документов
const cors = require("cors");

const app = express(); //экспресс-приложение
app.use(express.json()); //парсер для работы с json
app.use(cors()); //обход кросдоменных блокировок

const mongoClient = new MongoClient("mongodb://127.0.0.1:27017");

//iife-функция. открываем подключение к бд в начале работы сервера.
(async () => {
  try {
    await mongoClient.connect();
    app.locals.collection = mongoClient.db("lotrDB").collection("users"); //локальная переменная приложения с названием collection(название произвольное)
    app.listen(5000); //запускаем сервер, прослушиваем подключения
    console.log("Сервер запущен по адресу: http://localhost:5000");
  } catch (error) {
    return console.log(error);
  }
})();

// const collection = app.locals.collection;

//получение всех пользователей
app.get("/api/users", async (request, response) => {
  const collection = request.app.locals.collection;
  try {
    const users = await collection.find().toArray();
    response.send(users);
  } catch (error) {
    console.log(error);
    response.sendStatus(500);
  }
});

//получение пользователя по id
app.get("/api/users/:id", async (request, response) => {
  const collection = request.app.locals.collection;
  try {
    const id = new objectId(request.params.id);
    //находим пользователя по Id
    let user = await collection.findOne({ _id: id });
    //если нашли - отправляем клиенту
    if (user != null) {
      response.send(user);
    } else {
      response.sendStatus(404);
    }
  } catch (error) {
    console.log(error);
    response.sendStatus(500);
  }
});

//добавление пользователя
app.post("/api/users", async (request, response) => {
  const collection = request.app.locals.collection;
  if (!request.body) {
    return response.sendStatus(400);
  }

  const userName = request.body.name; //извлекаем данные из тела запроса
  const userAge = request.body.age;
  const userImage = request.body.image;

  let newUser = { name: userName, age: userAge, image: userImage }; //создаем нового пользователя на основе извлеченных данных
  try {
    await collection.insertOne(newUser);
    response.send(newUser);
  } catch (error) {
    console.log(error);
    response.sendStatus(500);
  }
});

//изменение пользователя
app.put("/api/users", async (request, response) => {
  const collection = request.app.locals.collection;
  if (!request.body) return response.sendStatus(400);

  const userName = request.body.name; //извлекаем данные из тела запроса
  const userAge = request.body.age;
  const userImage = request.body.image;

  try {
    const id = new objectId(request.body.id);
    const user = await collection.findOneAndUpdate(
      { _id: id },
      { $set: { name: userName, age: userAge, image: userImage } },
      { returnDocument: "after" }
    );

    if (user) response.send(user);
    else response.sendStatus(404);
  } catch (error) {
    console.log(error);
    response.sendStatus(500);
  }
});

//удаление пользователя
app.delete("/api/users/:id", async (request, response) => {
  const collection = request.app.locals.collection;
  try {
    const id = new objectId(request.params.id);
    const user = await collection.findOneAndDelete({ _id: id });

    if (user) response.send(user);
    else response.sendStatus(404);
  } catch (error) {
    console.log(error);
    response.sendStatus(500);
  }
});

//прослушиваем закрытие сервера. действия в методе будут выполнены перед остановкой сервера
process.on("SIGINT", async () => {
  await mongoClient.close();
  console.log("Приложение завершило работу");
  process.exit();
});
