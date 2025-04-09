export default {
    index: (req: any, res: any) => {
        console.log("123443w");
        res.status(200).json({
            message: "Welcome to the API 213",
        });
    },

    test: (req: any, res: any) => {
        res.status(200).json({
            message: "Test endpoint",
        });
    },
};
