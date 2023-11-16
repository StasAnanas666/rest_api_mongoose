var api_url = "http://localhost:5000/api/users";

//создание строки таблицы
function row(user) {
  const tr = document.createElement("tr"); //новая строка дл пользователя
  tr.style.verticalAlign = "middle"; //вертикальное выравнивание строки таблицы
  tr.setAttribute("data-rowid", user._id); //атрибут, из которого можно извлечь id пользователя

  //ячейка id
  const idTd = document.createElement("td");
  idTd.append(user._id); //контент ячейки
  tr.append(idTd); //добалвяем ячейку в строку

  //ячейка изображения
  const imageTd = document.createElement("td");
  const userImage = document.createElement("img");
  userImage.setAttribute("src", `images/${user.image}`);
  userImage.setAttribute("alt", user.name);
  userImage.style.width = "100px";
  imageTd.append(userImage);
  tr.append(imageTd);

  //ячейка имени
  const nameTd = document.createElement("td");
  nameTd.append(user.name);
  tr.append(nameTd);

  //ячейка возраста
  const ageTd = document.createElement("td");
  ageTd.append(user.age);
  tr.append(ageTd);

  //ячйка с кнопками действий
  const btnTd = document.createElement("td");

  const editBtn = document.createElement("button");
  editBtn.setAttribute("data-id", user._id);
  editBtn.classList.add("btn", "btn-warning", "me-5");
  editBtn.append("Изменить"); //контент кнопки
  //слушатель клика для получения пользователя по id
  editBtn.addEventListener("click", (e) => {
    e.preventDefault();
    GetUser(user._id);
  });
  btnTd.append(editBtn);

  const removeBtn = document.createElement("button");
  removeBtn.setAttribute("data-id", user._id);
  removeBtn.classList.add("btn", "btn-danger", "ms-5");
  removeBtn.append("Удалить");
  removeBtn.addEventListener("click", (e) => {
    e.preventDefault();
    DeleteUser(user._id);
  });
  btnTd.append(removeBtn);

  tr.append(btnTd);

  return tr;
}
//получение всех пользователей
async function GetUsers() {
  const response = await fetch(api_url, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  //если запрос прошел успешно
  if (response.ok === true) {
    //извлекаем данные с пользователями из ответа
    const users = await response.json();
    let rows = document.querySelector("tbody");
    users.forEach((user) => rows.append(row(user))); //для каждого пользователя создаем строку с данными о нем
  }
}

//получение пользователя по id при нажатии на кнопку Изменить
async function GetUser(id) {
  const response = await fetch(`${api_url}/${id}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  if (response.ok === true) {
    const user = await response.json();
    const form = document.forms["userForm"];
    form.elements["id"].value = user._id;
    form.elements["name"].value = user.name;
    form.elements["age"].value = user.age;
  }
}

//добавление пользователя
async function CreateUser(userName, userAge, userImage) {
  const response = await fetch(api_url, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      name: userName,
      age: parseInt(userAge),
      image: userImage,
    }),
  });

  if (response.ok === true) {
    const user = await response.json();
    document.querySelector("tbody").append(row(user));
    resetForm();
  }
}

//сброс формы
function resetForm() {
  const form = document.forms["userForm"];
  form.reset();
  form.elements["id"].value = 0;
}
//обработчик для кнопки сброса формы
document.querySelector("#resetBtn").addEventListener("click", (e) => {
  e.preventDefault();
  resetForm();
});
//обработчик отправки данных формы на сервер
document.forms["userForm"].addEventListener("submit", (e) => {
  e.preventDefault();
  const form = document.forms["userForm"];
  const id = form.elements["id"].value;
  const name = form.elements["name"].value;
  const age = form.elements["age"].value;
  const image = form.elements["image"].files[0].name;
  //id в скрытом поле не меняется при добавлении пользователя
  if (id == 0) {
    CreateUser(name, age, image);
  }
  //при изменении мы получаем данные пользователя для изменения и записываем их в форму, значение в поле id заполняется данными изменяемого объекта
  else {
    EditUser(id, name, age, image);
  }
});

//изменение пользователя
async function EditUser(userId, userName, userAge, userImage) {
  const response = await fetch(api_url, {
    method: "PUT",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      id: userId,
      name: userName,
      age: parseInt(userAge),
      image: userImage,
    }),
  });

  if (response.ok === true) {
    const user = await response.json();
    //находим строку по id пользователя, заменяем на строку с новыми данными
    document
      .querySelector(`tr[data-rowid="${user._id}"]`)
      .replaceWith(row(user));
    resetForm();
  }
}

//удаление пользователя
async function DeleteUser(id) {
  const response = await fetch(`${api_url}/${id}`, {
    method: "DELETE",
    headers: { Accept: "application/json" },
  });

  if (response.ok === true) {
    const user = await response.json();
    //удаляем строку по id пользователя
    document.querySelector(`tr[data-rowid="${user._id}"]`).remove();
  }
}

GetUsers();
