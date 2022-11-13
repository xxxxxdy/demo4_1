import { data_field, getDataTime, getDataValue } from './dataManager'
import { CODE_HEIGHT, CODE_WIDTH, mapping_relationship, mapping_default, 
    CODE_HEIGHT_WITH_MARGIN, MAX_STROKEWIDTH, STROKEDASH_LENGTH, MAX_STROKEWIDTH2, 
    user_parameters, CODE_PADDING, MIN_STROKEWIDTH, MIN_STROKEDASH, MAX_STROKEDASH2, 
    MIN_LINE2_HEIGHT, MIN_RECT_HEIGHT } from './parameters';
import { Hill } from './hillManager'

export class VisualCode{
    constructor(name, start, end){ // 不包括 end
        this.name = name;
        this.start = start;
        this.end = end;
        this.max = -Infinity;
        this.min = Infinity;
        this.hill_list = [];
    }

    setHill(top_list){
        // max critical list, sort by time from lower to higher
        top_list.sort(function(a, b){
            return getDataTime(a) - getDataTime(b);
        })
        // console.log(top_list);

        for(let i=0; i<top_list.length; i++){
            this.hill_list.push(new Hill(top_list[i]));
            if(getDataValue(top_list[i])>this.max)
                this.max = getDataValue(top_list[i]);
        }
    }

    updateHill(bottom_list){
        // min critical list, sort by value from higher to lower
        bottom_list.sort(function(a, b){
            return getDataValue(b) - getDataValue(a);
        })
        // console.log(bottom_list);

        this.min = getDataValue(bottom_list[bottom_list.length-1]);

        for(let i=0; i<bottom_list.length; i++){
            let le = -1, ri = -1;
            for(let j=0; j<this.hill_list.length; j++){
                if(this.hill_list[j].persistent === -1){
                    if(getDataTime(this.hill_list[j].top) < getDataTime(bottom_list[i])){
                        le = j;
                    }
                    else{
                        ri = j;
                        break;
                    }
                }
            }

            let hill_idx = -1;
            let is_left_bottom = true;
            if(le !== -1){
                if(ri !== -1){
                    if(getDataValue(this.hill_list[le].top) < getDataValue(this.hill_list[ri].top)){
                        hill_idx = le;
                        is_left_bottom = false;
                    }
                    else{
                        hill_idx = ri;
                    }
                }
                else{
                    hill_idx = le;
                    is_left_bottom = false;
                }
            }
            else if(ri !== -1){
                hill_idx = ri;
            }


            if(hill_idx !== -1){
                if(is_left_bottom){
                    let right_bottom = this.end - 1;
                    for(let k=i+1; k<bottom_list.length; k++){
                        if( (getDataTime(bottom_list[k]) > getDataTime(this.hill_list[hill_idx].top))
                        && (getDataTime(bottom_list[k]) < getDataTime(right_bottom)) ){
                            right_bottom = bottom_list[k];
                        }
                    }
                    this.hill_list[hill_idx].setBottom(getDataValue(bottom_list[i]),bottom_list[i], right_bottom);
                }

                else{
                    let left_bottom = this.start;
                    for(let k=i+1; k<bottom_list.length; k++){
                        if( (getDataTime(bottom_list[k]) < getDataTime(this.hill_list[hill_idx].top))
                        && (getDataTime(bottom_list[k]) > getDataTime(left_bottom)) ){
                            left_bottom = bottom_list[k];
                        }
                    }
                    this.hill_list[hill_idx].setBottom(getDataValue(bottom_list[i]), left_bottom, bottom_list[i]);
                }
            }
        }
    }

    checkHill(min_height){
        for(let i=0; i<this.hill_list.length; i++){
            if(this.hill_list[i].persistent < 0){
                this.hill_list[i].setBottom(min_height, this.start, this.end-1);
            }
        }
    }

    calculateAvgValue(){
        for(let i=0; i<this.hill_list.length; i++){
            this.hill_list[i].getAvgValue();
        }
    }

    getJson(idx, persistent = 0){
        var data_1code = {"name": "hill"+idx, "values": []};

        let total_time, start_time, value_range, min_value;
        let total_width = CODE_WIDTH, start_width = 0
        if(user_parameters["global_time"]){
            start_time = data_field["min_x"];
            total_time = data_field["max_x"] - start_time;
            start_width = CODE_WIDTH * (getDataTime(this.start)-start_time)/total_time;
            total_width = CODE_WIDTH * (getDataTime(this.end-1)-getDataTime(this.start))/total_time;    
        }
        else{
            start_time = getDataTime(this.start);
            total_time = getDataTime(this.end-1) - start_time;   
        }
        if(user_parameters["global_value"]){
            min_value = data_field["min_y"];
            value_range = data_field["max_y"] - min_value;
        }
        else{
            min_value = this.min;
            value_range = this.max - this.min;
        }

        let time_idx_for_draw = [];
        let hill_idx_for_draw = [];
        for(let i=0; i< this.hill_list.length; i++){
            // 这里可能需要一个filter函数
            if(this.hill_list[i].persistent < persistent) continue;
            time_idx_for_draw.push(this.hill_list[i].left);
            time_idx_for_draw.push(this.hill_list[i].right);
            hill_idx_for_draw.push(i);
        }
        time_idx_for_draw.sort(function(a, b){return a-b});

        let k = 1;
        while(time_idx_for_draw[k] === time_idx_for_draw[k-1] && time_idx_for_draw[k] !== undefined) {k++; }

        for(let i=0; i<hill_idx_for_draw.length; i++){
            let top_idx = this.hill_list[hill_idx_for_draw[i]].top;
            while(time_idx_for_draw[k]< top_idx) { k++; }
            // 这个k应该没问题
            data_1code["values"].push(this.hill_list[hill_idx_for_draw[i]].getJson(
                total_time, start_time, value_range, min_value, time_idx_for_draw[k-1], time_idx_for_draw[k]
            ));
        }

        // 生成marks格式
        var marks_1code = [];
        let y_offset = idx*CODE_HEIGHT_WITH_MARGIN + CODE_PADDING;
        let base_width = total_width / data_1code["values"].length;

        var marks_line1 = {"type":"rule", "from": {"data": "hill"+idx}, "encode":{ "enter":{} }};
        // line1 width 
        let x = CODE_PADDING + start_width;
        let x2 = x;
        if(mapping_relationship["line1"]["width"] === "none"){
            for(let i=0; i<data_1code["values"].length; i++){
                x2 += base_width;
                data_1code["values"][i]["l1x_draw"] = x;
                data_1code["values"][i]["l1x2_draw"] = x2;
                x = x2;
            }
        }
        else{
            let sum = 0;
            let min_width = base_width * 0.2;
            let width_key = mapping_relationship["line1"]["width"];
            for(let i=0; i<data_1code["values"].length; i++){
                sum += data_1code["values"][i][width_key];
            }
            if(sum < 0.000001){
                for(let i=0; i<data_1code["values"].length; i++){
                    x2 += base_width;
                    data_1code["values"][i]["l1x_draw"] = x;
                    data_1code["values"][i]["l1x2_draw"] = x2;
                    x = x2;
                }
            }
            else{
                let unit_length = total_width*0.8/sum;
                for(let i=0; i<data_1code["values"].length; i++){
                    let this_width = data_1code["values"][i][width_key]*unit_length+min_width;
                    x2 += this_width;
                    data_1code["values"][i]["l1x_draw"] = x;
                    data_1code["values"][i]["l1x2_draw"] = x2;
                    if(this_width < base_width) base_width=this_width;
                    x = x2;
                }
            }
        }
        marks_line1["encode"]["enter"]["x"]={"field": "l1x_draw"};
        marks_line1["encode"]["enter"]["x2"]={"field": "l1x2_draw"};
        // line1 stroke width
        let max_l1sw = 0;
        if(mapping_relationship["line1"]["strokeWidth"] === "none"){
            marks_line1["encode"]["enter"]["strokeWidth"]={"value": mapping_default["line1"]["strokeWidth"]};
        }
        else{
            let sw_key = mapping_relationship["line1"]["strokeWidth"];
            for(let i=0; i<data_1code["values"].length; i++){
                let this_l1sw = data_1code["values"][i][sw_key]*MAX_STROKEWIDTH + MIN_STROKEWIDTH;
                if(this_l1sw > max_l1sw) max_l1sw=this_l1sw;
                data_1code["values"][i]["l1sw_draw"] = this_l1sw;
            }
            marks_line1["encode"]["enter"]["strokeWidth"]={"field": "l1sw_draw"};
        }
        // line1 stroke dash
        if(mapping_relationship["line1"]["strokeDash"] === "none"){
            marks_line1["encode"]["enter"]["strokeDash"]={"value": mapping_default["line1"]["strokeDash"]};
        }
        else{
            let sw_key = mapping_relationship["line1"]["strokeDash"];
            for(let i=0; i<data_1code["values"].length; i++){
                let pre_sw_length = STROKEDASH_LENGTH * data_1code["values"][i][sw_key];
                if(pre_sw_length < MIN_STROKEDASH){
                    let pre_sw2_length = MIN_STROKEDASH * (1-data_1code["values"][i][sw_key])/data_1code["values"][i][sw_key];
                    if(pre_sw2_length > MAX_STROKEDASH2){
                        data_1code["values"][i]["l1sd_draw"] = [MIN_STROKEDASH, MAX_STROKEDASH2];
                    }
                    else{
                        data_1code["values"][i]["l1sd_draw"] = [MIN_STROKEDASH, pre_sw2_length];
                    }
                }
                else{
                    data_1code["values"][i]["l1sd_draw"] = [pre_sw_length, STROKEDASH_LENGTH - pre_sw_length];
                }
            }
            marks_line1["encode"]["enter"]["strokeDash"]={"field": "l1sd_draw"};
        }
        // line1 y position
        if(mapping_relationship["line1"]["y"] === "none"){
            marks_line1["encode"]["enter"]["y"]={"value": mapping_default["line1"]["y"] + y_offset};
        }
        else{
            let this_offset = y_offset + max_l1sw/2, this_height = CODE_HEIGHT - max_l1sw;
            let y_key = mapping_relationship["line1"]["y"];
            for(let i=0; i<data_1code["values"].length; i++){
                data_1code["values"][i]["l1y_draw"] = (1-data_1code["values"][i][y_key])*this_height + this_offset;
            }
            marks_line1["encode"]["enter"]["y"]={"field": "l1y_draw"};
        }
        marks_line1["encode"]["enter"]["y2"]=marks_line1["encode"]["enter"]["y"];
        // line1 else
        marks_line1["encode"]["enter"]["stroke"]={"value": mapping_default["line1"]["stroke"]};
        marks_line1["encode"]["enter"]["opacity"] = {"value": user_parameters["line_opacity"]};
        marks_1code.push(marks_line1);

        var marks_line2 = {"type":"rule", "from": {"data": "hill"+idx}, "encode":{ "enter":{} }};
        marks_line2["encode"]["enter"]["x"] = marks_line1["encode"]["enter"]["x2"];
        marks_line2["encode"]["enter"]["x2"] = marks_line1["encode"]["enter"]["x2"];
        // line2 height
        if(mapping_relationship["line2"]["height"] === "none"){
            // 此处偷懒
            marks_line2["encode"]["enter"]["y"]={"value": mapping_default["line2"]["y"] + y_offset};
            marks_line2["encode"]["enter"]["y2"]={"value": mapping_default["line2"]["y2"] + y_offset};
        }
        else{
            let height_key = mapping_relationship["line2"]["height"];
            let half_min_dis = MIN_LINE2_HEIGHT/2;
            for(let i=0; i<data_1code["values"].length; i++){
                let half_dis = data_1code["values"][i][height_key]*(CODE_HEIGHT-MIN_LINE2_HEIGHT)/2 + half_min_dis;
                data_1code["values"][i]["l2y_draw"] = y_offset + CODE_HEIGHT/2 - half_dis;
                data_1code["values"][i]["l2y2_draw"] = y_offset + CODE_HEIGHT/2 + half_dis;
            }
            marks_line2["encode"]["enter"]["y"]={"field": "l2y_draw"};
            marks_line2["encode"]["enter"]["y2"]={"field": "l2y2_draw"};
        }
        // line2 stroke width
        if(mapping_relationship["line2"]["strokeWidth"] === "none"){
            marks_line2["encode"]["enter"]["strokeWidth"]={"value": mapping_default["line2"]["strokeWidth"]};
        }
        else{
            let sw_key = mapping_relationship["line2"]["strokeWidth"];
            for(let i=0; i<data_1code["values"].length; i++){
                data_1code["values"][i]["l2sw_draw"] = data_1code["values"][i][sw_key]*MAX_STROKEWIDTH2+MIN_STROKEWIDTH ;
            }
            marks_line2["encode"]["enter"]["strokeWidth"]={"field": "l2sw_draw"};
        }
        // line2 else
        marks_line2["encode"]["enter"]["stroke"]={"value": mapping_default["line2"]["stroke"]};
        marks_line2["encode"]["enter"]["opacity"] = {"value": user_parameters["line_opacity"]};
        marks_1code.push(marks_line2);
        
        var marks_rect = {"type":"rect", "from": {"data": "hill"+idx}, "encode":{"enter":{}}};
        // rect width // 有点问题，base width是局部的，要写成全局的话需要拆开来写
        if(mapping_relationship["rect"]["width"] === "none"){
            let width = base_width*mapping_default["rect"]["width"];
            for(let i=0; i<data_1code["values"].length; i++){
                data_1code["values"][i]["rwidth_draw"] = width; 
            }
        }
        else{
            let width_key = mapping_relationship["rect"]["width"];
            let min_width = base_width * 0.2;
            if(mapping_relationship["rect"]["width"] === "area"){
                for(let i=0; i<data_1code["values"].length; i++){
                    let area = data_1code["values"][i][width_key] * 
                        (data_1code["values"][i]["l1x2_draw"]-data_1code["values"][i]["l1x_draw"]);
                    if(area < min_width){
                        data_1code["values"][i]["rwidth_draw"] = min_width;
                    }
                    else{
                        data_1code["values"][i]["rwidth_draw"] = area;
                    }
                }
            }
            else{
                let increase_width = base_width * 0.8;
                for(let i=0; i<data_1code["values"].length; i++){
                    data_1code["values"][i]["rwidth_draw"] = min_width +
                        increase_width * data_1code["values"][i][width_key]; 
                }
            }
        }
        marks_rect["encode"]["enter"]["width"]={"field":"rwidth_draw"};
        // rect height
        if(mapping_relationship["rect"]["height"] === "none"){
            marks_rect["encode"]["enter"]["y"]={"value":y_offset}; 
            marks_rect["encode"]["enter"]["y2"]={"value":y_offset + mapping_default["rect"]["height"]}; 
        }
        else{
            let height_key = mapping_relationship["rect"]["height"];
            let half_min_dis = MIN_RECT_HEIGHT/2;
            for(let i=0; i<data_1code["values"].length; i++){
                let half_dis = data_1code["values"][i][height_key]*(CODE_HEIGHT-MIN_RECT_HEIGHT)/2 + half_min_dis;
                data_1code["values"][i]["ry_draw"] = y_offset + CODE_HEIGHT/2 - half_dis;
                data_1code["values"][i]["ry2_draw"] = y_offset + CODE_HEIGHT/2 + half_dis;
            }
            marks_rect["encode"]["enter"]["y"]={"field": "ry_draw"};
            marks_rect["encode"]["enter"]["y2"]={"field": "ry2_draw"};
        }
        // rect position
        if(mapping_relationship["rect"]["x"] === "none"){
            for(let i=0; i<data_1code["values"].length; i++){
                data_1code["values"][i]["rx_draw"] = data_1code["values"][i]["l1x_draw"] + 0.5 *
                (data_1code["values"][i]["l1x2_draw"] - data_1code["values"][i]["l1x_draw"] - data_1code["values"][i]["rwidth_draw"]);
            }
        }
        else{
            let x_key = mapping_relationship["rect"]["x"];
            for(let i=0; i<data_1code["values"].length; i++){
                data_1code["values"][i]["rx_draw"] = data_1code["values"][i]["l1x_draw"] + data_1code["values"][i][x_key] *
                (data_1code["values"][i]["l1x2_draw"] - data_1code["values"][i]["l1x_draw"] - data_1code["values"][i]["rwidth_draw"]);
            }
        }
        marks_rect["encode"]["enter"]["x"]={"field": "rx_draw"};
        // rect else
        marks_rect["encode"]["enter"]["fill"]={"value": mapping_default["rect"]["fill"]};
        marks_rect["encode"]["enter"]["opacity"] = {"value": user_parameters["rect_opacity"]};
        marks_1code.push(marks_rect);
    
        return [data_1code, marks_1code];
    }

}
