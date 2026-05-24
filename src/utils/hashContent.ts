import crypto from "crypto"


export const normalizeContent=(content : string)=>{

    return content.toLowerCase().trim().replace(/\s+/g, " ");

}


export const generateContentHash=(content : string)=>{

    const normalizedContent=normalizeContent(content);

    return crypto.createHash("sha256").update(normalizedContent).digest("hex");
}