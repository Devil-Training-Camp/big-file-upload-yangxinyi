import SparkMD5 from 'spark-md5'

// 该文件为子线程代码
// 两种监听写法onmessage和addEventListener
// self.onmessage = (e:MessageEvent) => {
self.addEventListener('message', async(e: MessageEvent) => {
    const spark = new SparkMD5.ArrayBuffer();
    function readFileAsArrayBuffer(item:Blob):Promise<ArrayBuffer>{
        return new Promise((resolve) => {
            const fileReader = new FileReader()
            fileReader.readAsArrayBuffer(item)
            fileReader.onload = (event) => {
                // 将二进制文件数据交给spark-md5进行计算这块分片的hash
                resolve(event.target!.result as ArrayBuffer)
            }
        })
    }
    for(let i=0;i<e.data.length;i++){
        let res = await readFileAsArrayBuffer(e.data[i])
        spark.append(res)
    }
    // 计算最终hash，计算完成之后该spark实例将会销毁
    let hash = spark.end()
    console.log('前端hash:',hash)
    self.postMessage(hash)
})
// puzzle 如果不导出一个东西，就会报错在不是模块的情况下，使用import ‘Cannot use import statement outside a module’ 不知道有没有更好的处理办法
export const a = ''