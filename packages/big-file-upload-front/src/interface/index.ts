export interface FileChunk {
    id:number
    chunk:Blob
}
export interface FileInfo {
    hash:string
    name?:string
}
export interface FileNameObj {
    newName:string
    oldName:string
}
export interface FileChunkData {
    id:number
    [key:string]:any
}