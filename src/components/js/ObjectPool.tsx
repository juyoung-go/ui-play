class ObjectPoolItem<T> {
  private item:T
  constructor(item:T){
    this.item = item
  }
  getItem(){
    return this.item
  }
  clear(){
    this.item = null
  }
}

class ObjectPool<T>{

  private factory:Function
  private idlePool:Array<ObjectPoolItem<T>>
  private usePool:Map<T, ObjectPoolItem<T>>

  constructor(){

    this.idlePool = []
    this.usePool = new Map()

  }

  setFactory(factory:Function){
    this.factory = factory
    return this
  }

  createPool(initCount:number = 10){

    for(let i = 0 ; i < initCount ; i++){
      this.idlePool.push(this.createPoolItem())
    }

    return this

  }

  getPoolItem():T{
    let item = this.idlePool.pop()
    if(!item){
      item = this.createPoolItem()
      console.log('new PoolItem added!!!');
    }
    this.usePool.set(item.getItem(), item)
    return item.getItem()
  }

  getPoolItems(getCount:number = 1):T[]{
    const returnList:T[] = []
    for(let i = 0 ; i < getCount ; i++){
      returnList.push(this.getPoolItem())
    }
    return returnList
  }
  
  releasePoolItem(item:T){
    let poolItem = this.usePool.get(item)
    if(poolItem){
      this.idlePool.push(poolItem)
      this.usePool.delete(item)
    }
  }

  releasePoolItems(...items:T[]){
    items.forEach((item)=>{
      this.releasePoolItem(item)
    })
  }

  destroy(){
    this.factory = null
    this.idlePool.forEach((item)=>{
      item.clear()
    })
    this.usePool.forEach((item)=>{
      item.clear()
    })
    this.idlePool.length = 0
    this.usePool.clear()
  }

  private createPoolItem(){
    if(!this.factory || !(this.factory instanceof Function)){
      throw new Error('setFactory 가 정상적으로 실행되지 않았습니다.')
    }
    return new ObjectPoolItem<T>(this.factory())
  }

}

export default ObjectPool