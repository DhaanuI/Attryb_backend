const mongoose = require("mongoose")

const oemSchema = mongoose.Schema({
    modelName: { type: String, required: true },
    modelYear: { type: String, required: true },
    vehiclePrice: { type: String, required: true },
    colors: { type: [String], required: true },
    mileage: { type: Number, required: true },
    power: { type: Number, required: true },
    maxSpeed: { type: Number, required: true },
    image: { type: String, required: true }
})

const OEM_Specs = mongoose.model("oem", oemSchema)

module.exports = {
    OEM_Specs
}