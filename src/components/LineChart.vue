<template>
    <div id="chart"></div>
</template>

<style scoped>
</style>

<script>

import * as vega from "vega"
import * as vegalite from "vega-lite"
import vegaEmbed from "vega-embed"

import { data_type_name, data_value, data_field } from '../util/dataManager'
import { getDataTime, getDataValue, calculateDataField } from "../util/dataManager"
import bus from "../util/eventBus"
import { newcode_list } from "../util/codeList"
import { LINECHART_WIDTH, LINECHART_HEIGHT } from "../util/parameters"
import { color_for_highlight } from "../util/colorMapping"

export default{
    data(){
        return{
            linechart:{
                "$schema":"https://vega.github.io/schema/vega-lite/v5.json", 
                "width": LINECHART_WIDTH,
                "height":LINECHART_HEIGHT,
                "data":{
                    "values":[]
                },

                "mark":"line",
                "encoding":{
                    //"x": { "field": "a", "type": "ordinal"},
                    //"x": { "field": "a", "type": "temporal"},
                    "x": { "field": "a", "type": "quantitative",
                        "scale":{"domain":[0, 100]}    
                    },
                    "y": { "field": "b", "type":"quantitative",
                        "scale":{"domain":[0, 100]}   
                    },
                    "color": {"field":"c", "type": "nominal", 
                        "scale": {"range": ["#00ffff", "#7fffd4", "#fedd00"]} },

                    "opacity":{"value": 0.3}
                }
            }
        }
    },

    methods:{
        chart(){
            vegaEmbed("#chart", this.linechart);
        },

        updateData(){
            // console.log(this.x_max_domain, this.x_min_domain, this.y_max_domain, this.y_min_domain);
            // this.linechart["data"]["values"].splice(0, this.linechart["data"]["values"].length);
            this.linechart["data"]["values"] = data_value;
            this.linechart["encoding"]["color"]["field"] = data_type_name[0];
            this.linechart["encoding"]["x"]["field"] = data_type_name[1];
            this.linechart["encoding"]["x"]["scale"]["domain"] = [this.x_min_domain, this.x_max_domain];
            this.linechart["encoding"]["y"]["field"] = data_type_name[2];
            this.linechart["encoding"]["y"]["scale"]["domain"] = [this.y_min_domain, this.y_max_domain];
        },

        getDrawGridStep(real_step){
            let draw_step = 1;
            if(real_step >= 1){
                let cnt = 0;
                while(real_step>1){
                    if(cnt % 3 === 1){
                        real_step /= 2.5;
                        draw_step *= 2.5;
                    }
                    else{
                        real_step /= 2;
                        draw_step *= 2;
                    }
                    cnt ++;
                }
            }
            else{
                let cnt = 0;
                while(real_step<1){
                    if(cnt % 3 === 1){
                        real_step *= 2.5;
                        draw_step /= 2.5;
                    }
                    else{
                        real_step *= 2;
                        draw_step /= 2;
                    }
                    cnt ++;
                }
                if(cnt % 3 === 2){
                    draw_step *= 2.5;
                }
                else{
                    draw_step *= 2;
                }
            }
            return draw_step;
        },

        updateFieldValue(){
            let y_step = (data_field["max_y"] - data_field["min_y"])/20;
            let y_draw_step = this.getDrawGridStep(y_step);

            this.y_min_domain = Math.floor(data_field["min_y"]/y_draw_step)*y_draw_step;
            this.y_max_domain = Math.ceil(data_field["max_y"]/y_draw_step)*y_draw_step;
            this.y_range_to_draw = LINECHART_HEIGHT/(this.y_max_domain - this.y_min_domain);

            let x_step = (data_field["max_x"] - data_field["min_x"])/20;
            let x_draw_step = this.getDrawGridStep(x_step);

            this.x_min_domain = Math.floor(data_field["min_x"]/x_draw_step)*x_draw_step;
            this.x_max_domain = Math.ceil(data_field["max_x"]/x_draw_step)*x_draw_step;
            this.x_range_to_draw = LINECHART_WIDTH/(this.x_max_domain - this.x_min_domain);
        }
    },

    created(){
        bus.on("updateDataset", msg=>{
            this.canvas = undefined;

            calculateDataField();
            this.updateFieldValue();
            this.updateData();
            this.chart();
            console.log("finish drawing linechart.");
        });

        bus.on("clickForLine", msg=>{
            if(!this.canvas){
                this.canvas = document.querySelectorAll("canvas")[0];
                this.context = this.canvas.getContext('2d');
                // 这个玩意的大小不是LINECHART_WIDTH、LINECHART_HEIGHT
                this.original_canvas = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
            }
            else{
                this.context.putImageData(this.original_canvas, 0, 0);
            }


            for(let i=0; i<msg.length; i++){
                let begin_idx = newcode_list[msg[i]].start;
                let end_idx = newcode_list[msg[i]].end;

                this.context.lineWidth = 3;
                this.context.beginPath();
                let x_to_draw = (getDataTime(begin_idx)-this.x_min_domain)*this.x_range_to_draw;
                let y_to_draw = (this.y_max_domain-getDataValue(begin_idx))*this.y_range_to_draw;
                this.context.moveTo(x_to_draw, y_to_draw);
                for(let j=begin_idx+1; j<end_idx;j++){
                    x_to_draw = (getDataTime(j)-this.x_min_domain)*this.x_range_to_draw;
                    y_to_draw = (this.y_max_domain-getDataValue(j))*this.y_range_to_draw;
                    this.context.lineTo(x_to_draw, y_to_draw);
                }
                // this.context.moveTo(0, 0);
                // this.context.lineTo(100, 100);
                // this.context.lineTo(400, 800);
                this.context.strokeStyle = color_for_highlight[msg[i]][0];
                this.context.stroke();
                this.context.closePath();
            }

        })

        calculateDataField();

        this.updateFieldValue();

        this.updateData();
    },

    mounted(){
        this.chart();
    }
}
</script>