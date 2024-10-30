const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const { Readable } = require("stream");
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

async function imageUploadUtil(fileBuffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "auto" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    // Use the buffer directly with a Readable stream
    const readableStream = new Readable();
    readableStream._read = () => {}; // _read is required
    readableStream.push(fileBuffer);
    readableStream.push(null);
    readableStream.pipe(stream);
  });
}

module.exports = { upload, imageUploadUtil };
