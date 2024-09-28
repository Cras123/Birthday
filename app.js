require("dotenv").config(); // Load environment variables
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/Birthday_entities.js");
const path = require("path");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const multer = require("multer");
const fs = require("fs");

// MongoDB Connection URL
// const MONGO_URL = "mongodb://127.0.0.1:27017/Sampada";
const dbUrl = process.env.ATLASDB_URL;

main()
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}

// Multer Setup for Image Uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads"); // Save images in /public/uploads
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique file name
  },
});

const fileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
    return cb(new Error("Only image files are allowed!"), false);
  }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

// Express App Setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

// Log requests
app.use((req, res, next) => {
  console.log(`${req.method} request for '${req.url}'`);
  next();
});

// Routes
app.get("/", async (req, res) => {
  try {
    // Fetch featured or latest listings from the database, limit to 3 for the homepage
    const featuredListings = await Listing.find({}).limit(3);

    // Render the "home.ejs" view and pass the featured listings to the view
    res.render("listings/home.ejs", { featuredListings });
  } catch (error) {
    // If an error occurs during fetching or rendering, log it and send a 500 error response
    console.error("Error fetching listings for the home page:", error);
    res.status(500).send("An error occurred while loading the home page.");
  }
});

app.get("/listings", async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
});

app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

app.get("/listings/:id", async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/show.ejs", { listing });
});

app.post("/listings", upload.single("image"), async (req, res) => {
  try {
    const newListing = new Listing({
      title: req.body.listing.title,
      description: req.body.listing.description,
      money: req.body.listing.money,
      country: req.body.listing.country,
      contact_me: req.body.listing.contact_me,
      By: req.body.listing.By,
      image: {
        url: `/uploads/${req.file.filename}`, // Save the image URL (path to uploaded image)
        filename: req.file.filename,
      },
    });

    await newListing.save();
    res.redirect("/listings");
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while creating the listing.");
  }
});

app.get("/listings/:id/edit", async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", { listing });
});

app.put("/listings/:id", upload.single("image"), async (req, res) => {
  const { id } = req.params;

  try {
    const listing = await Listing.findById(id);
    if (!listing) {
      return res.status(404).send("Listing not found");
    }

    const updatedData = {
      title: req.body.listing.title,
      description: req.body.listing.description,
      money: req.body.listing.money,
      country: req.body.listing.country,
      contact_me: req.body.listing.contact_me,
      By: req.body.listing.By,
    };

    // Handle new image upload and remove the old image
    if (req.file) {
      // Remove the old image if it exists and isn't the default image
      if (
        listing &&
        listing.image &&
        listing.image.filename !== "default-image.jpg"
      ) {
        try {
          fs.unlinkSync(
            path.join(__dirname, "public/uploads", listing.image.filename)
          );
        } catch (error) {
          console.error(`Failed to delete image: ${error}`);
        }
      }

      updatedData.image = {
        url: `/uploads/${req.file.filename}`, // New image path
        filename: req.file.filename,
      };
    }

    const updatedListing = await Listing.findByIdAndUpdate(id, updatedData, {
      new: true,
    });

    res.redirect(`/listings/${updatedListing._id}`);
  } catch (err) {
    console.error("Error updating listing:", err);
    res.status(500).send("Server Error");
  }
});

app.delete("/listings/:id", async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findByIdAndDelete(id);

  if (
    listing &&
    listing.image &&
    listing.image.filename !== "default-image.jpg"
  ) {
    // Delete the image from the server when the listing is deleted
    fs.unlinkSync(
      path.join(__dirname, "public/uploads", listing.image.filename)
    );
  }

  res.redirect("/listings");
});

// Start the server
app.listen(2909, () => {
  console.log("Server is listening on port 2909");
});
