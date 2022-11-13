<template>
    <div class="encode">
        <h4> encode </h4>
        <input type="button" id="reset" value="reset" @click="resetEncoding">
        <input type="button" id="update" value="update" @click="startUpdateNewCode">

        <div class="rect">
            <div style="font-weight: bold">rectangle</div>
            width:
            <select class="rect-width" @change="setRectWidth">
                <option>area</option>
                <option>width</option>
                <option>top</option>
                <option>max</option>
                <option>min</option>
                <option>persistent</option>
                <option>none</option>
            </select>
            <br>
            height:
            <select class="rect-height" @change="setRectHeight">
                <option>none</option>
                <option>area</option>
                <option>width</option>
                <option>top</option>
                <option>max</option>
                <option>min</option>
                <option>persistent</option>
            </select>
            <br>
            position:
            <select class="rect-pos" @change="setRectPos">
                <option>top</option>
                <option>width</option>
                <option>area</option>
                <option>max</option>
                <option>min</option>
                <option>persistent</option>
                <option>none</option>
            </select>
            <br>
            color:
            <select class="rect-color" @change="setRectColor">
                <option>none</option>
                <option>width</option>
                <option>top</option>
                <option>max</option>
                <option>min</option>
                <option>persistent</option>
                <option>area</option>
            </select>
        </div>

        <div class="line">
            <div style="font-weight: bold">horizontal line</div>
            width:
            <select class="line1-width" @change="setLine1Width">
                <option>width</option>
                <option>top</option>
                <option>area</option>
                <option>max</option>
                <option>min</option>
                <option>persistent</option>
                <option>none</option>
            </select>
            <br>
            y-position:
            <select class="line1-height" @change="setLine1Pos">
                <option>none</option>
                <option>width</option>
                <option>top</option>
                <option>max</option>
                <option>min</option>
                <option>persistent</option>
                <option>area</option>
            </select>
            <br>
            stroke-width:
            <select class="line1-stroke" @change="setLine1StrokeWidth">
                <option>none</option>
                <option>width</option>
                <option>top</option>
                <option>max</option>
                <option>min</option>
                <option>persistent</option>
                <option>area</option>
            </select>
            <br>
            stroke-dash:
            <select class="line1-strokeDash" @change="setLine1StrokeDash">
                <option>none</option>
                <option>width</option>
                <option>top</option>
                <option>max</option>
                <option>min</option>
                <option>persistent</option>
                <option>area</option>
            </select>
            <br>
            color:
            <select class="line1-color" @change="setLine1Color">
                <option>none</option>
                <option>width</option>
                <option>top</option>
                <option>max</option>
                <option>min</option>
                <option>persistent</option>
                <option>area</option>
            </select>
        </div>

        <div class="line">
            <div style="font-weight: bold">vertical line</div>
            height:
            <select class="line2-height" @change="setLine2Height">
                <option>none</option>
                <option>width</option>
                <option>top</option>
                <option>max</option>
                <option>min</option>
                <option>persistent</option>
                <option>area</option>
            </select>
            <br>
            stroke-width:
            <select class="line2-stroke" @change="setLine2Stroke">
                <option>none</option>
                <option>width</option>
                <option>top</option>
                <option>max</option>
                <option>min</option>
                <option>persistent</option>
                <option>area</option>
            </select>
            <br>
            color:
            <select class="line2-color" @change="setLine2Color">
                <option>none</option>
                <option>width</option>
                <option>top</option>
                <option>max</option>
                <option>min</option>
                <option>persistent</option>
                <option>area</option>
            </select>

        </div>
    </div>
    <div class="param">
        <h4> parameters </h4>
        persistent:
        <div id="pers_val">0</div>
        <input type="range" class="persistent" min="0" max="1" step="0.01" value="0" @change="changePersistent">
        
        <br>
        rect-opacity: 
        <input type="range" class="rect-opacity" min="0" max="1" step="0.01" value="0.5" @change="changeRectOpacity">
        
        <br>
        global time:
        <input type="checkbox" class="globalx" @change="changeGlobalX" checked>

        <br>
        global value:
        <input type="checkbox" class="globaly" @change="changeGlobalY" checked>

        <br>
        sort type:
        <input type="checkbox" @change="changeSortRule" checked>
    </div>
    
</template>

<style scoped>
.encode, .param{
    position: relative;
    border: 2px solid black;
    padding-left: 10px;
    margin-right: 1rem;
    margin-bottom: 1rem;
}

#reset{
    position: absolute;
    right: 7rem;
    top: 1rem;
    height: 2rem;
    width: 4rem;
    color: red;
}

#update{
    position: absolute;
    right: 2rem;
    top: 1rem;
    height: 2rem;
    width: 4rem;
}

.rect, .line{
    position: relative;
    margin-bottom: 1rem;
    margin-right: 1rem;
    padding-left: 1rem;
    border: 2px solid aqua;
}

select{
    position: absolute;
    width: 7rem;
    right: 1rem;
}

#pers_val{
    color: red;
    display: inline;
}

input[type="range"]{
    position: absolute;
    right: 1rem;
    margin-bottom: 0.5rem;
}

</style>

<script>

import { mapping_relationship, user_parameters } from '../util/parameters'
import bus from '../util/eventBus'

export default{
    data(){
        return{
            
        }
    },

    methods:{
        resetEncoding(){
            this.rect_width.value = this.rect_width.options[0].value;
            mapping_relationship["rect"]["width"] = this.rect_width.value;
            this.rect_height.value = this.rect_height.options[0].value;
            mapping_relationship["rect"]["height"] = this.rect_height.value;
            this.rect_pos.value = this.rect_pos.options[0].value;
            mapping_relationship["rect"]["x"] = this.rect_pos.value;
            this.rect_color.value = this.rect_color.options[0].value;
            mapping_relationship["rect"]["fill"] = this.rect_color.value;
            this.line1_width.value = this.line1_width.options[0].value;
            mapping_relationship["line1"]["width"] = this.line1_width.value;
            this.line1_y.value = this.line1_y.options[0].value;
            mapping_relationship["line1"]["y"] = this.line1_y.value;
            this.line1_strokeWidth.value = this.line1_strokeWidth.options[0].value;
            mapping_relationship["line1"]["strokeWidth"] = this.line1_strokeWidth.value;
            this.line1_strokeDash.value = this.line1_strokeDash.options[0].value;
            mapping_relationship["line1"]["strokeDash"] = this.line1_strokeDash.value;
            this.line1_color.value = this.line1_color.options[0].value;
            mapping_relationship["line1"]["stroke"] = this.line1_color.value;
            this.line2_height.value = this.line2_height.options[0].value;
            mapping_relationship["line2"]["height"] = this.line2_height.value;
            this.line2_strokeWidth.value = this.line2_strokeWidth.options[0].value;
            mapping_relationship["line2"]["strokeWidth"] = this.line2_strokeWidth.value;
            this.line2_color.value = this.line2_color.options[0].value;
            mapping_relationship["line2"]["stroke"] = this.line2_color.value;

            this.startUpdateNewCode();
        },
        startUpdateNewCode(){
            bus.emit("updateNewCode", user_parameters["persistent"]);
            // console.log(mapping_relationship);
        },
        setRectWidth(){
            mapping_relationship["rect"]["width"] = this.rect_width.value;
        },
        setRectHeight(){
            mapping_relationship["rect"]["height"] = this.rect_height.value;
        },
        setRectPos(){
            mapping_relationship["rect"]["x"] = this.rect_pos.value;
        },
        setRectColor(){
            mapping_relationship["rect"]["fill"] = this.rect_color.value;
        },
        setLine1Width(){
            mapping_relationship["line1"]["width"] = this.line1_width.value;
        },
        setLine1Pos(){
            mapping_relationship["line1"]["y"] = this.line1_y.value;
        },
        setLine1StrokeWidth(){
            mapping_relationship["line1"]["strokeWidth"] = this.line1_strokeWidth.value;
        },
        setLine1StrokeDash(){
            mapping_relationship["line1"]["strokeDash"] = this.line1_strokeDash.value;
        },
        setLine1Color(){
            mapping_relationship["line1"]["stroke"] = this.line1_color.value;
        },
        setLine2Height(){
            mapping_relationship["line2"]["height"] = this.line2_height.value;
        },
        setLine2Stroke(){
            mapping_relationship["line2"]["strokeWidth"] = this.line2_strokeWidth.value;
        },
        setLine2Color(){
            mapping_relationship["line2"]["stroke"] = this.line2_color.value;
        },
        changePersistent(){
            user_parameters["persistent"] = this.persistent_range.value;
            this.pers_val.innerText = this.persistent_range.value;
            bus.emit("updateNewCode", this.persistent_range.value);
        },
        changeRectOpacity(){
            user_parameters["rect_opacity"] = this.rect_opacity.value;
            bus.emit("changeRectOpacity", this.rect_opacity.value);
        },
        changeGlobalX(){
            user_parameters["global_time"] = !user_parameters["global_time"];
            bus.emit("updateNewCode", this.persistent_range.value);
        },
        changeGlobalY(){
            user_parameters["global_value"] = !user_parameters["global_value"];
            bus.emit("updateNewCode", this.persistent_range.value);
        },
        changeSortRule(){
            user_parameters["sort_rule"] = !user_parameters["sort_rule"];
            bus.emit("updateNewCode", this.persistent_range.value);
        }

    },

    created(){
        bus.on("updateDataset", msg=>{
            this.resetEncoding();
            bus.emit("getHillAndDraw", null);
        })

        bus.on("showPersistent", msg=>{
            this.persistent_range.max = msg * 3;
            this.persistent_range.step = msg / 50;
            this.persistent_range.value = msg;
            this.pers_val.innerText = msg;
        })
    },

    mounted(){
        this.rect_width = document.querySelector(".rect-width");
        this.rect_height = document.querySelector(".rect-height");
        this.rect_pos = document.querySelector(".rect-pos");
        this.rect_color = document.querySelector(".rect-color");
        this.line1_width = document.querySelector(".line1-width");
        this.line1_y = document.querySelector(".line1-height");
        this.line1_strokeWidth = document.querySelector(".line1-stroke");
        this.line1_strokeDash = document.querySelector(".line1-strokeDash");
        this.line1_color = document.querySelector(".line1-color");
        this.line2_height = document.querySelector(".line2-height");
        this.line2_strokeWidth = document.querySelector(".line2-stroke");
        this.line2_color = document.querySelector(".line2-color");

        this.pers_val = document.querySelector("#pers_val");
        this.persistent_range = document.querySelector(".persistent");
        this.rect_opacity = document.querySelector(".rect-opacity");
    }
}
</script>