const express = require("express");
const User = require("../models").User;
const Event = require("../models").Event;
const Guest = require("../models").Guest;
const {
  validateEventInput,
  validateInviteInput,
} = require("../util/validators/eventValidator");
const { pagination } = require("../util/pagination");

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
    // http://localhost:5000/api/event/getAllCreatedEvents?sort=eventName:asc
    try {
      const { id } = req.decoded;
      // const {limit,sort,search,page} = req.query
      // const limit = req.query.limit || null;
      // const offset = (req.query.page - 1) * req.query.limit || 0;
      const user = await User.findByPk(id);
      // const { limits, offset, order, searchOpt } = pagination(
      //   req.query.page,
      //   req.query.limit,
      //   req.query.sort,
      //   req.query.search
      // );
      const { limit, offset, order, searchOpt } = pagination(req);

      // let str, order;
      // if (req.query.sort) {
      //   str = req.query.sort.split(":");
      //   str[1] = str[1].toUpperCase();
      //   order = [str];
      // } else {
      //   order = [];
      // }
      // let searchOpt = {};
      // if (req.query.search) {
      //   let searchQuery = req.query.search.split(":");
      //   searchOpt[searchQuery[0]] = { [Op.like]: "%" + searchQuery[1] + "%" };
      // }
      return res.json({
        payload: await user.getEvents({
          where: searchOpt,
          limit,
          offset,
          order,
        }),
        message: "User Events",
      });
    } catch (error) {
      console.log(error);
      res.json({ message: "Something went wrong" });
    }
  },

  // async getAllCreatedEvents(req, res) {
  //   // http://localhost:5000/api/event/getAllCreatedEvents?sort=eventName:asc
  //   try {
  //     const { id } = req.decoded;
  //     const limit = req.query.limit || null;
  //     const offset = (req.query.page - 1) * req.query.limit || 0;
  //     const user = await User.findByPk(id);
  //     //   const userEvents = await Event.findAll({
  //     //     where: {
  //     //       userId: id,
  //     //     },
  //     //   });
  //     let str, order;
  //     if (req.query.sort) {
  //       str = req.query.sort.split(":");
  //       str[1] = str[1].toUpperCase();
  //       order = [str];
  //     } else {
  //       order = [];
  //     }
  //     let searchOpt = {};
  //     if (req.query.search) {
  //       let searchQuery = req.query.search.split(":");
  //       searchOpt[searchQuery[0]] = { [Op.like]: "%" + searchQuery[1] + "%" };
  //     }
  //     return res.json({
  //       payload: await user.getEvents({
  //         where: searchOpt,
  //         limit,
  //         offset,
  //         order: order,
  //       }),
  //       message: "User Events",
  //     });
  //   } catch (error) {
  //     console.log(error);
  //     res.json({ message: "Something went wrong" });
  //   }
  // },

  async getAllEvents(req, res) {
    const { limit, offset, order, searchOpt } = pagination(req);
    console.log("limit", limit, offset, order, searchOpt);
    const events = await Event.findAll({
      where: searchOpt,
      limit,
      offset,
      order,
    });
    res.json({ message: "All Events List", payload: events });
  },

  async inviteUser(req, res) {
    const { id } = req.decoded;
    const { email } = req.body;
    const { isValid, error } = await validateInviteInput(email);
    if (isValid) {
      try {
        const user = await User.findOne({ where: { email } });
        const event = await Event.findByPk(req.params.eventId);
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
        // other user not allow to invite in event
        if (id !== event.userId) {
          return res.json({ message: "You are not allow to invite users" });
        }
        const userAlreadyInvited = await Guest.findAll({
          where: {
            invitedUserEmail: email,
            eventId: req.params.eventId,
          },
        });

        if (!userAlreadyInvited.length) {
          const guest = await Guest.create({
            eventId: req.params.eventId,
            userId: user.id,
            invitedUserEmail: email,
          });
          return res.json({
            payload: guest,
            message: "Invited Successfully",
          });
        }
        res.json({ message: "You have already invited" });
      } catch (error) {
        console.log(error);
        res.json({ message: "Something went wrong" });
      }
    } else {
      return res.json({ message: error.details.map((e) => e.message) });
    }
  },

  async getInvitedEvents(req, res) {
    try {
      const { id } = req.decoded;
      const user = await User.findByPk(id);
      if (user) {
        const guest = await Guest.findAll({
          where: {
            userId: id,
          },
          include: Event,
        });
        return res.json({
          message: "List of Invited Events",
          payload: guest.map(({ dataValues }) => {
            return dataValues;
          }),
        });
      } else {
        res.json({ message: "User not found" });
      }
    } catch (error) {
      console.log(error);
      return res.json({ message: "Something went wrong" });
    }
  },

  async eventDetail(req, res) {
    try {
      const event = await Event.findByPk(req.params.eventId, { include: User });
      if (!event) return res.json({ message: "Event not found" });

      res.json({ message: "Event details", payload: event });
    } catch (error) {
      console.log(error);
      return res.json({ message: "Something went wrong" });
    }
  },

  async updateEventDetail(req, res) {
    const { eventName, time, description } = req.body;
    const { isValid, error } = await validateEventInput(
      eventName,
      time,
      description
    );
    if (isValid) {
      try {
        const { id } = req.decoded;
        // const guest = await Guest.findAll({
        //   where: {
        //     eventId: req.params.eventId,
        //     userId: id,
        //   },
        // });
        const event = await Event.findByPk(req.params.eventId);
        // If req id and params id match ,so user is valid
        if (event.userId === id) {
          await event.update({
            eventName,
            description,
            time,
          });
          res.json({ message: "Event updated successfully", payload: event });
        } else {
          res.json({
            message:
              "Only event creators are allow to update the event details",
          });
        }
      } catch (error) {
        console.log(error);
        return res.json({ message: "Something went wrong" });
      }
    } else {
      return res.json({ message: error.details.map((e) => e.message) });
    }
  },
};
