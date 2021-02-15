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
    // page,
    // paginatedResult(Event),
    eventController.getAllCreatedEvents
  );
  app.get(
    "/api/event/getAllEvents",
    verifyUser,
    // pagination,
    // page,
    // paginatedResult(Event),
    eventController.getAllEvents
  );
  app.put("/api/event/:eventId", verifyUser, eventController.inviteUser);
  app.get(
    "/api/event/invitedEvents",
    verifyUser,
    eventController.getInvitedEvents
  );
  app.get("/api/event/:eventId", verifyUser, eventController.eventDetail);
  app.put(
    "/api/event/:eventId/updateEvent",
    verifyUser,
    eventController.updateEventDetail
  );
};
