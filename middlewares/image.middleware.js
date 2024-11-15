const path = require('path');
const multer = require('multer');

const maxSize = 1 * 5000 * 5000;

const fileMatch = [
    "image/png", 
    "image/jpg", 
    "image/jpeg", 
    "application/pdf", 
    "application/msword", 
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", 
    "text/csv", 
    "application/vnd.ms-excel", 
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ];

var storage = multer.diskStorage({
    
    destination: (req, file, callback) => {
        let uploadPath = './uploads/files/';
        if(file.fieldname === 'product_image') 
            uploadPath = './uploads/products/';
        if(file.fieldname === 'e_bill' || file.fieldname === 'e_way_bill') 
            uploadPath = './uploads/bills/';

        if (fileMatch.indexOf(file.mimetype) >= 0)
            callback(null, path.join(uploadPath));
    },

    filename: (req, file, callback) => {
        if (fileMatch.indexOf(file.mimetype) === -1) {
            return callback("Invalid file format", null);
        }
        var filename = `${Date.now()}-${file.originalname}`;
        callback(null, filename);
    }
});

let uploadFiles = multer({
    storage: storage,
    limits: { fileSize: maxSize}
});
module.exports = uploadFiles;