const userController = require("../controllers").user;
const eventController = require("../controllers").event;

const { verifyUser } = require("../middleware/verifyUser");

// const userRouter = require("./userRouter");
module.exports = (app) => {
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
  app.get("/api/event/getAllEvents", verifyUser, eventController.getAllEvents);
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
  app.delete("/api/event/:eventId", verifyUser, eventController.deleteEvent);
};
