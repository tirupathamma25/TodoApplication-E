const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const format = require("date-fns/format");
const isMatch = require("date-fns/isMatch");
const isValid = require("date-fns/isValid");

const databasePath = path.join(__dirname, "todoApplication.db");

const app = express();
app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => console.log("Server is Running"));
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const categoryAndPriorityQuery = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.priority !== undefined
  );
};

const searchQuery = (requestQuery) => {
  return requestQuery.search_q !== undefined;
};

const statusAndPriorityQuery = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const categoryAndStatusQuery = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.status !== undefined
  );
};

const statusQuery = (requestQuery) => {
  return requestQuery.status !== undefined;
};

const priorityQuery = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const categoryQuery = (requestQuery) => {
  return requestQuery.category !== undefined;
};

convertedData = (dbObject) => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    category: dbObject.category,
    priority: dbObject.priority,
    status: dbObject.status,
    dueDate: dbObject.due_date,
  };
};

//API 1

app.get("/todos/", async (request, response) => {
  const { status, priority, category, search_q = "" } = request.query;
  const data = null;
  const getTodoQuery = "";

  switch (true) {
    case statusQuery(request.query):
      if ((status === "TO DO" || status === "IN PROGRESS" || status = "DONE")) {
        getTodoQuery = `
              SELECT * FROM todo WHERE status = '${status}';`;

        data = await database.all(getTodoQuery);
        response.send(data.map((eachItem) => convertedData(eachItem)));
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }

      break;

    case priorityQuery(request.query):
      if ((priority === "HIGH" || priority === "MEDIUM" || priority = "LOW")) {
        getTodoQuery = `
              SELECT * FROM todo WHERE priority = '${priority}';`;

        data = await database.all(getTodoQuery);
        response.send(data.map((eachItem) => convertedData(eachItem)));
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }

      break;
    case categoryQuery(request.query):
      if (
        (category === "WORK" || category === "HOME" || category = "LEARNING")
      ) {
        getTodoQuery = `
              SELECT * FROM todo WHERE category = '${category}';`;

        data = await database.all(getTodoQuery);
        response.send(data.map((eachItem) => convertedData(eachItem)));
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }

      break;

    case searchQuery(request.query):
      getTodoQuery = `
              SELECT * FROM todo WHERE todo LIKE '%${search_q}%';`;

      data = await database.all(getTodoQuery);
      response.send(data.map((eachItem) => convertedData(eachItem)));

      break;

    case statusAndPriorityQuery(request.query):
      if ((priority === "HIGH" || priority === "MEDIUM" || priority = "LOW")) {
        if (
          (status === "TO DO" || status === "IN PROGRESS" || status = "DONE")
        ) {
          getTodoQuery = `SELECT * FROM todo WHERE  priority = '${priority}' AND status = '${status}';`;
          data = await database.all(getTodoQuery);
          response.send(data.map((eachItem) => convertedData(eachItem)));
        } else {
          response.status(400);
          response.send("Invalid Todo Status");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }

      break;

    case categoryAndStatusQuery(request.query):
      if (
        (category === "WORK" || category === "HOME" || category = "LEARNING")
      ) {
        if (
          (status === "TO DO" || status === "IN PROGRESS" || status = "DONE")
        ) {
          getTodoQuery = `SELECT * FROM todo WHERE  category = '${category}' AND priority = '${priority}';`;
          data = await database.all(getTodoQuery);
          response.send(data.map((eachItem) => convertedData(eachItem)));
        } else {
          response.status(400);
          response.send("Invalid Todo Priority");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }

      break;

    case categoryAndPriorityQuery(request.query):
      if (
        (category === "WORK" || category === "HOME" || category = "LEARNING")
      ) {
        if (
          (priority === "HIGH" || priority === "MEDIUM" || priority = "LOW")
        ) {
          getTodoQuery = `SELECT * FROM todo WHERE  category = '${category}' AND status = '${status}';`;
          data = await database.all(getTodoQuery);
          response.send(data.map((eachItem) => convertedData(eachItem)));
        } else {
          response.status(400);
          response.send("Invalid Todo Status");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }

      break;

    default:
      getTodoQuery = `SELECT * FROM todo`;
      data = await database.all(getTodoQuery);
      response.send(data.map((eachItem) => convertedData(eachItem)));
  }
});

//API 2

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `
    SELECT * FROM todo 
    WHERE id = ${todoId};`;
  const todo = await database.get(getTodoQuery);
  response.send(convertedData(todo));
});

// API 3

app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  if (isMatch(date, "yyyy-MM-dd")) {
    const newDate = format(new Date(date), "yyyy-MM-dd");
    const getAgendasQuery = `SELECT * FROM todo WHERE due_date = '${newDate}';`;
    const agendasArray = await database.all(getAgendasQuery);
    response.send(agendasArray.map((eachItem) => convertedData(eachItem)));
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

// API 4

app.post("/todos/", async (request, response) => {
  const { todoDetails } = request.body;
  const { id, todo, priority, status, category, dueDate } = todoDetails;
  if ((priority === "HIGH" || priority === "MEDIUM" || priority = "LOW")) {
    if ((status === "TO DO" || status === "IN PROGRESS" || status = "DONE")) {
      if (
        (category === "WORK" || category === "HOME" || category = "LEARNING")
      ) {
        if (isMatch(dueDate, "yyyy-MM-dd")) {
          const newDueDate = format(new Date(dueDate), "yyyy-MM-dd");
          const addTodoQuery = `INSERT INTO todo
                    (id,todo,priority, status, category, due_date)
                    VALUES 
                    (${id},'${todo}', '${priority}', '${status}', '${category}', ${newDueDate});`;
          const dbResponse = await database.run(addTodoQuery);
          response.send("Todo Successfully Added");
        } else {
          response.status(400);
          response.send("Invalid Due Date");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
    }
  }
});

//API 5

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let updateColumn = "";
  const requestBody = request.body;
  const previousTodoQuery = `SELECT  * FROM todo WHERE id = ${todoId};`;
  const previousTodo = await database.get(previousTodoQuery);

  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
    category = previousTodo.category,
    dueDate = previousTodo.dueDate,
  } = requestBody;
  let updateTodo;

  switch (true) {
    case requestBody.status !== undefined:
      if ((status === "TO DO" || status === "IN PROGRESS" || status = "DONE")) {
        updateTodo = `UPDATE todo 
           SET 
           todo = '${todo}'
           priority = '${priority}',
           status = '${status}',
           category = '${category}',
           due_date = '${dueDate}'
           WHERE id = ${todoId};`;
        await database.run(updateTodo);
        response.send("Status Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }

      break;
    case requestBody.priority !== undefined:
      if ((priority === "HIGH" || priority === "MEDIUM" || priority = "LOW")) {
        updateTodo = `UPDATE todo 
              SET 
              todo = '${todo}'
              priority = '${priority}',
              status = '${status}',
              category = '${category}',
              due_date = '${dueDate}'
             WHERE id = ${todoId};`;
        await database.run(updateTodo);
        response.send("Priority Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }

    case requestBody.category !== undefined:
      if (
        (category === "WORK" || category === "HOME" || category = "LEARNING")
      ) {
        updateTodo = `UPDATE todo 
              SET 
              todo = '${todo}'
              priority = '${priority}',
              status = '${status}',
              category = '${category}',
              due_date = '${dueDate}'
             WHERE id = ${todoId};`;
        await database.run(updateTodo);
        response.send("Category Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;

    case requestBody.dueDate !== undefined:
      if (isMatch(dueDate, "yyyy-MM-dd")) {
        const newDueDate = format(new Date(dueDate), "yyyy-MM-dd");
        updateTodo = `UPDATE todo 
              SET 
              todo = '${todo}'
              priority = '${priority}',
              status = '${status}',
              category = '${category}',
              due_date = '${dueDate}'
             WHERE id = ${todoId};`;
        await database.run(updateTodo);
        response.send("Due Date Updated");
      } else {
        response.status(400);
        response.send("Invalid Due Date");
      }
      break;
  }
});

// API 6

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteQuery = `
    DELETE FROM 
    todo
    WHERE id = ${todoId};`;
  await database.run(deleteQuery);
  response.send("Todo Deleted");
});

module.exports = app;
