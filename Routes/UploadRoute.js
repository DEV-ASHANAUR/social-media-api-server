import express from 'express';
import multer from 'multer';
const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "public/images");
    },
    filename: (req, file, cb) => {
      cb(null, req.body.name);
    },
  });
const upload = multer({ storage: storage });


router.post("/", upload.single("file"), (req, res,next) => {
    try {
      return res.status(200).json("File uploded successfully");
    } catch (error) {
      next(error);
    }
  });


export default router;