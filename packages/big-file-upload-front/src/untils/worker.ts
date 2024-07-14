import sparkMd5 from 'spark-md5'

// 该文件为子线程代码
// 两种监听写法onmessage和addEventListener
// self.onmessage = (e:MessageEvent) => {
self.addEventListener('message', (e: MessageEvent) => {
    const spark = new sparkMd5()
    const fileReader = new FileReader()
    fileReader.readAsArrayBuffer(e.data.blob as Blob)
    fileReader.onload = (event) => {
        const { result } = event.target as FileReader
        // 将二进制文件数据交给spark-md5进行计算这块分片的hash
        spark.append(result as string)
        // 如果是最后一个分片，则将计算结果返回给主线程
        
        if(e.data.hasDone){
            // 计算最终hash，计算完成之后该spark实例将会销毁
            let hash = spark.end()
            self.postMessage(hash)
        }
    }
})
// puzzle 如果不导出一个东西，就会报错在不是模块的情况下，使用import ‘Cannot use import statement outside a module’ 不知道有没有更好的处理办法
export const a = ''