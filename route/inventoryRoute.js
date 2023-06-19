const express = require("express");

const inventoryRoute = express.Router();
inventoryRoute.use(express.json());

require("dotenv").config();

const { Marketplace_Inventory } = require("../model/inventoryModel");
const { OEM_Specs } = require("../model/oem_specsModel");

const { authenticate } = require("../middleware/authentication.middleware");


// get all the inventory
inventoryRoute.get("/", async (req, res) => {
    const { sort, filterByColor } = req.query;

    try {
        let query = Marketplace_Inventory.find().populate('oemId userID');

        if (sort) {
            if (sort === 'price_desc') {
                query = query.sort({ price: -1 });
            } else if (sort === 'price_asc') {
                query = query.sort({ price: 1 });
            } else if (sort === 'mileage_desc') {
                query = query.sort({ mileage: -1 });
            } else if (sort === 'mileage_asc') {
                query = query.sort({ mileage: 1 });
            }
        }

        if (filterByColor) {
            query = query.find({ color: filterByColor });
        }

        const data = await query.exec();
        res.status(200).send(data);
    } catch (err) {
        console.log(err);
        res.status(500).send({ "Message": "Error in getting all Second Hand Cars" });
    }
});

inventoryRoute.get("/:id", async (req, res) => {
    const id = req.params.id
    try {
        const data = await Marketplace_Inventory.find({ _id: id }).populate('oemId userID');
        res.status(200).send(data);

    } catch (err) {
        console.log(err);
        res.status(500).send({ "Message": "Error in getting all Second Hand Cars" });
    }
});


// authentication is applied for posting / updating and deleting a data
inventoryRoute.use(authenticate)

// get specific inventory added by specific user
inventoryRoute.get("getuser", async (req, res) => {
    const ID = req.body.userID;
    try {
        const data = await Marketplace_Inventory.find({ userID: ID }).populate('oemId userID');
        res.status(200).send(data);
    }
    catch (err) {
        console.log(err);
        res.status(500).send({ "Message": "error in getting all Second Hand Cars" });
    }
})




// post a car details in inventory
inventoryRoute.post("/add", async (req, res) => {
    const {
        kilometer,
        majorScratches,
        originalPaint,
        numOfAccidents,
        numOfprevBuyers,
        registrationPlace,
        image,
        price,
        title,
        mileage,
        description,
        userID } = req.body;
    try {
        const data = new Marketplace_Inventory({
            kilometer,
            majorScratches,
            originalPaint,
            numOfAccidents,
            numOfprevBuyers,
            registrationPlace,
            image,
            price,
            title,
            mileage,
            description,
            userID
        })
        await data.save();
        res.status(201).send({ "message": "Car info added Successfully" });
    }
    catch (err) {
        console.log(err);
        res.status(500)({ "ERROR": err });
    }
})

// update a car details in inventory
inventoryRoute.patch("/update/:id", async (req, res) => {
    const ID = req.params.id;
    const payload = req.body;
    const data = await Marketplace_Inventory.findOne({ _id: ID });
    const userid_in_req = payload.userID;
    const userid_in_doc = data.userID.toString();

    try {
        if (userid_in_req !== userid_in_doc) {
            res.status(401).send({ "message": "Oops, You're NOT Authorized" });
        }
        else {
            await Marketplace_Inventory.findByIdAndUpdate({ _id: ID }, payload)
            res.send({ "Message": "Info modified in Database" })
        }
    }
    catch (err) {
        console.log(err)
        res.status(404).send( "Error" )
    }
})


// delete a car details in inventory
inventoryRoute.delete("/delete/:id", async (req, res) => {
    const ID = req.params.id;
    const data = await Marketplace_Inventory.findOne({ _id: ID });
    const userid_in_req = req.body.userID;

    const userid_in_doc = data.userID.toString();
    try {
        if (userid_in_req !== userid_in_doc) {
            res.status(401).send({ "message": "Oops, You're NOT Authorized" });
        }
        else {
            await Marketplace_Inventory.findByIdAndDelete({ _id: ID })
            res.send({ "Message": "Particular data has been deleted" })
        }
    }
    catch (err) {
        console.log(err)
        res.status(500).send({ "Error": err })
    }
})


// deleting multiple cars - unique one
inventoryRoute.delete("/delete", async (req, res) => {
    const { itemIds } = req.body;
    try {
        await Marketplace_Inventory.deleteMany({ _id: { $in: itemIds } });
        res.status(200).send("Items deleted successfully");
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred while deleting items");
    }
})


module.exports = {
    inventoryRoute
}