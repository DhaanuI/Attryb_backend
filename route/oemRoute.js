const express = require("express");

const oemRoute = express.Router();
oemRoute.use(express.json());

const { OEM_Specs } = require("../model/oem_specsModel");


// get OEM specs of all else specific oem based on SEARCH
oemRoute.get("/", async (req, res) => {
    const { modelname, modelyear } = req.query
    try {
        if (modelname && modelyear) {

            const specs = await OEM_Specs.findOne({
                modelName: { $regex: new RegExp(modelname, "i") },
                modelYear: { $regex: new RegExp(modelyear, "i") }
            });
            res.status(200).send({ specs });
        }
        else {
            const data = await OEM_Specs.find();
            res.status(200).send(data);
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).send({ "Message": "error in getting all OEM data" });
    }
})

// Post OEM specs 
oemRoute.post("/add", async (req, res) => {
    const {
        modelName,
        modelYear,
        vehiclePrice,
        colors,
        mileage,
        power,
        maxSpeed,
        image } = req.body;
    try {
        const data = new OEM_Specs({
            modelName,
            modelYear,
            vehiclePrice,
            colors,
            mileage,
            power,
            maxSpeed,
            image
        })
        await data.save();
        res.status(201).send({ "message": "OEM info added Successfully" });
    }
    catch (err) {
        console.log(err);
        res.status(500)({ "ERROR": err });
    }
})

oemRoute.get('/oemmodels', async (req, res) => {
    try {
        // Group and count the OEM models
        const modelCounts = await OEM_Specs.aggregate([
            { $group: { _id: '$modelName', count: { $sum: 1 } } },
            { $project: { _id: 0, modelName: '$_id', count: 1 } },
        ]);

        res.json(modelCounts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



module.exports = {
    oemRoute
}