const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const express = require("express");
const cors = require("cors");
const { request } = require("http");

const app = express();
app.use(express.json());
app.use(cors());

//создаем схему пользователя, убираем поле __v(версия документа)
const userSchema = new Schema(
    { name: String, age: String, image: String },
    { versionKey: false }
);
const User = mongoose.model("User", userSchema); //модель пользователя

//функция запуска сервера и БД
async function main() {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/lotrDB");
        app.listen(5000);
        console.log("Сервер запущен по адресу: http://localhost:5000");
    } catch (error) {
        return console.log(error);
    }
}
//получение всех пользователей
app.get("/api/users", async (request, response) => {
    try {
        const users = await User.find({});
        response.send(users);
    } catch (error) {
        console.log(error);
        response.sendStatus(500);
    }
});

//получение пользователя по id
app.get("/api/users/:id", async (request, response) => {
    try {
        const id = request.params.id;
        const user = await User.findById(id);
        if (user) response.send(user);
        else response.sendStatus(404);
    } catch (error) {
        console.log(error);
        response.sendStatus(500);
    }
});

//добавление пользователей
app.post("/api/users", async (request, response) => {
    if (!request.body) return response.sendStatus(400);

    const userName = request.body.name;
    const userAge = request.body.age;
    const userImage = request.body.image;

    const user = new User({
        name: userName,
        age: userAge,
        image: userImage,
    });
    try {
        //сохраняем пользователя в БД
        await user.save();
        response.send(user);
    } catch (error) {
        console.log(error);
        response.sendStatus(500);
    }
});

//изменение
app.put("/api/users", async (request, response) => {
    if (!request.body) return response.sendStatus(400);

    const id = request.body.id;
    const userName = request.body.name;
    const userAge = request.body.age;
    const userImage = request.body.image;

    const editedUser = { name: userName, age: userAge, image: userImage };
    try {
        const user = await User.findByIdAndUpdate({ _id: id }, editedUser, {
            returnDocument: "after",
        });
        if (user) response.send(user);
        else response.sendStatus(404);
    } catch (error) {
        console.log(error);
        response.sendStatus(500);
    }
});

//удаление
app.delete("/api/users/:id", async (request, response) => {
    try {
        const id = request.params.id;
        const user = await User.findByIdAndDelete(id);

        if (user) response.send(user);
        else response.sendStatus(404);
    } catch (error) {
        console.log(error);
        response.sendStatus(500);
    }
});

main(); //запуск сервера и БД
//прослушиваем закрытие сервера. действия в методе будут выполнены перед остановкой сервера
process.on("SIGINT", async () => {
    await mongoose.disconnect();
    console.log("Приложение завершило работу");
    process.exit();
});
