<template>
  <div style="width:1300px;padding:20px;display:flex;justify-content:space-between;">
    <canvas ref="can1" width="400" height="300"></canvas>
    <canvas ref="can2" width="400" height="300"></canvas>
    <canvas ref="can3" width="400" height="300"></canvas>
  </div>
</template>

<script>
export default {
  name:'CanvasTest',
  async created(){
    await this.$nextTick()
    for(let i = 1 ; i <= 3 ; i++){
      this['can'+i] = this.$refs['can'+i]
      this['ctx'+i] = this['can'+i].getContext('2d')
    }

    this.w = 20
    this.h = 20

    //1
    this.rect(this.ctx1, 50, 50)
    this.ctx1.strokeRect(0, 0, 400, 300)

    setTimeout(()=>{
      this.ctx1.translate(100, 100)
      this.rect(this.ctx1, 50, 50)
    }, 1000)

    setTimeout(()=>{
      this.ctx1.translate(100, 100)
      this.rect(this.ctx1, 50, 50)
    }, 2000)

    //2
    this.ctx2.translate(100, 100)
    this.rect(this.ctx2, 100, 100)

    //3
    this.ctx3.translate(100, 100)
    this.ctx3.fillRect(0, 0, 400, 300)

  },
  methods:{
    rect(ctx, x, y){
      ctx.strokeRect(x, y, this.w, this.h)
    }
  }
}
</script>

<style>

canvas{
  width:400px;
  height:300px;
  border:1px solid black;
}

</style>