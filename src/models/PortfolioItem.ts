import mongoose from "mongoose";

import { Document, model, Schema } from "mongoose";

import { Portfolio, PortfolioState } from "../types/portfolio";

const portfolioItemSchema = new Schema<Portfolio>({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    imageURL: {
        type: String,
        required: true,
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
    state: {
        type: String,
        enum: Object.values(PortfolioState),
        default: PortfolioState.DRAFT,
    },
    url: {
        type: String,
        required: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Categories",
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const PortfolioItemModel = model<Portfolio>("Items", portfolioItemSchema);
export default PortfolioItemModel;
