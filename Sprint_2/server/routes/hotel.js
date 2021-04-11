import express from "express";
import formidable from "express-formidable";

const router = express.Router();

// middleware
import { requireSignin,hotelOwner } from "../middlewares";
// controllers
import { create, hotels, image, sellerHotels, remove, read, update,userHotelBookings,searchListings } from "../controllers/hotel";
//import { create } from "../controllers/hotel";
//formidable is to handle form data.
router.post("/create-hotel", requireSignin, formidable(), create);
router.get("/hotels", hotels);
router.get("/hotel/image/:hotelId",image);
router.get('/seller-hotels',requireSignin, sellerHotels);
router.delete("/delete-hotel/:hotelId", requireSignin, hotelOwner, remove);
router.get("/hotel/:hotelId", read);
router.put(
    "/update-hotel/:hotelId",
    requireSignin,
    hotelOwner,
    formidable(),
    update
  );
  

router.get("/user-hotel-bookings", requireSignin, userHotelBookings); 
router.post("/search-listings", searchListings);
module.exports = router;
