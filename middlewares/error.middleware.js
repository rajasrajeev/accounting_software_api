
const errorLogger = (error, request, response, next) => {
    console.log(error);
    next(error);
}


const errorResponder = (error, request, response, next) => {
    response.header("Content-Type", 'application/json');
    const status = error.status || 500;
    
    if (status !== 500)
        response.status(status).send({"message": error.message});
    else
        response.status(status).send({"message": "Internal server error!"});
}
  

const invalidPathHandler = (request, response, next) => {
    response.status(404)
    response.send({"message":`Not Found - ${request.originalUrl}`});
}


module.exports = {
    errorLogger,
    errorResponder,
    invalidPathHandler
};