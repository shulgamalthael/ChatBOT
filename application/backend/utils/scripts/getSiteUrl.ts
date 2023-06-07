export const getSiteUrl = () => {
    require("dotenv").config();
    const protocol = process.env.PROTOCOL || "https";
    const host = process.env.HOST || "localhost";
    const port = process.env.PORT ? `:${process.env.PORT}` : "";

    console.log(`${protocol}://${host}${port}`);

    return `${protocol}://${host}${port}`;
}