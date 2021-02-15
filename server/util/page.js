module.exports.page = (req, res, next) => {
  console.log("called", req.query.sort);
  const limit = req.query.limit || null;
  const offset = (req.query.page - 1) * req.query.limit || 0;

  console.log(req.query.sort);
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
    return { searchOpt, limit, offset, order };
  }
  next();
};
