import { FileChunkData } from '../interface/index'
declare global {
    //  mozIndexedDB针对某些特定版本的 Firefox 浏览器的写法
    //  webkitIndexedDB针对早期的 WebKit 内核浏览器（用于 Safari 和早期版本的 Chrome 浏览器）的写法
    //  msIndexedDB针对Internet Explorer 10 和 11 中的写法
    interface Window {
        mozIndexedDB?: IDBFactory;
        webkitIndexedDB?: IDBFactory;
        msIndexedDB?: IDBFactory;
    }
}
/**
 * 打开数据库
 * @param {object} dbName 数据库的名字
 * @param {string} storeName 仓库名称
 * @param {string} version 数据库的版本
 * @return {object} 该函数会返回一个数据库实例
 */
function openDB(dbName: string,storeName:string,isClean:boolean=false): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        let indexedDB: IDBFactory | null = null;
        //  兼容浏览器
        if (typeof window !== 'undefined') {
            indexedDB =
                window.indexedDB ||
                window.mozIndexedDB ||
                window.webkitIndexedDB ||
                window.msIndexedDB;
        } else {
            return reject("not in browser");
        }
        let db: IDBDatabase;
        // 打开数据库，若没有则会创建(此时不知道版本号)
        const request = indexedDB.open(dbName);
        // 数据库打开成功回调
        request.onsuccess = function (event) {
            db = (event.target as any).result; // 数据库对象
            console.log("数据库打开成功");
            
            if (!db.objectStoreNames.contains(storeName)) {
                indexedDB.open(dbName,db.version+1)
                // createObjectStore(db,storeName)
            }else{
                resolve(db);
            }
            if (isClean){
                indexedDB.open(dbName,db.version+1)
            }
        };
        // 数据库打开失败的回调
        request.onerror = function (event) {
            console.log("数据库打开报错");
        };
        // 数据库有更新时候的回调
        request.onupgradeneeded = function (event) {
            // 数据库创建或升级的时候会触发
            console.log("onupgradeneeded");
            db = (event.target as any).result; // 数据库对象
            if (!db.objectStoreNames.contains(storeName)) {
                createObjectStore(db,storeName)
            }else{
                deleteStore(db,storeName)
            }
        };
    });
}
/**
 * 创建一个对象存储空间（仓库）
 * @param db 数据库实例
 * @param storeName 对象存储空间（仓库）
 * @param dataIndex 索引（暂时未实现）
 * @returns 
 */
function createObjectStore(db: IDBDatabase, storeName: string, dataIndex?: object) {
    let objectStore: IDBObjectStore;
    // 创建存储库
    objectStore = db.createObjectStore(storeName, {
        keyPath: "ID", // 这是主键
        autoIncrement: true // 实现自增
    });

    // todo 添加索引,后续完成
    // 创建索引，在后面查询数据的时候可以根据索引查
    if (dataIndex) {
        Object.getOwnPropertyNames(dataIndex).forEach(key => {
            objectStore.createIndex(key, key, { unique: false });
        })
    }
    return objectStore;
}
/**
 * 新增数据
 * @param {object} db 数据库实例
 * @param {string} storeName 仓库名称
 * @param {string} data 数据
 */
function addData(db: IDBDatabase , storeName: string, data: any) {
    let request = db
        .transaction([storeName], "readwrite") // 事务对象 指定表格名称和操作模式（"只读"或"读写"）
        .objectStore(storeName) // 仓库对象
        .add(data);

    request.onsuccess = function (event: Event) {
        console.log("数据写入成功");
    };

    request.onerror = function (event: Event) {
        console.log("数据写入失败");
    };
}
/**
 * 通过主键读取数据
 * @param {object} db 数据库实例
 * @param {string} storeName 仓库名称
 * @param {string} key 主键值
 */
function getDataByKey(db: IDBDatabase, storeName: string, key: number) {
    return new Promise((resolve, reject) => {
        var transaction = db.transaction([storeName]); // 事务
        var objectStore = transaction.objectStore(storeName); // 仓库对象
        var request = objectStore.get(key); // 通过主键获取数据

        request.onerror = function (event: Event) {
            console.log("事务失败");
        };

        request.onsuccess = function (event: Event) {
            console.log("主键查询结果: ", request.result);
            resolve(request.result);
        };
    });
}
function deleteStore(db: IDBDatabase, storeName: string):Promise<boolean> {
    return new Promise((resolve, reject) => {
        if (db.objectStoreNames.contains(storeName)) {
            db.deleteObjectStore(storeName);
            resolve(true);
        } else {
            reject(false);
        }
    })
}

export default {
    openDB,
    createObjectStore,
    addData,
    getDataByKey,
    deleteStore
}

