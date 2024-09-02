export interface FileChunk {
    chunk:Blob
    id:number
}
export interface FileInfo {
    hash:string
    name?:string
}