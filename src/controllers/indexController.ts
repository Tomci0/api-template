export default {
    index: (req: any, res: any) => {
        console.log("123");
        res.status(200).json({
            message: "Welcome to the API",
        });
    },
};
