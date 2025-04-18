import { Request, Response } from "express";
import ErrorResponse from "../classess/ErrorResponse";
import { ErrorCodes } from "../types/ErrorCodes";

import { Schema } from "mongoose";

import PortfolioCategoryModel from "../models/PortfolioCategory";
import PortfolioItemModel from "../models/PortfolioItem";
import { PortfolioCategory, PortfolioCategoryType } from "../types/portfolio";
import ApiResponse from "../classess/Response";

export default {
    index: (req: Request, res: Response) => {
        console.log("123443w");
        res.json({
            message: "Welcome to the API 213",
        });
    },

    getCategories: async (req: Request, res: Response) => {
        try {
            const categoryId = req.query.categoryId as string;
            const type = req.query.type as string;
            const structure = req.query.structure === "true";

            // 2. Przygotuj filtr wyszukiwania
            const filter: Record<string, any> = {};

            if (categoryId) {
                filter._id = categoryId;
            }

            if (type) {
                filter.type = type;
            }

            if (structure) {
                const structuredCategories = await getStructuredCategories(
                    filter
                );

                return new ApiResponse(200, "Structured Categories", {
                    categories: structuredCategories,
                }).send(res);
            } else {
                const categories = await PortfolioCategoryModel.find(filter)
                    .populate("subcategoryFor")
                    .lean();

                return new ApiResponse(200, "Categories", {
                    categories,
                }).send(res);
            }
        } catch (error: any) {
            console.error("Error getting categories:", error);
            return new ErrorResponse(500, "Internal server error", {
                code: ErrorCodes.INTERNAL_SERVER_ERROR,
                error: error.message,
            }).send(res);
        }
    },

    get_projects: async (req: Request, res: Response) => {
        const { categoryId, projectId } = req.query;

        try {
            const query = {
                ...(categoryId && { category: categoryId }),
                ...(projectId && { _id: projectId }),
            };

            const results = await PortfolioItemModel.find(query).lean();

            return new ApiResponse(200, "Projects", {
                projects: results,
            }).send(res);
        } catch (error: any) {
            console.error("Error getting projects:", error);
            return new ErrorResponse(500, "Internal server error", {
                code: ErrorCodes.INTERNAL_SERVER_ERROR,
                error: error.message,
            }).send(res);
        }
    },

    add_project: async (req: Request, res: Response) => {
        const {
            title,
            description,
            imageURL,
            isFeatured,
            url,
            category,
            state,
        } = req.body;

        if (!title || !description || !imageURL || !url || !category) {
            return new ErrorResponse(400, "Missing required fields", {
                code: ErrorCodes.MISSING_FIELDS,
                fields: [
                    !title && "title",
                    !description && "description",
                    !imageURL && "imageURL",
                    !url && "url",
                    !category && "category",
                ].filter(Boolean),
            }).send(res);
        }

        try {
            const newProject = new PortfolioItemModel({
                title,
                description,
                imageURL,
                isFeatured,
                url,
                category,
                state,
            });

            await newProject.save();
            return new ApiResponse(201, "Project created", newProject).send(
                res
            );
        } catch (error: any) {
            console.error("Error creating project:", error);
            return new ErrorResponse(500, "Internal server error", {
                code: ErrorCodes.INTERNAL_SERVER_ERROR,
                error: error.message,
            }).send(res);
        }
    },

    edit_project: async (req: Request, res: Response) => {
        const {
            id,
            title,
            description,
            imageURL,
            isFeatured,
            url,
            category,
            state,
        } = req.body;

        if (!title || !description || !imageURL || !url || !category) {
            return new ErrorResponse(400, "Missing required fields", {
                code: ErrorCodes.MISSING_FIELDS,
                fields: [
                    !title && "title",
                    !description && "description",
                    !imageURL && "imageURL",
                    !url && "url",
                    !category && "category",
                ].filter(Boolean),
            }).send(res);
        }

        try {
            const updatedProject = await PortfolioItemModel.findByIdAndUpdate(
                id,
                {
                    title,
                    description,
                    imageURL,
                    isFeatured,
                    url,
                    category,
                    state,
                },
                { new: true }
            );

            if (!updatedProject) {
                return new ErrorResponse(404, "Project not found", {
                    code: ErrorCodes.NOT_FOUND,
                }).send(res);
            }

            return new ApiResponse(200, "Project updated", updatedProject).send(
                res
            );
        } catch (error: any) {
            console.error("Error updating project:", error);
            return new ErrorResponse(500, "Internal server error", {
                code: ErrorCodes.INTERNAL_SERVER_ERROR,
                error: error.message,
            }).send(res);
        }
    },

    remove_project: (req: Request, res: Response) => {},

    add_category: async (req: Request, res: Response) => {
        const { name, type, subcategoryFor } = req.body;

        if (!name || !type) {
            return new ErrorResponse(400, "Name and type are required", {
                code: ErrorCodes.MISSING_FIELDS,
                fields: [!name && "name", !type && "type"],
            }).send(res);
        }

        if (
            type !== PortfolioCategoryType.MAIN &&
            type !== PortfolioCategoryType.SUB
        ) {
            return new ErrorResponse(400, "Invalid type", {
                code: ErrorCodes.MISSING_FIELDS,
                fields: ["type"],
            }).send(res);
        }

        if (type === PortfolioCategoryType.SUB && !subcategoryFor) {
            return new ErrorResponse(
                400,
                "Subcategory requires a parent category",
                {
                    code: ErrorCodes.MISSING_FIELDS,
                    fields: ["subcategoryFor"],
                }
            ).send(res);
        }

        try {
            const category = new PortfolioCategoryModel({
                name,
                type,
                subcategoryFor,
            });

            await category.save();

            return new ApiResponse(201, "Category created", category).send(res);
        } catch (error: any) {
            return new ErrorResponse(500, "Internal server error", {
                code: ErrorCodes.INTERNAL_SERVER_ERROR,
                error: error.message,
            }).send(res);
        }
    },

    remove_category: async (req: Request, res: Response) => {
        const { categoryId } = req.body;
        let deletedCategoryCount = 0;
        let deletedCategories: PortfolioCategory[] = [];

        if (!categoryId) {
            return new ErrorResponse(400, "Category ID is required", {
                code: ErrorCodes.MISSING_FIELDS,
                fields: ["categoryId"],
            }).send(res);
        }

        try {
            const deletedCategory =
                await PortfolioCategoryModel.findByIdAndDelete(categoryId);

            deletedCategoryCount++;

            if (!deletedCategory) {
                return new ErrorResponse(404, "Category not found", {
                    code: ErrorCodes.NOT_FOUND,
                }).send(res);
            }

            deletedCategories = [deletedCategory];
            const deletedSubcategoirs = await PortfolioCategoryModel.find({
                subcategoryFor: deletedCategory._id,
            });
            deletedCategoryCount += deletedSubcategoirs.length;
            deletedCategories = deletedCategories.concat(deletedSubcategoirs);
            await PortfolioCategoryModel.deleteMany({
                subcategoryFor: deletedCategory._id,
            });

            if (deletedCategoryCount > 0) {
                console.log(
                    `Deleted ${deletedCategoryCount} items from category ${deletedCategory._id}`
                );
            }
        } catch (e) {
            console.error(e);
            return new ErrorResponse(500, "Internal server error", {
                code: ErrorCodes.DATABASE_ERROR,
            }).send(res);
        }

        return new ApiResponse(200, "Category deleted", {
            categories: deletedCategories,
            deletedCount: deletedCategoryCount,
        }).send(res);
    },
};

async function getStructuredCategories(
    filter: Record<string, any> = {}
): Promise<any[]> {
    // 1. Pobierz wszystkie kategorie spełniające warunek filtru
    const allCategories = await PortfolioCategoryModel.find(filter)
        .populate("subcategoryFor")
        .lean();

    const mainCategories = allCategories.filter(
        (category) => category.type === PortfolioCategoryType.MAIN
    );

    const subcategories = allCategories.filter(
        (category) => category.type === PortfolioCategoryType.SUB
    );

    return mainCategories.map((mainCategory) => {
        const categorySubcategories: PortfolioCategory[] = subcategories.filter(
            (subcategory) => {
                if (!subcategory.subcategoryFor) return false;

                const parentId = extractParentId(subcategory.subcategoryFor);

                if (String(parentId) === String(mainCategory._id)) {
                    subcategory.subcategoryFor = undefined;
                    return true;
                }
                return;
            }
        );

        return {
            ...mainCategory,
            subcategories: categorySubcategories,
            totalItems: getTotalItems(mainCategory),
        };
    });
}

async function getTotalItems(category: PortfolioCategory): Promise<number> {
    let categoriesIds: string[] = [category._id];

    if (category.subcategories) {
        categoriesIds = categoriesIds.concat(
            category.subcategories.map((subcategory) => {
                if (typeof subcategory === "string") {
                    return new Schema.Types.ObjectId(subcategory);
                } else {
                    return subcategory._id;
                }
            }) as string[]
        );
    }
    return await PortfolioItemModel.countDocuments({
        category: {
            $in: categoriesIds,
        },
    });
}

function extractParentId(subcategoryFor: any): string | null {
    if (!subcategoryFor) return null;

    // Jeśli to string, zwróć go bezpośrednio
    if (typeof subcategoryFor === "string") {
        return subcategoryFor;
    }

    // Jeśli to obiekt z _id, zwróć _id
    if (subcategoryFor._id) {
        return subcategoryFor._id;
    }

    // W przeciwnym razie zwróć null
    return null;
}
