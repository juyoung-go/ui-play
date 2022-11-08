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
    this.drawMarker2(true)
  },
  mapCenterChanged(coord){
    if(this.isMoving){
      return
    }
    console.log('center changed', coord);

    if(this.mode == 'canvas'){
      this.clearMarker()
      this.initOffset()
    }

  },

  //전역 이벤트 - mousedown
  mousedown(e){

    if(!this.isMoving){
      return
    }

    console.log('mousedown', e);

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

  //offset 초기화
  initOffset(){
    this.ctx.translate(this.lastLeft + this.canSize.marginLeft, this.lastTop + this.canSize.marginTop)
    //console.log('initOffset', this.lastLeft + this.canSize.marginLeft, this.lastTop + this.canSize.marginTop)
    this.lastLeft = -1*this.canSize.marginLeft
    this.lastTop = -1*this.canSize.marginTop
    this.can.style.left = this.lastLeft+'px'
    this.can.style.top = this.lastTop+'px'
  },
  //센터 변경
  changeCenter(bef, aft){

    console.log('changeCenter', bef, aft);

    const deltaX = bef.x - aft.x
    const deltaY = bef.y - aft.y
    this.lastLeft += deltaX
    this.lastTop += deltaY

    this.can.style.left = this.lastLeft+'px'
    this.can.style.top = this.lastTop+'px'

    //translate x,y
    console.log('translate', this.lastLeft, this.lastTop);
    return {
      x:deltaX * -1, y:deltaY * -1
    }
    
  },

}