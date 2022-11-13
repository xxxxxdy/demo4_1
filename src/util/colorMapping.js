// 这个玩意的结构大概是下面这个样子的
//  {
//   key: number, 表示对应的是第几条线
//   value: string, 颜色编码
//  }
export var color_for_highlight = {};

const HIGHLIGHT_COLOR_SET = [
    "#1f77b4",
    "#ff7e0e",
    "#2c9f2c",
    "#d52728",
    "#9367bc",
    "#8b554a",
    "#e277c2",
    "#7e7e7e",
    "#bbbc21",
    "#16bdcf",
    "#adc6e8",
    "#ffba78",
    "#97df89",
    "#ff9795",
    "#c5afd4",
    "#c49c93",
    "#f7b6d2",
    "#c6c6c6",
    "#dbdb8d",
    "#9edae4"
];


export function getRandomColor(){
    for(let i=0; i<HIGHLIGHT_COLOR_SET.length; i++){
        let flag = true;
        for(let key in color_for_highlight){
            if(color_for_highlight[key][1] === i){
                flag = false;
                break;
            }
        }
        if(flag){
            return [HIGHLIGHT_COLOR_SET[i], i];
        }

    }

    return ['#' + Math.floor(Math.random()*0xffffff).toString(16), -1];
}



