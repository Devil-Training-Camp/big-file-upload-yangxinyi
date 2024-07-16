const fs = require("fs");
const crypto = require("crypto");
const path = require("path");

export const calculateHash = (fileName:string) => {
    return new Promise((resolve, reject) => {
        const uploadUrl = path.resolve(__dirname, "../../public/upload")
        const filePath = path.join(uploadUrl,fileName);
        if (!fs.existsSync(filePath)) {
            resolve('');
            return
        }
        const algorithm = 'md5'; // 选择哈希算法
        const localHash = crypto.createHash(algorithm);
        const fileStream = fs.createReadStream(path.join(filePath,fileName));
        fileStream.on("data", (data:Buffer|string) => {
            localHash.update(data);
        });
        fileStream.on("end", () => {
            // hash.digest 此方法用于获取计算出的哈希摘要
            const fileHash = localHash.digest("hex");
            resolve(fileHash)
        });
    });
    
};
