
import axios from "axios";

export const generateAIReview = async (prompt: string) => {
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is missing in .env");
    }

    const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
            contents: [
                {
                    role: "user",
                    parts: [
                        {
                            text: prompt,
                        },
                    ],
                },
            ],
        }
    );

    const text =
        response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
        throw new Error("AI did not return valid text");
    }

    return text;
};