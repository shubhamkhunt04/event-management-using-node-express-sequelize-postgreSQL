const express = require("express");
const User = require("../models").User;
const Event = require("../models").Event;
const Guest = require("../models").Guest;
const { verifyUser } = require("../middleware/verifyUser");
const {
  validateEventInput,
  validateInviteInput,
} = require("../util/validators/eventValidator");
const { paginatedResult } = require("../middleware/pagination");

module.exports = {
  async createEvent(req, res) {
    let { eventName, time, description } = req.body;
    console.log(eventName, time, description);
    const { isValid, error } = await validateEventInput(
      eventName,
      time,
      description
    );
    if (isValid) {
      const { id } = req.decoded;
      try {
        const user = await User.findByPk(id);
        // const event = await Event.create({
        //   eventName,
        //   time,
        //   description,
        //   createdBy: user.username,
        //   userId: user.id,
        // });
        const event = await user.createEvent({
          eventName,
          time,
          description,
          createdBy: user.username,
          userId: user.id,
        });

        return res.json({
          payload: event,
          message: "Event created successfully",
        });
      } catch (error) {
        console.log(error);
        return res.json({ message: "Something went wrong !" });
      }
    } else {
      return res.json({ message: error.details.map((e) => e.message) });
    }
  },

  async getAllCreatedEvents(req, res) {
    try {
      const { id } = req.decoded;
      const user = await User.findByPk(id);
      //   const userEvents = await Event.findAll({
      //     where: {
      //       userId: id,
      //     },
      //   });
      return res.json({
        payload: await user.getEvents(),
        message: "User Events",
      });
    } catch (error) {
      res.json({ message: "Something went wrong" });
    }
  },

  async inviteUser(req, res) {
    try {
      const { id } = req.decoded;
      console.log(id, req.params.eventId);
      const user = await User.findByPk(id);
      const event = await Event.findByPk(req.params.eventId);
      console.log(user);
      // const guest = await user.createGuest({
      //   eventId: req.params.eventId,
      //   userId: id,
      // });
      if (!event) {
        return res.json({ message: "Event not found" });
      }
      if (!user) {
        return res.json({
          message:
            "Please enter email who is registered user on event management",
        });
      }

      console.log("DAta ", await user.getEvents());

      const guest = await Guest.create({
        eventId: req.params.eventId,
        userId: id,
      });
      console.log(guest);
      //   const userEvents = await Event.findAll({
      //     where: {
      //       userId: id,
      //     },
      //   });
      return res.json({
        payload: await user.getEvents(),
        message: "User Events",
      });
    } catch (error) {
      console.log(error);
      res.json({ message: "Something went wrong" });
    }
  },
};
