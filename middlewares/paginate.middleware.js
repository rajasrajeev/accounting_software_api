const { createPaginator } = require('prisma-pagination');

const pagination = (req, res, next) => {
  req.paginate = createPaginator({ page: req.query.page, perPage: 8 });

  next();
}

module.exports = { pagination }