const multer  = require('multer');

let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        //think and write
      cb(null, './public/files');
    },
    filename: (req, file, cb) => {
      console.log(file);
      var filetype = '';
      if(file.mimetype === 'image/gif') {
        filetype = 'gif';
      }
      if(file.mimetype === 'image/png') {
        filetype = 'png';
      }
      if(file.mimetype === 'image/jpeg') {
        filetype = 'jpg';
      }
      if(file.mimetype === "text/html"){
        filetype = 'html';
      }

      cb(null, 'file-' + Date.now() + '.'+ filetype);
    }
});


let upload = multer({storage: storage});

module.exports = upload;