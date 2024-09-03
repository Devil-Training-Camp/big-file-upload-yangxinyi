
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { isFileExistRes } from '../interface/index';

export const checkFileHash = async (uploadFileHash: string): Promise<isFileExistRes> => {
    const dirPath = path.resolve(__dirname, "../../public/upload");
    const allFilesPathArr = getAllFiles(dirPath)
    for (let i = 0; i < allFilesPathArr.length; i++) {
        const fileHash = await calculateHash(allFilesPathArr[i])
        if (uploadFileHash === fileHash) {
            const baseName = path.basename(allFilesPathArr[i])
            return {
                isExist: true,
                fileName: baseName,
            }
        }
    }
    return {
        isExist: false
    }
};

export const calculateHash = (filePath: string) => {
    return new Promise((resolve, reject) => {
        const algorithm = 'md5'; // 选择哈希算法
        const localHash = crypto.createHash(algorithm);
        const fileStream = fs.createReadStream(filePath);
        fileStream.on("data", (data: Buffer | string) => {
            localHash.update(data);
        });
        fileStream.on("end", () => {
            // hash.digest 此方法用于获取计算出的哈希摘要
            const fileHash = localHash.digest("hex");
            resolve(fileHash)
        });
    });

}

// 定义一个函数用于递归获取指定目录下的所有文件
export const getAllFiles = (dirPath: string) => {
    // 设置一个空数组，用于存储所有文件路径
    let arrayOfFiles: string[] = [];
    // 使用fs.readdirSync同步读取指定路径下的所有文件名
    const files = fs.readdirSync(dirPath);
    if (files.length) {
        // 遍历读取到的文件名
        files.forEach((file) => {
            // 对于每个文件，检查是否为目录
            if (fs.statSync(dirPath + "/" + file).isDirectory()) {
                // 如果是目录，则递归调用getAllFiles函数继续获取该目录下的所有文件
                arrayOfFiles = getAllFiles(dirPath + "/" + file);
            } else {
                // 如果不是目录，则将文件路径加入到文件数组中
                // 使用path.join来正确地拼接路径，以适应不同的操作系统
                arrayOfFiles.push(path.join(dirPath, "/", file));
            }
        });
    }
    // 返回包含所有文件路径的数组
    return arrayOfFiles;
}