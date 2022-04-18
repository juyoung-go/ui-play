export default {

  //이벤트 추가
  addMapEvents(){

    this.naver.maps.Event.addListener(this.map, 'mousedown', this.mapMouseDown);
    this.naver.maps.Event.addListener(this.map, 'mousemove', this.mapMouseMove);
    this.naver.maps.Event.addListener(this.map, 'mouseup', this.mapMouseUp);
    this.naver.maps.Event.addListener(this.map, 'zooming', this.mapZooming);
    this.naver.maps.Event.addListener(this.map, 'zoom_changed', this.mapZoomChanged);
    this.naver.maps.Event.addListener(this.map, 'center_changed', this.mapCenterChanged);

    window.addEventListener('mousedown', this.mousedown)
    window.addEventListener('mouseup', this.mouseup)
    
  },

  //이벤트 제거
  removeMapEvents(){

    this.naver.maps.Event.clearInstanceListeners(this.map);

    window.removeEventListener('mousedown', this.mousedown)
    window.removeEventListener('mouseup', this.mouseup)

  },

  //맵 이벤트
  mapMouseDown(){
    this.isMoving = true
  },
  mapMouseMove(){
    
  },
  mapMouseUp(){
    
  },
  mapZooming(){
    console.log('zooming', arguments);
    this.prevCoord = this.map.getCenter()
  },
  mapZoomChanged(){
    console.log('zoom changed', arguments);
    this.drawMarker2()
  },
  mapCenterChanged(coord){
    if(this.isMoving){
      return
    }
    console.log('center changed', coord);

    const prev = this.getCoordToOffset(this.prevCoord.x,this.prevCoord.y)
    const curr = this.getCoordToOffset(coord.x,coord.y)
    const trans = this.changeCenter(prev, curr)

    if(this.mode == 'canvas'){
      this.clearMarker()
      this.ctx.translate(trans.x, trans.y)
      this.clearMarker()
    }

  },

  //전역 이벤트 - mousedown
  mousedown(e){

    if(!this.isMoving){
      return
    }

    this.moveX = e.x
    this.moveY = e.y
    
  },
  //전역 이벤트 - mouseup
  mouseup(e){

    if(!this.isMoving){
      return
    }
    console.log('mouseup', e);
    this.isMoving = false

    const trans = this.changeCenter({x:this.moveX, y:this.moveY}, e)

    if(this.mode == 'canvas'){
      this.clearMarker()
      this.ctx.translate(trans.x, trans.y)
      this.drawMarker2()
    }
    
  },

  //센터 변경
  changeCenter(bef, aft){

    if(!this.lastLeft) this.lastLeft = -1*this.canSize.baseWidth
    if(!this.lastTop) this.lastTop = -1*this.canSize.baseHeight
    
    this.lastLeft += bef.x - aft.x
    this.lastTop += bef.y - aft.y

    this.can.style.left = this.lastLeft+'px'
    this.can.style.top = this.lastTop+'px'

    //translate x,y
    return {
      x:aft.x - bef.x, y:aft.y - bef.y
    }
    
  },

}