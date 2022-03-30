// variables
const url = "http://localhost:3000/api/task";
const taskForm = document.querySelector("#task-form");
const message = document.querySelector(".message");
const taskList = document.querySelector("#task-list");
const reminderList = document.querySelector("#reminder-list");
const taskCountDom = document.querySelector(".task-count");
const reminderCountDom = document.querySelector(".reminder-count");
const token = localStorage.getItem("taskToken");

// get tasks
getTask();

// onsubmit form
taskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const formElement = e.srcElement;

  if (formElement[0].value === "") {
    message.innerHTML = `
  <div class='alert alert-danger text-center'>Task Name is required</div>
  `;
    return;
  }

  message.innerHTML = ``;

  let userMessage = ``;

  if (formElement[1].value === "") {
    userMessage += `Description,`;
  }
  if (formElement[2].value === "") {
    userMessage += `EndDate,`;
  }
  if (formElement[3].checked === false) {
    userMessage += ` Reminder,`;
  }
  if (formElement[3].checked && formElement[2].value === "") {
    message.innerHTML = `<div class='alert alert-danger'>Task Reminder cannot be created without an end date</div>`;
    return;
  }
  const task = {
    name: formElement[0].value,
    description: formElement[1].value,
    endDate: formElement[2].value,
    reminder: formElement[3].checked,
    done: false,
  };

  if (userMessage !== "") {
    const con = confirm(`${userMessage} is not set \n Submit incomplete form?`);

    if (!con) return;

    createTask(task);
    return;
  }

  const abc = "submitted complete form";
  createTask(task);
});

// create task api request function
const createTask = async (newTask, formElement) => {
  // make api request
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authentication: token,
    },
    body: JSON.stringify(newTask),
  });

  const data = await response.json();
  // get response and make sure it is ok
  if (data.ok) {
    // clear success message after 1sec
    setTimeout(() => {
      message.innerHTML = "";
    }, 1000);
    // give an alert to user
    message.innerHTML = `<div class='alert alert-success'>Task Created</div>`;
    // clear form input values
    taskForm[0].value = "";
    taskForm[1].value = "";
    taskForm[2].value = "";
    taskForm[3].checked = false;
    getTask();
  }
};

// date formate function that get date string and returns the date
function dateformat(d) {
  let date = `${d}`;
  let dateArray = date.split("T");
  // console.log("dateArray", dateArray);
  return dateArray[0];
}

// get task from the database api call
async function getTask() {
  // get api responce
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authentication: token,
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();
  // validate responce
  if (!data.ok) {
    if (data.error === "invalid token") {
      document.querySelector("body").innerHTML = `
      
      <div class='w-100 bg-danger py-4 px-2 text-white mt-0'>Security Alert  </div>
      <div class='w-100 d-flex justify-content-center align-items-center' style='height: 400px'>
      <h1 class='text-danger text-center'> 
      this is an invalid login \n try logging in again <br> <button class="btn btn-danger logout mt-4" onclick="logout()">Logout</button>
      </h1>
      </div>


      `;
    }
    console.log("Token->", token);
    console.log(data);

    return;
  }

  // clear task list
  taskList.innerHTML = "";
  // clear reminder list
  reminderList.innerHTML = "";

  // get responce
  const tasks = data.data;

  // task array to keep task record so we can get the length
  let taskCount = [];
  let reminderCount = [];
  tasks.map((task) => {
    const { _id, name, description, done, date, endDate, reminder } = task;

    const htmlTemp = `
  <li class="d-flex w-100 justify-content-between" done='${done}' key=${_id}>
          <div class="name-div">

            <span class="max-btn d-flex justify-content-between">
              <b>${name}</b>
             ${
               reminder
                 ? ` <span class='task-date'>${dateformat(
                     date
                   )}<br> ${dateformat(endDate)}</span>`
                 : `<span class='task-date'>${dateformat(date)}</span>`
             }
              </span>
            <div class="description">${description}
            </div>
          </div>
          <div class="icon-div d-flex justify-content-between">

           ${
             done === false
               ? '<i class="px-2 fas fa-check task-check my-auto"></i>'
               : '<i class="px-2 fas fa-check-double task-check my-auto"></i>'
           }
            <i class="fas fa-trash px-2 my-auto task-trash"></i>
          </div>
        </li>`;
    if (reminder === true) {
      // push into the task-count array task that reminder is not set so we can count them
      reminderCount.push(reminder);
      reminderCount.length === 0
        ? (reminderList.innerHTML =
            "<div>No Reminder found Add new task and check the reminder box</div>")
        : "";
      reminderList.innerHTML += htmlTemp;
    }
    if (reminder === false) {
      // push into the task-count array task that reminder is not set so we can count them
      taskCount.push(reminder);
      taskCount.length === 0
        ? (taskList.innerHTML = "<div>No task found Add new task</div>")
        : "";
      taskList.innerHTML += htmlTemp;
    }
  });
  // get the length of the array to know the number of task that reminder is not set
  taskCountDom.innerHTML = taskCount.length;
  reminderCountDom.innerHTML = reminderCount.length;

  // get the icons after the task has been listed
  getIcons();
}

// get all the icons on the page
function getIcons() {
  const taskCheck = document.querySelectorAll(".task-check");
  const taskTrash = document.querySelectorAll(".task-trash");

  taskCheck.forEach((check) => {
    check.addEventListener("click", (e) => {
      const li = e.target.parentElement.parentElement;
      const key = li.getAttribute("key");
      const done = li.getAttribute("done");
      let newTask = "";
      done === "true"
        ? (newTask = { done: false })
        : (newTask = { done: true });

      checkTask(key, newTask);
    });
  });
  taskTrash.forEach((trash) => {
    trash.addEventListener("click", (e) => {
      const li = e.target.parentElement.parentElement;
      const key = li.getAttribute("key");
      trashTask(key);
    });
  });
}

// handel the delete operation
async function trashTask(id) {
  console.log(id);
  if (id === "") {
    return;
  }
  try {
    const response = await fetch(`${url}/${id}`, {
      method: "DELETE",
      header: {
        "Content-Type": "application/json",
        authentication: token,
      },
    });
    console.log(response);
    const data = await response.json();
    if (data.ok) {
      getTask();
    }
  } catch (error) {
    console.log(error);
  }
}

// toggle done
async function checkTask(id, newTask) {
  const response = await fetch(`${url}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      authentication: token,
    },
    body: JSON.stringify(newTask),
  });

  const data = await response.json();
  if (data.ok) {
    getTask();
  }
}

// logout user
function logout() {
  const confirmLogout = confirm("Logout??");
  if (!confirmLogout) {
    return;
  }
  localStorage.removeItem("taskToken");
  location.replace("/");
}

// get user name

const decode = JSON.parse(
  atob(localStorage.getItem("taskToken").split(".")[1])
);

document.querySelector(".uName").innerHTML = `${decode.uName}' Task`;
