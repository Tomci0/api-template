import { Document } from "mongoose";

export interface PortfolioCategory extends Document {
    _id: string;
    name: string;
    type: PortfolioCategoryType;
    createdAt: Date;
    subcategoryFor?: PortfolioCategory | string;
    subcategories?: PortfolioCategory[] | string[];
}

export enum PortfolioCategoryType {
    MAIN = "main",
    SUB = "sub",
}

export interface Portfolio extends Document {
    _id: string;

    title: string;
    description: string;
    imageURL: string;

    isFeatured: boolean;

    state: PortfolioState;

    url: string;

    createdAt: Date;

    category: PortfolioCategory | string;
}

export enum PortfolioState {
    PUBLISHED = "published",
    DRAFT = "draft",
    ARCHIVED = "archived",
    DELETED = "deleted",
}
