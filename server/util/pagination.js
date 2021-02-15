const { Op } = require("sequelize");
// http://localhost:5000/api/event/getAllEvents?limit=4&page=1&search=eventName:Node for testing
module.exports.pagination = (req) => {
  //   console.log("\n\ncalled", sort, page, limit, search);
  console.log(req.query.page);
  const limit = parseInt(req.query.limit) || null;
  const offset =
    (parseInt(req.query.page) - 1) * parseInt(req.query.limit) || 0;
  console.log(req.query);
  let str, order;
  if (req.query.sort) {
    str = req.query.sort.split(":");
    str[1] = str[1].toUpperCase();
    order = [str];
  } else {
    order = [];
  }
  let searchOpt = {};
  if (req.query.search) {
    let searchQuery = req.query.search.split(":");
    searchOpt[searchQuery[0]] = { [Op.like]: "%" + searchQuery[1] + "%" };
  }
  return { searchOpt, limit, offset, order };
};
// module.exports.pagination = (
//   page = 0,
//   limit = null,
//   sort = null,
//   search = null
// ) => {
//   console.log("\n\ncalled", sort, page, limit, search);
//   const limits = limit || null;
//   const offset = (page - 1) * limit || 0;

//   console.log(sort);
//   var str, order;
//   if (sort) {
//     str = sort.split(":");
//     str[1] = str[1].toUpperCase();
//     order = [str];
//   } else {
//     order = [];
//   }
//   var searchOpt = {};
//   if (search) {
//     let searchQuery = search.split(":");
//     searchOpt[searchQuery[0]] = { [Op.like]: "%" + searchQuery[1] + "%" };
//   }
//   return { searchOpt, limits, offset, order };
// };
