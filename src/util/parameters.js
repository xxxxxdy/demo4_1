export const CODE_HEIGHT = 60;
export const CODE_HEIGHT_WITH_MARGIN = 80;
export const CODE_WIDTH = 300;
export const CODE_PADDING = 10;
export const MAX_STROKEWIDTH = CODE_HEIGHT*0.2;
export const MIN_STROKEWIDTH = 0.3;
export const MAX_STROKEWIDTH2 = 10;
export const STROKEDASH_LENGTH = 12;
export const MIN_STROKEDASH = 4;
export const MAX_STROKEDASH2 = 20;
export const MIN_LINE2_HEIGHT = 10; 
export const MIN_RECT_HEIGHT = 10;
export const LINECHART_WIDTH = 800;
export const LINECHART_HEIGHT = 800;

// 可能会用到的编码通道
// [width, left, right, top, area/avg, max, persistent, none, min]

export var user_parameters = {
    "data_sort" : false,
    "sort_rule": true,
    "global_time": true,
    "global_value": true,
    "rect_opacity": 0.5,
    "line_opacity": 1,
    "persistent": 0,
    "filter":{}
}

export var mapping_relationship = {
    "line1":{ // line1 的 y 和 y2 是一样的
        // x 和 x2 共同由hill-width来决定
        // "x": "left",
        // "x2": "right",
        "width": "width",
        "y":  "none",
        "strokeWidth": "none",
        "strokeDash": "none",
        "stroke": "none"
    },
    "line2":{ // line2 的 x 和 x2 是一样的
        // x 同样由hill-width来决定
        // "x":  "right",
        // "y":  "none",
        // "y2":  "none",
        "height": "none",
        "strokeWidth": "none",
        "stroke": "none"
    },
    "rect":{ // y 和 y2 由矩形的idx决定，不受其他变量影响
        "x": "top",
        "width": "area",
        "height": "none",
        "fill": "none",
    }
}

export const mapping_default = {
    "line1":{ // line1 的 y 和 y2 是一样的
        // x 和 x2 共同由一个变量【x】来决定
        // "x": 0,
        // "x2": CODE_WIDTH,
        "width": CODE_WIDTH,
        "y":  CODE_HEIGHT/2, // 这里需要加上idx产生的偏移量
        "strokeWidth": 2,
        "strokeDash": [STROKEDASH_LENGTH/2, STROKEDASH_LENGTH/2],
        "stroke": "black" // color
    },
    "line2":{ // line2 的 x 和 x2 是一样的
        // x 同样由【x】来决定
        // "x":  "right",
        // y 和 y2 由同一个变量【y】来决定
        "y":  CODE_HEIGHT/4, // 这里需要加上idx产生的偏移量
        "y2":  CODE_HEIGHT*3/4, // 这里需要加上idx产生的偏移量
        "height": CODE_HEIGHT/2,
        "strokeWidth": 2,
        "stroke": "black" // color
    },
    "rect":{ // y 和 y2 由矩形的idx决定，不受其他变量影响
        "x": CODE_WIDTH/2,
        "width": 0.8,
        "height": CODE_HEIGHT, 
        "fill": "black", // color
    }
}
