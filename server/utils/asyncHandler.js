const asyncHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next);
    } catch (error) {
        const statusCode = error.statusCode || error.status || 500;
        res.status(statusCode).json({
            message: error.message || "Internal Server Error",
            success: false,
            errors: error.errors || []
        });
    }
};


export { asyncHandler }