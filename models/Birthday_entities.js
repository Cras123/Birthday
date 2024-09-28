const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BirthdaySchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    filename: {
      type: String,
      default: "default-image.jpg",
    },
    url: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fGhvdGVsc3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
    },
  },
  money: Number,
  contact_me: String,
  country: String,
  By: String,
});

const Listing = mongoose.model("Listing", BirthdaySchema);

module.exports = Listing;
