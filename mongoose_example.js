const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//схема описания пользователя
const userScheme = new Schema({
    name: {
        type: String,
        default: "NoName",
        required: true,
        minlength: 3,
        maxlength: 20,
    },
    age: {
        type: Number,
        min: 1,
        max: 999999,
    },
    image: String,
    race: {
        name: String,
        bonus: {
            type: [String],
            default: ["stealth +15", "stamina +10", "magic -10", "strength -5"],
        },
    },
},
{versionKey: false}
);

//модель пользователя
const User = mongoose.model("User", userScheme);
//объект модели
const user = new User({
    name: "Torin",
    age: 125,
    image: "Torin.jpg",
});

const user1 = new User();
const user2 = new User({ name: "Fili" });
const user3 = new User({
    name: "Kili",
    age: 45,
    image: "Kili.png",
    race: {
        name: "Dwarf",
        bonus: ["stealth +5", "stamina +15", "magic -10", "strength +15"],
    },
});

async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/lotrDB");

    await user.save(); //сохраняет объект в бд
    console.log("Объект сохранен", user);

    await mongoose.disconnect();
}

main().catch(console.log);
