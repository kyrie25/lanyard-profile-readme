import imageToBase64 from "image-to-base64";

export const encodeBase64 = async (url: string): Promise<string> => {
    let response = "",
        isURL = false;

    try {
        new URL(url);
        isURL = true;
    } catch (e) {
        isURL = false;
    }

    if (isURL) {
        try {
            new URL(url);
            response = await imageToBase64(url);
        } catch (e) {
            console.log(e);
        }
    } else {
        // Convert string to base64
        const buffer = Buffer.from(url, "binary");
        response = buffer.toString("base64");
    }

    return response;
};
