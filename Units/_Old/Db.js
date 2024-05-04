export class DB {
  static delete(dbName) {
    return new Promise((resolve, reject) => {
      let query = indexedDB.deleteDatabase(dbName);
      
      query.onerror = () => reject(query.error);
      query.onsuccess = () => resolve(query.result);
    });
  }
  
  
  
  open(dbName, version, dbInit) {
    return new Promise((resolve, reject) => {
      let query = indexedDB.open(dbName, version);
      
      query.onblocked = query.onerror = () => {
        console.log(query.error);
        
        reject(query.error)
      };
      
      query.onupgradeneeded = () => {
        console.log(query.result.version, 'onupgradeneeded');
        
        dbInit(query.result)
      };
      
      query.onsuccess = () => {
        console.log(query.result.version, 'onsuccess');
        
        this._db = query.result;
        
        resolve(this);
      };
    });
  }
  
  
  
  close() {
    this._db.close();
  }
  
  transaction(storeName, type) {
    type = type ? 'readwrite' : 'readonly';
    
    let transaction = this._db.transaction(storeName, type);
    
    transaction.__completed = new Promise((resolve, reject) => {
      transaction.onerror = (event) => reject(event.target.error);
      transaction.oncomplete = () => resolve();
    });
    
    return transaction;
  }
  
  transactionComplete(transaction) {
    return transaction.__completed;
  }
}

