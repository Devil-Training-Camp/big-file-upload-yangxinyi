export interface FileChunk {
    chunk:Blob;
    id:number
}
export interface isFileExistRes {
    isExist:boolean;
    fileName?:string;
}