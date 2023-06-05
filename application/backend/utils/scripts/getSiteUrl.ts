require("dotenv").config();

export const getSiteUrl = () => {
    const protocol = process.env.PROTOCOL || "https";
    const host = process.env.HOST || "localhost";
    const port = process.env.PORT ? `:${process.env.PORT}` : "";

    return `${protocol}://${host}${port}`;
}