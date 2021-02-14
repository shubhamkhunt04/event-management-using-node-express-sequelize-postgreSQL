const userController = require("../controllers").user;
const eventController = require("../controllers").event;

const { verifyUser } = require("../middleware/verifyUser");

module.exports = (app) => {
  app.get("/api", (req, res) =>
    res.status(200).send({
      message: "Welcome to the Todos API!",
    })
  );
  // User Routes
  app.post("/api/register", userController.register);
  app.post("/api/login", userController.login);
  app.put("/api/updatepassword", verifyUser, userController.updatepassword);
  app.post("/api/resetpassword", userController.resetpassword);
  app.put("/api/changepassword/:token", userController.changePassword);

  // Event Routes
  app.post("/api/event/createEvent", verifyUser, eventController.createEvent);
  app.get(
    "/api/event/getAllCreatedEvents",
    verifyUser,
    eventController.getAllCreatedEvents
  );
  app.put("/api/event/:eventId", verifyUser, eventController.inviteUser);
  app.get(
    "/api/event/invitedEvents",
    verifyUser,
    eventController.getInvitedEvents
  );
  app.get("/api/event/:eventId", verifyUser, eventController.eventDetail);

  // app.post("/api/login", userController.login);
  // app.get("/api/todos", todosController.list);
  // app.get("/api/todos/:todoId", todosController.retrieve);
  // app.put("/api/todos/:todoId", todosController.update);
  // app.delete("/api/todos/:todoId", todosController.destroy);

  // app.post("/api/todos/:todoId/items", todoItemsController.create);
  // app.put("/api/todos/:todoId/items/:todoItemId", todoItemsController.update);
  // app.delete(
  //   "/api/todos/:todoId/items/:todoItemId",
  //   todoItemsController.destroy
  // );

  // app.all("/api/todos/:todoId/items", (req, res) =>
  //   res.status(405).send({
  //     message: "Method Not Allowed",
  //   })
  // );
};
