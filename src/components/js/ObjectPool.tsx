class ObjectPoolItem<T> {
  private time:number = new Date().getTime()
  private item:T
  constructor(item:T){
    this.item = item
  }
  getItem(){
    return this.item
  }
  touchItem(){
    this.time = new Date().getTime()
  }
  isLive(ttl:number){
    return new Date().getTime() - this.time > ttl
  }
}

class ObjectPool<T>{

  private factory:Function|null = null
  private clearFunction:Function|null = null
  private idlePool:Array<ObjectPoolItem<T>>
  private usePool:Map<T, ObjectPoolItem<T>>
  private initPoolCount:number = 10

  private timeToLive:number|null = null
  private checkLiveTimeInterval:number = 5000 //5초
  private checkInterval:number|null = null

  private logFlag:true|false = false

  private tempPoolArray:Array<ObjectPoolItem<T>> = []

  constructor(){

    this.idlePool = []
    this.usePool = new Map()

  }

  setTimeToLive(timeMs:number){
    if(this.checkLiveTimeInterval > timeMs){
      throw new Error(`checkLiveTimeInterval (${this.checkLiveTimeInterval} ms) 값 보다 TimeToLive (${timeMs} ms) 값을 크게 설정해야 합니다.`)
    }
    this.timeToLive = timeMs
    if(!this.checkInterval){
      this.checkInterval = window.setInterval(()=>{
        let t = performance.now()
        this.checkLiveTime()    
        this.logStr('checkLiveTime',`처리시간 ${(performance.now() - t).toFixed(0)} ms`)
      }, this.checkLiveTimeInterval)
    }
    return this
  }

  setCheckLiveTimeInterval(timeMs:number){
    this.checkLiveTimeInterval = timeMs
    return this
  }
  
  private checkLiveTime(){

    let cnt = 0

    if(this.idlePool.length + this.usePool.size > this.initPoolCount){
      
      this.idlePool.forEach((item)=>{
        if(this.idlePool.length + this.usePool.size - cnt <= this.initPoolCount){
          this.logStr('checkLiveTime',`initPoolCount => ${this.initPoolCount} 유지를 위해 clear 체크 중단 / 현재 Pool 갯수 (${this.idlePool.length + this.usePool.size - cnt})`)
          return true
        }
        if(this.checkTTLInvalid(item)){
          this.clearItem(item)
          this.tempPoolArray.push(item)
          cnt += 1
        }
      })

    }

    if(cnt > 0){
      this.tempPoolArray.forEach((item)=>{
        this.idlePool.splice(this.idlePool.indexOf(item), 1)
      })
      this.tempPoolArray.length = 0
      this.logStr('checkLiveTime',`${cnt} 건 cleared!!! ${this.idlePool.length + this.usePool.size} 건 유지중`)
    }

  }

  private checkTTLInvalid(item: ObjectPoolItem<T>){
    return this.timeToLive && item.isLive(this.timeToLive)
  }

  setFactory(factory:Function){
    this.factory = factory
    return this
  }

  setClear(clearFunction:Function){
    this.clearFunction = clearFunction
    return this
  }

  createPool(initCount:number = 10){

    this.initPoolCount = initCount

    for(let i = 0 ; i < initCount ; i++){
      this.idlePool.push(this.createPoolItem())
    }

    return this

  }

  setLog(flag:true|false){
    this.logFlag = flag
    return this
  }

  getPoolItem():T{
    let item = this.idlePool.pop()
    if(!item){
      item = this.createPoolItem()
      this.logStr('getPoolItem','new PoolItem added!!!')
    }else{
      item.touchItem()
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
      poolItem.touchItem()
    }
  }

  releasePoolItems(...items:T[]){
    items.forEach((item)=>{
      this.releasePoolItem(item)
    })
  }

  destroy(){
    this.factory = null
    if(this.clearFunction){
      this.idlePool.forEach((item)=>{
        this.clearItem(item)
      })
      this.usePool.forEach((item)=>{
        this.clearItem(item)
      })
    }
    if(this.checkInterval !== null){
      window.clearInterval(this.checkInterval)
    }
    this.idlePool.length = 0
    this.usePool.clear()
  }

  private clearItem(item: ObjectPoolItem<T>){
    if(this.clearFunction)this.clearFunction(item.getItem())
  }

  private createPoolItem(){
    if(!this.factory || !(this.factory instanceof Function)){
      throw new Error('setFactory 가 정상적으로 실행되지 않았습니다.')
    }
    return new ObjectPoolItem<T>(this.factory())
  }

  private logStr(title:string, str:string){
    if(!this.logFlag) return
    console.log(`[${title}] ${str}`)
  }

}

export default ObjectPool