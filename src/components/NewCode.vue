<template>
    <div id="code" ref="code" @click="updateHighlightList($event)" ></div>
</template>

<style scoped>
#code{
    width: 100%;
    height: 100%;
    overflow-y: scroll;
}

</style>

<script>

import vegaEmbed from "vega-embed"

import { data_order, data_order2, re_data_order, re_data_order2, data_value } from '../util/dataManager'
import { getDataName } from '../util/dataManager'
import { calculateInitPersistent, newcode_list, set1VisualCode } from '../util/codeList'
import { CODE_PADDING, CODE_HEIGHT_WITH_MARGIN, CODE_WIDTH, user_parameters } from '../util/parameters'
import bus from "../util/eventBus"
import { color_for_highlight, getRandomColor } from "../util/colorMapping"

export default{
    data(){
        return{
            scroll_y: 0,
            interactive_list: [],
            newcode:{
                "$schema":"https://vega.github.io/schema/vega/v5.json",
                "width": CODE_WIDTH+40, "height": 800,    
                "data": [],
                "marks": [{
                    //"type":"rect",
                    //"encode":{
                        // "update":{
                        //     "x": {"value": -5},
                        //     "width":{"value": 310},
                        //     "y":{"value": -5},
                        //     "height":{"value": 70},
                        //     "stroke": {"value": "rgb"},
                        //     "strokeWidth":{"signal": "a"}
                        // }
                    //}
                }],
                // "signals":[{
                //     "name": "a", "value": 2,
                //     "on":[{"events":"click","update":"2-a" }]
                // }
                // ]
            },

            
            
        }
    },

    methods:{
        chart(){
            if(this.canvas){
                this.canvas.remove();
                this.canvas = undefined;
            }
            vegaEmbed("#code", this.newcode);
        },

        drawHighLightRect(){
            if(!this.canvas){
                this.canvas = document.querySelectorAll("canvas")[1];
                this.context = this.canvas.getContext('2d');
            }
            
            for(let i=0; i<this.interactive_list.length; i++){
                // let y_offset = this.interactive_list[i]*CODE_HEIGHT_WITH_MARGIN+2;
                let y_idx = this.interactive_list[i];
                if(user_parameters["data_sort"]){
                    if(user_parameters["sort_rule"]){
                        y_idx = re_data_order[this.interactive_list[i]];
                    }
                    else{
                        y_idx = re_data_order2[this.interactive_list[i]];
                    }
                }
                let y_offset = y_idx*CODE_HEIGHT_WITH_MARGIN + 2;
                this.context.strokeStyle = color_for_highlight[this.interactive_list[i]][0];
                this.context.lineWidth = 2;
                this.context.strokeRect(2, y_offset, 316, 76);
            }
        },

        updateHighlightList(e){
            // 这个40是定义在App.vue中的main标签的padding值
            let y_idx = Math.floor((this.scroll_y + e.y - 40 - CODE_PADDING)/CODE_HEIGHT_WITH_MARGIN);
            if( y_idx >= newcode_list.length ) return;
            
            let y_offset = y_idx*CODE_HEIGHT_WITH_MARGIN+2;
            let flag = true;

            if(!this.canvas){
                this.canvas = document.querySelectorAll("canvas")[1];
                this.context = this.canvas.getContext('2d');
            }
            let data_idx = y_idx;
            if(user_parameters["data_sort"]){
                if(user_parameters["sort_rule"]){
                    data_idx = data_order[y_idx];
                }
                else{
                    data_idx = data_order2[y_idx];
                }
            }
            for(let i=0; i<this.interactive_list.length; i++){
                if(data_idx === this.interactive_list[i]){
                    flag = false;
                    this.interactive_list.splice(i, 1);
                    // white: 背景颜色 3:要比2大才能完全涂掉
                    this.context.strokeStyle = "white";
                    this.context.lineWidth = 3;
                    // 316 = CODE_WIDTH + 2*(CODE_PADDING-2)
                    //  76 = CODE_HEIGHT + 2*(CODE_PADDING-2)
                    this.context.strokeRect(2, y_offset, 316, 76);

                    delete(color_for_highlight[data_idx]);
                    break;
                }
            }

            if(flag){
                this.interactive_list.push(data_idx);
                // 这个color写个映射表用来区分
                // if(!(y_idx in color_for_highlight))
                color_for_highlight[data_idx] = getRandomColor();
                
                this.context.strokeStyle = color_for_highlight[data_idx][0];
                this.context.lineWidth = 2;
                this.context.strokeRect(2, y_offset, 316, 76);

                console.log(this.newcode["data"][y_idx]);
            }

            bus.emit("clickForLine", this.interactive_list);
        },

        handleScroll(){// 监听滑动窗口的距离
            this.scroll_y = this.$refs.code.scrollTop;
        },

        updateNewCodeData(){ // 在更换数据集的时候调用
            newcode_list.splice(0, newcode_list.length);
            this.interactive_list.splice(0, this.interactive_list.length);
            for(let key in color_for_highlight){
                delete color_for_highlight[key];
            }
            // 假设数据都以name进行排序过
            let name = "";
            let start_idx = 0, end_idx = 0;
            for(let i=0; i<data_value.length; i++){
                if(getDataName(i) !== name){
                    end_idx = i;
                    set1VisualCode(name, start_idx, end_idx);
                    start_idx = i;
                    name = getDataName(i);
                }
            }
            set1VisualCode(name, start_idx, data_value.length);
        },

        getNewCodeJson(pers = 0){
            this.newcode["data"].splice(0, this.newcode["data"].length);
            this.newcode["marks"].splice(0, this.newcode["marks"].length);

            if(user_parameters["data_sort"]){
                if(user_parameters["sort_rule"]){
                    for(let i=0; i<newcode_list.length; i++){
                        let tmp_list = newcode_list[i].getJson(re_data_order[i], pers);
                        this.newcode["data"].push(tmp_list[0]);
                        for(let i=0; i<tmp_list[1].length; i++){
                            this.newcode["marks"].push(tmp_list[1][i]);
                        }
                    }
                }
                else{
                    for(let i=0; i<newcode_list.length; i++){
                        let tmp_list = newcode_list[i].getJson(re_data_order2[i], pers);
                        this.newcode["data"].push(tmp_list[0]);
                        for(let i=0; i<tmp_list[1].length; i++){
                            this.newcode["marks"].push(tmp_list[1][i]);
                        }
                    }
                }
            }
            else{
                for(let i=0; i<newcode_list.length; i++){
                    let tmp_list = newcode_list[i].getJson(i, pers);
                    this.newcode["data"].push(tmp_list[0]);
                    for(let i=0; i<tmp_list[1].length; i++){
                        this.newcode["marks"].push(tmp_list[1][i]);
                    }
                }
            }
            this.newcode["marks"].push({
                "type":"rect",
                "encode":{
                    "enter":{
                        "x": {"value": 0},
                        "width":{"value": CODE_WIDTH},
                        "y":{"value": CODE_HEIGHT_WITH_MARGIN * newcode_list.length},
                        "height":{"value": 10},
                        "fill": {"value": "white"}
                    }
                }
            });
        }

    },

    created(){

        window.onload = (function(method){
            var drawHighLightRect = method;
            return function(){
                var cnt = 0;
                var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
                var target = document.querySelector("#code");
                // var config = {attributes:true, childList: true, characterData: true};
                var config = {childList:true };
                var observer = new MutationObserver(function(mutations){
                    mutations.forEach(function(mutation){
                        if(mutation.type === "childList"){
                            cnt++;
                        }
                        if(cnt % 3 === 0){
                            // 这里应该有一个draw high light
                            drawHighLightRect();
                        }
                    })
                });
                observer.observe(target, config);
            }
        })(this.drawHighLightRect);

        bus.on("updateNewCode", msg=>{
            
            this.getNewCodeJson(msg);
            this.chart();
            // setTimeout(()=>{this.drawHighLightRect()}, 500);
            // console.log(this.newcode);
        })

        bus.on("changeRectOpacity", msg=>{  
            for(let i=0; i<this.newcode["marks"].length-1; i++){
                if(this.newcode["marks"][i]["type"]==="rect"){
                    this.newcode["marks"][i]["encode"]["enter"]["opacity"] = {"value": msg};
                }
            }
            this.chart();
            // setTimeout(()=>{this.drawHighLightRect()}, 500);
        })

        bus.on("getHillAndDraw", msg=>{
            console.log("start coding.");
            this.updateNewCodeData();
            console.log("finish coding and start drawing.");
            let pers = calculateInitPersistent();
            bus.emit("showPersistent",pers);
            this.getNewCodeJson(pers);
            this.chart();
            console.log("finish drawing");
        })

        this.updateNewCodeData();
        this.getNewCodeJson();

    },

    mounted(){
        window.addEventListener('scroll', this.handleScroll, true);

        this.chart();

        // console.log(this.newcode);
    }
}
</script>