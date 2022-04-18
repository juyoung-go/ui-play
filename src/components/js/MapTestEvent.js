export default {

    //이벤트 - mousedown
    mousedown(e){

      if(!this.isMoving){
        return
      }

      this.moveX = e.x
      this.moveY = e.y
      
    },
    //이벤트 - mouseup
    mouseup(e){

      if(!this.isMoving){
        return
      }
      
      this.isMoving = false

      if(!this.lastLeft) this.lastLeft = -1*this.canSize.baseWidth
      if(!this.lastTop) this.lastTop = -1*this.canSize.baseHeight
      
      this.lastLeft += this.moveX - e.x
      this.lastTop += this.moveY - e.y

      this.can.style.left = this.lastLeft+'px'
      this.can.style.top = this.lastTop+'px'

      if(this.mode == 'canvas'){
        this.clearMarker()
        this.ctx.translate(e.x - this.moveX, e.y - this.moveY)
        this.drawMarker2()
      }
      
    },

}