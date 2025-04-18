import mongoose from "mongoose";

import { Document, model, Schema } from "mongoose";

import { PortfolioCategory, PortfolioCategoryType } from "../types/portfolio";

const portfolioCategorySchema = new Schema<PortfolioCategory>({
    name: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: Object.values(PortfolioCategoryType),
        default: PortfolioCategoryType.MAIN,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    subcategoryFor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Categories",
        default: null,
    },
});

const PortfolioCategoryModel = model<PortfolioCategory>(
    "Categories",
    portfolioCategorySchema
);
export default PortfolioCategoryModel;
